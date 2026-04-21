import { useState } from "react";
import axios from "axios";
import { 
  XMarkIcon, 
  CameraIcon, 
  BanknotesIcon, 
  DocumentTextIcon, 
  CheckIcon,
  PlusIcon,
  TrashIcon,
  BookOpenIcon
} from "@heroicons/react/24/outline";

export default function CourseCreate({ isOpen, onClose, onSuccess }) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [subjects, setSubjects] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const addSubjectField = () => setSubjects([...subjects, ""]);
  const removeSubjectField = (index) => setSubjects(subjects.filter((_, i) => i !== index));
  const handleSubjectChange = (index, value) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.group("Course Creation: Submit Form");
    
    // Using FormData for banner upload
    const formData = new FormData();
    formData.append("title", courseName);
    formData.append("description", description);
    formData.append("price", price);
    if (banner) {
      formData.append("banner", banner);
    }
    
    console.log("Course Creation FormData entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[0] === 'banner' ? '[File]' : pair[1]));
    }
    
    try {
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      };

      // Create Course
      const courseRes = await axios.post(`${API_BASE_URL}/api/admin/courses`, formData, config);
      console.log("Course Creation Response:", courseRes?.data);
      
      const courseId = courseRes.data?.course?.id || courseRes.data?.data?.id;

      // Create Subjects
      if (courseId) {
        const subjectsList = subjects.filter(s => s.trim());
        if (subjectsList.length > 0) {
          console.log("Creating Subjects for Course ID:", courseId, "Subjects:", subjectsList);
          await Promise.all(subjectsList.map(async (subjectName) => {
            const subPayload = {
              name: subjectName,
              course_id: courseId
            };
            await axios.post(`${API_BASE_URL}/api/admin/subjects`, subPayload, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }));
        }
      }

      setToast({ type: "success", message: "Course created successfully!" });
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
        // Reset state
        setCourseName("");
        setDescription("");
        setPrice("");
        setBanner(null);
        setBannerPreview(null);
        setSubjects([""]);
      }, 1500);
    } catch (error) {
      console.error("Course/Subjects Creation Error:", error);
      setToast({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to create course." 
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

      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Header */}
        <div className="p-8 sm:p-10 flex justify-between items-center bg-[#0F2843] text-white">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shadow-inner">
              <PlusIcon className="w-8 h-8 text-[#BB9E7F]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">CREATE COURSE</h2>
              <p className="text-[#BB9E7F] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Curriculum Architect</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-4 hover:bg-[#E83831] rounded-2xl transition-all group active:scale-90 shadow-lg hover:shadow-red-900/20"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Banner Upload Section */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Course Banner Image</label>
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
                      <PlusIcon className="w-10 h-10 text-[#BB9E7F]" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-black text-lg">Upload Display Banner</p>
                      <p className="text-gray-400 text-sm font-bold mt-1">Recommended size: 1920x1080 (JPG, PNG)</p>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  onChange={handleBannerChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Title Input */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Course Core Title</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl group-focus-within:bg-[#0F2843] transition-colors">
                    <BookOpenIcon className="w-5 h-5 text-[#BB9E7F]" />
                  </div>
                  <input 
                    type="text" 
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. UTME - JAMB 2024"
                    required
                    className="w-full pl-20 pr-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 focus:bg-white dark:focus:bg-gray-700 rounded-2xl font-black text-[#0F2843] dark:text-white outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Price Input */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Monthly Enrollment Fee</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl group-focus-within:bg-[#76D287] transition-colors">
                    <BanknotesIcon className="w-5 h-5 text-[#76D287] group-focus-within:text-white" />
                  </div>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Naira (₦)
                  </div>
                  <input 
                    type="number" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full pl-20 pr-24 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#76D287]/30 focus:bg-white dark:focus:bg-gray-700 rounded-2xl font-black text-[#0F2843] dark:text-white outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Description Area */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Academic Overview & Description</label>
              <div className="relative group">
                <div className="absolute left-6 top-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl group-focus-within:bg-[#BB9E7F] transition-colors">
                  <DocumentTextIcon className="w-5 h-5 text-[#BB9E7F] group-focus-within:text-white" />
                </div>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  placeholder="Provide a detailed roadmap of what this course offers..."
                  required
                  className="w-full pl-20 pr-8 py-6 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#BB9E7F]/30 focus:bg-white dark:focus:bg-gray-700 rounded-[32px] font-bold text-[#0F2843] dark:text-white outline-none transition-all shadow-sm resize-none"
                />
              </div>
            </div>

            {/* Subjects Builder Section */}
            <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
               <div className="flex items-center justify-between px-2">
                 <div>
                   <h4 className="text-sm font-black text-[#0F2843] dark:text-white uppercase tracking-tight">Associate Subjects</h4>
                   <p className="text-[10px] text-gray-400 font-bold mt-0.5">Define core subjects for this course</p>
                 </div>
                 <button 
                   type="button"
                   onClick={addSubjectField}
                   className="px-6 py-2.5 bg-[#BB9E7F]/10 text-[#BB9E7F] hover:bg-[#BB9E7F] hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                 >
                   <PlusIcon className="w-4 h-4" />
                   Add Subject
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {subjects.map((subject, index) => (
                   <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                     <div className="flex-1 relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#BB9E7F] rounded-full group-focus-within:scale-150 transition-transform"></div>
                        <input 
                          type="text" 
                          value={subject}
                          onChange={(e) => handleSubjectChange(index, e.target.value)}
                          placeholder="Subject Name"
                          className="w-full pl-10 pr-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-[#BB9E7F]/20 focus:bg-white font-bold text-sm text-[#0F2843] dark:text-white outline-none transition-all shadow-sm"
                        />
                     </div>
                     {subjects.length > 1 && (
                       <button 
                         type="button"
                         onClick={() => removeSubjectField(index)}
                         className="p-4 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
                       >
                         <TrashIcon className="w-5 h-5" />
                       </button>
                     )}
                   </div>
                 ))}
               </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-6 pt-10 border-t border-gray-100 dark:border-gray-800">
               <button 
                 type="button" 
                 onClick={onClose}
                 className="flex-1 py-5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 font-black rounded-3xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
               >
                 Cancel
               </button>
               <button 
                 type="submit"
                 disabled={loading}
                 className="flex-[2] py-5 bg-[#0F2843] text-white font-black rounded-3xl shadow-2xl shadow-[#0F2843]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3"
               >
                 {loading ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     Forging Curriculum...
                   </>
                 ) : "Finalize & Create"}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
