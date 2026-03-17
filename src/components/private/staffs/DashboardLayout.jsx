import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import RightPanel from "./RightPanel.jsx";
import MobileHeader from "./MobileHeader.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";

export default function StaffDashboardLayout({ children }) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile-only Header */}
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={leftCollapsed} setCollapsed={setLeftCollapsed} />
        <RightPanel
          collapsed={rightCollapsed}
          setCollapsed={setRightCollapsed}
        />
      </div>

      {/* Main Content Branch - Persists through all breakpoints */}
      <main
        className={`
          transition-all duration-300 px-4 pt-16 pb-20 
          lg:pt-6 lg:pb-6 lg:p-6
          ${leftCollapsed ? "lg:ml-20" : "lg:ml-64"}
          ${rightCollapsed ? "lg:mr-1" : "lg:mr-80"}
        `}
      >
        {children}
      </main>

      {/* Mobile-only Nav */}
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}

