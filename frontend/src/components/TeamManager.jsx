import { useState, useEffect } from 'react';
import { auth, database } from '../config/firebase';
import { ref, push, set, onValue, get, remove, update } from 'firebase/database';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { sendInvitation as sendInvitationEmail } from '../services/emailService';

const TeamManager = ({ projectId, isOpen, onClose }) => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [emailToInvite, setEmailToInvite] = useState('');
    const [loading, setLoading] = useState(false);
    const [project, setProject] = useState(null);

    useEffect(() => {
        if (projectId && isOpen) {
            loadTeamData();
        }
    }, [projectId, isOpen]);

    const loadTeamData = async () => {
        try {
            // Load project details
            const projectRef = ref(database, `projects/${projectId}`);
            const projectSnap = await get(projectRef);
            if (projectSnap.exists()) {
                setProject(projectSnap.val());
            }

            // Load team members
            const membersRef = ref(database, `projects/${projectId}/teamMembers`);
            const membersUnsubscribe = onValue(membersRef, (snapshot) => {
                const data = snapshot.val() || {};
                const membersList = Object.entries(data).map(([userId, memberData]) => ({
                    userId,
                    ...memberData
                }));
                setTeamMembers(membersList);
            });

            // Load pending invitations
            const invitesRef = ref(database, `projects/${projectId}/invitations`);
            const invitesUnsubscribe = onValue(invitesRef, (snapshot) => {
                const data = snapshot.val() || {};
                const invitesList = Object.entries(data).map(([inviteId, inviteData]) => ({
                    id: inviteId,
                    ...inviteData
                }));
                setInvitations(invitesList);
            });

            return () => {
                membersUnsubscribe();
                invitesUnsubscribe();
            };
        } catch (error) {
            console.error('Error loading team data:', error);
            toast.error('Failed to load team data');
        }
    };

    const sendInvitation = async (e) => {
        e.preventDefault();
        if (!emailToInvite.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        setLoading(true);
        try {
            const inviteId = uuidv4();
            const inviteToken = uuidv4();
            
            // Create invitation record
            const invitationData = {
                email: emailToInvite.toLowerCase(),
                invitedBy: {
                    id: auth.currentUser.uid,
                    name: auth.currentUser.displayName || 'Unknown',
                    email: auth.currentUser.email
                },
                projectId,
                projectName: project?.name || 'Untitled Project',
                token: inviteToken,
                status: 'pending',
                createdAt: Date.now(),
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
            };

            // Save to project invitations
            const projectInviteRef = ref(database, `projects/${projectId}/invitations/${inviteId}`);
            await set(projectInviteRef, invitationData);

            // Save to global invitations for easy lookup
            const globalInviteRef = ref(database, `invitations/${inviteToken}`);
            await set(globalInviteRef, {
                ...invitationData,
                inviteId
            });            // Create invitation link
            const inviteLink = `${window.location.origin}/join-team?token=${inviteToken}`;
              // Send invitation email (with fallback to clipboard)
            const currentUser = auth.currentUser;
            const inviterName = currentUser.displayName || currentUser.email || 'A team member';
            const projectName = project?.name || 'InkCode Project';
            
            const result = await sendInvitationEmail(emailToInvite, inviterName, projectName, inviteLink, 'member');
              if (result.success) {
                // Show detailed success message
                if (result.deliveryInfo) {
                    toast.success(
                        `✅ Email sent successfully to ${emailToInvite}!\n` +
                        `Status: ${result.deliveryInfo.status}\n` +
                        `Time: ${new Date(result.deliveryInfo.timestamp).toLocaleTimeString()}\n\n` +
                        `📋 Ask the recipient to check their spam/junk folder if they don't see it in their inbox.`,
                        { autoClose: 8000 }
                    );
                } else {
                    toast.success(result.message, { autoClose: 6000 });
                }
                  // Also log delivery info for debugging
                console.log('Invitation sent successfully:', {
                    recipient: emailToInvite,
                    inviteLink: inviteLink,
                    deliveryInfo: result.deliveryInfo
                });
            } else {
                toast.error(result.message || 'Failed to send invitation');
                console.error('Invitation failed:', result.error);
            }
            
            setEmailToInvite('');
        } catch (error) {
            console.error('Error sending invitation:', error);
            toast.error('Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };    const removeMember = async (userId) => {
        if (userId === auth.currentUser.uid) {
            toast.error("You cannot remove yourself from the team");
            return;
        }

        try {
            // Remove user from project team members
            const memberRef = ref(database, `projects/${projectId}/teamMembers/${userId}`);
            
            // Remove project from user's personal projects list
            const userProjectRef = ref(database, `users/${userId}/projects/${projectId}`);
            
            // Execute both removals
            await Promise.all([
                remove(memberRef),
                remove(userProjectRef)
            ]);
            
            toast.success('Team member removed successfully');
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error('Failed to remove team member');
        }
    };const leaveTeam = async () => {
        if (isProjectOwner) {
            toast.error("As the project owner, you cannot leave the team. Transfer ownership first or delete the project.");
            return;
        }

        if (window.confirm("Are you sure you want to leave this team? You'll lose access to this project.")) {
            try {
                // Remove user from project team members
                const memberRef = ref(database, `projects/${projectId}/teamMembers/${auth.currentUser.uid}`);
                
                // Remove project from user's personal projects list
                const userProjectRef = ref(database, `users/${auth.currentUser.uid}/projects/${projectId}`);
                
                // Execute both removals
                await Promise.all([
                    remove(memberRef),
                    remove(userProjectRef)
                ]);
                
                toast.success('You have left the team successfully');
                onClose(); // Close the modal after leaving
                // You might want to redirect to dashboard here
                window.location.href = '/dashboard';
            } catch (error) {
                console.error('Error leaving team:', error);
                toast.error('Failed to leave team');
            }
        }
    };

    const cancelInvitation = async (inviteId, token) => {
        try {
            const projectInviteRef = ref(database, `projects/${projectId}/invitations/${inviteId}`);
            const globalInviteRef = ref(database, `invitations/${token}`);
            
            await Promise.all([
                remove(projectInviteRef),
                remove(globalInviteRef)
            ]);
            
            toast.success('Invitation cancelled');
        } catch (error) {
            console.error('Error cancelling invitation:', error);
            toast.error('Failed to cancel invitation');
        }
    };

    const updateMemberRole = async (userId, newRole) => {
        try {
            const memberRef = ref(database, `projects/${projectId}/teamMembers/${userId}`);
            await update(memberRef, { role: newRole });
            toast.success('Member role updated');
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update member role');
        }
    };

    const isProjectOwner = project?.createdBy === auth.currentUser.uid;
    const currentUserMember = teamMembers.find(m => m.userId === auth.currentUser.uid);
    const canManageTeam = isProjectOwner || currentUserMember?.role === 'admin';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#111119] border border-gray-800 p-6 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Team Management</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {project && (
                    <div className="mb-6 p-4 bg-[#1a1a23] border border-gray-700 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                        <p className="text-sm text-gray-400 capitalize">{project.language} Project</p>
                    </div>
                )}

                {canManageTeam && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
                        <form onSubmit={sendInvitation} className="flex gap-3">
                            <input
                                type="email"
                                value={emailToInvite}
                                onChange={(e) => setEmailToInvite(e.target.value)}
                                placeholder="Enter email address"
                                className="flex-1 px-3 py-2 bg-[#1a1a23] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Invite'}
                            </button>
                        </form>
                        <p className="text-xs text-gray-400 mt-2">
                            The invitation link will be copied to your clipboard. Share it with the team member.
                        </p>
                    </div>
                )}

                {/* Team Members */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Team Members ({teamMembers.length})</h3>
                    <div className="space-y-3">
                        {teamMembers.map((member) => (
                            <div key={member.userId} className="flex items-center justify-between p-3 bg-[#1a1a23] border border-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={member.photoURL}
                                        alt={member.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div>
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-sm text-gray-400">{member.email}</div>
                                    </div>
                                    {member.userId === project?.createdBy && (
                                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                            Owner
                                        </span>
                                    )}
                                    {member.role && member.role !== 'member' && (
                                        <span className="px-2 py-1 bg-violet-500/20 text-violet-400 text-xs rounded-full capitalize">
                                            {member.role}
                                        </span>
                                    )}
                                </div>
                                {canManageTeam && member.userId !== auth.currentUser.uid && member.userId !== project?.createdBy && (
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={member.role || 'member'}
                                            onChange={(e) => updateMemberRole(member.userId, e.target.value)}
                                            className="px-2 py-1 bg-[#2a2a35] border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
                                        >
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button
                                            onClick={() => removeMember(member.userId)}
                                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                            title="Remove member"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Invitations */}
                {invitations.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Pending Invitations ({invitations.length})</h3>
                        <div className="space-y-3">
                            {invitations.map((invite) => (
                                <div key={invite.id} className="flex items-center justify-between p-3 bg-[#1a1a23] border border-gray-700 rounded-lg">
                                    <div>
                                        <div className="font-medium">{invite.email}</div>
                                        <div className="text-sm text-gray-400">
                                            Invited by {invite.invitedBy.name} • {new Date(invite.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {canManageTeam && (
                                        <button
                                            onClick={() => cancelInvitation(invite.id, invite.token)}
                                            className="px-3 py-1 text-sm text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>                    </div>
                )}

                {/* Leave Team Option for Non-Owners */}
                {!isProjectOwner && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <button
                            onClick={leaveTeam}
                            className="w-full px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
                        >
                            Leave Team
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            You will lose access to this project and all its contents.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamManager;
