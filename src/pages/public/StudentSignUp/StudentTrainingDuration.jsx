import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import signup_img from "../../../assets/images/student_sign_up.jpg";

export const StudentTrainingDuration = () => {
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const [courses, setCourses] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState({});
  const [error, setError] = useState(false);

  /* ================= CONSTANTS ================= */
  const DURATION_OPTIONS = [
    { key: "monthly", label: "Monthly", months: 1 },
    { key: "quarterly", label: "Quarterly", months: 3 },
    { key: "semi_annual", label: "Semi-Annual", months: 6 },
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
        const studentData = JSON.parse(localStorage.getItem("studentdata"));
        const selectedTraining = studentData?.selectedTraining;

        if (!selectedTraining?.length) {
          navigate("/register/student/training/selection");
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/courses`);
        const allCourses = res.data.courses || [];

        const activeCourses = allCourses.filter((c) =>
          selectedTraining.includes(c.id)
        );

        setCourses(activeCourses);

        const initMap = {};
        activeCourses.forEach((c) => {
          initMap[c.id] = null;
        });
        setSelectedDurations(initMap);
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };

    init();
  }, [navigate, API_BASE_URL]);

  /* ================= HANDLE CHANGE ================= */
  const handleDurationChange = (course, durationKey) => {
    const option = DURATION_OPTIONS.find((d) => d.key === durationKey);
    const price = calculatePrice(course.price, option.months);

    setSelectedDurations((prev) => ({
      ...prev,
      [course.id]: {
        duration: option.key,
        months: option.months,
        price,
      },
    }));
  };

  /* ================= TOTAL ================= */
  const totalAmount = useMemo(() => {
    return Object.values(selectedDurations)
      .filter(Boolean)
      .reduce((sum, item) => sum + item.price, 0);
  }, [selectedDurations]);

  /* ================= CONTINUE ================= */
  const handleContinue = () => {
    const valid = courses.every(
      (course) => selectedDurations[course.id]
    );

    if (!valid) {
      setError(true);
      return;
    }

    setError(false);

    const studentdata = JSON.parse(localStorage.getItem("studentdata"));

    const updatedStudentData = {
      ...studentdata,
      selectedDurations, // ✅ stored here
    };

    localStorage.setItem(
      "studentdata",
      JSON.stringify(updatedStudentData)
    );

    navigate("/register/student/training/payment");
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans">
      {/* LEFT */}
      <div className="w-full md:w-1/2 bg-[#F4F4F4] px-6 py-10 lg:px-[100px] overflow-y-auto">
        {/* NAV */}
        <div className="relative flex justify-center mb-6">
          <button onClick={() => navigate(-1)} className="absolute left-0 p-2">
            <img src={ReturnArrow} alt="Back" className="h-6 w-6" />
          </button>
          <img src={TC_logo} alt="Logo" className="h-[70px]" />
        </div>

        <h1 className="text-center text-2xl font-bold text-[#09314F] mb-6">
          Select Training Duration
        </h1>

        <div className="grid grid-cols-3 bg-[#09314F] text-white text-sm font-bold rounded-t-lg">
          <div className="p-2">Course</div>
          <div className="p-2">Duration</div>
          <div className="p-2 text-right">Price (₦)</div>
        </div>

        {courses.map((course) => {
          const selected = selectedDurations[course.id];

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
                  handleDurationChange(course, e.target.value)
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

        <div className="flex justify-between mt-6 font-bold text-lg text-[#09314F]">
          <span>Total</span>
          <span>₦{totalAmount.toLocaleString()}</span>
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center mt-4">
            Please select a duration for each course
          </p>
        )}

        <button
          onClick={handleContinue}
          className="mt-6 w-full py-3 rounded bg-gradient-to-r from-[#09314F] to-[#E83831] text-white"
        >
          Continue to Payment
        </button>
      </div>

      {/* RIGHT */}
      <div
        className="w-full md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${signup_img})` }}
      />
    </div>
  );
};
