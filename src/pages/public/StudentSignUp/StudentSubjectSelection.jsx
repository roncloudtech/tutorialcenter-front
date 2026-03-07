import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import signup_img from "../../../assets/images/student_sign_up.jpg";
import { dropdownTheme } from "../../../utils/dropdownTheme";
import { 
  ChevronLeftIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Defined outside the component so it's a stable reference and won't
// cause the init useEffect to re-run on every render.
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

export const StudentSubjectSelection = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);



  const [selectedCourses, setSelectedCourses] = useState([]);
  const [subjectsByCourse, setSubjectsByCourse] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  /* ================= HELPERS ================= */
  const getSubjectLimit = (courseTitle) =>
    courseTitle.toLowerCase().includes("jamb") ? 4 : 9;

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      try {
        const studentData = JSON.parse(localStorage.getItem("studentdata"));
        console.log("StudentData from localStorage.getItem", studentData);
        const storedTraining = studentData?.selectedTraining;
        const department = studentData?.data?.department;

        console.log("Selected Training IDs:", storedTraining)
        console.log("Department:", department)

        if (!storedTraining?.length || !department) {
          navigate("/register/student/training/selection");
          return;
        }

        const courseRes = await axios.get(`${API_BASE_URL}/api/courses`);
        console.log("Raw course response:", courseRes.data);

        const allCourses = courseRes.data.data || [];
        console.log(" All courses:", allCourses);
        const activeCourses = allCourses.filter((c) => storedTraining.includes(c.id));
        console.log(" Active courses (filtered):", activeCourses);
        setSelectedCourses(activeCourses);

        const subjectMap = {};
        const selectionMap = {};

        for (const course of activeCourses) {
          console.log(`🔍 Fetching subjects for course ${course.id} (${course.title}) - department: ${department}`);
          const res = await axios.get(
            `${API_BASE_URL}/courses/${course.id}/subjects/${department}`
          );
          console.log(`📖 Subjects response for ${course.title}:`, res.data);
          subjectMap[course.id] = res.data.subjects || [];
          selectionMap[course.id] = [];
          console.log(`📝 Subjects for ${course.title}:`, subjectMap[course.id]);
        }

         console.log("🗺️ Final subjectMap:", subjectMap);
        console.log("🗺️ Final selectionMap:", selectionMap);

        setSubjectsByCourse(subjectMap);
        setSelectedSubjects(selectionMap);
      } catch (err) {
        console.error("Initialization failed:", err);
        // console.error("💥 Initialization failed:", err);
        console.error("💥 Error response:", err.response?.data);
        console.error("💥 Error status:", err.response?.status);
      }
    };
    init();
  // API_BASE_URL is a module-level constant so it's excluded from deps safely.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ================= SUBJECT TOGGLE ================= */
  const toggleSubject = (courseId, subjectId) => {
    setSelectedSubjects((prev) => {
      const current = prev[courseId] || [];
      const course = selectedCourses.find((c) => c.id === courseId);
      const limit = getSubjectLimit(course.title);

      if (current.includes(subjectId)) {
        return { ...prev, [courseId]: current.filter((id) => id !== subjectId) };
      }
      if (current.length >= limit) return prev;
      return { ...prev, [courseId]: [...current, subjectId] };
    });
  };

  const handleContinue = () => {
    const valid = selectedCourses.every(
      (course) => selectedSubjects[course.id]?.length > 0
    );
    if (!valid) {
      setToast({ type: "error", message: "Please select subjects for all your examinations." });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleProceed = () => {
    setLoading(true);
    try {
      const studentData = JSON.parse(localStorage.getItem("studentdata"));
      const updatedStudentData = { ...studentData, selectedSubjects };
      localStorage.setItem("studentdata", JSON.stringify(updatedStudentData));
      navigate("/register/student/training/duration");
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
              onClick={() => navigate("/register/student/training/selection")}
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
            Select your preferred subjects for your examination.
          </p>
        </div>

        {/* Table Container — ref placed here so click-outside works for ALL course dropdowns */}
        <div ref={dropdownRef} className="w-full max-w-[500px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 mb-8 relative z-10">
          {/* Table Header */}
          <div className="grid grid-cols-[120px_minmax(0,1fr)_80px] bg-[#09314F] text-white px-6 py-4 rounded-t-[32px]">
            <span className="text-sm font-black uppercase tracking-widest px-2">Examination</span>
            <span className="text-sm font-black uppercase tracking-widest px-2">Subjects</span>
            <span className="text-sm font-black uppercase tracking-widest text-right">Number</span>
          </div>

          <div className="p-2 space-y-1">
            {selectedCourses.map((course) => {
              const selectedIds = selectedSubjects[course.id] || [];
              const subjects = subjectsByCourse[course.id] || [];
              const limit = getSubjectLimit(course.title);
              const isOpen = openDropdown === course.id;

              return (
                <div key={course.id} className="grid grid-cols-[120px_minmax(0,1fr)_80px] items-center px-4 py-6 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors relative">
                  <div className="text-sm font-extrabold text-[#09314F] uppercase tracking-wide truncate">
                    {course.title}
                  </div>

                  <div className="px-2 relative">
                    <button
                      id={`toggle-${course.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(isOpen ? null : course.id);
                      }}
                      className="w-full min-h-[44px] flex items-center transition-all group pointer-events-auto"
                    >
                      <div className={dropdownTheme.subjectPreview}>
                        {selectedIds.length > 0 ? (
                          subjects
                            .filter((s) => selectedIds.includes(s.id))
                            .map((s) => s.name)
                            .join(", ")
                        ) : (
                          "Select subjects"
                        )}
                      </div>
                    </button>

                    {/* Dropdown Overlay */}
                    {isOpen && (
                      <div 
                        className={`${dropdownTheme.overlay.container} w-[280px]`}
                      >
                        <p className={dropdownTheme.overlay.header}>
                          Choose up to {limit} subjects
                        </p>
                        <div className="space-y-1.5">
                          {subjects.map((subject) => {
                            const isSelected = selectedIds.includes(subject.id);
                            const isLimitReached = !isSelected && selectedIds.length >= limit;

                            return (
                              <button
                                key={subject.id}
                                disabled={isLimitReached}
                                onClick={() => toggleSubject(course.id, subject.id)}
                                className={dropdownTheme.overlay.item(isSelected, isLimitReached)}
                              >
                                {subject.name}
                                {isSelected && <CheckIcon className="h-4 w-4" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className={`text-sm font-black transition-colors ${selectedIds.length === limit ? "text-[#76D287]" : "text-[#09314F]"}`}>
                      {selectedIds.length}
                    </span>
                    <span className="text-sm font-bold text-gray-300"> / </span>
                    <span className="text-sm font-bold text-gray-400">{limit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full max-w-[500px]">
          <button
            onClick={handleContinue}
            className="w-full py-5 rounded-[22px] font-bold text-lg text-white bg-gradient-to-r from-[#09314F] to-[#E83831] shadow-xl hover:shadow-[#E8383144] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Continue
          </button>
        </div>

        {/* Brand */}
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
  <div className="fixed inset-0 bg-[#09314F99] backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-fadeIn">
    {/* Added max-h-full to ensure the modal itself doesn't bleed off screen */}
    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-8 md:p-10 border border-white/20 flex flex-col max-h-[90vh]">
      
      {/* HEADER: Stays fixed at the top */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <h2 className="text-2xl font-black text-[#09314F] uppercase tracking-tight">Confirm Selection</h2>
        <button onClick={() => setShowConfirmModal(false)} className="p-2 hover:bg-gray-50 rounded-2xl transition-colors">
          <XMarkIcon className="h-6 w-6 text-gray-400" />
        </button>
      </div>

      {/* CONTENT: This section scrolls */}
      <div className="space-y-6 mb-10 overflow-y-auto pr-2 custom-scrollbar">
        {selectedCourses.map((course) => {
          const subjects = subjectsByCourse[course.id]?.filter((s) => selectedSubjects[course.id]?.includes(s.id)) || [];
          return (
            <div key={course.id} className="p-6 bg-[#F8F9FA] rounded-3xl border border-gray-50">
              <h3 className="text-xs font-black text-[#888888] uppercase tracking-widest mb-3">{course.title}</h3>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <span key={s.id} className="px-3 py-1.5 bg-white rounded-xl text-xs font-extrabold text-[#09314F] shadow-sm border border-black/5">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER: Stays fixed at the bottom */}
      <div className="flex flex-col md:flex-row gap-4 shrink-0">
        <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 px-6 rounded-2xl font-bold text-[#09314F] bg-white border-2 border-[#09314F11] hover:bg-gray-50 transition-all active:scale-95">
          Make Changes
        </button>
        <button onClick={handleProceed} disabled={loading} className="flex-[1.5] py-4 px-6 rounded-2xl font-bold text-white bg-[#09314F] shadow-lg shadow-[#09314F33] hover:shadow-[#09314F55] transition-all active:scale-95 disabled:opacity-50">
          {loading ? "Processing..." : "Proceed"}
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
};
