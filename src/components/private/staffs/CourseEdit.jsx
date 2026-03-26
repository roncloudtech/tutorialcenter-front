import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  BookOpenIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function CourseEdit() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null); // { type: 'course'|'subject', data: item }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({}); // { courseId: boolean }

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Fetch all courses
      const courseRes = await axios.get(`${API_BASE_URL}/api/courses`);
      console.group("Course Edit Data Fetching");
      console.log("Courses Payload:", courseRes?.data);
      const allCourses = courseRes.data?.data || courseRes.data?.courses || [];

      // Fetch all subjects ONCE
      let allSubjects = [];
      try {
        const subRes = await axios.get(`${API_BASE_URL}/api/admin/subjects/all`, config);
        allSubjects = subRes.data?.subjects || subRes.data?.data || [];
        console.log("All Subjects Payload:", allSubjects);
      } catch (err) {
        console.error("Error fetching all subjects:", err);
      }

      // Map courses and attach subjects (Removing the course_id filter as requested)
      const fullData = allCourses.map((course) => {
        // For now, showing ALL subjects under EACH course to check if they exist
        // Later we can restore filtering if course_id is present in the payload
        return {
          ...course,
          subjects: allSubjects 
        };
      });

      setCourses(fullData);
      console.table(fullData);
      console.groupEnd();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = (e, type, item) => {
    e.stopPropagation(); // Don't trigger collapse/expand when clicking edit
    setEditingItem({ type, data: item });
    setNewName(type === 'course' ? item.title : item.name);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editingItem.type === 'course') {
        const res = await axios.put(`${API_BASE_URL}/api/admin/courses/update/${editingItem.data.id}`, {
          title: newName
        }, config);
        console.log("Course Update Result:", res?.data);
      } else {
        const res = await axios.put(`${API_BASE_URL}/api/admin/subjects/update/${editingItem.data.id}`, {
          name: newName
        }, config);
        console.log("Subject Update Result:", res?.data);
      }

      setToast({ type: 'success', message: `${editingItem.type === 'course' ? 'Course' : 'Subject'} updated successfully!` });
      setIsModalOpen(false);
      setShowConfirmSave(false);
      fetchData();
    } catch (error) {
      console.error("Error updating:", error);
      setToast({ type: 'error', message: "Failed to update item." });
    }
  };

  const handleDelete = async (e, type, id) => {
    e.stopPropagation(); // Don't trigger collapse/expand
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (type === 'course') {
        const res = await axios.delete(`${API_BASE_URL}/api/admin/courses/destroy/${id}`, config);
        console.log("Course Delete Result:", res?.data);
      } else {
        const res = await axios.delete(`${API_BASE_URL}/api/admin/subjects/destroy/${id}`, config);
        console.log("Subject Delete Result:", res?.data);
      }

      setToast({ type: 'success', message: `${type === 'course' ? 'Course' : 'Subject'} deleted successfully!` });
      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
      setToast({ type: 'error', message: "Failed to delete item." });
    }
  };

  const handleRestore = async (e, type, id) => {
    e.stopPropagation(); // Don't trigger collapse/expand
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (type === 'course') {
        const res = await axios.post(`${API_BASE_URL}/api/admin/courses/restore/${id}`, {}, config);
        console.log("Course Restore Result:", res?.data);
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/admin/subjects/restore/${id}`, {}, config);
        console.log("Subject Restore Result:", res?.data);
      }

      setToast({ type: 'success', message: `${type === 'course' ? 'Course' : 'Subject'} restored successfully!` });
      fetchData();
    } catch (error) {
      console.error("Error restoring:", error);
      setToast({ type: 'error', message: "Failed to restore item." });
    }
  };

  // Close toast automatically
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-12 h-12 border-4 border-[#0F2843]/10 border-t-[#0F2843] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 right-8 z-[110] px-8 py-4 rounded-2xl shadow-2xl text-white font-black flex items-center gap-3 animate-in fade-in slide-in-from-right-8 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckIcon className="w-6 h-6" /> : <ExclamationCircleIcon className="w-6 h-6" />}
          {toast.message}
        </div>
      )}

      {courses.map((course) => {
        const isExpanded = expandedCourses[course.id];
        return (
          <div key={course.id} className="bg-white rounded-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden group hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <div 
              onClick={() => toggleCourse(course.id)}
              className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 cursor-pointer hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-[#BB9E7F]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#BB9E7F] transition-all duration-500">
                  <BookOpenIcon className={`w-8 h-8 ${isExpanded ? 'text-white' : 'text-[#BB9E7F]'} group-hover:text-white transition-colors`} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#BB9E7F] uppercase tracking-widest">Master Program</span>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-[#0F2843] tracking-tight">{course.title}</h3>
                    <ChevronRightIcon className={`w-6 h-6 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-[#BB9E7F]' : ''}`} />
                  </div>
                  <p className="text-xs text-gray-400 font-bold mt-1">{course.subjects?.length || 0} Subjects Registered</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <button 
                  onClick={(e) => handleRestore(e, 'course', course.id)}
                  className="p-3 bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                  title="Restore/Recover"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => handleEditClick(e, 'course', course)}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-[#0F2843] hover:bg-white hover:shadow-lg rounded-xl transition-all"
                  title="Edit Course Name"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => handleDelete(e, 'course', course.id)}
                  className="p-3 bg-red-50 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                  title="Delete Course"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Subjects Dropdown/List (Collapsable) */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100 py-6 px-10 border-t border-gray-50 bg-gray-50/50' : 'max-h-0 opacity-0 px-10'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {course.subjects?.length > 0 ? course.subjects.map((subject) => (
                  <div key={subject.id} className="bg-white p-5 rounded-2xl flex items-center justify-between border border-gray-100 hover:border-[#BB9E7F]/30 hover:shadow-md transition-all group/sub">
                    <div className="flex items-center gap-3">
                      <AcademicCapIcon className="w-5 h-5 text-gray-300 group-hover/sub:text-[#BB9E7F] transition-colors" />
                      <span className="text-sm font-bold text-[#0F2843]">{subject.name}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleEditClick(e, 'subject', subject)}
                        className="p-1.5 text-gray-400 hover:text-[#BB9E7F] transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, 'subject', subject.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="col-span-full text-center text-gray-400 text-xs font-bold italic py-4">No subjects found for this course.</p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md bg-[#0F2843]/40 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-8 duration-500">
              {/* Header */}
              <div className="p-10 flex justify-between items-start">
                 <div>
                    <span className="text-[10px] font-black text-[#BB9E7F] uppercase tracking-[0.2em]">Refine Metadata</span>
                    <h2 className="text-2xl font-black text-[#0F2843] mt-2">Edit {editingItem.type === 'course' ? 'Course' : 'Subject'}</h2>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all">
                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                 </button>
              </div>

              {/* Body */}
              <div className="px-10 pb-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">New Identity</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (e.target.value !== (editingItem.type === 'course' ? editingItem.data.title : editingItem.data.name)) {
                        setShowConfirmSave(true);
                      } else {
                        setShowConfirmSave(false);
                      }
                    }}
                    className="w-full px-8 py-6 bg-gray-50 rounded-[24px] font-black text-xl text-[#0F2843] focus:ring-4 focus:ring-[#BB9E7F]/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-10 pt-4 flex flex-col gap-4">
                {showConfirmSave ? (
                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 mb-2 animate-in slide-in-from-top-2">
                    <p className="text-xs font-bold text-amber-700 leading-relaxed">
                      Are you sure you want to save your changes to this {editingItem.type}? This action will update the identity across the entire system.
                    </p>
                    <button 
                      onClick={handleSave}
                      className="w-full mt-4 py-4 bg-[#0F2843] text-white font-black rounded-2xl shadow-xl shadow-[#0F2843]/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
                    >
                      Confirm & Save Changes
                    </button>
                  </div>
                ) : (
                  <button 
                    disabled
                    className="w-full py-5 bg-gray-100 text-gray-400 font-bold rounded-2xl cursor-not-allowed uppercase tracking-widest text-xs"
                  >
                    No Changes Detected
                  </button>
                )}
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-4 bg-white text-gray-400 hover:text-gray-600 font-bold rounded-2xl transition-all text-xs uppercase tracking-widest"
                >
                  Discard Changes
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
