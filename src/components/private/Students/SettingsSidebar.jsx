import React from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";

export default function SettingsSidebar({ collapsed, setCollapsed }) {
  const { student } = useAuth();
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const studentLoaded = student?.firstname && student?.surname;
  const fullName = studentLoaded
    ? `${student.firstname} ${student.surname}`
    : "First & Last Name";
  const email = student?.email || "User@Email.Com";

  // Parse arrays or use defaults for display
  const trainingStr = Array.isArray(student?.selectedTraining)
    ? student.selectedTraining.join(", ")
    : "JAMB, GCE, NECO, WAEC";
    
  const departmentStr = student?.department || "Science";

  return (
    <aside
      className={`
        fixed top-0 right-0 h-screen
        ${collapsed ? "w-2" : "w-80"}
        transition-all duration-300
        bg-white dark:bg-gray-900
        border-l border-gray-200 dark:border-gray-700
        flex flex-col z-40
      `}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -left-3 top-1/2 -translate-y-1/2
          bg-[#09314F] text-white
          p-1.5 rounded-full shadow-lg z-50
        "
      >
        {collapsed ? (
          <ChevronLeftIcon className="w-4 h-4" />
        ) : (
          <ChevronRightIcon className="w-4 h-4" />
        )}
      </button>

      {!collapsed && (
        <div className="h-full overflow-y-auto px-6 py-8 flex flex-col items-center">
          {/* Profile Picture */}
          <div className="w-full flex-shrink-0 relative rounded-[20px] overflow-hidden aspect-[4/5] bg-gray-200 shadow-sm mb-4 border-2 border-transparent hover:border-gray-300 transition-all">
            {student?.profile_picture ? (
              <img
                src={`${API_BASE_URL}/storage/${student.profile_picture}`}
                alt="Profile"
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center text-gray-400 bg-gray-50">
                <span className="text-4xl">📸</span>
              </div>
            )}
          </div>

          <div className="w-full flex justify-start flex-col mb-8">
             <h2 className="text-xl font-bold text-[#09314F] dark:text-white leading-tight">
               {fullName}
             </h2>
             <p className="text-sm text-gray-500">{email}</p>
          </div>
          
          <div className="w-full">
            <h3 className="font-bold text-[#09314F] dark:text-gray-200 mb-4 text-base">
              Information
            </h3>
            
            <div className="space-y-4 text-sm w-full">
              <InfoRow label="Name:" value={fullName} />
              <InfoRow label="Email:" value={email} />
              <InfoRow label="Phone:" value={student?.tel || "+234 123 456 7890"} />
              <InfoRow label="DOB:" value={student?.date_of_birth ? student.date_of_birth.split("T")[0] : "19/10/2000"} />
              <InfoRow label="Address:" value={student?.address || "12 Bode Thomas, Surulere"} />
              <InfoRow label="Location:" value={student?.location || "Lagos, Nigeria"} />
              <InfoRow label="Class:" value="#01" />
              <InfoRow label="Department:" value={departmentStr} />
              <InfoRow label="Training:" value={trainingStr} />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 w-full border-b border-gray-100 pb-2 last:border-0 dark:border-gray-800">
      <span className="font-semibold text-[#09314F] dark:text-gray-300 min-w-[80px]">
        {label}
      </span>
      <span className="text-gray-600 dark:text-gray-400 text-right break-words flex-1 leading-snug">
        {value}
      </span>
    </div>
  );
}
