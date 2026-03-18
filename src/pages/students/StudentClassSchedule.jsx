import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/private/students/DashboardLayout";

export default function StudentClassSchedule() {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const authToken = localStorage.getItem("student_token");

  const [nextClass, setNextClass] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =============================
     FETCH STUDENT SCHEDULE
  ============================= */

  const fetchStudentSchedule = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/api/students/class/schedule`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        },
      );


      const data = await res?.data;
      console.log(data);

      setNextClass(data.next_class || null);
      setTodayClasses(data.today_classes || []);
      setWeekSchedule(data.week_schedule || []);
      setUpcomingSessions(data.upcoming_sessions || []);
    } catch (err) {
      console.error("Failed to fetch student schedule", err);
      setError(
        err.response?.data?.message || "Unable to load schedule at the moment.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentSchedule();
  }, []);

  /* =============================
     HELPERS
  ============================= */

  const formatSessionDate = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(hour, minute);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =============================
     LOADING / ERROR
  ============================= */

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading schedule...</div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  /* =============================
     PAGE UI
  ============================= */

  return (
    <DashboardLayout pagetitle="Class Schedule">
      <div className="p-6 space-y-8">
        {/* =============================
          NEXT CLASS
      ============================= */}

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Next Class</h2>

          {nextClass ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{nextClass.class.title}</h3>

              <p className="text-gray-500">
                {formatSessionDate(nextClass.session_date)}
              </p>

              <p>
                {formatTime(nextClass.starts_at)} -{" "}
                {formatTime(nextClass.ends_at)}
              </p>

              <div className="text-sm text-gray-600">
                Tutor(s):{" "}
                {nextClass.class.staffs
                  .map((s) => `${s.firstname} ${s.surname}`)
                  .join(", ")}
              </div>

              <a
                href={nextClass.class_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
              >
                Join Class
              </a>
            </div>
          ) : (
            <p className="text-gray-500">No upcoming classes scheduled.</p>
          )}
        </section>

        {/* =============================
          TODAY CLASSES
      ============================= */}

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Classes</h2>

          {todayClasses.length > 0 ? (
            <div className="space-y-4">
              {todayClasses.map((session) => (
                <div key={session.id} className="border p-4 rounded">
                  <h3 className="font-semibold">{session.class.title}</h3>

                  <p>
                    {formatTime(session.starts_at)} -{" "}
                    {formatTime(session.ends_at)}
                  </p>

                  <a
                    href={session.class_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 font-medium"
                  >
                    Join Class
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No classes scheduled for today.</p>
          )}
        </section>

        {/* =============================
          WEEK SCHEDULE
      ============================= */}

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Week Schedule</h2>

          {weekSchedule.length > 0 ? (
            <div className="space-y-3">
              {weekSchedule.map((session) => (
                <div
                  key={session.id}
                  className="flex justify-between border-b py-2"
                >
                  <div>{formatSessionDate(session.session_date)}</div>

                  <div>
                    {formatTime(session.starts_at)} -{" "}
                    {formatTime(session.ends_at)}
                  </div>

                  <div>{session.class.title}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No schedule available this week.</p>
          )}
        </section>

        {/* =============================
          UPCOMING SESSIONS
      ============================= */}

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="border p-4 rounded">
                  <h3 className="font-semibold">{session.class.title}</h3>

                  <p>{formatSessionDate(session.session_date)}</p>

                  <p>
                    {formatTime(session.starts_at)} -{" "}
                    {formatTime(session.ends_at)}
                  </p>

                  <a
                    href={session.class_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 font-medium"
                  >
                    Join Class
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming sessions.</p>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}