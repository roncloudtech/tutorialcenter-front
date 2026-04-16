import { useState, useEffect } from "react";
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import logo from "../../../assets/images/tutorial_logo.png";
import collapselogo from "../../../assets/images/TC 1.png";

const adminMenuItems = [
  { label: "Dashboard", icon: HomeIcon },
  { label: "Manage Staffs", icon: UsersIcon, destination: "/staffs/manage-staffs" },
  { label: "Manage Students", icon: UserGroupIcon },
  { label: "Manage Guardian", icon: ShieldCheckIcon },
  { label: "Master Class", icon: AcademicCapIcon, destination: "/staffs/master-class" },
  { label: "Calendar", icon: CalendarDaysIcon },
  { label: "Manage Courses", icon: BookOpenIcon, destination: "/staffs/manage-courses" },
  { label: "Exams", icon: ClipboardDocumentCheckIcon },
  { label: "Audit Log", icon: ChartBarIcon },
  { label: "Settings", icon: Cog6ToothIcon },
];

const tutorMenuItems = [
  { label: "Dashboard", icon: HomeIcon, destination: "/staffs/tutor/dashboard" },
  { label: "Master Class", icon: AcademicCapIcon, destination: "/staffs/tutor/master-class" },
  { label: "Calendar", icon: CalendarDaysIcon },
  { label: "Assessment", icon: ClipboardDocumentListIcon, destination: "/staffs/tutor/assessment" },
  { label: "Exams", icon: ClipboardDocumentCheckIcon, destination: "/staffs/tutor/exams" },
  { label: "Settings", icon: Cog6ToothIcon, destination: "/staffs/tutor/settings" },
];

const courseAdvisorMenuItems = [
  { label: "Dashboard", icon: HomeIcon, destination: "/staffs/course-advisor/dashboard" },
  { label: "Manage Students", icon: UserGroupIcon, destination: "/staffs/course-advisor/students" },
  { label: "Manage Guardian", icon: ShieldCheckIcon, destination: "/staffs/course-advisor/guardians" },
  { label: "Master Class", icon: AcademicCapIcon, destination: "/staffs/course-advisor/master-class" },
  { label: "Calendar", icon: CalendarDaysIcon, destination: "/staffs/course-advisor/calendar" },
  { label: "Exams", icon: ClipboardDocumentCheckIcon, destination: "/staffs/course-advisor/exams" },
  { label: "Settings", icon: Cog6ToothIcon, destination: "/staffs/course-advisor/settings" },
];

export default function StaffSidebar({ collapsed, setCollapsed, isOpen, onClose }) {
  const { theme, setTheme } = useTheme();

  const [staffInfo, setStaffInfo] = useState(null);
  const [staffRole, setStaffRole] = useState("Staff");

  useEffect(() => {
    const updateProfileData = () => {
      const storedStaff = localStorage.getItem("staff_info");
      const storedRole = localStorage.getItem("staff_role");
      let parsedStaff = null;

      if (storedStaff) {
        try {
          parsedStaff = JSON.parse(storedStaff);
          setStaffInfo(parsedStaff);
        } catch (e) {
          console.error("Error parsing staff_info", e);
        }
      }

      if (storedRole) {
        try {
          const parsed = JSON.parse(storedRole);
          setStaffRole(parsed.charAt(0).toUpperCase() + parsed.slice(1));
        } catch {
          setStaffRole(storedRole.charAt(0).toUpperCase() + storedRole.slice(1));
        }
      } else if (parsedStaff && parsedStaff.role) {
        setStaffRole(parsedStaff.role.charAt(0).toUpperCase() + parsedStaff.role.slice(1));
      }
    };

    updateProfileData();
    window.addEventListener("storage", updateProfileData);
    window.addEventListener("staffProfileUpdated", updateProfileData);

    return () => {
      window.removeEventListener("storage", updateProfileData);
      window.removeEventListener("staffProfileUpdated", updateProfileData);
    };
  }, []);

  const fullName =
    staffInfo?.firstname && staffInfo?.surname
      ? `${staffInfo.firstname} ${staffInfo.surname}`
      : "Staff Member";

  const staffLoaded = staffInfo?.firstname && staffInfo?.surname;

  const profilePic = staffInfo?.profile_picture 
    ? (process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test") + "/storage/" + staffInfo.profile_picture 
    : null;

  const handleLogout = () => {
    localStorage.removeItem("staff_token");
    localStorage.removeItem("staff_info");
    localStorage.removeItem("staff_role");
    window.location.href = "/staff/login";
  };

  const getMenuItems = () => {
    const roleLower = staffRole.toLowerCase();
    if (roleLower === "tutor") return tutorMenuItems;
    if (roleLower === "course advisor" || roleLower === "advisor") return courseAdvisorMenuItems;
    return adminMenuItems;
  };

  const menuItems = getMenuItems();

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
          fixed top-0 lg:top-2 left-0 lg:left-2 z-50 
          h-screen lg:h-[calc(100vh-22px)]
          bg-white dark:bg-gray-900
          transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100"}
          lg:rounded-xl lg:shadow-2xl flex flex-col
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

        {/* Avatar & Name */}
        <div className={`flex flex-col min-h-0 px-2 md:px-3 lg:px-4 ${collapsed ? "items-center" : ""}`}>
          <div className={`flex py-1 md:py-2 items-center ${collapsed ? "justify-center" : "gap-2 md:gap-3"}`}>
            {staffLoaded ? (
              profilePic ? (
                <img
                  src={profilePic}
                  alt={fullName}
                  className="rounded-full shadow-lg h-10 w-10 object-cover border-2 border-[#BB9E7F] flex-shrink-0"
                />
              ) : (
                <div className="rounded-full shadow-lg h-10 w-10 flex items-center justify-center bg-[#09314F] text-white font-bold border-2 border-[#BB9E7F] flex-shrink-0">
                  {fullName?.[0] || "S"}
                </div>
              )
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
            )}
            {!collapsed && (
              <div className="min-w-0">
                {staffLoaded ? (
                  <>
                    <h6 className="text-[#BB9E7F] text-xs">Welcome {staffRole}</h6>
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
            {menuItems.map(({ label, icon: Icon, destination }) => {
              if (!destination) {
                return (
                  <div
                    key={label}
                    className={`w-full flex items-center rounded-lg text-xs md:text-sm font-medium text-gray-400 cursor-not-allowed ${
                      collapsed ? "justify-center py-2.5" : "gap-3 px-2 md:px-3 py-1.5 md:py-2 lg:py-2.5"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
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
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer - scrolls on mobile/tablet */}
          <div className="p-1 md:p-2 lg:p-3 pt-1 md:pt-2 lg:pt-3 space-y-3 md:space-y-3 lg:space-y-5 mt-auto lg:hidden">
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
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              {!collapsed && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </div>

        {/* Footer - fixed on desktop */}
        <div className="hidden lg:block p-3 pt-3 space-y-3 flex-shrink-0">
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
            onClick={handleLogout}
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
