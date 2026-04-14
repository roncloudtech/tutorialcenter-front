import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const tabs = [
  { label: "Dashboard", icon: HomeIcon, to: "/staffs/manage-staffs" },
  { label: "Staffs", icon: UsersIcon, to: "/staffs/manage-staffs" },
  { label: "Students", icon: UserGroupIcon, to: "/staffs/manage-students" },
  { label: "Calendar", icon: CalendarDaysIcon, to: "/staffs/calendar" },
];

export default function StaffMobileBottomNav() {
  return (
    <nav className="
      fixed bottom-0 inset-x-0 z-50
      bg-[#09314F] text-white
      h-16
      flex justify-around items-center
      lg:hidden
      border-t border-white/10
      shadow-[0_-4px_10px_rgba(0,0,0,0.1)]
    ">
      {tabs.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) => `
            flex flex-col items-center gap-1 text-[10px] sm:text-xs transition-all duration-300
            ${isActive ? "text-blue-400 scale-110" : "text-gray-400 hover:text-white"}
          `}
        >
          <Icon className={`w-5 h-5 ${to === window.location.pathname ? "stroke-2" : "stroke-1"}`} />
          <span className="font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
