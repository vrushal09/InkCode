import { useState, useEffect } from "react";
import { auth, database } from "../config/firebase";
import { ref, onValue, set } from "firebase/database";

export const useCollaboration = (roomId) => {
    const [collaborators, setCollaborators] = useState([]);
    const [codeBlame, setCodeBlame] = useState({});
    const [lineBlameData, setLineBlameData] = useState({});

    useEffect(() => {
        if (!roomId) return;

        // Track collaborators and project info
        const roomDetailsRef = ref(database, `rooms/${roomId}`);
        const roomDetailsUnsubscribe = onValue(roomDetailsRef, async (snapshot) => {
            const data = snapshot.val() || {};
            const projectId = data.projectId;

            if (projectId) {
                // Load team members from project
                const projectRef = ref(database, `projects/${projectId}/teamMembers`);
                const teamUnsubscribe = onValue(projectRef, (teamSnapshot) => {
                    const teamData = teamSnapshot.val() || {};
                    const teamList = Object.values(teamData).map((member) => ({
                        ...member,
                        id: member.userId,
                        isCreator: member.role === 'owner',
                        lastActive: Date.now() // You can track this more precisely
                    }));
                    setCollaborators(teamList);
                });

                return () => teamUnsubscribe();
            } else {
                // Fallback to old room-based collaborators
                const collaboratorsRef = ref(database, `rooms/${roomId}/collaborators`);
                const collaboratorUnsubscribe = onValue(collaboratorsRef, (snapshot) => {
                    const collaboratorsData = snapshot.val() || {};
                    const collaboratorsList = Object.values(collaboratorsData).map((user) => ({
                        ...user,
                        isCreator: user.id === data.createdBy,
                    }));
                    setCollaborators(collaboratorsList);
                });

                return () => collaboratorUnsubscribe();
            }
        });

        // Add current user to collaborators (for backward compatibility with old rooms)
        const userRef = ref(database, `rooms/${roomId}/collaborators/${auth.currentUser.uid}`);
        set(userRef, {
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName || "Anonymous",
            photoURL:
                auth.currentUser.photoURL ||
                "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
            lastActive: Date.now(),
            isCreator: false,
        });

        // Track blame data
        const blameRef = ref(database, `rooms/${roomId}/codeBlame`);
        const blameUnsubscribe = onValue(blameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCodeBlame(data);
            }
        });

        // Track line-by-line blame data
        const lineBlameRef = ref(database, `rooms/${roomId}/lineBlame`);
        const lineBlameUnsubscribe = onValue(lineBlameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setLineBlameData(data);
            }
        });

        return () => {
            roomDetailsUnsubscribe();
            blameUnsubscribe();
            lineBlameUnsubscribe();
            // Remove user from collaborators on leaving
            set(userRef, null);
        };
    }, [roomId]);

    return {
        collaborators,
        codeBlame,
        lineBlameData
    };
};
