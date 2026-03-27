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
    icon: "mdi:clipboard-text-outline"
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
    // destination: "/student/games",
  },
  {
    label: "Payment",
    icon: "mdi:credit-card-outline",
    destination: "/student/payment-history", // This makes it clickable!
  },
  {
    label: "Settings",
    icon: "mdi:cog-outline",
    // destination: "/student/settings",
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
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const studentLoaded = student?.firstname && student?.surname;
  const fullName = studentLoaded ? `${student.firstname} ${student.surname}` : null;

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-white dark:bg-gray-900
          border-r dark:border-gray-800
          flex flex-col
          transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="relative flex items-center justify-center p-6 mt-2 mb-2">
          <img
            src={collapsed ? collapselogo : logo}
            alt="TC Logo"
            className={`transition-all duration-300 object-contain ${
              collapsed ? "w-10 h-10" : "w-40 h-auto"
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
              absolute -right-3 top-1/2 -translate-y-1/2
              bg-blue-900 text-white
              p-1.5 rounded-full shadow-lg hover:bg-blue-800 z-10
            "
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Avatar & Name */}
        <div className="flex px-3 space-y-2 flex-wrap gap-3 items-center">
          {studentLoaded ? (
            <img
              src={student?.profile_picture !== null ? `${API_BASE_URL}/storage/${student?.profile_picture}` : collapselogo}
              alt="Avatar"
              className="rounded-full shadow-lg h-10 w-10 object-cover border-2 border-yellow-400"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}
          {!collapsed && (
            <div>
              {studentLoaded ? (
                <>
                  <h6 className="text-yellow-400 text-sm">Hello Student</h6>
                  <h3 className="font-bold dark:text-gray-50 text-sm">{fullName}</h3>
                </>
              ) : (
                <>
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </>
              )}
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4">
          {menuItems.map(({ label, icon, destination }) => {
            if (!destination) {
              return (
                <div
                  key={label}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                >
                  <Icon icon={icon} className="w-5 h-5" />
                  {!collapsed && <span>{label}</span>}
                </div>
              );
            }

            return (
              <NavLink
                key={label}
                to={destination}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg
                  text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-blue-900 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
              >
                <Icon icon={icon} className="w-5 h-5" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-4">
          {/* Theme Toggle */}
          <div
            className={`
              flex items-center bg-gray-100 dark:bg-gray-800
              rounded-full px-2 py-1
              ${collapsed ? "justify-center" : "justify-between"}
            `}
          >
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-3 py-1 rounded-full transition
                ${
                  theme === "light"
                    ? "bg-white text-yellow-500 shadow ring-2 ring-yellow-400/40"
                    : "text-gray-400 hover:text-yellow-500"
                }
              `}
            >
              <SunIcon className="w-4 h-4" />
              {!collapsed && <span className="text-xs">Light</span>}
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-3 py-1 rounded-full transition
                ${
                  theme === "dark"
                    ? "bg-gray-900 text-blue-400 ring-2 ring-blue-400/40"
                    : "text-gray-400 hover:text-blue-400"
                }
              `}
            >
              <MoonIcon className="w-4 h-4" />
              {!collapsed && <span className="text-xs">Dark</span>}
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}