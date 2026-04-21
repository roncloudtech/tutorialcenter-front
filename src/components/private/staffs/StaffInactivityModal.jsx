import React, { useState, useEffect } from "react";
import { useStaffAuth } from "../../../context/StaffAuthContext";
import { ExclamationTriangleIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function StaffInactivityModal() {
  const { isInactiveModalOpen, resetActivity, logout } = useStaffAuth();
  const [timeLeft, setTimeLeft] = useState(120); // 120 seconds = 2 minutes

  useEffect(() => {
    if (!isInactiveModalOpen) {
      setTimeLeft(120);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isInactiveModalOpen, logout]);

  if (!isInactiveModalOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={resetActivity}
      />
      
      {/* Modal Card */}
      <div className="relative bg-white/90 dark:bg-[#09314F]/90 backdrop-blur-xl border border-white/20 dark:border-[#BB9E7F]/30 rounded-[40px] shadow-2xl p-8 md:p-12 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          {/* Warning Icon Container */}
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mb-8 ring-8 ring-red-50/50 dark:ring-red-900/10">
            <ExclamationTriangleIcon className="w-10 h-10 text-[#E83831]" />
          </div>

          <h2 className="text-3xl font-black text-[#09314F] dark:text-white uppercase italic tracking-tighter mb-4">
            STAFF SECURITY <span className="text-[#BB9E7F] not-italic">CHECK</span>
          </h2>
          
          <p className="text-gray-500 dark:text-blue-200 font-bold text-sm leading-relaxed mb-8">
            You've been inactive for more than <span className="text-[#09314F] dark:text-white">3 minutes</span>. 
            For security reasons, this staff session will terminate unless you choose to stay.
          </p>

          {/* Timer Display */}
          <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 mb-8">
            <ClockIcon className="w-5 h-5 text-[#BB9E7F]" />
            <span className="text-lg font-black text-[#09314F] dark:text-white font-mono">
              Auto-logout in: {formatTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={resetActivity}
            className="w-full py-5 bg-[#09314F] text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}
