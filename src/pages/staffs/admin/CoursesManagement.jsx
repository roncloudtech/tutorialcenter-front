import { useState } from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import { 
  PlusIcon, 
  PencilSquareIcon, 
  ExclamationTriangleIcon,
  BellIcon
} from "@heroicons/react/24/outline";
import CourseCreate from "../../../components/private/staffs/CourseCreate.jsx";
import CourseEdit from "../../../components/private/staffs/CourseEdit.jsx";
import DisenrolledCourses from "../../../components/private/staffs/DisenrolledCourses.jsx";

export default function CoursesManagement() {
  const [activeTab, setActiveTab] = useState("create");

  const tabs = [
    { id: "create", label: "Create", icon: PlusIcon },
    { id: "edit", label: "Edit", icon: PencilSquareIcon },
    { id: "disenrolled", label: "Disenrolled Courses", icon: ExclamationTriangleIcon },
  ];

  return (
    <StaffDashboardLayout>
      <div className="flex flex-col gap-8 min-h-screen">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-black text-[#0F2843] tracking-tight uppercase">
              Course Management
            </h1>
            <p className="text-gray-400 font-medium mt-1">
              Manage your institution's courses and subjects from one central hub.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-all group">
                <BellIcon className="w-6 h-6 text-[#0F2843] group-hover:scale-110 transition-transform" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </div>
          </div>
        </div>

        {/* Subheadings / Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 backdrop-blur-md rounded-[24px] w-fit border border-gray-200/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2.5 px-6 py-3 rounded-[20px] font-bold text-sm transition-all duration-300
                ${activeTab === tab.id 
                  ? "bg-[#0F2843] text-white shadow-lg shadow-[#0F2843]/20 translate-y-[-1px]" 
                  : "text-gray-500 hover:text-[#0F2843] hover:bg-white/80"
                }
              `}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "text-gray-400"}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === "create" && <CourseCreate />}
          {activeTab === "edit" && <CourseEdit />}
          {activeTab === "disenrolled" && <DisenrolledCourses />}
        </div>

      </div>
    </StaffDashboardLayout>
  );
}
