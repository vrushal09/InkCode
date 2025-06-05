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

    if (!isOpen) return null;    return (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#242424] bg-[#000000]">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#242424] rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[#FFFFFF]">Team Management</h2>
                            {project && (
                                <p className="text-sm text-[#FFFFFF]/60">{project.name}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-[#FFFFFF]/60 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-lg transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                        {/* Left Column - Team Members */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-base font-medium mb-4 text-[#FFFFFF] flex items-center">
                                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    Team Members ({teamMembers.length})
                                </h3>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {teamMembers.map((member) => (
                                        <div key={member.userId} className="bg-[#000000] border border-[#242424] rounded-lg p-4 hover:border-[#FFFFFF]/20 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <img
                                                        src={member.photoURL}
                                                        alt={member.name}
                                                        className="w-10 h-10 rounded-full border border-[#242424]"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-medium text-[#FFFFFF] text-sm truncate">{member.name}</div>
                                                            {member.userId === project?.createdBy && (
                                                                <span className="px-2 py-0.5 bg-[#FFFFFF] text-[#000000] text-xs rounded-md font-medium">
                                                                    Owner
                                                                </span>
                                                            )}
                                                            {member.role && member.role !== 'member' && (
                                                                <span className="px-2 py-0.5 bg-[#242424] text-[#FFFFFF] text-xs rounded-md capitalize">
                                                                    {member.role}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-[#FFFFFF]/60 truncate">{member.email}</div>
                                                    </div>
                                                </div>
                                                {canManageTeam && member.userId !== auth.currentUser.uid && member.userId !== project?.createdBy && (
                                                    <div className="flex items-center gap-2 ml-3">
                                                        <select
                                                            value={member.role || 'member'}
                                                            onChange={(e) => updateMemberRole(member.userId, e.target.value)}
                                                            className="px-2 py-1 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs text-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#FFFFFF]/20"
                                                        >
                                                            <option value="member">Member</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                        <button
                                                            onClick={() => removeMember(member.userId)}
                                                            className="p-1.5 text-[#FFFFFF]/60 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                                            title="Remove member"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Invitations & Actions */}
                        <div className="space-y-6">{canManageTeam && (
                                <div>
                                    <h3 className="text-base font-medium mb-4 text-[#FFFFFF] flex items-center">
                                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Invite New Member
                                    </h3>
                                    <div className="bg-[#000000] border border-[#242424] rounded-lg p-4">
                                        <form onSubmit={sendInvitation} className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-[#FFFFFF]/80 mb-2">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={emailToInvite}
                                                    onChange={(e) => setEmailToInvite(e.target.value)}
                                                    placeholder="colleague@company.com"
                                                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#242424] rounded-md text-[#FFFFFF] placeholder-[#FFFFFF]/40 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30"
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full px-4 py-2.5 bg-[#FFFFFF] text-[#000000] rounded-md hover:bg-[#FFFFFF]/90 transition-colors disabled:opacity-50 font-medium flex items-center justify-center"
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                        Send Invitation
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                        <p className="text-xs text-[#FFFFFF]/50 mt-3 text-center">
                                            An email invitation will be sent with a secure join link
                                        </p>
                                    </div>
                                </div>
                            )}{canManageTeam && (
                    <div className="mb-6">
                        <h3 className="text-base font-medium mb-4 text-[#FFFFFF]">Invite Team Member</h3>
                        <form onSubmit={sendInvitation} className="flex gap-3">
                            <input
                                type="email"
                                value={emailToInvite}
                                onChange={(e) => setEmailToInvite(e.target.value)}
                                placeholder="Enter email address"
                                className="flex-1 px-3 py-2.5 bg-[#000000] border border-[#242424] rounded-md text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2.5 bg-[#FFFFFF] text-[#000000] rounded-md hover:bg-[#FFFFFF]/90 transition-colors disabled:opacity-50 font-medium"
                            >
                                {loading ? 'Sending...' : 'Invite'}
                            </button>
                        </form>
                        <p className="text-xs text-[#FFFFFF]/60 mt-2">
                            The invitation link will be copied to your clipboard. Share it with the team member.
                        </p>
                    </div>
                )}                {/* Team Members */}
                <div className="mb-6">
                    <h3 className="text-base font-medium mb-4 text-[#FFFFFF]">Team Members ({teamMembers.length})</h3>
                    <div className="space-y-3">
                        {teamMembers.map((member) => (
                            <div key={member.userId} className="flex items-center justify-between p-3 bg-[#000000] border border-[#242424] rounded-md">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={member.photoURL}
                                        alt={member.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                        <div className="font-medium text-[#FFFFFF] text-sm">{member.name}</div>
                                        <div className="text-xs text-[#FFFFFF]/60">{member.email}</div>
                                    </div>
                                    {member.userId === project?.createdBy && (
                                        <span className="px-2 py-1 bg-[#242424] text-[#FFFFFF] text-xs rounded-md">
                                            Owner
                                        </span>
                                    )}
                                    {member.role && member.role !== 'member' && (
                                        <span className="px-2 py-1 bg-[#242424] text-[#FFFFFF] text-xs rounded-md capitalize">
                                            {member.role}
                                        </span>
                                    )}
                                </div>
                                {canManageTeam && member.userId !== auth.currentUser.uid && member.userId !== project?.createdBy && (
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={member.role || 'member'}
                                            onChange={(e) => updateMemberRole(member.userId, e.target.value)}
                                            className="px-2 py-1 bg-[#0A0A0A] border border-[#242424] rounded-md text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30"
                                        >
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button
                                            onClick={() => removeMember(member.userId)}
                                            className="p-1 text-[#FFFFFF]/60 hover:text-red-400 transition-colors"
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
                </div>                {/* Pending Invitations */}
                {invitations.length > 0 && (
                    <div>
                        <h3 className="text-base font-medium mb-4 text-[#FFFFFF]">Pending Invitations ({invitations.length})</h3>
                        <div className="space-y-3">
                            {invitations.map((invite) => (
                                <div key={invite.id} className="flex items-center justify-between p-3 bg-[#000000] border border-[#242424] rounded-md">
                                    <div>
                                        <div className="font-medium text-[#FFFFFF] text-sm">{invite.email}</div>
                                        <div className="text-xs text-[#FFFFFF]/60">
                                            Invited by {invite.invitedBy.name} • {new Date(invite.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {canManageTeam && (
                                        <button
                                            onClick={() => cancelInvitation(invite.id, invite.token)}
                                            className="px-3 py-1 text-sm text-[#FFFFFF]/60 hover:text-red-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>                            ))}
                        </div>
                    </div>
                )}

                {/* Leave Team Option for Non-Owners */}
                {!isProjectOwner && (
                    <div className="mt-6 pt-6 border-t border-[#242424]">
                        <button
                            onClick={leaveTeam}
                            className="w-full px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors font-medium"
                        >
                            Leave Team
                        </button>
                        <p className="text-xs text-[#FFFFFF]/50 mt-2 text-center">
                            You will lose access to this project and all its contents.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamManager;
