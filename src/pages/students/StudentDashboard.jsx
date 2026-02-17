import { useEffect, useState } from "react";
import ProgressCard from "../../components/private/ProgressCard";
import DashboardLayout from "../../components/private/DashboardLayout";
import axios from "axios";

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
      {/* <h1 className="text-xl font-semibold mb-6 dark:text-white">
        Dashboard
      </h1> */}

      {loading ? (
        <p className="text-sm text-gray-500">Loading courses...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
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
    </DashboardLayout>
  );
}