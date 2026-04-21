import React, { useState, useEffect } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

export default function SettingsSidebar({ collapsed, setCollapsed }) {
  const { student, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // Fetch student courses dynamically
  useEffect(() => {
    const fetchCourses = async () => {
      if (!token) return;
      try {
        setLoadingCourses(true);
        const res = await axios.get(`${API_BASE_URL}/api/students/courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        setCourses(res?.data?.courses || []);
      } catch (error) {
        console.error("Failed to fetch student courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [API_BASE_URL, token]);

  const studentLoaded = student?.firstname && student?.surname;
  const fullName = studentLoaded
    ? `${student.firstname} ${student.surname}`
    : "First & Last Name";
  const email = student?.email || "User@Email.Com";

  // Parse courses from API for display
  const trainingStr = loadingCourses 
    ? "Loading..." 
    : courses.length > 0
      ? courses.map(c => c.course?.title || c.title).join(", ")
      : "No courses enrolled";
    
  const departmentStr = student?.department || "Science";

  return (
    <>
    <aside
      className={`
        fixed top-2 right-2 h-[calc(100vh-16px)] z-[100]
        rounded-xl
        w-80 transition-all duration-300 ease-in-out
        ${collapsed ? "translate-x-[328px]" : "translate-x-0"}
        bg-white dark:bg-gray-900 shadow-2xl
        flex flex-col border-l border-gray-200 dark:border-gray-800
        overflow-x-hidden
      `}
    >
      <div className="h-full overflow-y-auto overflow-x-hidden px-6 py-8 flex flex-col items-center relative">
        {/* THE BUTTON - Wrapped "D" Shape as per RightPanel */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            absolute -left-2 top-[60%] -translate-y-1/2
            bg-[#09314F] text-white
            w-5 h-9
            rounded-r-xl
            flex items-center justify-center
            hover:bg-[#09314F]/80 z-10
            transition-all duration-300 ease-in-out
          `}
        >
          <Icon 
            icon={collapsed ? "lucide:chevron-right" : "lucide:chevron-left"} 
            className="w-5 h-5 text-white ml-0.5" 
            style={{ strokeWidth: "6px" }}
          />
        </button>

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

        <div className="w-full flex justify-start flex-col mb-8 overflow-hidden">
            <h2 className="text-xl font-bold text-[#09314F] dark:text-white leading-tight truncate">
              {fullName}
            </h2>
            <p className="text-sm text-gray-500 truncate">{email}</p>
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
            {/* <InfoRow label="Class:" value="#01" /> */}
            <InfoRow label="Department:" value={departmentStr} />
            <InfoRow label="Training:" value={trainingStr} />
          </div>
        </div>
      </div>
    </aside>

    {/* ================= Sentinel Trigger (Visible only when collapsed) ================= */}
    {collapsed && (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed right-0 top-[60%] -translate-y-1/2 bg-[#09314F] text-white w-5 h-9 rounded-l-xl flex items-center justify-center hover:bg-[#09314F]/80 z-[101] shadow-[-4px_0_15px_rgba(0,0,0,0.1)] transition-all animate-in fade-in slide-in-from-right-4 duration-500"
      >
        <ChevronLeftIcon className="w-4 h-4 text-white stroke-[3]" />
      </button>
    )}
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center gap-4 w-full border-b border-gray-100 pb-2 last:border-0 dark:border-gray-800 overflow-hidden">
      <span className="font-semibold text-[#09314F] dark:text-gray-300 flex-shrink-0">
        {label}
      </span>
      <span className="text-gray-600 dark:text-gray-400 text-right truncate flex-1 leading-snug">
        {value}
      </span>
    </div>
  );
}
