import { useState, useEffect, useCallback } from "react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import axios from "axios";
import { 
  PlusIcon, 
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  // BellIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import CourseEdit from "../../../components/private/staffs/CourseEdit.jsx";
import DisenrolledCourses from "../../../components/private/staffs/DisenrolledCourses.jsx";
import CourseCreate from "../../../components/private/staffs/CourseCreate.jsx";
import CourseDetailModal from "../../../components/private/staffs/CourseDetailModal.jsx";
import SubjectCreate from "../../../components/private/staffs/SubjectCreate.jsx";
import SubjectDetailModal from "../../../components/private/staffs/SubjectDetailModal.jsx";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

export default function CoursesManagement() {
  const [activeTab, setActiveTab] = useState("courses"); // "courses" | "subjects"
  const [activeView, setActiveView] = useState("main"); // "main" | "edit" | "disenrolled"
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [toast, setToast] = useState(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [isSubjectCreateModalOpen, setIsSubjectCreateModalOpen] = useState(false);
  const [isSubjectDetailModalOpen, setIsSubjectDetailModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [expandedCourseIds, setExpandedCourseIds] = useState(new Set());

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
    console.group("Course Management: Fetch Courses");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/courses`);
      console.log("Courses Response:", res.data);
      const fetched = res.data?.data || res.data?.courses || [];
      setCourses(fetched);
    } catch (err) {
      console.error("Fetch Courses Error:", err);
      console.log("Error Details:", err.response?.data);
    } finally {
      console.groupEnd();
    }
  }, []);

  // Fetch subjects for a course
  const fetchSubjects = useCallback(async () => {
    console.group("Course Management: Fetch Subjects");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/subjects`);
      console.log("Subjects Response:", res.data);
      const fetched = res.data?.data || res.data?.subjects || [];
      setSubjects(fetched);
    } catch (err) {
      console.error("Fetch Subjects Error:", err);
      console.log("Error Details:", err.response?.data);
    } finally {
      console.groupEnd();
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
  }, [fetchCourses, fetchSubjects]);

  // handleCreateCourse is now managed within the CourseCreate Modal component

  // handleCreateSubject is now managed within the SubjectCreate Modal component

  // Delete course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    console.group("Course Management: Delete Course");
    console.log("Delete ID:", id);
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/admin/courses/${id}`, config);
      console.log("Delete Response:", res.data);
      fetchCourses();
      setToast({ type: "success", message: "Course deleted." });
    } catch (err) {
      console.error("Delete Course Error:", err);
      console.log("Error Response Details:", err.response?.data);
      setToast({ type: "error", message: "Failed to delete course." });
    } finally {
      console.groupEnd();
    }
  };

  // Delete subject
  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    console.group("Course Management: Delete Subject");
    console.log("Delete ID:", id);
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/admin/subjects/${id}`, config);
      console.log("Delete Response:", res.data);
      fetchSubjects();
      setToast({ type: "success", message: "Subject deleted." });
    } catch (err) {
      console.error("Delete Subject Error:", err);
      console.log("Error Response Details:", err.response?.data);
      setToast({ type: "error", message: "Failed to delete subject." });
    } finally {
      console.groupEnd();
    }
  };
  
  const toggleCourseExpansion = (courseId) => {
    setExpandedCourseIds(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  return (
    <StaffDashboardLayout pagetitle="Course Management">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[120] px-6 py-4 rounded-2xl shadow-2xl text-white transition-all ${toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"}`}>
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      <div className="flex flex-col gap-8 min-h-screen">

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
            {/* Create Course Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-10 bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-[#0F2843] rounded-[28px] flex items-center justify-center shadow-xl shadow-[#0F2843]/20 group">
                    <BookOpenIcon className="w-10 h-10 text-[#BB9E7F]" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-[#0F2843] dark:text-white tracking-tight uppercase">Curriculum Hub</h3>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Foundational Programs</p>
                 </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full sm:w-auto px-10 py-5 bg-[#0F2843] text-white font-black rounded-3xl shadow-2xl shadow-[#0F2843]/30 hover:scale-[1.03] active:scale-95 transition-all text-sm flex items-center justify-center gap-3 group"
              >
                <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                Forge New Course
              </button>
            </div>

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
                  <button 
                    key={course.id} 
                    onClick={() => {
                      setSelectedCourse(course);
                      setIsDetailModalOpen(true);
                    }}
                    className="w-full text-left bg-white dark:bg-gray-800/50 dark:backdrop-blur-md p-6 rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#BB9E7F]/5 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    
                    {course.banner && (
                      <div className="w-full h-32 rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-900">
                        <img src={course.banner.startsWith('http') ? course.banner : `${API_BASE_URL}${course.banner}`} alt="Banner" className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-3 py-1 bg-[#BB9E7F]/10 text-[#BB9E7F] text-[10px] font-black uppercase tracking-[0.15em] rounded-full">Course</span>
                      <ChevronLeftIcon className="w-4 h-4 text-gray-300 rotate-180 group-hover:text-[#BB9E7F] transition-colors" />
                    </div>
                    
                    <h3 className="text-xl font-black text-[#0F2843] dark:text-white leading-tight mb-2 group-hover:text-[#BB9E7F] transition-colors uppercase tracking-tight">{course.title}</h3>
                    <p className="text-[11px] text-gray-400 font-bold mb-4 line-clamp-2">{course.description || "Comprehensive academic tutoring program."}</p>
                    
                    <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#76D287]"></div>
                      <span className="text-[11px] text-gray-400 font-bold">Operational</span>
                      <span className="ml-auto text-[11px] text-[#BB9E7F] font-black tracking-widest">₦{Number(course.price || 0).toLocaleString()}</span>
                    </div>
                  </button>
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
            {/* Create Subject Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-10 bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-[#0F2843] rounded-[28px] flex items-center justify-center shadow-xl shadow-[#0F2843]/20 group">
                    <AcademicCapIcon className="w-10 h-10 text-[#BB9E7F]" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-[#0F2843] dark:text-white tracking-tight uppercase">Subject Lab</h3>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Specialized Modules</p>
                 </div>
              </div>
              <button
                onClick={() => setIsSubjectCreateModalOpen(true)}
                className="w-full sm:w-auto px-10 py-5 bg-[#0F2843] text-white font-black rounded-3xl shadow-2xl shadow-[#0F2843]/30 hover:scale-[1.03] active:scale-95 transition-all text-sm flex items-center justify-center gap-3 group"
              >
                <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                Forge New Subject
              </button>
            </div>

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
                  <div key={course.id} className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-md rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-700 overflow-hidden transition-all duration-300">
                    <button 
                      onClick={() => toggleCourseExpansion(course.id)}
                      className="w-full px-6 py-5 bg-[#0F2843] flex items-center gap-3 hover:bg-[#153457] transition-colors"
                    >
                      <BookOpenIcon className="w-5 h-5 text-[#BB9E7F]" />
                      <span className="text-white font-black text-sm uppercase tracking-wider">{course.title}</span>
                      <span className="ml-auto text-[#BB9E7F] text-xs font-black bg-white/5 px-3 py-1 rounded-full">{courseSubjects.length} subjects</span>
                      <ChevronDownIcon className={`w-5 h-5 text-white/40 transition-transform duration-500 ${expandedCourseIds.has(course.id) ? "rotate-180" : ""}`} />
                    </button>
                    {expandedCourseIds.has(course.id) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 animate-in slide-in-from-top-4 duration-500">
                        {courseSubjects.map((subject) => (
                          <button 
                            key={subject.id} 
                            onClick={() => {
                              setSelectedSubject(subject);
                              setIsSubjectDetailModalOpen(true);
                            }}
                            className="w-full text-left bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#BB9E7F]/5 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            
                            {subject.banner && (
                              <div className="w-full h-28 rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                                <img src={subject.banner.startsWith('http') ? subject.banner : `${API_BASE_URL}${subject.banner}`} alt="Banner" className="w-full h-full object-cover" />
                              </div>
                            )}
                            
                            <div className="flex items-start justify-between mb-4">
                              <span className="px-3 py-1 bg-[#BB9E7F]/10 text-[#BB9E7F] text-[9px] font-black uppercase tracking-[0.15em] rounded-full">Subject</span>
                              <AcademicCapIcon className="w-4 h-4 text-gray-300 group-hover:text-[#BB9E7F] transition-colors" />
                            </div>
                            
                            <h3 className="text-lg font-black text-[#0F2843] dark:text-white leading-tight mb-2 group-hover:text-[#BB9E7F] transition-colors uppercase tracking-tight">{subject.name}</h3>
                            <p className="text-[10px] text-gray-400 font-bold mb-4 line-clamp-2">{subject.description || "In-depth academic module."}</p>
                            
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#76D287]"></div>
                                <span className="text-[10px] text-gray-400 font-bold">Live</span>
                              </div>
                              <span className="text-[10px] text-gray-300 font-bold italic">Module #{subject.id}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
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

      {/* Modals */}
      <CourseCreate 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchCourses()}
      />
      
      <CourseDetailModal
        isOpen={isDetailModalOpen}
        course={selectedCourse}
        subjects={subjects}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCourse(null);
        }}
        onDelete={(id) => {
          handleDeleteCourse(id);
          setIsDetailModalOpen(false);
        }}
        onEdit={(course) => {
          // You could open another modal or switch view here
          setSelectedCourse(course);
          setActiveView("edit");
          setIsDetailModalOpen(false);
        }}
      />

      <SubjectCreate
        isOpen={isSubjectCreateModalOpen}
        onClose={() => setIsSubjectCreateModalOpen(false)}
        onSuccess={() => fetchSubjects()}
        courses={courses}
      />

      <SubjectDetailModal
        isOpen={isSubjectDetailModalOpen}
        subject={selectedSubject}
        course={courses.find(c => Number(c.id) === Number(selectedSubject?.courses?.[0]))}
        onClose={() => {
          setIsSubjectDetailModalOpen(false);
          setSelectedSubject(null);
        }}
        onDelete={(id) => {
          handleDeleteSubject(id);
          setIsSubjectDetailModalOpen(false);
        }}
        onEdit={(subject) => {
          setSelectedSubject(subject);
          setActiveView("edit");
          setIsSubjectDetailModalOpen(false);
        }}
      />
    </StaffDashboardLayout>
  );
}
