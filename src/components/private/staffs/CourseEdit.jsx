import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  PencilIcon, 
  TrashIcon, 
  AcademicCapIcon,
  BookOpenIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function CourseEdit({ mode = "courses" }) {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [toast, setToast] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");
  const config = { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const courseRes = await axios.get(`${API_BASE_URL}/api/courses`);
      const allCourses = courseRes.data?.data || courseRes.data?.courses || [];
      setCourses(allCourses);

      if (mode === "subjects") {
        try {
          const subRes = await axios.get(`${API_BASE_URL}/api/subjects`);
          const allSubjects = subRes.data?.subjects || subRes.data?.data || [];
          setSubjects(allSubjects);
        } catch (err) {
          console.error("Error fetching subjects:", err);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, mode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = (type, item) => {
    setEditingItem({ type, data: item });
    setNewName(type === "course" ? item.title : item.name);
    setShowConfirmSave(false);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    try {
      if (editingItem.type === "course") {
        await axios.put(`${API_BASE_URL}/api/admin/courses/update/${editingItem.data.id}`, { title: newName }, config);
      } else {
        await axios.put(`${API_BASE_URL}/api/admin/subjects/update/${editingItem.data.id}`, { name: newName }, config);
      }
      setToast({ type: "success", message: `${editingItem.type === "course" ? "Course" : "Subject"} updated!` });
      setIsModalOpen(false);
      setShowConfirmSave(false);
      fetchData();
    } catch (error) {
      console.error("Error updating:", error);
      setToast({ type: "error", message: "Failed to update." });
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      if (type === "course") {
        await axios.delete(`${API_BASE_URL}/api/admin/courses/destroy/${id}`, config);
      } else {
        await axios.delete(`${API_BASE_URL}/api/admin/subjects/destroy/${id}`, config);
      }
      setToast({ type: "success", message: `${type === "course" ? "Course" : "Subject"} deleted.` });
      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
      setToast({ type: "error", message: "Failed to delete." });
    }
  };

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

  // Helper to find course title by id
  const getCourseTitle = (courseId) => {
    const c = courses.find(c => Number(c.id) === Number(courseId));
    return c?.title || "Unknown";
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-8 right-8 z-[110] px-8 py-4 rounded-2xl shadow-2xl text-white font-black flex items-center gap-3 animate-in fade-in slide-in-from-right-8 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckIcon className="w-6 h-6" /> : <ExclamationCircleIcon className="w-6 h-6" />}
          {toast.message}
        </div>
      )}

      {/* ===== COURSES MODE ===== */}
      {mode === "courses" && (
        <>
          {courses.length > 0 ? courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-md p-6 rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#BB9E7F]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#BB9E7F] transition-all">
                  <BookOpenIcon className="w-6 h-6 text-[#BB9E7F] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-[#BB9E7F] uppercase tracking-widest">Course</span>
                  <h3 className="text-lg font-black text-[#0F2843] dark:text-white tracking-tight">{course.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEditClick("course", course)}
                  className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-[#0F2843] dark:hover:text-white hover:bg-white dark:hover:bg-gray-600 hover:shadow-lg rounded-xl transition-all"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete("course", course.id)}
                  className="p-3 bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="py-16 text-center bg-white/30 dark:bg-gray-800/30 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700">
              <BookOpenIcon className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-black text-gray-300 dark:text-gray-500">No Courses</h4>
            </div>
          )}
        </>
      )}

      {/* ===== SUBJECTS MODE ===== */}
      {mode === "subjects" && (
        <>
          {subjects.length > 0 ? subjects.map((subject) => (
            <div key={subject.id} className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-md p-6 rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0F2843]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0F2843] transition-all">
                  <AcademicCapIcon className="w-6 h-6 text-[#0F2843] dark:text-white group-hover:text-white transition-colors" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-[#BB9E7F] uppercase tracking-widest">
                    {getCourseTitle(subject.courses?.[0])}
                  </span>
                  <h3 className="text-lg font-black text-[#0F2843] dark:text-white tracking-tight">
                    {getCourseTitle(subject.courses?.[0])} - {subject.name}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEditClick("subject", subject)}
                  className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-[#0F2843] dark:hover:text-white hover:bg-white dark:hover:bg-gray-600 hover:shadow-lg rounded-xl transition-all"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete("subject", subject.id)}
                  className="p-3 bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="py-16 text-center bg-white/30 dark:bg-gray-800/30 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700">
              <AcademicCapIcon className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-black text-gray-300 dark:text-gray-500">No Subjects</h4>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md bg-[#0F2843]/40 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-10 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-[#BB9E7F] uppercase tracking-[0.2em]">Refine Metadata</span>
                <h2 className="text-2xl font-black text-[#0F2843] mt-2">Edit {editingItem.type === "course" ? "Course" : "Subject"}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all">
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="px-10 pb-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">New Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    const original = editingItem.type === "course" ? editingItem.data.title : editingItem.data.name;
                    setShowConfirmSave(e.target.value !== original);
                  }}
                  className="w-full px-8 py-6 bg-gray-50 rounded-[24px] font-black text-xl text-[#0F2843] focus:ring-4 focus:ring-[#BB9E7F]/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-10 pt-4 flex flex-col gap-4">
              {showConfirmSave ? (
                <button 
                  onClick={handleSave}
                  className="w-full py-5 bg-[#0F2843] text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
                >
                  Confirm & Save Changes
                </button>
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
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
