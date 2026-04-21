import React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";

import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import logo from "../../../assets/images/tutorial_logo.png";
import collapselogo from "../../../assets/images/TC 1.png";

const menuItems = [
  {
    label: "Dashboard",
    icon: "mynaui:home-solid",
    destination: "/student/dashboard",
  },
  {
    label: "Courses",
    icon: "mdi:book-open-page-variant",
    // destination: "/student/courses",
  },
  {
    label: "Master Class",
    icon: "healthicons:i-training-class",
    // destination: "/student/master-class",
    destination: "/student/class-schedule",
  },
  {
    label: "Exam Practice",
    icon: "mdi:clipboard-text-outline",
  },
  {
    label: "Calendar",
    icon: "mdi:calendar-month",
    destination: "/student/calendar",
  },
  {
    label: "Assessment",
    icon: "mdi:file-document-edit-outline",
    // destination: "/student/assessment",
  },
  {
    label: "Games & Fun",
    icon: "mdi:controller-classic",
    destination: "/student/games",
  },
  {
    label: "Payment",
    icon: "mdi:credit-card-outline",
    destination: "/student/payment-history", // This makes it clickable!
  },
  {
    label: "Settings",
    icon: "mdi:cog-outline",
    destination: "/student/settings",
  },
  {
    label: "Help",
    icon: "mdi:help-circle-outline",
    // destination: "/student/help",
  },
];

export default function Sidebar({ collapsed, setCollapsed, isOpen, onClose }) {
  const { theme, setTheme } = useTheme();
  const { student, logout } = useAuth();
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test"; 

  const studentLoaded = student?.firstname && student?.surname;
  const fullName = studentLoaded
    ? `${student.firstname} ${student.surname}`
    : null;

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-[55] lg:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 lg:top-2 left-0 lg:left-2 z-[60] lg:z-50 
          h-screen lg:h-[calc(100vh-22px)]
          bg-white dark:bg-gray-900
          transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100"}
          lg:rounded-xl lg:shadow-2xl flex flex-col overflow-hidden
        `}
      >
        {/* Logo */}
        <div className="relative flex items-center justify-center p-3 lg:p-6 mt-1 mb-1 overflow-visible flex-shrink-0">
          <img
            src={collapsed ? collapselogo : logo}
            alt="TC Logo"
            className={`transition-all duration-300 object-contain ${
              collapsed ? "w-10 h-10" : "w-28 md:w-32 lg:w-40 h-auto"
            }`}
          />

          <button
            onClick={() => {
              if (isOpen !== undefined && onClose) {
                onClose();
                return;
              }
              setCollapsed(!collapsed);
            }}
            className="
              absolute -right-0 top-[70%] -translate-y-1/2
                          bg-[#09314F] text-white
              w-5 h-9
              rounded-l-xl
              flex items-center justify-center
              hover:bg-[#09314F]/80 z-10
              transition-all duration-300 ease-in-out
            "
          >
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5 ml-1" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 mr-1" />
            )}
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll flex flex-col ${collapsed ? "items-center" : "px-3 md:px-4"}`}>
          {/* Avatar & Name */}
          <div className="flex flex-col min-h-0">
          <div className={`flex py-1 md:py-2 items-center ${collapsed ? "justify-center" : "gap-2 md:gap-3"}`}>
            {studentLoaded ? (
              <img
                src={
                  student?.profile_picture !== null
                    ? `${API_BASE_URL}/storage/${student?.profile_picture}`
                    : collapselogo
                }
                alt="Avatar"
                className="rounded-full shadow-lg h-10 w-10 object-cover border-2 border-[#BB9E7F] flex-shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
            )}
            {!collapsed && (
              <div className="min-w-0">
                {studentLoaded ? (
                  <>
                    <h6 className="text-[#BB9E7F] text-xs">Welcome Student</h6>
                    <h3 className="font-bold dark:text-gray-50 text-sm truncate">
                      {fullName}
                    </h3>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-1" />
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Menu */}
          <nav className="px-0.5 md:px-2 lg:px-3 space-y-1 md:space-y-1.5 lg:space-y-2 mt-2 md:mt-3 lg:mt-6 flex flex-col">
            {menuItems.map(({ label, icon, destination }) => {
              if (!destination) {
                return (
                  <div
                    key={label}
                    className={`w-full flex items-center rounded-lg text-xs md:text-sm font-medium text-gray-400 cursor-not-allowed ${
                      collapsed ? "justify-center py-2.5" : "gap-3 px-2 md:px-3 py-1.5 md:py-2 lg:py-2.5"
                    }`}
                  >
                    <Icon icon={icon} className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </div>
                );
              }

              return (
                <NavLink
                  key={label}
                  to={destination}
                  className={({ isActive }) => `
                    w-full flex items-center rounded-lg
                    text-xs md:text-sm font-medium transition duration-200
                    ${collapsed ? "justify-center py-2.5" : "gap-3 px-2 md:px-3 lg:px-3 py-1.5 md:py-2 lg:py-2.5"}
                    ${
                      isActive
                        ? "bg-[#09314F] text-white shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  <Icon icon={icon} className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              );
            })}
          </nav>

            {/* Mobile Footer */}
            <div className="p-1 md:p-2 lg:p-3 pt-1 md:pt-2 lg:pt-3 pb-20 space-y-3 md:space-y-3 lg:space-y-5 mt-auto lg:hidden border-t border-gray-100 dark:border-gray-800">
              {/* Theme Toggle (Mobile) */}
              <div className={`flex items-center gap-1 ${collapsed ? "justify-center" : "justify-between px-2"}`}>
                {!collapsed && <span className="text-xs text-gray-500">Light</span>}
                <button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${theme === "dark" ? "bg-blue-900" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full shadow transition-all duration-300 flex items-center justify-center ${theme === "dark" ? "right-1 bg-gray-800" : "left-1 bg-white"}`}>
                    {theme === "light" ? <SunIcon className="w-3 h-3 text-yellow-500" /> : <MoonIcon className="w-3 h-3 text-blue-300" />}
                  </span>
                </button>
                {!collapsed && <span className="text-xs text-gray-500">Dark</span>}
              </div>
              <button onClick={logout} className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                {!collapsed && <span className="text-sm font-medium">Logout</span>}
              </button>
            </div>

            {/* Desktop Footer (Now inside scroll area to prevent overlap) */}
            <div className="hidden lg:block p-3 pt-3 space-y-3 mt-auto">
              <div className={`flex items-center gap-1 ${collapsed ? "justify-center" : "justify-between px-2"}`}>
                {!collapsed && <span className="text-xs text-gray-500">Light</span>}
                <button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${theme === "dark" ? "bg-blue-900" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full shadow transition-all duration-300 flex items-center justify-center ${theme === "dark" ? "right-1 bg-gray-800" : "left-1 bg-white"}`}>
                    {theme === "light" ? <SunIcon className="w-3 h-3 text-yellow-500" /> : <MoonIcon className="w-3 h-3 text-blue-300" />}
                  </span>
                </button>
                {!collapsed && <span className="text-xs text-gray-500">Dark</span>}
              </div>
              <button onClick={logout} className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                {!collapsed && <span className="text-sm font-medium">Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
