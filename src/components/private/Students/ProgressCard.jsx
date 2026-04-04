import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function ProgressCard({ title, end_date, subjects = [] }) {
  const [open, setOpen] = useState(false);

  // Average progress for course progress bar
  const avgProgress =
    subjects.length > 0
      ? subjects.reduce((sum, s) => sum + (s.progress || 0), 0) /
        subjects.length
      : 0;

  return (
    <div className="bg-white dark:bg-[#09314F]/50 dark:backdrop-blur-md border border-transparent dark:border-[#09314F] rounded-xl shadow overflow-hidden isolate">
      
      {/* Accordion Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex justify-between items-center text-left"
      >
        <div>
          <h3 className="font-semibold text-sm dark:text-white">{title}</h3>
          <div className="text-xs text-gray-500 dark:text-gray-100">
            End Date: {new Date(end_date).toDateString()}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-100">
            Subjects {subjects.length}
          </span>
        </div>

        <ChevronDownIcon
          className={`w-5 h-5 transition-transform duration-300 dark:text-white ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Course Progress Bar (Always Visible) */}
      <div className="px-4 pb-3">
        <div className="h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full">
          <div
            className="h-2 bg-blue-900 dark:bg-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      </div>

      {/* Accordion Body */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 pb-4 space-y-3">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-gray-100 dark:bg-[#09314F]/60 border border-transparent dark:border-[#09314F] rounded-lg px-3 py-2"
            >
              <div className="flex justify-between items-center text-gray-800 dark:text-gray-100">
                <span className="text-sm font-medium">{sub.name}</span>
                <span className="text-xs font-bold">
                  {Math.round(sub.progress || 0)}%
                </span>
              </div>

              <div className="h-2 bg-gray-300 dark:bg-gray-700/50 rounded-full mt-1">
                <div
                  className="h-2 bg-blue-900 dark:bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${sub.progress || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}