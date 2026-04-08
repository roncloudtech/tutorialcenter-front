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
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed top-2 left-2 z-50 h-[calc(100vh-22px)]
          bg-white dark:bg-gray-900
          rounded-xl shadow-2xl
          flex flex-col
          overflow-hidden
          transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-12 lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="relative flex items-center justify-center p-6 mt-2 mb-2 overflow-visible">
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
   absolute -right-0 top-[70%] -translate-y-1/2
  bg-blue-900 text-white
  w-5 h-9
  rounded-l-xl
  flex items-center justify-center
  hover:bg-blue-800 z-10
  transition-all duration-300 ease-in-out
            "
          >
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Avatar & Name */}
        <div className="flex px-4 py-2 items-center gap-3">
          {studentLoaded ? (
            <img
              src={
                student?.profile_picture !== null
                  ? `${API_BASE_URL}/storage/${student?.profile_picture}`
                  : collapselogo
              }
              alt="Avatar"
              className="rounded-full shadow-lg h-10 w-10 object-cover border-2 border-amber-200 flex-shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
          )}
          {!collapsed && (
            <div className="min-w-0">
              {studentLoaded ? (
                <>
                  <h6 className="text-amber-600 text-xs">Welcome Student</h6>
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
        <nav className="flex-1 px-3 space-y-2 mt-6 flex flex-col">
          {menuItems.map(({ label, icon, destination }) => {
            if (!destination) {
              return (
                <div
                  key={label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
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
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition duration-200
                  ${
                    isActive
                      ? "bg-blue-900 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-gray-800"
                  }
                `}
              >
                <Icon icon={icon} className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-4">
          {/* Theme Toggle */}
          <div
            className={`flex items-center gap-1 ${collapsed ? "justify-center" : "justify-between px-2"}`}
          >
            {!collapsed && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Light
              </span>
            )}

            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`
      relative w-12 h-6 rounded-full transition-all duration-300
      ${theme === "dark" ? "bg-blue-900" : "bg-gray-300"}
    `}
            >
              <span
                className={`
        absolute top-1 w-4 h-4 rounded-full shadow transition-all duration-300 flex items-center justify-center
        ${theme === "dark" ? "right-1 bg-gray-800" : "left-1 bg-white"}
      `}
              >
                {theme === "light" ? (
                  <SunIcon className="w-3 h-3 text-yellow-500" />
                ) : (
                  <MoonIcon className="w-3 h-3 text-blue-300" />
                )}
              </span>
            </button>

            {!collapsed && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Dark
              </span>
            )}
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
