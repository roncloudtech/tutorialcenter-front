import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "./Sidebar.jsx";
import RightPanel from "./RightPanel.jsx";
import MobileHeader from "./MobileHeader.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import { BellIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import InactivityModal from "./InactivityModal";
import VerificationModal from "./VerificationModal";
import { useAuth } from "../../../context/AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";

export default function DashboardLayout({ 
  children, 
  pagetitle, 
  hideHeader = false,
  RightPanelComponent: CustomRightPanel,
  hideMobileTitle = false,
  hideMobileBell = false
}) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { 
    shouldShowProfileAlert, 
    alertMessage, 
    openVerificationModal,
    student,
    token
  } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchUnreadCount();
    window.addEventListener('updateUnreadCount', fetchUnreadCount);
    return () => window.removeEventListener('updateUnreadCount', fetchUnreadCount);
  }, [fetchUnreadCount]);

  // Default to the standard RightPanel if no custom one is provided
  const RightPanelToRender = CustomRightPanel || RightPanel;

  return (
    <div className="min-h-screen bg-[#E6E9EC] dark:bg-gray-900">
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden">
        <MobileHeader 
          pagetitle={pagetitle} 
          hideTitle={hideMobileTitle}
          hideBell={hideMobileBell}
        />

        <main className="pt-16 pb-20 px-4">
          {shouldShowProfileAlert && (
            <div className="mb-6 bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md border border-gray-100 dark:border-[#09314F] p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-3">
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-[12px] font-bold text-[#09314F] dark:text-gray-200">
                Please complete your profile!{" "}
                <button 
                  onClick={() => openVerificationModal(student?.tel && !student?.tel_verified_at ? 'phone' : 'email')}
                  className="text-blue-500 hover:underline"
                >
                  {alertMessage}
                </button>
              </p>
            </div>
          )}
          {children}
        </main>

        <MobileBottomNav />
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:block">
        <Sidebar collapsed={leftCollapsed} setCollapsed={setLeftCollapsed} />

        <RightPanelToRender
          collapsed={rightCollapsed}
          setCollapsed={setRightCollapsed}
        />

        <main
          className={`
            transition-all duration-300 p-6 pt-2
            ${leftCollapsed ? "ml-20" : "ml-64"}
            ${rightCollapsed ? "mr-0" : "mr-80"}
          `}
        >
          {/* Header Row */}
          {!hideHeader && (
            <div className="flex justify-between items-center mb-10 px-0 mt-2">
              <h1 className="text-[36px] font-black text-[#09314F] dark:text-white tracking-tighter leading-none uppercase">
                {pagetitle || "Dashboard"}
              </h1>
              <div className="relative z-50">
                <div 
                  className="bg-white dark:bg-[#09314F]/60 p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-[#09314F] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a4a75] transition-all"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <button className="relative flex items-center justify-center pointer-events-none">
                    <BellIcon className="w-7 h-7 text-[#09314F] dark:text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-[#E83831] rounded-full border-2 border-white dark:border-[#09314F] shadow-sm flex items-center justify-center px-1">
                        <span className="text-[10px] font-black text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>
                      </span>
                    )}
                  </button>
                </div>
                <NotificationsDropdown 
                  isOpen={isNotificationsOpen} 
                  onClose={() => setIsNotificationsOpen(false)} 
                  onUpdate={fetchUnreadCount}
                />
              </div>
            </div>
          )}

          {shouldShowProfileAlert && (
            <div className="mb-8 bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md border border-gray-100 dark:border-[#09314F] p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-red-50 dark:bg-red-900/20 p-2.5 rounded-xl">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-[#09314F] dark:text-gray-200">
                  Account Verification Required
                </p>
                <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                  To secure your account and track attendance, please{" "}
                  <button 
                    onClick={() => openVerificationModal(student?.tel && !student?.tel_verified_at ? 'phone' : 'email')}
                    className="text-[#E83831] hover:underline font-black"
                  >
                    {alertMessage}
                  </button>
                </p>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
      <InactivityModal />
      <VerificationModal />
    </div>
  );
}
