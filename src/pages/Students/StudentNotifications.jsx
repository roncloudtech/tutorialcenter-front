import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext";
import { 
  BellIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  InformationCircleIcon, 
  EyeIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import NotificationDetailModal from "../../components/private/Students/NotificationDetailModal.jsx";

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [toast, setToast] = useState(null);
  const { token } = useAuth();
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = response.data;
      // Handle Laravel pagination (resData.data) or flat array
      const notificationList = resData?.data && Array.isArray(resData.data) 
        ? resData.data 
        : (Array.isArray(resData) ? resData : []);
      setNotifications(notificationList);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update locally
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      // Sync Header
      window.dispatchEvent(new CustomEvent('updateUnreadCount'));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setToast({ type: "success", message: "All notifications marked as read" });
      // Sync Header
      window.dispatchEvent(new CustomEvent('updateUnreadCount'));
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (selectedNotif?.id === id) setSelectedNotif(null);
      setToast({ type: "success", message: "Notification deleted" });
      // Sync Header
      window.dispatchEvent(new CustomEvent('updateUnreadCount'));
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const openDetail = (notif) => {
    setSelectedNotif(notif);
    if (!notif.read_at) {
      handleMarkAsRead(notif.id);
    }
  };

  return (
    <DashboardLayout pagetitle="Notifications">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[2000] px-8 py-4 bg-[#09314F] text-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3">
          <CheckBadgeIcon className="w-5 h-5 text-green-400" />
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-4">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inbox</p>
            <h2 className="text-xl font-black text-[#09314F] dark:text-white mt-0.5">Your Updates</h2>
          </div>
          
          <button 
            onClick={handleMarkAllAsRead}
            disabled={!notifications.some(n => !n.read_at)}
            className="px-6 py-3 bg-white dark:bg-[#09314F] border border-gray-100 dark:border-[#1a4a75] text-[#09314F] dark:text-gray-300 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 dark:hover:bg-[#1a4a75] transition-all disabled:opacity-50 shadow-sm"
          >
            Mark all read
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-blue-100 border-t-[#09314F] rounded-full" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4 px-2">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => openDetail(notif)}
                className={`group relative p-6 bg-white dark:bg-[#09314F] rounded-[32px] border border-gray-100 dark:border-[#1a4a75] shadow-sm transition-all hover:shadow-md cursor-pointer flex items-start gap-6 ${
                  !notif.read_at ? "ring-2 ring-[#09314F]/10 dark:ring-blue-500/10" : "opacity-80 hover:opacity-100"
                }`}
              >
                {/* Icon Column */}
                <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  notif.data?.type === "success" ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
                }`}>
                  {notif.data?.type === "success" ? <CheckCircleIcon className="w-6 h-6" /> : <InformationCircleIcon className="w-6 h-6" />}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-[17px] font-black tracking-tight capitalize ${!notif.read_at ? "text-[#09314F] dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                      {notif.data?.type || "Notification"}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap pt-1">
                      {new Date(notif.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-2">
                    {notif.data?.message}
                  </p>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-1/2 -translate-y-1/2 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-3 bg-gray-50 dark:bg-[#06243A] rounded-xl text-[#09314F] dark:text-blue-400">
                    <EyeIcon className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif.id);
                    }}
                    className="p-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Unread indicator */}
                {!notif.read_at && (
                  <div className="absolute top-6 left-6 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white dark:bg-[#09314F]/40 rounded-[48px] border-2 border-dashed border-gray-200 dark:border-[#1a4a75] mx-4 shadow-inner">
            <BellIcon className="w-16 h-16 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-gray-600 text-lg font-bold">Your notification inbox is clear.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <NotificationDetailModal 
        notification={selectedNotif} 
        onClose={() => setSelectedNotif(null)} 
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
}
