import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";
import { useState, useMemo } from "react";

export default function RightPanel({ collapsed, setCollapsed }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [notifOpen, setNotifOpen] = useState(true);

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

  return (
    <aside
      className={`
        fixed top-2 right-2 h-screen z-[40]
        w-80 transition-all duration-300 ease-in-out
        ${collapsed ? "translate-x-[298px]" : "translate-x-0"}
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
              bg-blue-900 text-white
              w-5 h-9
              rounded-r-xl
              flex items-center justify-center
              hover:bg-blue-800 z-10
              transition-all duration-300 ease-in-out
            `}
          >
            <Icon 
              icon={collapsed ? "lucide:chevron-right" : "lucide:chevron-left"} 
              className="w-5 h-5 text-white ml-1" 
              style={{ strokeWidth: "6px" }}
            />
          </button>

          <div className={`bg-white dark:bg-gray-800 rounded-xl border border-[#C5A97A]/60 p-5 shadow-sm transition-opacity duration-300 ${collapsed ? "opacity-0" : "opacity-100"}`}>
            <div className="flex justify-between items-center mb-5">
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
                      ${
                        isToday(dayObj)
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
              <span className="text-[13px] font-black text-gray-500">
                100
              </span>
              {notifOpen ? (
                <ChevronUpIcon className="w-4 h-4 text-[#09314F] dark:text-white" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-[#09314F] dark:text-white" />
              )}
            </div>
          </div>

          {notifOpen && (
            <div className="flex gap-2 mt-4">
              <div className="flex-1 bg-[#E6E9EC]/40 dark:bg-gray-700/50 rounded-2xl p-2 max-h-64 overflow-y-auto space-y-2 scrollbar-hide">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-50 dark:border-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  >
                    <div className="text-[11px] font-black text-[#09314F] dark:text-gray-200 leading-snug">
                      {idx % 2 === 0 
                        ? "A student made a general English challenge, be the first to respond" 
                        : "Teacher daily challenge is available for your review"}
                    </div>
                    <div className="text-[9px] text-right text-gray-400 dark:text-gray-500 mt-2 font-black">
                      7:12pm
                    </div>
                  </div>
                ))}
              </div>
              {/* Visual Scrollbar Indicator */}
              <div className="w-1.5 bg-gray-100 dark:bg-gray-700 rounded-full flex flex-col items-center py-1">
                <div className="w-full h-1/3 bg-[#09314F] dark:bg-blue-500 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* ================= Today's Classes Card ================= */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-[#C5A97A]/60 p-5 shadow-sm transition-opacity duration-300 ${collapsed ? "opacity-0" : "opacity-100"}`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-black text-[#09314F] dark:text-white uppercase text-[15px] tracking-tighter">
              Today's Classes
            </h3>
            <ChevronUpIcon className="w-4 h-4 text-[#09314F] dark:text-white" />
          </div>

          <div className="bg-[#E6E9EC]/40 dark:bg-gray-700/50 rounded-2xl p-5 space-y-5">
            {[
              ["bg-[#9AB3D5]", "Physics Master Class", "8:30am"],
              ["bg-[#BDA58E]", "English Master Class", "11:00am"],
              ["bg-[#E67E7E]", "Mathematics Master C...", "2:30pm"],
              ["bg-[#F5CB5C]", "Chemistry Master Class", "5:30pm"],
            ].map(([color, title, time], idx) => (
              <div
                key={idx}
                className="flex justify-between items-center"
              >
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
        </div>

      </div>
    </aside>
  );
}