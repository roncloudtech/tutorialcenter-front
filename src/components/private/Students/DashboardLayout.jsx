import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import RightPanel from "./RightPanel.jsx";
import MobileHeader from "./MobileHeader.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import { BellIcon } from "@heroicons/react/24/outline";

export default function DashboardLayout({ children, pagetitle, hideHeader = false }) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden">
        <MobileHeader pagetitle={pagetitle} />

        <main className="pt-16 pb-20 px-4">{children}</main>

        <MobileBottomNav />
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:block">
        <Sidebar collapsed={leftCollapsed} setCollapsed={setLeftCollapsed} />

        <RightPanel
          collapsed={rightCollapsed}
          setCollapsed={setRightCollapsed}
        />

        <main
          className={`
            transition-all duration-300 p-6
            ${leftCollapsed ? "ml-20" : "ml-64"}
            ${rightCollapsed ? "mr-1" : "mr-80"}
          `}
        >
          {/* Header Row */}
          {!hideHeader && (
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
              <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-800 dark:text-white">
                {pagetitle || "Dashboard"}
              </h1>
              <button className="relative p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-100 dark:border-gray-600 hover:bg-gray-50 transition">
                <BellIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-900 rounded-full border border-white"></span>
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
