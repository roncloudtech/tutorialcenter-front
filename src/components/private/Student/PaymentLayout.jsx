// layouts/PaymentLayout.jsx

import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import StudentPaymentRightBar from "./StudentPaymentRightBar.jsx";
import MobileHeader from "./MobileHeader.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";

export default function PaymentLayout({ children, onPaymentAdded }) {
  
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden">
        <MobileHeader />

        <main className="pt-16 pb-20 px-4">
          {children}
        </main>

        <MobileBottomNav />
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:block">
        {/* LEFT SIDEBAR - Same as Dashboard */}
        <Sidebar
          collapsed={leftCollapsed}
          setCollapsed={setLeftCollapsed}
        />

        {/* RIGHT PANEL - Payment Right Bar */}
        <div
          className={`
            fixed top-0 right-0 h-screen bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700
            transition-all duration-300 z-30
            ${rightCollapsed ? "w-0" : "w-[400px]"}
          `}
        >
          {!rightCollapsed && (
            <StudentPaymentRightBar onPaymentAdded={onPaymentAdded} />
          )}
        </div>

        {/* COLLAPSE BUTTON for Right Panel */}
        <button
          onClick={() => setRightCollapsed(!rightCollapsed)}
          className={`
            fixed top-1/2 -translate-y-1/2 z-40
            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
            rounded-l-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700
            transition-all duration-300
            ${rightCollapsed ? "right-0" : "right-[400px]"}
          `}
        >
          <svg
            className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${
              rightCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* MAIN CONTENT AREA */}
        <main
          className={`
            transition-all duration-300 p-6
            ${leftCollapsed ? "ml-20" : "ml-64"}
            ${rightCollapsed ? "mr-0" : "mr-[400px]"}
          `}
        >
          {children}
        </main>
      </div>

    </div>
  );
}