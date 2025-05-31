import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, database } from '../config/firebase';
import { ref, get, set, update, remove } from 'firebase/database';
import { toast } from 'react-toastify';

const JoinTeam = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setError('Invalid invitation link');
            setLoading(false);
            return;
        }

        loadInvitation(token);
    }, [searchParams]);

    const loadInvitation = async (token) => {
        try {
            const inviteRef = ref(database, `invitations/${token}`);
            const snapshot = await get(inviteRef);

            if (!snapshot.exists()) {
                setError('Invitation not found or has expired');
                return;
            }

            const inviteData = snapshot.val();
            
            // Check if invitation has expired
            if (inviteData.expiresAt < Date.now()) {
                setError('This invitation has expired');
                return;
            }

            // Check if invitation is still pending
            if (inviteData.status !== 'pending') {
                setError('This invitation has already been used');
                return;
            }

            setInvitation(inviteData);
        } catch (error) {
            console.error('Error loading invitation:', error);
            setError('Failed to load invitation');
        } finally {
            setLoading(false);
        }
    };

    const joinTeam = async () => {
        if (!auth.currentUser) {
            toast.error('Please sign in to join the team');
            navigate('/auth');
            return;
        }

        if (!invitation) return;

        setJoining(true);
        try {
            const { projectId, token, inviteId, email } = invitation;

            // Check if user's email matches the invitation
            if (auth.currentUser.email.toLowerCase() !== email) {
                toast.error('This invitation was sent to a different email address');
                return;
            }

            // Add user to project team members
            const memberData = {
                userId: auth.currentUser.uid,
                name: auth.currentUser.displayName || 'Unknown',
                email: auth.currentUser.email,
                photoURL: auth.currentUser.photoURL || `https://api.dicebear.com/7.x/avatars/svg?seed=${auth.currentUser.uid}`,
                role: 'member',
                joinedAt: Date.now()
            };

            const memberRef = ref(database, `projects/${projectId}/teamMembers/${auth.currentUser.uid}`);
            await set(memberRef, memberData);

            // Add project to user's projects list
            const userProjectRef = ref(database, `users/${auth.currentUser.uid}/projects/${projectId}`);
            await set(userProjectRef, {
                projectId,
                joinedAt: Date.now(),
                role: 'member'
            });

            // Mark invitation as accepted and remove it
            const projectInviteRef = ref(database, `projects/${projectId}/invitations/${inviteId}`);
            const globalInviteRef = ref(database, `invitations/${token}`);
            
            await Promise.all([
                remove(projectInviteRef),
                remove(globalInviteRef)
            ]);

            toast.success(`Successfully joined ${invitation.projectName}!`);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error joining team:', error);
            toast.error('Failed to join team');
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090f] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading invitation...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#09090f] text-white flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-16 h-16 mx-auto mb-4 text-red-400">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors font-medium"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090f] text-white">
            <div className="max-w-md mx-auto pt-20 px-6">
                <div className="bg-[#111119] border border-gray-800 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold mb-2">Join Team</h1>
                    <p className="text-gray-400 mb-6">
                        You've been invited to join the team
                    </p>

                    {invitation && (
                        <div className="bg-[#1a1a23] border border-gray-700 rounded-lg p-4 mb-6 text-left">
                            <h3 className="font-semibold text-lg mb-2">{invitation.projectName}</h3>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <span>Invited by:</span>
                                    <span className="text-white">{invitation.invitedBy.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>Email:</span>
                                    <span className="text-white">{invitation.invitedBy.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>Invited on:</span>
                                    <span className="text-white">{new Date(invitation.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!auth.currentUser ? (
                        <div className="space-y-4">
                            <p className="text-gray-400 text-sm">
                                Please sign in to join this team
                            </p>
                            <button
                                onClick={() => navigate('/auth')}
                                className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors font-medium"
                            >
                                Sign In
                            </button>
                        </div>
                    ) : auth.currentUser.email.toLowerCase() !== invitation?.email ? (
                        <div className="space-y-4">
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <p className="text-yellow-400 text-sm">
                                    This invitation was sent to <strong>{invitation?.email}</strong>, but you're signed in as <strong>{auth.currentUser.email}</strong>.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/auth')}
                                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            >
                                Sign in with correct account
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={joinTeam}
                                disabled={joining}
                                className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {joining ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Joining...
                                    </>
                                ) : (
                                    'Join Team'
                                )}
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full px-6 py-3 bg-transparent border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JoinTeam;
