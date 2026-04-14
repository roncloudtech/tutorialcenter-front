import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import RightPanel from "./RightPanel.jsx";
import MobileHeader from "./MobileHeader.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import { BellIcon } from "@heroicons/react/24/outline";

export default function StaffDashboardLayout({ 
  children, 
  pagetitle,
  hideHeader = true,
  RightPanelComponent: CustomRightPanel,
  hideMobileTitle = false,
  hideMobileBell = false
}) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // Default to the standard RightPanel if no custom one is provided
  const RightPanelToRender = CustomRightPanel || RightPanel;

  return (
    <div className="min-h-screen bg-[#E6E9EC] dark:bg-gray-900">
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden">
        <MobileHeader 
          pagetitle={pagetitle} 
          hideTitle={hideMobileTitle}
          hideBell={hideMobileBell}
        />

        <main className="pt-16 pb-20 px-4">
          {children}
        </main>

        <MobileBottomNav />
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:block">
        <Sidebar collapsed={leftCollapsed} setCollapsed={setLeftCollapsed} />

        <RightPanelToRender
          collapsed={rightCollapsed}
          setCollapsed={setRightCollapsed}
        />

        <main
          className={`
            transition-all duration-300 p-6 pt-2
            ${leftCollapsed ? "ml-20" : "ml-64"}
            ${rightCollapsed ? "mr-0" : "mr-80"}
          `}
        >
          {/* Header Row */}
          {!hideHeader && (
            <div className="flex justify-between items-center mb-10 px-0 mt-2">
              <h1 className="text-[36px] font-black text-[#09314F] dark:text-white tracking-tighter leading-none uppercase">
                {pagetitle || "Dashboard"}
              </h1>
              <div className="relative z-50">
                <div 
                  className="bg-white dark:bg-[#09314F]/60 p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-[#09314F] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a4a75] transition-all"
                >
                  <button className="relative flex items-center justify-center pointer-events-none">
                    <BellIcon className="w-7 h-7 text-[#09314F] dark:text-white" />
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#E83831] rounded-full border-2 border-white shadow-sm"></span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
