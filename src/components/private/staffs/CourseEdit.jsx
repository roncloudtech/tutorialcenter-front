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
  const [description, setDescription] = useState("");
  const [departments, setDepartments] = useState(""); // We keep the plural name to match backend expectation
  const [price, setPrice] = useState("");
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [toast, setToast] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");
  const config = { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } };

  const fetchData = useCallback(async () => {
    console.group("Course Edit: Fetch Data");
    setLoading(true);
    try {
      const courseRes = await axios.get(`${API_BASE_URL}/api/courses`);
      console.log("Courses Response:", courseRes.data);
      const allCourses = courseRes.data?.data || courseRes.data?.courses || [];
      setCourses(allCourses);

      if (mode === "subjects") {
        try {
          const subRes = await axios.get(`${API_BASE_URL}/api/subjects`);
          console.log("Subjects Response:", subRes.data);
          const allSubjects = subRes.data?.subjects || subRes.data?.data || [];
          setSubjects(allSubjects);
        } catch (err) {
          console.error("Error fetching subjects:", err);
          console.log("Subject Fetch Error Details:", err.response?.data);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      console.log("Fetch Error Details:", error.response?.data);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, [API_BASE_URL, mode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = (type, item) => {
    setEditingItem({ type, data: item });
    setNewName(type === "course" ? item.title : item.name);
    
    // Populate metadata for both courses and subjects
    setDescription(item.description || "");
    // Extract first department if it comes as an array, or handle string
    const existingDept = Array.isArray(item.departments) ? item.departments[0] : (item.departments || item.department || "");
    setDepartments(existingDept);
    setBannerPreview(item.banner ? (item.banner.startsWith('http') ? item.banner : `${API_BASE_URL}${item.banner}`) : null);
    setBanner(null);

    if (type === "course") {
      setPrice(item.price || "");
    } else {
      setPrice(""); // Reset price for subjects
    }
    
    setShowConfirmSave(false);
    setIsModalOpen(true);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
      setShowConfirmSave(true);
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;
    console.group(`Course Edit: Save ${editingItem.type}`);
    
    let payload;
    let headers = { Authorization: `Bearer ${token}` };

    if (editingItem.type === "course") {
      // Use FormData for courses to support banner upload
      payload = new FormData();
      payload.append("title", newName);
      payload.append("description", description);
      payload.append("price", price);
      if (banner) {
        payload.append("banner", banner);
      }
      headers["Content-Type"] = "multipart/form-data";
    } else {
      // Use FormData for subjects too to support banner upload
      payload = new FormData();
      payload.append("name", newName);
      payload.append("description", description);
      // Backend requires departments as an array
      payload.append("departments[]", departments);
      if (banner) {
        payload.append("banner", banner);
      }
      headers["Content-Type"] = "multipart/form-data";
    }

    const url = editingItem.type === "course" 
      ? `${API_BASE_URL}/api/admin/courses/update/${editingItem.data.id}` 
      : `${API_BASE_URL}/api/admin/subjects/update/${editingItem.data.id}`;
    
    console.log("Request URL:", url);

    try {
      // Note: We are using PUT as requested. 
      const res = await axios.put(url, payload, { headers });
      console.log("Update Response Data:", res.data);
      
      setToast({ type: "success", message: `${editingItem.type === "course" ? "Course" : "Subject"} updated!` });
      setIsModalOpen(false);
      setShowConfirmSave(false);
      fetchData();
    } catch (error) {
      console.error("Update Error:", error);
      console.log("Error Response:", error.response?.data);
      setToast({ type: "error", message: "Failed to update." });
    } finally {
      console.groupEnd();
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    console.group(`Course Edit: Delete ${type}`);
    const url = type === "course" 
      ? `${API_BASE_URL}/api/admin/courses/destroy/${id}`
      : `${API_BASE_URL}/api/admin/subjects/destroy/${id}`;
    
    console.log("Delete URL:", url);

    try {
      const res = await axios.delete(url, config);
      console.log("Delete Response Data:", res.data);
      setToast({ type: "success", message: `${type === "course" ? "Course" : "Subject"} deleted.` });
      fetchData();
    } catch (error) {
      console.error("Delete Error:", error);
      console.log("Error Response Details:", error.response?.data);
      setToast({ type: "error", message: "Failed to delete." });
    } finally {
      console.groupEnd();
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
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-100 rounded-2xl hover:bg-[#E83831] hover:text-white transition-all group shadow-sm hover:shadow-red-900/20">
                <XMarkIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />
              </button>
            </div>

            <div className="px-10 pb-6 overflow-y-auto max-h-[60vh] space-y-8 custom-scrollbar">
              {editingItem.type === "course" && (
                <div className="space-y-6">
                  {/* Banner Edit */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Banner</label>
                    <div className="relative group aspect-video rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700">
                      {bannerPreview ? (
                        <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpenIcon className="w-12 h-12 text-gray-200" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                        <CheckIcon className="w-8 h-8 text-white" />
                        <span className="text-white font-black text-xs uppercase tracking-widest ml-2">Change Image</span>
                      </div>
                      <input type="file" onChange={handleBannerChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>

                  {/* Title & Price Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                      <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          setShowConfirmSave(true);
                        }}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₦)</label>
                      <input 
                        type="number" 
                        value={price}
                        onChange={(e) => {
                          setPrice(e.target.value);
                          setShowConfirmSave(true);
                        }}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setShowConfirmSave(true);
                      }}
                      rows="4"
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {editingItem.type === "subject" && (
                <div className="space-y-6">
                  {/* Banner Edit */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Banner</label>
                    <div className="relative group aspect-video rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700">
                      {bannerPreview ? (
                        <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <AcademicCapIcon className="w-12 h-12 text-gray-200" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                        <CheckIcon className="w-8 h-8 text-white" />
                        <span className="text-white font-black text-xs uppercase tracking-widest ml-2">Change Image</span>
                      </div>
                      <input type="file" onChange={handleBannerChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Name</label>
                      <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => {
                          setNewName(e.target.value);
                          setShowConfirmSave(true);
                        }}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Department</label>
                      <select 
                        value={departments}
                        onChange={(e) => {
                          setDepartments(e.target.value);
                          setShowConfirmSave(true);
                        }}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select Department</option>
                        <option value="science">Science</option>
                        <option value="art">Arts</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Syllabus Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setShowConfirmSave(true);
                      }}
                      rows="4"
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold text-[#0F2843] dark:text-white outline-none resize-none"
                    />
                  </div>
                </div>
              )}
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
