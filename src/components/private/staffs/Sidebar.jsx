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
  { label: "Students", icon: UserGroupIcon, destination: "/staffs/tutor/students" },
  { label: "Master Class", icon: AcademicCapIcon, destination: "/staffs/tutor/master-class" },
  { label: "Calendar", icon: CalendarDaysIcon },
  { label: "Courses", icon: BookOpenIcon },
  { label: "Assessment", icon: ClipboardDocumentListIcon },
  { label: "Exams", icon: ClipboardDocumentCheckIcon },
  { label: "Settings", icon: Cog6ToothIcon },
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
        // Handle whether the role was stringified as a JSON string `"tutor"` or raw `tutor`
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

    // Initial load
    updateProfileData();

    // Listen for cross-tab storage changes
    window.addEventListener("storage", updateProfileData);
    // Listen for custom event from same tab updates (e.g. from the profile settings page)
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

  const profilePic = staffInfo?.profile_picture 
    ? (process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test") + "/storage/" + staffInfo.profile_picture 
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
          {profilePic ? (
            <img 
              src={profilePic} 
              alt={fullName} 
              className="rounded-full shadow-lg h-10 w-10 object-cover border-2 border-[#BB9E7F]" 
            />
          ) : (
            <div className="rounded-full shadow-lg h-10 w-10 flex items-center justify-center bg-blue-900 text-white font-bold border-2 border-[#BB9E7F]">
              {fullName?.[0] || "S"}
            </div>
          )}
          {!collapsed && (
            <div>
              <h6 className="text-[#BB9E7F] text-[11px] font-black uppercase tracking-widest leading-tight mb-0.5">
                Welcome {staffRole}
              </h6>
              <h3 className="font-bold dark:text-gray-50 text-[13px] leading-tight truncate max-w-[140px]">
                {fullName}
              </h3>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4">
          {(staffRole.toLowerCase() === "tutor" ? tutorMenuItems : adminMenuItems).map(({ label, icon: Icon, destination }) => {
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
            onClick={() => {
              localStorage.removeItem("staff_token");
              localStorage.removeItem("staff_info");
              localStorage.removeItem("staff_role");
              
              window.location.href = "/staff/login";
            }}
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

