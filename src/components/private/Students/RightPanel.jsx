import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

export default function RightPanel({ collapsed, setCollapsed }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [notifOpen, setNotifOpen] = useState(true);
  const [classesOpen, setClassesOpen] = useState(true);
  const { token } = useAuth();

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Memoized today (fixes eslint warning)
  const today = useMemo(() => new Date(), []);

  const currentDateLabel = useMemo(() => {
    const day = today.getDate();
    const month = today.toLocaleDateString("en-GB", { month: "short" });
    const year = today.getFullYear();
    return `${day}-${month}-${year}`; // Matches "8-Jan-2024" format
  }, [today]);

  const calendarData = useMemo(() => {
    const baseDate = new Date(
      today.getFullYear(),
      today.getMonth() + monthOffset,
      1
    );

    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, currentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true });
    }

    // Fill remaining cells (total 42 cells)
    while (days.length < 42) {
      days.push({
        day: days.length - (startDay + daysInMonth) + 1,
        currentMonth: false,
      });
    }

    return {
      monthLabel: baseDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
      days,
      year,
      month,
    };
  }, [monthOffset, today]);

  const isToday = (dayObj) =>
    dayObj.currentMonth &&
    dayObj.day === today.getDate() &&
    calendarData.month === today.getMonth() &&
    calendarData.year === today.getFullYear();

  // Fetch notifications
  useEffect(() => {
    if (!token) return;
    const fetchNotifications = async () => {
      try {
        setNotifLoading(true);
        const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
        const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const resData = response.data;
        const notificationList = resData?.data && Array.isArray(resData.data)
          ? resData.data
          : (Array.isArray(resData) ? resData : []);
        setNotifications(notificationList);
      } catch (error) {
        console.error("Failed to fetch notifications for right panel:", error);
      } finally {
        setNotifLoading(false);
      }
    };
    fetchNotifications();
  }, [token]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <>
      <aside
        className={`
        fixed top-2 right-2 h-screen z-[100]
        rounded-xl
        w-80 transition-all duration-300 ease-in-out
        ${collapsed ? "translate-x-[328px]" : "translate-x-0"}
        bg-white dark:bg-gray-900 shadow-2xl
        flex flex-col border-l border-gray-200 dark:border-gray-800
      `}
      >
        <div className="h-full overflow-y-auto p-2 space-y-4 scrollbar-hide">

          {/* ================= Calendar Card Section ================= */}
          <div className="relative">
            {/* THE BUTTON - Wrapped "D" Shape as per Mockup */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`
              absolute -left-2 top-[60%] -translate-y-1/2
              bg-[#09314F] text-white
              w-5 h-9
              rounded-r-xl
              flex items-center justify-center
              hover:bg-[#09314F]/80 z-10
              transition-all duration-300 ease-in-out
            `}
            >
              <Icon
                icon={collapsed ? "lucide:chevron-left" : "lucide:chevron-right"}
                className="w-5 h-5 text-white ml-1"
                style={{ strokeWidth: "6px" }}
              />
            </button>

            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-[#C5A97A]/60 p-5 shadow-sm transition-opacity duration-300 ${collapsed ? "opacity-0" : "opacity-100"}`}>
              <div
                onClick={() => setClassesOpen(!classesOpen)}
                className="flex justify-between items-center mb-5 cursor-pointer"
              >
                <h3 className="font-black text-[#09314F] dark:text-white uppercase text-[15px] tracking-tighter">Calendar</h3>
                <span className="text-[12px] font-black text-gray-500 dark:text-gray-400">
                  {currentDateLabel}
                </span>
              </div>

              <div className="bg-[#E6E9EC]/50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-600">
                <div className="flex justify-between items-center mb-5">
                  <span className="font-black text-[#09314F] dark:text-white text-[14px]">
                    {calendarData.monthLabel}
                  </span>
                  <div className="flex gap-3">
                    <button onClick={() => setMonthOffset((p) => p - 1)} className="hover:bg-white p-1 rounded-md transition-colors">
                      <ChevronLeftIcon className="w-3.5 h-3.5 text-[#09314F] dark:text-white" />
                    </button>
                    <button onClick={() => setMonthOffset((p) => p + 1)} className="hover:bg-white p-1 rounded-md transition-colors">
                      <ChevronRightIcon className="w-3.5 h-3.5 text-[#09314F] dark:text-white" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 text-[10px] mb-4 text-gray-400 dark:text-gray-400 font-black uppercase tracking-widest">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="text-center">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-[12px]">
                  {calendarData.days.map((dayObj, idx) => (
                    <div
                      key={idx}
                      className={`h-7 flex items-center justify-center transition-all cursor-default font-black
                      ${isToday(dayObj)
                          ? "bg-[#09314F] text-white shadow-lg rounded-sm scale-110"
                          : dayObj.currentMonth
                            ? "text-[#09314F] dark:text-gray-200"
                            : "text-gray-300 dark:text-gray-600"
                        }
                    `}
                    >
                      {dayObj.day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ================= Notification Card ================= */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-[#C5A97A]/60 p-5 shadow-sm transition-opacity duration-300 ${collapsed ? "opacity-0" : "opacity-100"}`}>
            <div
              onClick={() => setNotifOpen(!notifOpen)}
              className="flex justify-between items-center cursor-pointer mb-1"
            >
              <h3 className="font-black text-[#09314F] dark:text-white uppercase text-[15px] tracking-tighter">Notification</h3>
              <div className="flex items-center gap-3">
                <span className={`text-[13px] font-black ${unreadCount > 0 ? 'text-[#E83831]' : 'text-gray-500'}`}>
                  {unreadCount}
                </span>
                {classesOpen ? (
                  <ChevronUpIcon className="w-4 h-4 text-[#09314F] dark:text-white" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 text-[#09314F] dark:text-white" />
                )}
              </div>
            </div>

            {notifOpen && (
              <div className="mt-4">
                <div className="bg-[#E6E9EC]/40 dark:bg-gray-700/50 rounded-2xl p-2 max-h-64 overflow-y-auto space-y-2">
                  {notifLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-3 border-[#09314F]/20 border-t-[#09314F] rounded-full animate-spin" />
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.slice(0, 8).map((notif, idx) => (
                      <div
                        key={notif.id || idx}
                        className={`bg-white dark:bg-gray-800 rounded-xl p-3 border shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${notif.read_at
                          ? 'border-gray-50 dark:border-gray-700'
                          : 'border-[#09314F]/20 dark:border-blue-700'
                          }`}
                      >
                        <div className="text-[11px] font-black text-[#09314F] dark:text-gray-200 leading-snug">
                          {notif.data?.message || notif.message || "New notification"}
                        </div>
                        <div className="text-[9px] text-right text-gray-400 dark:text-gray-500 mt-2 font-black">
                          {notif.created_at
                            ? new Date(notif.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-xs text-gray-400 font-bold">No notifications yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ================= Today's Classes Card ================= */}
<div className={`bg-white dark:bg-gray-800 rounded-2xl border border-[#C5A97A]/60 p-5 shadow-sm transition-opacity duration-300 ${collapsed ? "opacity-0" : "opacity-100"}`}>

  {/* HEADER (click to toggle) */}
  <div
    className="flex justify-between items-center mb-5 cursor-pointer"
    onClick={() => setClassesOpen(prev => !prev)}
  >
    <h3 className="font-black text-[#09314F] dark:text-white uppercase text-[15px] tracking-tighter">
      Today's Classes
    </h3>

    {/* arrow rotates like notification */}
    <ChevronDownIcon
      className={`w-4 h-4 text-[#09314F] dark:text-white transition-transform duration-300 ${
        classesOpen ? "rotate-180" : "rotate-0"
      }`}
    />
  </div>

  {/* COLLAPSIBLE BODY */}
  {classesOpen && (
    <div className="bg-[#E6E9EC]/40 dark:bg-gray-700/50 rounded-2xl p-5 space-y-5">
      {[
        ["bg-[#9AB3D5]", "Physics Master Class", "8:30am"],
        ["bg-[#BDA58E]", "English Master Class", "11:00am"],
        ["bg-[#E67E7E]", "Mathematics Master C...", "2:30pm"],
        ["bg-[#F5CB5C]", "Chemistry Master Class", "5:30pm"],
      ].map(([color, title, time], idx) => (
        <div key={idx} className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className={`w-4 h-4 rounded shadow-sm ${color}`} />
            <span className="text-[12px] font-black text-[#09314F] dark:text-gray-200">
              {title}
            </span>
          </div>
          <span className="text-[11px] font-black text-gray-500 dark:text-gray-400">
            {time}
          </span>
        </div>
      ))}
    </div>
  )}
</div>

      </div>

    </aside >

      {/* ================= Sentinel Trigger (Visible only when collapsed) ================= */ }
  {
    collapsed && (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed right-0 top-[60%] -translate-y-1/2 bg-[#09314F] text-white w-5 h-9 rounded-l-xl flex items-center justify-center hover:bg-[#09314F]/80 z-[50] shadow-[-4px_0_15px_rgba(0,0,0,0.1)] transition-all animate-in fade-in slide-in-from-right-4 duration-500"
      >
        <ChevronLeftIcon className="w-4 h-4 text-white stroke-[3]" />
      </button>
    )
  }
    </>
  );
}