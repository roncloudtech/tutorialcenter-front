import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import otp_img_student from "../../../assets/images/otpStudentpic.jpg";
import axios from "axios";

// Module-level constant — avoids causing useEffect to re-run on every render
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

export default function StudentTrainingSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [examError, setExamError] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState([]);



  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/courses`);
        // Log the full raw response to verify the shape coming from the backend
        console.log("[TrainingSelection] raw response.data:", response?.data);
        const fetched = response?.data?.courses || [];
        if (fetched.length === 0) {
          console.warn("[TrainingSelection] No courses resolved — check that response.data.courses exists and is non-empty.");
        }
        setCourses(fetched);
        console.table(fetched);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      }
    };

    fetchCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= TOGGLE SELECTION ================= */
  const toggleTraining = (courseId) => {
    setSelectedTraining((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };



  /* ================= CONTINUE ================= */
  const handleContinue = async () => {
  if (selectedTraining.length === 0) {
    setExamError(true);
    return;
  }

  setExamError(false);
  setLoading(true);

  try {
    // 1️⃣ Read existing student data
    const studentData = JSON.parse(
      localStorage.getItem("studentdata")
    );

    if (!studentData) {
      throw new Error("Student data not found in localStorage");
    }

    // 2️⃣ Attach selected trainings + the full courses list so downstream pages can resolve titles
    const updatedStudentData = {
      ...studentData,
      selectedTraining, // 👈 stored here
      availableTrainings: courses, // 👈 full list with titles for the success screen
    };

    // 3️⃣ Save back to localStorage
    localStorage.setItem(
      "studentdata",
      JSON.stringify(updatedStudentData)
    );

    console.log("Updated studentdata:", updatedStudentData);

    navigate("/register/student/subject/selection");
  } catch (error) {
    console.error("Failed to save training selection", error);
  } finally {
    setLoading(false);
  }
};

  // const handleContinue = async () => {
  //   if (selectedTraining.length === 0) {
  //     setExamError(true);
  //     return;
  //   }

  //   setExamError(false);
  //   setLoading(true);

  //   try {
  //     console.log("Selected trainings:", selectedTraining);
  //     localStorage.setItem("selectedTraining", JSON.stringify(selectedTraining));
  //     navigate("/register/student/subject/selection");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-[#F4F4F4] font-sans overflow-x-hidden">

      {/* IMAGE SECTION */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full relative order-1 md:order-2">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${otp_img_student})` }}
        />
      </div>

      {/* FORM SECTION */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[500px] mx-auto my-auto flex flex-col">

          {/* HEADER */}
          <div className="relative w-full flex items-center justify-center mb-6 mt-4">
            <button
              onClick={() => navigate('/register/student/biodata')}
              className="absolute left-0 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90"
            >
              <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">
              Select Training
            </h1>
          </div>

          {/* CARD */}
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">

            <p className="text-gray-500 text-xs md:text-sm mb-10 text-center max-w-[340px]">
              Select the examinations you're about to write. You may select more
              than one examination.
            </p>

            {/* COURSES GRID */}
            <div className="grid grid-cols-2 gap-4 w-full mb-10">
              {courses.map((exam) => {
                const isSelected = selectedTraining.includes(exam.id);

                return (
                  <button
                    key={exam.id}
                    onClick={() => toggleTraining(exam.id)}
                    className={`h-[50px] md:h-[55px] rounded-lg font-bold flex items-center justify-between px-5 transition-all duration-300
                      ${
                        isSelected
                          ? "bg-[#76D287] text-white shadow-md shadow-green-100"
                          : "bg-[#D1D5DB] text-[#4B5563] hover:bg-gray-400"
                      }`}
                  >
                    <span className="text-sm uppercase tracking-wide">
                      {exam.title}
                    </span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* ERROR */}
            {examError && (
              <p className="text-red-500 text-xs font-bold mb-4">
                Select at least one examination
              </p>
            )}

            {/* CONTINUE */}
            <button
              onClick={handleContinue}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#09314F] to-[#E83831]"
              } text-white`}
            >
              {loading ? "Loading..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}