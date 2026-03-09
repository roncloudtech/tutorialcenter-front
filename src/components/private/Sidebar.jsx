import {
  HomeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/images/tutorial_logo.png";
import collapselogo from "../../assets/images/TC 1.png";

const menuItems = [
  { label: "Dashboard", icon: HomeIcon, destination: "/student/dashboard" },
  { label: "Courses", icon: BookOpenIcon },
  { label: "Master Class", icon: AcademicCapIcon },
  { label: "Exam Practice", icon: ClipboardDocumentCheckIcon },
  { label: "Calendar", icon: CalendarDaysIcon, destination: "/student/calendar" },
  { label: "Assessment", icon: ChartBarIcon },
  { label: "Payment", icon: CreditCardIcon },
  { label: "Games", icon: PuzzlePieceIcon },
  { label: "Settings", icon: Cog6ToothIcon },
  { label: "Help", icon: QuestionMarkCircleIcon },
];

export default function Sidebar({ collapsed, setCollapsed, isOpen, onClose }) {
  const { theme, setTheme } = useTheme();
  const { student, logout } = useAuth();
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const fullName =
    student?.firstname && student?.surname
      ? `${student.firstname} ${student.surname}`
      : "Caleb Samuel Thomas";

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
        <div className="relative flex items-center justify-center p-4">
          <img
            src={collapsed ? collapselogo : logo}
            alt="TC Logo"
            className={`transition-all duration-300 ${
              collapsed ? "w-10" : "w-full"
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
              p-1.5 rounded-full shadow-lg hover:bg-blue-800
            "
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Avatar */}
        <div className="flex px-3 space-y-2 flex-wrap gap-3 items-center">
          <img
            src={student?.profile_picture !== null ? `${API_BASE_URL}/storage/${student?.profile_picture}` : collapselogo}
            alt="Avatar"
            className="rounded-full shadow-lg h-10 w-10 object-cover border-2 border-yellow-400"
          />
          {!collapsed && (
            <div>
              <h6 className="text-yellow-400 text-sm">Hello Student</h6>
              <h3 className="font-bold dark:text-gray-50 text-sm">
                {fullName}
              </h3>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4">
          {menuItems.map(({ label, icon: Icon, destination }) => {
            if (!destination) {
              return (
                <div
                  key={label}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                >
                  <Icon className="w-5 h-5" />
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
                <Icon className="w-5 h-5" />
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