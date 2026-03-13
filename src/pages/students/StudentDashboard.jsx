import { useEffect, useState } from "react";
import ProgressCard from "../../components/private/Student/ProgressCard";
import DashboardLayout from "../../components/private/Student/DashboardLayout";
import axios from "axios";
import { Icon } from "@iconify/react/dist/iconify.js";
import { BellIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function StudentDashboard() {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const authToken = localStorage.getItem("student_token");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveCourses = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/students/courses`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              Accept: "application/json",
            },
          }
        );
        console.log(res?.data?.courses);
        if (res?.status !== 200) throw new Error(res?.data?.message);

        setCourses(res?.data?.courses || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCourses();
  }, [API_BASE_URL, authToken]);

  return (
    <DashboardLayout>
      <div className="flex flex-col xl:flex-row gap-6 p-2 lg:p-6 w-full max-w-[1600px] mx-auto text-gray-800 dark:text-gray-100">
        
        {/* --- LEFT MAIN COLUMN --- */}
        <div className="flex-1 flex flex-col space-y-6">
          
          {/* Header Row */}
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-800 dark:text-white">
              Dashboard
            </h1>
            <button className="relative p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-100 dark:border-gray-600 hover:bg-gray-50 transition">
              <BellIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-900 rounded-full border border-white"></span>
            </button>
          </div>

          {/* Profile Alert Banner */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm flex items-start sm:items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Please complete your profile! Click the link to{" "}
              <a href="/student/settings" className="text-blue-500 hover:underline font-medium">
                update profile
              </a>
            </p>
          </div>

          {/* Assessment Notification */}
          <div className="bg-[#f8fafc] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 shadow-sm">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              You have English and Mathematics assessment
            </p>
            <span className="text-xs text-gray-500 font-medium">10:15am</span>
          </div>

          {/* Overall Progress Section */}
          <div className="pt-4">
            <div className="flex justify-between items-end mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:chart-bar" className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                <h2 className="text-lg font-bold">Progress Level</h2>
              </div>
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Courses {courses.length || 4}
              </span>
            </div>
            
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
              <span>Start</span>
              <span>Finish</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6 shadow-inner">
              <div 
                className="bg-[#1e3a8a] h-2.5 rounded-full" 
                style={{ width: '15%' }} 
              ></div>
            </div>
          </div>

          {/* Dynamic Courses Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-sm text-gray-500 animate-pulse">Loading active courses...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
              {courses.map((course) => (
                <ProgressCard
                  key={course.enrollment_id}
                  title={course.course?.title}
                  subjects={course.subjects}
                  end_date={course.end_date}
                />
              ))}
            </div>
          )}
        </div>

      

        
      </div>
    </DashboardLayout>
  );
}