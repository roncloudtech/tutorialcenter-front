import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../components/private/students/DashboardLayout.jsx";
import axios from "axios";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const hours = Array.from({ length: 24 }, (_, i) => i); // 0 → 23

export default function StudentCalendar() {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const authToken = localStorage.getItem("student_token");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/students/courses`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        });

        if (res.status !== 200) throw new Error(res?.data?.message);

        setCourses(res?.data?.courses || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [API_BASE_URL, authToken]);

  // Flatten schedules
  const scheduledClasses = useMemo(() => {
    const classes = [];

    courses.forEach((course) => {
      course.subjects?.forEach((subject) => {
        subject.schedule?.forEach((slot) => {
          classes.push({
            title: subject.title,
            day: slot.day,
            start: slot.start_time,
            end: slot.end_time,
          });
        });
      });
    });

    return classes;
  }, [courses]);

  const formatHour = (hour) => {
    const suffix = hour >= 12 ? "PM" : "AM";
    const formatted = hour % 12 === 0 ? 12 : hour % 12;
    return `${formatted} ${suffix}`;
  };

  const getClassForCell = (day, hour) => {
    return scheduledClasses.find((cls) => {
      const classHour = parseInt(cls.start.split(":")[0]);
      return cls.day === day && classHour === hour;
    });
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6 dark:text-white">Calendar</h1>

      {loading ? (
        <p className="text-sm text-gray-500">Loading schedule...</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header Row */}
            <div className="grid grid-cols-8 bg-amber-600 text-white rounded-t-lg">
              <div className="p-3"></div>
              {daysOfWeek.map((day) => (
                <div key={day} className="p-3 text-center font-medium">
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Time Grid */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700"
              >
                {/* Time Column */}
                <div className="p-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatHour(hour)}
                </div>

                {/* Day Columns */}
                {daysOfWeek.map((day) => {
                  const cls = getClassForCell(day, hour);

                  return (
                    <div
                      key={day}
                      className="relative h-16 border-l border-gray-200 dark:border-gray-700 p-1"
                    >
                      {cls && (
                        <div className="absolute inset-1 bg-blue-500 text-white text-xs rounded-md p-2 shadow">
                          {cls.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
