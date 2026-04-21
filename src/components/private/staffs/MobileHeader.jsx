import StaffSidebar from "./Sidebar.jsx";
import { useState } from "react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function StaffMobileHeader({ 
  pagetitle, 
  hideTitle = false, 
  hideBell = false,
  unreadCount = 0,
  onBellClick
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <>
      {/* Sidebar (must be ABOVE header) */}
      <StaffSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <header
        className="
          fixed top-0 inset-x-0 z-40
          h-14 bg-[#09314F] text-white
          flex items-center justify-between px-4
          lg:hidden
        "
      >
        <button
          onClick={toggleSidebar}
          className="focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>

        {!hideTitle && (
          <h1 className="text-sm font-semibold tracking-wide">
            {pagetitle || "STAFF DASHBOARD"}
          </h1>
        )}

        {!hideBell ? (
          <div className="relative">
            <button 
              onClick={onBellClick}
              className="relative p-1 focus:outline-none pointer-events-auto group active:scale-95 transition-all"
            >
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-[#E83831] rounded-full border border-[#09314F] flex items-center justify-center px-0.5">
                  <span className="text-[8px] font-black text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </span>
              )}
            </button>
          </div>
        ) : (
          <div className="w-6 h-6" />
        )}
      </header>
    </>
  );
}
