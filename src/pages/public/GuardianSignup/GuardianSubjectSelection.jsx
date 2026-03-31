import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import signup_img from "../../../assets/images/Student_sign_up.jpg";
import { dropdownTheme } from "../../../utils/dropdownTheme";
import { 
  ChevronLeftIcon
, CheckIcon, UserIcon
} from "@heroicons/react/24/outline";

export default function GuardianSubjectSelection() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  /* ================= HELPERS ================= */
  const getSubjectLimit = (courseTitle) =>
    courseTitle.toLowerCase().includes("jamb") ? 4 : 9;

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      try {
        const stored = localStorage.getItem("guardianStudentsTraining");
        if (!stored) {
          navigate("/register/guardian/training/selection");
          return;
        }

        const parsedStudents = JSON.parse(stored);
        const courseRes = await axios.get(`${API_BASE_URL}/api/courses`);
        const allCourses = courseRes.data.courses || [];

        const enrichedStudents = await Promise.all(
          parsedStudents.map(async (student, index) => {
            const activeCourses = allCourses.filter((c) =>
              student.selectedTraining.includes(c.id)
            );

            const subjectsByCourse = {};
            const selectedSubjects = {};

            for (const course of activeCourses) {
              const res = await axios.get(
                `${API_BASE_URL}/courses/${course.id}/subjects/${student.department}`
              );
              subjectsByCourse[course.id] = res.data.subjects || [];
              selectedSubjects[course.id] = [];
            }

            return {
              ...student,
              activeCourses,
              subjectsByCourse,
              selectedSubjects,
              expanded: index === 0,
            };
          })
        );

        setStudents(enrichedStudents);
      } catch (err) {
        console.error("Initialization failed:", err);
      }
    };
    init();
  }, [navigate, API_BASE_URL]);

  const [openDropdown, setOpenDropdown] = useState(null); // format: "studentIndex-courseId"

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStudent = (index) => {
    setStudents((prev) =>
      prev.map((s, i) => (i === index ? { ...s, expanded: !s.expanded } : s))
    );
  };

  const toggleDropdown = (studentIndex, courseId) => {
    const key = `${studentIndex}-${courseId}`;
    setOpenDropdown(prev => prev === key ? null : key);
  };

  const toggleSubject = (studentIndex, courseId, subjectId) => {
    setStudents((prev) =>
      prev.map((s, i) => {
        if (i !== studentIndex) return s;

        const current = s.selectedSubjects[courseId] || [];
        const course = s.activeCourses.find((c) => c.id === courseId);
        const limit = getSubjectLimit(course.title);

        let updated;
        if (current.includes(subjectId)) {
          updated = current.filter((id) => id !== subjectId);
        } else {
          if (current.length >= limit) return s;
          updated = [...current, subjectId];
        }

        return {
          ...s,
          selectedSubjects: { ...s.selectedSubjects, [courseId]: updated },
        };
      })
    );
  };

  const handleContinue = () => {
    const allValid = students.every((student) =>
      student.activeCourses.every(
        (course) => student.selectedSubjects[course.id]?.length > 0
      )
    );

    if (!allValid) {
      setToast({ type: "error", message: "Please select subjects for all students and their chosen courses." });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleProceed = () => {
    setLoading(true);
    try {
      const payload = students.map((s) => ({
        id: s.id,
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
      }));

      localStorage.setItem("guardianStudentsSubjects", JSON.stringify(payload));
      setToast({ type: "success", message: "Subjects saved successfully!" });
      setTimeout(() => navigate("/register/guardian/training/duration"), 1500);
    } catch (err) {
      console.error("Failed to store subjects", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white transition-all duration-500 transform translate-y-0 ${
          toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
        } animate-in fade-in slide-in-from-top-4`}>
          <div className="flex items-center gap-3 text-sm font-bold">
            {toast.message}
          </div>
        </div>
      )}

      {/* LEFT SIDE */}
      <div className="w-full md:w-1/2 h-full bg-[#F8F9FA] flex flex-col items-center py-8 px-6 lg:px-[100px] overflow-y-auto order-2 md:order-1">
        
        {/* Header */}
        <div className="w-full max-w-[500px] mb-10 text-center">
          <div className="flex items-center relative h-12 mb-6">
            <button 
              onClick={() => navigate("/register/guardian/training/selection")}
              className="absolute left-0 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90"
            >
              <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
            </button>
            <div className="w-full flex justify-center">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#09314F]">
                Subject Selection
              </h1>
            </div>
          </div>
          <p className="text-[#888888] font-medium">
            Select subjects for each student's chosen training.
          </p>
        </div>

        {/* Multi-Student Accordions */}
        <div className="w-full max-w-[500px] space-y-6 mb-8 relative z-10">
          {students.map((student, sIndex) => (
            <div key={sIndex} className="bg-white rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-50 mb-4">
              <button 
                onClick={() => toggleStudent(sIndex)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors rounded-[32px]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#09314F] text-white flex items-center justify-center font-black text-xs">
                    {sIndex + 1}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest leading-none mb-1">Student</p>
                    <h3 className="text-sm font-black text-[#09314F] uppercase tracking-wide">{student.name}</h3>
                  </div>
                </div>
                <ChevronLeftIcon className={`h-5 w-5 text-[#09314F] transition-transform duration-300 ${student.expanded ? "-rotate-90" : ""}`} />
              </button>

              {student.expanded && (
                <div className="p-2 pt-0 animate-fadeIn relative">
                  <div className="bg-[#09314F] text-white rounded-2xl grid grid-cols-[90px_1fr_50px] md:grid-cols-[100px_1fr_60px] px-2 md:px-4 py-3 mb-1">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-1 md:px-2">Exam</span>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-1 md:px-2">Subjects</span>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-right">Count</span>
                  </div>

                  <div className="space-y-1">
                    {student.activeCourses.map((course) => {
                      const selectedIds = student.selectedSubjects[course.id] || [];
                      const subjects = student.subjectsByCourse[course.id] || [];
                      const limit = getSubjectLimit(course.title);
                      const currentKey = `${sIndex}-${course.id}`;
                      const isOpen = openDropdown === currentKey;

                      return (
                        <div key={course.id} className="grid grid-cols-[90px_1fr_50px] md:grid-cols-[100px_1fr_60px] items-center px-2 md:px-4 py-4 border-b border-gray-50 last:border-0 relative">
                          <span className="text-[10px] md:text-xs font-extrabold text-[#09314F] uppercase truncate">{course.title}</span>
                          
                          <div className="px-2 relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown(sIndex, course.id);
                              }}
                              className="w-full min-h-[40px] flex items-center transition-all pointer-events-auto"
                            >
                              <div className={dropdownTheme.subjectPreview}>
                                {selectedIds.length > 0 ? (
                                  subjects
                                    .filter(s => selectedIds.includes(s.id))
                                    .map(s => s.name)
                                    .join(", ")
                                ) : (
                                  "Select..."
                                )}
                              </div>
                            </button>

                            {isOpen && (
                              <div ref={dropdownRef} className={`${dropdownTheme.overlay.container} w-[220px] max-h-[220px]`}>
                                <p className={dropdownTheme.overlay.header}>Choose up to {limit}</p>
                                <div className="space-y-1">
                                  {subjects.map(subject => {
                                    const isSelected = selectedIds.includes(subject.id);
                                    const isLimitReached = !isSelected && selectedIds.length >= limit;
                                    return (
                                      <button
                                        key={subject.id}
                                        disabled={isLimitReached}
                                        onClick={() => toggleSubject(sIndex, course.id, subject.id)}
                                        className={dropdownTheme.overlay.item(isSelected, isLimitReached)}
                                      >
                                        {subject.name}
                                        {isSelected && <CheckIcon className="h-3 w-3" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] md:text-xs font-black text-[#09314F]">{selectedIds.length}</span>
                            <span className="text-[10px] md:text-xs font-bold text-gray-300"> / </span>
                            <span className="text-[10px] md:text-xs font-bold text-gray-400">{limit}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="w-full max-w-[500px]">
          <button
            onClick={handleContinue}
            className="w-full py-5 rounded-[22px] font-bold text-lg text-white bg-gradient-to-r from-[#09314F] to-[#E83831] shadow-xl hover:shadow-[#E8383144] transition-all hover:-translate-y-0.5 mt-4"
          >
            Continue
          </button>
        </div>

        <div className="mt-auto py-10 opacity-30 grayscale pointer-events-none">
          <img src={TC_logo} alt="Tutorial Center" className="h-10" />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div 
        className="w-full h-[250px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2"
        style={{ backgroundImage: `url(${signup_img})` }}
      />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-[#09314F77] backdrop-blur-[2px] flex items-center justify-center z-[100] p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-[560px] md:max-w-[900px] rounded-[24px] shadow-2xl p-8 md:p-10 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#09314F] mb-6">Review</h2>

            {/* Students Sections */}
            <div className="space-y-8">
              {students.map((student, sIndex) => (
                <div key={sIndex} className="space-y-4">
                  {/* Student Header with Icon */}
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
                    <div className="w-8 h-8 rounded-lg bg-[#09314F] text-white flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-[#09314F]">{student.name}</span>
                  </div>

                  {/* Courses and Subjects Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Desktop Header Row */}
                    <div className="hidden md:block col-span-2">
                      <div className="grid grid-cols-2 gap-8 pb-4 border-b-2 border-gray-200">
                        <div className="text-xs font-bold text-[#09314F] uppercase tracking-widest">Courses</div>
                        <div className="text-xs font-bold text-[#09314F] uppercase tracking-widest">Subjects</div>
                      </div>
                    </div>

                    {/* Desktop View - Horizontal */}
                    <div className="hidden md:contents">
                      {student.activeCourses.map((course) => {
                        const selectedSubjects = student.subjectsByCourse[course.id]
                          ?.filter(sub => student.selectedSubjects[course.id]?.includes(sub.id))
                          ?.map(sub => sub.name)
                          ?.join(", ");

                        return (
                          <React.Fragment key={course.id}>
                            <div className="text-sm font-bold text-[#09314F] uppercase tracking-wide py-3 border-b border-gray-100">
                              {course.title}
                            </div>
                            <div className="text-sm font-medium text-gray-600 py-3 border-b border-gray-100 leading-relaxed">
                              {selectedSubjects}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Mobile View - Vertical Rectangles */}
                    <div className="md:hidden col-span-1 space-y-3">
                      {student.activeCourses.map((course) => {
                        const selectedSubjects = student.subjectsByCourse[course.id]
                          ?.filter(sub => student.selectedSubjects[course.id]?.includes(sub.id))
                          ?.map(sub => sub.name)
                          ?.join(", ");

                        return (
                          <div key={course.id} className="bg-gray-50 rounded-[16px] p-4 border border-gray-200">
                            <div className="text-xs font-bold text-[#09314F] uppercase tracking-widest mb-2">
                              {course.title}
                            </div>
                            <div className="text-sm font-medium text-gray-600 leading-relaxed">
                              {selectedSubjects}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="flex-1 h-[54px] rounded-[14px] font-bold text-sm text-[#09314F] bg-white border-2 border-[#09314F] hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Edit
              </button>
              <button 
                onClick={handleProceed} 
                disabled={loading} 
                className="flex-1 h-[54px] rounded-[14px] font-bold text-sm text-white bg-[#09314F] hover:bg-[#09314F]/95 transition-all shadow-lg shadow-[#09314F33] disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Processing..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
