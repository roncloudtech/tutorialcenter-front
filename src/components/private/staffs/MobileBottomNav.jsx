import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const tabs = [
  { label: "Dashboard", icon: HomeIcon },
  { label: "Staffs", icon: UsersIcon },
  { label: "Students", icon: UserGroupIcon },
  { label: "Calendar", icon: CalendarDaysIcon },
];

export default function StaffMobileBottomNav() {
  return (
    <nav
      className="
      fixed bottom-0 inset-x-0 z-40
      bg-[#09314F] text-white
      h-16
      flex justify-around items-center
      lg:hidden
    "
    >
      {tabs.map(({ label, icon: Icon }) => (
        <button
          key={label}
          className="flex flex-col items-center gap-1 text-xs"
        >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

