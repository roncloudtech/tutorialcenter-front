import { useState } from "react";
import axios from "axios";
import { 
  XMarkIcon, 
  CameraIcon, 
  DocumentTextIcon, 
  BanknotesIcon,
  CheckIcon,
  PlusIcon,
  AcademicCapIcon,
  BookOpenIcon
} from "@heroicons/react/24/outline";

export default function SubjectCreate({ isOpen, onClose, onSuccess, courses }) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  const [subjectName, setSubjectName] = useState("");
  const [description, setDescription] = useState("");
  const [departments, setDepartments] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setToast({ type: "error", message: "Please select a course first." });
      return;
    }

    setLoading(true);
    console.group("Subject Creation: Submit Form");
    
    const formData = new FormData();
    formData.append("name", subjectName);
    formData.append("description", description);
    // Backend requires 'courses' as an array for validation, 
    // but may rely on 'course_id' for the database column mapping.
    formData.append("departments[]", departments);
    formData.append("courses[]", selectedCourseId); 
    formData.append("course_id", selectedCourseId);
    formData.append("status", "active");
    if (banner) {
      formData.append("banner", banner);
    } else {
      setToast({ type: "error", message: "Please upload a subject banner." });
      setLoading(false);
      return;
    }
    
    try {
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      };

      const res = await axios.post(`${API_BASE_URL}/api/admin/subjects`, formData, config);
      console.log("Subject Creation Response:", res?.data);
      
      setToast({ type: "success", message: "Subject created successfully!" });
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
        // Reset state
        setSubjectName("");
        setDescription("");
        setDepartments("");
        setSelectedCourseId("");
        setBanner(null);
        setBannerPreview(null);
      }, 1500);
    } catch (error) {
      console.error("Subject Creation Error:", error);
      setToast({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to create subject." 
      });
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-[#0F2843]/60 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-3xl shadow-2xl text-white font-black flex items-center gap-4 animate-in slide-in-from-top-10 transition-all ${
          toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
        }`}>
          {toast.type === "success" ? <CheckIcon className="w-6 h-6" /> : <XMarkIcon className="w-6 h-6" />}
          {toast.message}
        </div>
      )}

      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Header */}
        <div className="p-8 sm:p-10 flex justify-between items-center bg-[#0F2843] text-white">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shadow-inner">
              <PlusIcon className="w-8 h-8 text-[#BB9E7F]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">FORGE SUBJECT</h2>
              <p className="text-[#BB9E7F] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Knowledge Module Architect</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-[#E83831] rounded-2xl transition-all group active:scale-90 shadow-lg hover:shadow-red-900/20">
            <XMarkIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Banner Upload Section */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subject Display Banner</label>
              <div className={`relative group border-2 border-dashed rounded-[32px] overflow-hidden bg-gray-50 dark:bg-gray-800/50 transition-all ${
                bannerPreview ? "border-[#76D287]/30" : "border-gray-200 hover:border-[#BB9E7F]/40"
              }`}>
                {bannerPreview ? (
                  <div className="relative aspect-video sm:aspect-[21/9]">
                    <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <CameraIcon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center text-center gap-4 cursor-pointer">
                    <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-[24px] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AcademicCapIcon className="w-10 h-10 text-[#BB9E7F]" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-black text-lg">Upload Subject Banner</p>
                      <p className="text-gray-400 text-sm font-bold mt-1">High resolution editorial artwork (16:9)</p>
                    </div>
                  </div>
                )}
                <input type="file" onChange={handleBannerChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Course Selection */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Parent Curriculum</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl group-focus-within:bg-[#0F2843] transition-colors">
                    <BookOpenIcon className="w-5 h-5 text-[#BB9E7F]" />
                  </div>
                  <select 
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                    className="w-full pl-20 pr-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 focus:bg-white dark:focus:bg-gray-700 rounded-2xl font-black text-[#0F2843] dark:text-white outline-none transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="">Select a Parent Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Subject Designation</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl group-focus-within:bg-[#0F2843] transition-colors">
                    <AcademicCapIcon className="w-5 h-5 text-[#BB9E7F]" />
                  </div>
                  <input 
                    type="text" 
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. Advanced Mathematics"
                    required
                    className="w-full pl-20 pr-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 focus:bg-white dark:focus:bg-gray-700 rounded-2xl font-black text-[#0F2843] dark:text-white outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Department Input */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Academic Department</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl group-focus-within:bg-[#0F2843] transition-colors">
                    <BanknotesIcon className="w-5 h-5 text-[#BB9E7F]" />
                  </div>
                  <select 
                    value={departments}
                    onChange={(e) => setDepartments(e.target.value)}
                    required
                    className="w-full pl-20 pr-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 focus:bg-white dark:focus:bg-gray-700 rounded-2xl font-black text-[#0F2843] dark:text-white outline-none transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    <option value="science">Science</option>
                    <option value="art">Arts</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description Area */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Academic Syllabus & Description</label>
              <div className="relative group">
                <div className="absolute left-6 top-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl group-focus-within:bg-[#BB9E7F] transition-colors">
                  <DocumentTextIcon className="w-5 h-5 text-[#BB9E7F] group-focus-within:text-white" />
                </div>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="5"
                  placeholder="Elaborate on the modules, learning objectives, and scope of this subject..."
                  required
                  className="w-full pl-20 pr-8 py-6 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 focus:bg-white dark:focus:bg-gray-700 rounded-[32px] font-bold text-[#0F2843] dark:text-white outline-none transition-all shadow-sm resize-none"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-6 pt-10 border-t border-gray-100 dark:border-gray-800">
               <button type="button" onClick={onClose} className="flex-1 py-5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 font-black rounded-3xl transition-all uppercase tracking-widest text-xs">Cancel</button>
               <button type="submit" disabled={loading} className="flex-[2] py-5 bg-[#0F2843] text-white font-black rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3">
                 {loading ? "Constructing Module..." : "Finalize & Forge Subject"}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
