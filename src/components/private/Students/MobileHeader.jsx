import Sidebar from "./Sidebar.jsx";
import { useState } from "react";
import axios from "axios";
import { useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import NotificationsDropdown from "./NotificationsDropdown";

export default function MobileHeader({ pagetitle, hideTitle = false, hideBell = false }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token } = useAuth();

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

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <>
      {/* Sidebar (must be ABOVE header) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <header
        className="
          fixed top-0 inset-x-0 z-40
          h-14 bg-[#09314F] text-white
          flex items-center justify-between px-4
          lg:hidden
        "
      >
        <button
          onClick={toggleSidebar}
          className="focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>

        {!hideTitle && (
          <h1 className="text-sm font-semibold tracking-wide">
            {pagetitle || "Dashboard"}
          </h1>
        )}

        {!hideBell ? (
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
              className="relative p-1 focus:outline-none pointer-events-auto"
            >
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 bg-[#E83831] rounded-full border border-[#09314F] shadow-sm flex items-center justify-center px-1">
                  <span className="text-[9px] font-black text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>
                </span>
              )}
            </button>
            <NotificationsDropdown 
              isOpen={isNotificationsOpen} 
              onClose={() => setIsNotificationsOpen(false)} 
              onUpdate={fetchUnreadCount}
            />
          </div>
        ) : (
          <div className="w-6 h-6" /> // Empty placeholder to keep flex spacing
        )}
      </header>
    </>
  );
}
