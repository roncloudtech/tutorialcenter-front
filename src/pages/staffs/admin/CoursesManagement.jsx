import { useState, useEffect, useCallback } from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import axios from "axios";
import { 
  PlusIcon, 
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  BellIcon,
  TrashIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import CourseEdit from "../../../components/private/staffs/CourseEdit.jsx";
import DisenrolledCourses from "../../../components/private/staffs/DisenrolledCourses.jsx";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

export default function CoursesManagement() {
  const [activeTab, setActiveTab] = useState("courses"); // "courses" | "subjects"
  const [activeView, setActiveView] = useState("main"); // "main" | "edit" | "disenrolled"
  const [courseName, setCourseName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("staff_token");
  const config = { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } };

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/courses`);
      const fetched = res.data?.data || res.data?.courses || [];
      setCourses(fetched);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  }, []);

  // Fetch subjects for a course
  const fetchSubjects = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/subjects`);
      const fetched = res.data?.data || res.data?.subjects || [];
      setSubjects(fetched);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
  }, [fetchCourses, fetchSubjects]);

  // Create course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseName.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/admin/courses`, { title: courseName.trim() }, config);
      setCourseName("");
      fetchCourses();
      setToast({ type: "success", message: "Course created successfully!" });
    } catch (err) {
      console.error("Error creating course:", err);
      setToast({ type: "error", message: err.response?.data?.message || "Failed to create course." });
    } finally {
      setLoading(false);
    }
  };

  // Create subject
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim() || !selectedCourseId) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/admin/subjects`, { 
        name: subjectName.trim(), 
        course_id: Number(selectedCourseId) 
      }, config);
      setSubjectName("");
      fetchSubjects();
      setToast({ type: "success", message: "Subject created successfully!" });
    } catch (err) {
      console.error("Error creating subject:", err);
      setToast({ type: "error", message: err.response?.data?.message || "Failed to create subject." });
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/courses/${id}`, config);
      fetchCourses();
      setToast({ type: "success", message: "Course deleted." });
    } catch (err) {
      console.error("Error deleting course:", err);
      setToast({ type: "error", message: "Failed to delete course." });
    }
  };

  // Delete subject
  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/subjects/${id}`, config);
      fetchSubjects();
      setToast({ type: "success", message: "Subject deleted." });
    } catch (err) {
      console.error("Error deleting subject:", err);
      setToast({ type: "error", message: "Failed to delete subject." });
    }
  };

  return (
    <StaffDashboardLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[120] px-6 py-4 rounded-2xl shadow-2xl text-white transition-all ${toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"}`}>
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      <div className="flex flex-col gap-8 min-h-screen">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-black text-[#0F2843] dark:text-white tracking-tight uppercase">
              Course Management
            </h1>
            <p className="text-gray-400 font-medium mt-1">
              Create and manage courses and subjects separately.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative p-3 bg-white dark:bg-[#09314F]/60 rounded-2xl shadow-sm border border-gray-100 dark:border-[#09314F] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a4a75] transition-all group">
              <BellIcon className="w-6 h-6 text-[#0F2843] dark:text-white group-hover:scale-110 transition-transform" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </div>

        {/* ===== SUB-PAGE: EDIT ===== */}
        {activeView === "edit" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setActiveView("main")}
              className="flex items-center gap-2 mb-6 group w-fit"
            >
              <ChevronLeftIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-[#0F2843] dark:group-hover:text-white transition-colors" />
              <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-[#0F2843] dark:group-hover:text-white transition-colors">
                Back / <span className="font-bold text-[#0F2843] dark:text-white">{activeTab === "courses" ? "Edit Courses" : "Edit Subjects"}</span>
              </span>
            </button>
            <CourseEdit mode={activeTab} />
          </div>
        )}

        {/* ===== SUB-PAGE: DISENROLLED ===== */}
        {activeView === "disenrolled" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setActiveView("main")}
              className="flex items-center gap-2 mb-6 group w-fit"
            >
              <ChevronLeftIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-[#0F2843] dark:group-hover:text-white transition-colors" />
              <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-[#0F2843] dark:group-hover:text-white transition-colors">
                Back / <span className="font-bold text-[#0F2843] dark:text-white">{activeTab === "courses" ? "Disenrolled Courses" : "Disenrolled Subjects"}</span>
              </span>
            </button>
            <DisenrolledCourses />
          </div>
        )}

        {/* ===== MAIN VIEW ===== */}
        {activeView === "main" && (<>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => setActiveView("edit")}
            className="w-full text-left px-6 py-4 bg-white dark:bg-[#09314F]/50 dark:backdrop-blur-md border border-gray-200 dark:border-[#09314F] rounded-xl text-[15px] font-bold text-[#09314F] dark:text-white hover:shadow-md hover:border-gray-300 dark:hover:border-blue-400 transition-all active:scale-[0.99] flex items-center gap-3"
          >
            <PencilSquareIcon className="w-5 h-5 text-[#BB9E7F]" />
            {activeTab === "courses" ? "Edit Courses" : "Edit Subjects"}
          </button>
          <button
            onClick={() => setActiveView("disenrolled")}
            className="w-full text-left px-6 py-4 bg-white dark:bg-[#09314F]/50 dark:backdrop-blur-md border border-gray-200 dark:border-[#09314F] rounded-xl text-[15px] font-bold text-[#09314F] dark:text-white hover:shadow-md hover:border-gray-300 dark:hover:border-blue-400 transition-all active:scale-[0.99] flex items-center gap-3"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-[#E83831]" />
            {activeTab === "courses" ? "Disenrolled Courses" : "Disenrolled Subjects"}
          </button>
        </div>

        {/* Toggle Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-md rounded-[24px] w-fit border border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={() => setActiveTab("courses")}
            className={`
              flex items-center gap-2.5 px-6 py-3 rounded-[20px] font-bold text-sm transition-all duration-300
              ${activeTab === "courses" 
                ? "bg-[#0F2843] text-white shadow-lg shadow-[#0F2843]/20 translate-y-[-1px]" 
                : "text-gray-500 hover:text-[#0F2843] dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-700/50"
              }
            `}
          >
            <BookOpenIcon className={`w-5 h-5 ${activeTab === "courses" ? "text-white" : "text-gray-400"}`} />
            Courses
          </button>
          <button
            onClick={() => setActiveTab("subjects")}
            className={`
              flex items-center gap-2.5 px-6 py-3 rounded-[20px] font-bold text-sm transition-all duration-300
              ${activeTab === "subjects" 
                ? "bg-[#0F2843] text-white shadow-lg shadow-[#0F2843]/20 translate-y-[-1px]" 
                : "text-gray-500 hover:text-[#0F2843] dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-700/50"
              }
            `}
          >
            <AcademicCapIcon className={`w-5 h-5 ${activeTab === "subjects" ? "text-white" : "text-gray-400"}`} />
            Subjects
          </button>
        </div>

        {/* ==================== COURSES TAB ==================== */}
        {activeTab === "courses" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500" key="courses">
            {/* Create Course Form */}
            <form onSubmit={handleCreateCourse} className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-md p-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-black text-[#0F2843] dark:text-white mb-6 uppercase tracking-tight">Create New Course</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Enter course name (e.g. WAEC, NECO, JAMB)"
                  required
                  className="flex-1 px-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-[#BB9E7F]/30 focus:bg-white dark:focus:bg-gray-800 font-bold text-[#0F2843] dark:text-white placeholder-gray-300 dark:placeholder-gray-600 transition-all outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !courseName.trim()}
                  className="px-8 py-4 bg-[#0F2843] text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  <PlusIcon className="w-5 h-5" />
                  {loading ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>

            {/* Courses List */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-700">
                  <ClockIcon className="w-6 h-6 text-[#BB9E7F]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0F2843] dark:text-white uppercase tracking-wider">Existing Courses</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{courses.length} course{courses.length !== 1 ? "s" : ""} registered</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.length > 0 ? courses.map((course) => (
                  <div key={course.id} className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-md p-6 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-50 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-3 py-1 bg-[#BB9E7F]/10 text-[#BB9E7F] text-[10px] font-black uppercase tracking-[0.15em] rounded-full">Course</span>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-lg font-black text-[#0F2843] dark:text-white leading-tight">{course.title}</h3>
                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#76D287] shadow-[0_0_8px_rgba(118,210,135,0.5)]"></div>
                      <span className="text-[11px] text-gray-400 font-bold">Active</span>
                      <span className="ml-auto text-[11px] text-gray-300 font-bold italic">
                        {course.created_at ? new Date(course.created_at).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-16 text-center bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <BookOpenIcon className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-black text-gray-300 dark:text-gray-500">No Courses Yet</h4>
                    <p className="text-gray-400 text-sm font-medium">Create your first course above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUBJECTS TAB ==================== */}
        {activeTab === "subjects" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500" key="subjects">
            {/* Create Subject Form */}
            <form onSubmit={handleCreateSubject} className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-md p-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-black text-[#0F2843] dark:text-white mb-6 uppercase tracking-tight">Create New Subject</h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                    className="md:w-[240px] px-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-[#BB9E7F]/30 focus:bg-white dark:focus:bg-gray-800 font-bold text-[#0F2843] dark:text-white transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select a course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="Enter subject name (e.g. English Language)"
                    required
                    className="flex-1 px-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-[#BB9E7F]/30 focus:bg-white dark:focus:bg-gray-800 font-bold text-[#0F2843] dark:text-white placeholder-gray-300 dark:placeholder-gray-600 transition-all outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !subjectName.trim() || !selectedCourseId}
                  className="w-full md:w-auto md:self-end px-8 py-4 bg-[#0F2843] text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  {loading ? "Creating..." : "Create Subject"}
                </button>
              </div>
            </form>

            {/* Subjects List grouped by course */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-700">
                  <AcademicCapIcon className="w-6 h-6 text-[#BB9E7F]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0F2843] dark:text-white uppercase tracking-wider">Existing Subjects</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{subjects.length} subject{subjects.length !== 1 ? "s" : ""} registered</p>
                </div>
              </div>

              {/* Group subjects by course */}
              {courses.map((course) => {
                const courseSubjects = subjects.filter(s => Number(s.courses?.[0]) === Number(course.id));
                if (courseSubjects.length === 0) return null;
                return (
                  <div key={course.id} className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-md rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 bg-[#0F2843] flex items-center gap-3">
                      <BookOpenIcon className="w-5 h-5 text-[#BB9E7F]" />
                      <span className="text-white font-black text-sm uppercase tracking-wider">{course.title}</span>
                      <span className="ml-auto text-[#BB9E7F] text-xs font-black">{courseSubjects.length} subject{courseSubjects.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                      {courseSubjects.map((subject) => (
                        <div key={subject.id} className="px-6 py-4 flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                          <span className="font-bold text-[#0F2843] dark:text-gray-200 text-sm">{subject.name}</span>
                          <button
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {subjects.length === 0 && (
                <div className="py-16 text-center bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <AcademicCapIcon className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-black text-gray-300 dark:text-gray-500">No Subjects Yet</h4>
                  <p className="text-gray-400 text-sm font-medium">Select a course and add subjects above.</p>
                </div>
              )}
            </div>
          </div>
        )}

        </>)}
      </div>
    </StaffDashboardLayout>
  );
}
