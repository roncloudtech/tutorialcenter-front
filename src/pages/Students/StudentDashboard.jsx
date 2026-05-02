import { useEffect, useState } from "react";
import ProgressCard from "../../components/private/Students/ProgressCard";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";
import axios from "axios";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function StudentDashboard() {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const { token: authToken } = useAuth();

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
      <div className="flex flex-col xl:flex-row gap-6 w-full max-w-[1600px] mx-auto text-gray-800 dark:text-gray-100">

        {/* --- LEFT MAIN COLUMN --- */}
        <div className="flex-1 flex flex-col space-y-6">

          {/* Header Row */}
          {/* <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-800 dark:text-white">
              Dashboard
            </h1>
            <button className="relative p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-100 dark:border-gray-600 hover:bg-gray-50 transition">
              <BellIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-900 rounded-full border border-white"></span>
            </button>
          </div> */}


          {/* Assessment Notification */}
          <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-xl p-2 border border-[#C5A97A]/40 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <div className="bg-[#E6E9EC]/60 dark:bg-[#09314F]/80 p-5 rounded-lg relative min-h-[100px] flex flex-col justify-between">
              <p className="text-[14px] font-bold text-[#09314F] dark:text-gray-200">
                You have English and Mathematics assessment
              </p>
              <div className="flex justify-end">
                <span className="text-[11px] font-black text-[#09314F] dark:text-gray-400">10:15am</span>
              </div>
            </div>
          </div>

          {/* Overall Progress Section */}
          <div className="pt-4">
            <div className="flex justify-between items-end mb-3 border-b border-gray-200 dark:border-[#09314F]/50 pb-2">
              <div className="flex items-center gap-2">
                <Icon icon="game-icons:progression" className="w-6 h-6 text-[#09314F] dark:text-blue-300" />
                <h2 className="text-lg font-bold dark:text-white">Progress Level</h2>
              </div>
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Courses {courses.length || 4}
              </span>
            </div>

            <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              <span>Start</span>
              <span>Finish</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2.5 mb-6 shadow-inner">
              <div
                className="bg-[#1e3a8a] dark:bg-blue-400 h-2.5 rounded-full"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10 items-start">
              {courses.map((course, index) => (
                <ProgressCard
                  key={`course-${course.enrollment_id || index}`}
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
