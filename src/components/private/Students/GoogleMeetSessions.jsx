import { useEffect, useRef } from "react";
// import { XMarkIcon } from "@heroicons/react/24/outline";

export default function GoogleMeetSessions({ class_link, studentId, class_schedule_id }) {
    const sessions = useRef([]);
    const hasUnmounted = useRef(false);

    useEffect(() => {
        const handleJoin = () => {
            const joinedAt = new Date().toISOString();
            sessions.current.push({ joinedAt, leftAt: null, minutesOnCall: 0 });
        };

        const sendPayload = () => {
            const payload = {
                studentId: studentId?.toString(),
                class_schedule_id: class_schedule_id?.toString(),
                sessions: sessions.current
            };
            const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
            const syncUrl = `${API_BASE_URL}/api/sessions/sync`;
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon(syncUrl, blob);
        };

        const handleLeave = () => {
             // If we've already handled the leave unmount, don't do it again
             if (hasUnmounted.current) return;
             hasUnmounted.current = true;

             if (sessions.current.length === 0) return;
             
             const currentSession = sessions.current[sessions.current.length - 1];
             if (currentSession.leftAt !== null) return; // already closed
             
             const leftAt = new Date().toISOString();
             currentSession.leftAt = leftAt;
             
             const joinTime = new Date(currentSession.joinedAt).getTime();
             const leaveTime = new Date(leftAt).getTime();
             currentSession.minutesOnCall = Math.round((leaveTime - joinTime) / 60000);

             sendPayload();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Not returning payload here, as they might just be minimizing tab, but we could pause tracking.
                // The requirements say "on rejoin -> push a new session". 
                // We'll treat page hidden as "leaving" and page visible as "rejoining" to be accurate.
                if (!hasUnmounted.current) {
                    const currentSession = sessions.current[sessions.current.length - 1];
                    if (currentSession && currentSession.leftAt === null) {
                        const leftAt = new Date().toISOString();
                        currentSession.leftAt = leftAt;
                        const joinTime = new Date(currentSession.joinedAt).getTime();
                        currentSession.minutesOnCall = Math.round((new Date(leftAt).getTime() - joinTime) / 60000);
                        
                        sendPayload();
                    }
                }
            } else if (document.visibilityState === 'visible') {
                if (!hasUnmounted.current) {
                    handleJoin();
                }
            }
        };

        const handleBeforeUnload = () => {
            handleLeave();
        };

        // Initialize first session
        handleJoin();

        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            handleLeave();
        };
    }, [studentId, class_schedule_id]);

    useEffect(() => {
        if (class_link) {
            window.location.replace(class_link);
        }
    }, [class_link]);

    return (
        <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center w-screen h-screen">
            <div className="text-center text-white">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold tracking-widest uppercase">Redirecting to Class...</h2>
                <p className="text-sm text-gray-400 mt-2">You will be redirected shortly.</p>
            </div>
        </div>
    );
}