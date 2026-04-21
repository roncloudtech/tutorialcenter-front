import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "./Sidebar.jsx";
import RightPanel from "./RightPanel.jsx";
import MobileHeader from "./MobileHeader.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import { BellIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useStaffAuth } from "../../../context/StaffAuthContext";
import NotificationsDropdown from "../Students/NotificationsDropdown";
import StaffInactivityModal from "./StaffInactivityModal.jsx";

export default function StaffDashboardLayout({
  children,
  pagetitle,
  hideHeader = false,
  RightPanelComponent: CustomRightPanel,
  hideMobileTitle = false,
  hideMobileBell = false,
  backPath = null,
  backLabel = "Back"
}) {
  const navigate = useNavigate();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { token } = useStaffAuth();

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

    const toggleHandler = () => setIsNotificationsOpen(prev => !prev);
    window.addEventListener('toggleNotifications', toggleHandler);
    window.addEventListener('updateUnreadCount', fetchUnreadCount);

    return () => {
      window.removeEventListener('toggleNotifications', toggleHandler);
      window.removeEventListener('updateUnreadCount', fetchUnreadCount);
    };
  }, [fetchUnreadCount]);

  // Default to the standard RightPanel if no custom one is provided
  const RightPanelToRender = CustomRightPanel || RightPanel;

  return (
    <div className="min-h-screen bg-[#E6E9EC] dark:bg-gray-900">
      <StaffInactivityModal />
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden">
        <MobileHeader
          pagetitle={pagetitle}
          hideTitle={hideMobileTitle}
          hideBell={hideMobileBell}
          unreadCount={unreadCount}
          onBellClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        />

        <main className="pt-16 pb-20 px-4">
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
            <div className="mb-10 mt-2 px-0">
              {/* Back Button Subheader */}
              {backPath && (
                <div className="flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-left-4">
                  <button 
                    onClick={() => navigate(backPath)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-[#0F2843] transition-colors group"
                  >
                    <ChevronLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-[13px] font-bold">Back</span>
                  </button>
                  <span className="text-gray-300 text-[13px]">/</span>
                  <span className="text-[13px] font-black text-[#0F2843]">{backLabel}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
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
                        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-[#E83831] rounded-full border-2 border-white shadow-sm flex items-center justify-center px-1">
                          <span className="text-[10px] font-black text-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        </span>
                      )}
                    </button>
                  </div>
                  <NotificationsDropdown
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                    onUpdate={fetchUnreadCount}
                    token={token}
                    viewAllLink="/staff/notifications"
                  />
                </div>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
