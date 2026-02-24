import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import signup_img from "../../../assets/images/student_sign_up.jpg";

export default function GuardianTrainingDuration() {
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const [students, setStudents] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  /* ================= CONSTANTS ================= */
  const DURATION_OPTIONS = [
    { key: "monthly", label: "Monthly", months: 1 },
    { key: "quarterly", label: "Quarterly", months: 3 },
    { key: "semi-annual", label: "Semi-Annual", months: 6 },
    { key: "annual", label: "Annual", months: 12 },
  ];

  /* ================= HELPERS ================= */
  const calculatePrice = (basePrice, months) => {
    const total = basePrice * months;
    return months === 1 ? total : total - total * 0.05;
  };

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      try {
        const stored = localStorage.getItem("guardianStudentsSubjects");
        if (!stored) {
          navigate("/register/guardian/subject/selection");
          return;
        }

        const parsedStudents = JSON.parse(stored);

        // Fetch all courses
        const res = await axios.get(`${API_BASE_URL}/api/courses`);
        const allCourses = res.data.courses || [];

        const enrichedStudents = parsedStudents.map((student, index) => {
          const activeCourses = allCourses.filter((c) =>
            student.selectedTraining.includes(c.id)
          );

          const selectedDurations = {};
          activeCourses.forEach((c) => {
            selectedDurations[c.id] = null;
          });

          return {
            ...student,
            activeCourses,
            selectedDurations,
            expanded: index === 0,
          };
        });

        setStudents(enrichedStudents);
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };

    init();
  }, [navigate, API_BASE_URL]);

  /* ================= TOGGLE ACCORDION ================= */
  const toggleStudent = (index) => {
    setStudents((prev) =>
      prev.map((s, i) => (i === index ? { ...s, expanded: !s.expanded } : s))
    );
  };

  /* ================= HANDLE DURATION CHANGE ================= */
  const handleDurationChange = (studentIndex, course, durationKey) => {
    const option = DURATION_OPTIONS.find((d) => d.key === durationKey);
    const price = calculatePrice(course.price, option.months);

    setStudents((prev) =>
      prev.map((s, i) => {
        if (i !== studentIndex) return s;
        return {
          ...s,
          selectedDurations: {
            ...s.selectedDurations,
            [course.id]: {
              duration: option.key,
              months: option.months,
              price,
            },
          },
        };
      })
    );
  };

  /* ================= TOTALS ================= */
  const studentTotals = useMemo(() => {
    return students.map((student) =>
      Object.values(student.selectedDurations || {})
        .filter(Boolean)
        .reduce((sum, item) => sum + item.price, 0)
    );
  }, [students]);

  const grandTotal = useMemo(() => {
    return studentTotals.reduce((sum, t) => sum + t, 0);
  }, [studentTotals]);

  /* ================= CONTINUE ================= */
  const handleContinue = () => {
    const valid = students.every((student) =>
      student.activeCourses.every(
        (course) => student.selectedDurations[course.id]
      )
    );

    if (!valid) {
      setError(true);
      setToast({
        type: "error",
        message: "Please select a duration for each course per student",
      });
      return;
    }

    setError(false);
    setLoading(true);

    const payload = students.map((s) => ({
      id: s.id, // ✅ Preserve ID from backend
      name: s.name,
      email: s.email,
      firstname: s.firstname,
      surname: s.surname,
      gender: s.gender,
      date_of_birth: s.date_of_birth,
      location: s.location,
      address: s.address,
      department: s.department,
      selectedTraining: s.selectedTraining,
      selectedSubjects: s.selectedSubjects,
      selectedDurations: s.selectedDurations,
    }));

    localStorage.setItem("guardianStudentsDuration", JSON.stringify(payload));

    setToast({ type: "success", message: "Durations saved!" });

    setTimeout(() => {
      setLoading(false);
      navigate("/register/guardian/training/payment");
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* LEFT */}
      <div className="w-full md:w-1/2 bg-[#F4F4F4] px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white transition-all duration-300 ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* NAV */}
        <div className="relative flex justify-center mb-6">
          <button
            onClick={() => navigate("/register/guardian/subject/selection")}
            className="absolute left-0 p-2 hover:bg-gray-200 rounded-full"
          >
            <img src={ReturnArrow} alt="Back" className="h-6 w-6" />
          </button>
          <img src={TC_logo} alt="Logo" className="h-[70px]" />
        </div>

        <h1 className="text-center text-2xl font-bold text-[#09314F] mb-2">
          Select Training Duration
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Choose a duration for each student's training courses
        </p>

        {/* PER-STUDENT ACCORDION */}
        <div className="space-y-4">
          {students.map((student, sIndex) => (
            <div
              key={sIndex}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleStudent(sIndex)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#09314F] uppercase tracking-wide">
                    Student {sIndex + 1}
                  </span>
                  <span className="text-xs text-gray-400">
                    — {student.firstname} {student.surname}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {studentTotals[sIndex] > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      ₦{studentTotals[sIndex].toLocaleString()}
                    </span>
                  )}
                  <svg
                    className={`w-5 h-5 text-[#09314F] transition-transform duration-200 ${
                      student.expanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Accordion Body — Duration Table */}
              {student.expanded && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-3 bg-[#09314F] text-white text-sm font-bold rounded-t-lg">
                    <div className="p-2">Course</div>
                    <div className="p-2">Duration</div>
                    <div className="p-2 text-right">Price (₦)</div>
                  </div>

                  {/* Course Rows */}
                  {student.activeCourses.map((course) => {
                    const selected = student.selectedDurations[course.id];

                    return (
                      <div
                        key={course.id}
                        className="grid grid-cols-3 gap-4 items-center border-b py-4 text-sm"
                      >
                        <div className="font-semibold text-[#09314F]">
                          {course.title}
                        </div>

                        <select
                          className="bg-gray-300 rounded px-3 py-2 text-xs"
                          value={selected?.duration || ""}
                          onChange={(e) =>
                            handleDurationChange(
                              sIndex,
                              course,
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select duration</option>
                          {DURATION_OPTIONS.map((d) => (
                            <option key={d.key} value={d.key}>
                              {d.label}
                            </option>
                          ))}
                        </select>

                        <div className="text-right font-bold">
                          {selected
                            ? `₦${selected.price.toLocaleString()}`
                            : "—"}
                        </div>
                      </div>
                    );
                  })}

                  {/* Student Subtotal */}
                  <div className="flex justify-between mt-4 font-bold text-sm text-[#09314F]">
                    <span>Subtotal</span>
                    <span>₦{studentTotals[sIndex].toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Grand Total */}
        <div className="flex justify-between mt-6 font-bold text-lg text-[#09314F] bg-white rounded-lg px-5 py-4 shadow-sm border border-gray-100">
          <span>Grand Total</span>
          <span>₦{grandTotal.toLocaleString()}</span>
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center mt-4">
            Please select a duration for each course per student
          </p>
        )}

        {/* CONTINUE */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className={`mt-6 w-full py-3 rounded-lg font-medium ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90"
          } text-white transition-colors`}
        >
          {loading ? "Saving..." : "Continue to Payment"}
        </button>
      </div>

      {/* RIGHT */}
      <div
        className="w-full h-[192px] md:w-1/2 md:h-full bg-cover bg-center relative order-1 md:order-2"
        style={{ backgroundImage: `url(${signup_img})` }}
      >
        <div className="hidden md:block absolute bottom-[60px] left-0">
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-md"
            style={{ borderRadius: "0px 20px 20px 0px" }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
