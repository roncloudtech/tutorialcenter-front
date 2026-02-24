import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useState, useMemo } from "react";

export default function RightPanel({ collapsed, setCollapsed }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [notifOpen, setNotifOpen] = useState(true);

  // Memoized today (fixes eslint warning)
  const today = useMemo(() => new Date(), []);

  const currentDateLabel = useMemo(() => {
    return today.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
        fixed top-0 right-0 h-screen
        ${collapsed ? "w-2" : "w-80"}
        transition-all duration-300
        bg-gray-100 dark:bg-gray-900
        border-l border-gray-200 dark:border-gray-700
        flex flex-col
      `}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -left-3 top-1/2 -translate-y-1/2
          bg-blue-900 text-white
          p-1.5 rounded-full shadow-lg
        "
      >
        {collapsed ? (
          <ChevronLeftIcon className="w-4 h-4" />
        ) : (
          <ChevronRightIcon className="w-4 h-4" />
        )}
      </button>

      {!collapsed && (
        <div className="h-full overflow-y-auto p-4 space-y-6">

          {/* ================= Calendar ================= */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold dark:text-white">Calendar</h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentDateLabel}
              </span>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium dark:text-white">
                  {calendarData.monthLabel}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setMonthOffset((p) => p - 1)}>
                    <ChevronLeftIcon className="w-4 h-4 dark:text-white" />
                  </button>
                  <button onClick={() => setMonthOffset((p) => p + 1)}>
                    <ChevronRightIcon className="w-4 h-4 dark:text-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-xs mb-2 text-gray-500 dark:text-gray-300">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="text-center">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-sm">
                {calendarData.days.map((dayObj, idx) => (
                  <div
                    key={idx}
                    className={`h-5 flex items-center justify-center rounded-md
                      ${
                        isToday(dayObj)
                          ? "bg-blue-900 text-white"
                          : dayObj.currentMonth
                          ? "text-gray-800 dark:text-gray-200"
                          : "text-gray-400"
                      }
                    `}
                  >
                    {dayObj.day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= Notifications ================= */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div
              onClick={() => setNotifOpen(!notifOpen)}
              className="flex justify-between items-center cursor-pointer"
            >
              <h3 className="font-semibold dark:text-white">Notification</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium dark:text-gray-300">
                  100
                </span>
                {notifOpen ? (
                  <ChevronUpIcon className="w-4 h-4 dark:text-white" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 dark:text-white" />
                )}
              </div>
            </div>

            {notifOpen && (
              <div className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-h-60 overflow-y-auto space-y-3 text-sm">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-md p-2"
                  >
                    <div className="dark:text-gray-200">
                      Sample notification message
                    </div>
                    <div className="text-xs text-right text-gray-500 dark:text-gray-400">
                      7:12pm
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= Today's Classes ================= */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold dark:text-white">
                Today's Classes
              </h3>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 space-y-4 text-sm">
              {[
                ["bg-blue-400", "Physics Master Class", "8:30am"],
                ["bg-amber-400", "English Master Class", "11:00am"],
                ["bg-red-500", "Mathematics Master Class", "2:30pm"],
                ["bg-yellow-400", "Chemistry Master Class", "5:30pm"],
              ].map(([color, title, time], idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded ${color}`} />
                    <span className="dark:text-gray-200">
                      {title}
                    </span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">
                    {time}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </aside>
  );
}