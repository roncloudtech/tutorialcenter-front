import Sidebar from "./Sidebar.jsx";
import { useState } from "react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function MobileHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <>
      {/* Sidebar (must be ABOVE header) */}
      <Sidebar
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

        <h1 className="text-sm font-semibold tracking-wide">
          DASHBOARD
        </h1>

        <BellIcon className="w-6 h-6" />
      </header>
    </>
  );
}
