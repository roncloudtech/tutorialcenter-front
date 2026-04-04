import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import signup_img from "../../../assets/images/Student_sign_up.jpg";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

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
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* LEFT */}
      <div className="w-full md:w-1/2 bg-[#F8F9FA] flex flex-col items-center py-8 px-6 lg:px-8 xl:px-[100px] overflow-y-auto pb-32 order-2 md:order-1">
        
        {/* NAV & HEADER */}
        <div className="w-full max-w-[500px] mb-10 text-center">
          <div className="flex items-center relative h-12 mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="absolute left-0 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90"
            >
              <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
            </button>
            <div className="w-full flex justify-center">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#09314F]">
                Training Duration
              </h1>
            </div>
          </div>
          <p className="text-[#888888] font-medium max-w-[340px] mx-auto">
            Select your preferred training duration for your examination.
          </p>
        </div>

        {/* Card Container */}
        <div className="w-full max-w-[500px] bg-white rounded-[8px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 mb-8 relative z-10 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-[#09314F] text-white px-4 md:px-6 py-4 rounded-t-[8px]">
            <span className="text-[10px] md:text-sm font-black uppercase tracking-wider text-left">Examination</span>
            <span className="text-[10px] md:text-sm font-black uppercase tracking-wider text-center">Duration</span>
            <span className="text-[10px] md:text-sm font-black uppercase tracking-wider text-right">Amount</span>
          </div>

          <div className="space-y-0">
            {courses.map((course) => {
              const selected = selectedDurations[course.id];

              return (
                <div
                  key={course.id}
                  className="grid grid-cols-3 items-center px-4 md:px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="text-[11px] md:text-sm font-extrabold text-[#09314F] uppercase tracking-wide truncate">
                    {course.title}
                  </div>

                  <div className="flex justify-center">
                    <select
                      className="bg-[#D1D5DB] text-[#4B5563] text-[10px] md:text-xs font-bold rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-gray-400 transition-colors text-center appearance-none min-w-[100px]"
                      value={selected?.duration || ""}
                      onChange={(e) =>
                        handleDurationChange(course, e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {DURATION_OPTIONS.map((d) => (
                        <option key={d.key} value={d.key}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-right text-[11px] md:text-sm font-black text-[#09314F]">
                    {selected
                      ? `₦${selected.price.toLocaleString()}`
                      : "NO"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOTAL & CONTINUE */}
        <div className="w-full max-w-[500px]">
          {error && (
            <p className="text-red-500 text-xs text-center mb-4 font-bold">
              Please select a duration for each course.
            </p>
          )}
          
          <button
            onClick={handleContinue}
            className="w-full py-5 rounded-[12px] font-bold text-lg text-white bg-gradient-to-r from-[#09314F] to-[#E83831] shadow-xl hover:shadow-[#E8383144] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Continue = ₦{totalAmount.toLocaleString()}
          </button>
        </div>

        {/* Brand */}
        <div className="mt-auto py-10 opacity-30 grayscale pointer-events-none">
          <img src={TC_logo} alt="Tutorial Center" className="h-10" />
        </div>
      </div>

      {/* RIGHT SIDE: Visual Image */}
      <div
        className="w-full h-[250px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2"
        style={{ backgroundImage: `url(${signup_img})` }}
      />
    </div>
  );
};
