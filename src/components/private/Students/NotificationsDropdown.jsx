import React, { useEffect, useRef, useState } from "react";
import { CheckCircleIcon, InformationCircleIcon, XMarkIcon, BellIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";

export default function NotificationsDropdown({ isOpen, onClose, onUpdate }) {
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Fetch from API when modal opens
  useEffect(() => {
    if (!isOpen || !token) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
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
    };

    fetchNotifications();
  }, [isOpen, token]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-16 right-0 sm:right-6 w-[340px] sm:w-[380px] bg-white dark:bg-[#09314F] rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.4)] border border-gray-100 dark:border-[#1a4a75] overflow-hidden z-[999] animate-in fade-in slide-in-from-top-4 duration-300 origin-top-right flex flex-col max-h-[85vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#1a4a75] bg-gray-50 dark:bg-[#06243A]">
        <div>
          <h3 className="font-black text-[#09314F] dark:text-white text-lg tracking-tight uppercase">Notifications</h3>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
            You have {(Array.isArray(notifications) ? notifications : []).filter(n => !n.read_at).length} unread messages
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-[#1a4a75] rounded-full transition-colors text-gray-400 dark:text-gray-300">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1 p-2">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 rounded-full border-4 border-blue-50 border-t-[#09314F] dark:border-blue-900 dark:border-t-white"></div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.slice(0, 5).map((notif) => (
            <Link 
              to="/student/notifications"
              key={notif.id} 
              onClick={onClose}
              className={`p-4 mx-2 my-2 rounded-2xl flex gap-4 transition-colors cursor-pointer block ${
                notif.read_at 
                  ? "bg-transparent hover:bg-gray-50 dark:hover:bg-[#1a4a75]/30" 
                  : "bg-blue-50/50 dark:bg-[#1a4a75] hover:bg-blue-50 dark:hover:bg-[#205280]"
              }`}
            >
              <div className="mt-1 flex-shrink-0">
                {notif.data?.type === "success" || notif.type?.toLowerCase().includes("success") ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                ) : (
                  <InformationCircleIcon className="w-6 h-6 text-[#09314F] dark:text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                  <h4 className={`font-bold text-sm capitalize ${notif.read_at ? "text-gray-800 dark:text-gray-200" : "text-[#09314F] dark:text-white"}`}>
                    {notif.data?.type || "Notification"}
                  </h4>
                  {!notif.read_at && <span className="w-2 h-2 rounded-full bg-[#E83831] flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1 leading-relaxed line-clamp-2">
                  {notif.data?.message || ""}
                </p>
                <span className="text-[10px] font-black tracking-wider text-gray-400 dark:text-gray-500 uppercase mt-3 block">
                  {new Date(notif.created_at).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                  })}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-6 py-12 text-center text-gray-400">
            <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold">No notifications yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-[#1a4a75] bg-gray-50/50 dark:bg-[#06243A]/50 text-center">
        <Link 
          to="/student/notifications" 
          onClick={onClose}
          className="text-sm font-bold text-[#09314F] dark:text-blue-400 hover:underline"
        >
          See all notifications
        </Link>
      </div>
    </div>
  );
}
