import { useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";

export default function GoogleMeetSessions({ class_link, studentId, class_schedule_id, alreadyOpened }) {
    const { setIsClassActive } = useAuth();
    const sessions = useRef([]);
    const hasUnmounted = useRef(false);
    const popupRef = useRef(null);
    const hasOpened = useRef(false);

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

    const handleJoin = () => {
        const joinedAt = new Date().toISOString();
        if (sessions.current.length === 0 || sessions.current[sessions.current.length - 1].leftAt !== null) {
            sessions.current.push({ joinedAt, leftAt: null, minutesOnCall: 0 });
        }
    };

    const handleLeave = () => {
        if (hasUnmounted.current || sessions.current.length === 0) return;
        const currentSession = sessions.current[sessions.current.length - 1];
        if (currentSession.leftAt !== null) return; 

        const leftAt = new Date().toISOString();
        currentSession.leftAt = leftAt;
        const joinTime = new Date(currentSession.joinedAt).getTime();
        const leaveTime = new Date(leftAt).getTime();
        currentSession.minutesOnCall = Math.round((leaveTime - joinTime) / 60000);
        sendPayload();
    };

    const startClassSession = () => {
        // If it's already open, we can't easily "focus" a _blank tab, 
        // so we just allow a new one to open or assume the user knows it's open.
        if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.focus();
            return;
        }

        // REMOVED: width, height, left, top calculations.
        
        // UPDATED: Changed window name to "_blank" and removed feature string.
        // This makes it open as a standard browser tab.
        popupRef.current = window.open(class_link, "_blank");

        if (popupRef.current) {
            handleJoin();
        } else {
            alert("Please allow popups/redirects to join the class.");
        }
    };

    useEffect(() => {
        setIsClassActive(true);
        
        // Adopt globally opened popup if available
        if (alreadyOpened && window.activeClassPopup && !window.activeClassPopup.closed) {
            popupRef.current = window.activeClassPopup;
            window.activeClassPopup = null; // Clear after adopting
            hasOpened.current = true;
            handleJoin();
        }

        if (!hasOpened.current) {
            startClassSession();
            hasOpened.current = true;
        }

        const checkPopupStatus = setInterval(() => {
            // This still works for tabs! If the user closes the tab, 
            // the 'closed' property becomes true.
            if (popupRef.current && popupRef.current.closed) {
                handleLeave();
                popupRef.current = null;
            }
        }, 3000);

        const handleBeforeUnload = () => {
            // Note: browser security may prevent closing a standard tab 
            // via script if it wasn't opened in a specific way, but it's good practice.
            if (popupRef.current) popupRef.current.close();
            handleLeave();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        
        return () => {
            setIsClassActive(false);
            hasUnmounted.current = true;
            clearInterval(checkPopupStatus);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (popupRef.current && !popupRef.current.closed) {
                popupRef.current.close();
            }
            handleLeave();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [class_link, studentId, class_schedule_id, setIsClassActive]);

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-xl border border-[#BB9E7F]/30 shadow-2xl">
            <div className="w-16 h-16 border-4 border-[#BB9E7F] border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-white tracking-tight text-center uppercase">Class Session Active</h2>
            <p className="text-gray-400 mt-2 max-w-xs text-center">
                The Google Meet opened in a new tab. Keep this dashboard tab open to track your attendance.
            </p>
            <button 
                onClick={startClassSession}
                className="mt-6 px-8 py-3 bg-[#BB9E7F] text-black font-black uppercase tracking-widest rounded-lg hover:bg-[#a68a6d] transition-all transform active:scale-95"
            >
                Open Class Tab
            </button>
        </div>
    );
}