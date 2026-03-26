import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { PlusIcon, TrashIcon, ClockIcon, AcademicCapIcon, BookOpenIcon } from "@heroicons/react/24/outline";

export default function CourseCreate() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [subjects, setSubjects] = useState([""]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  // Fetch history (all courses)
  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses`);
      console.group("Course Creation History");
      console.log("Raw Response:", response?.data);
      const fetched = response.data?.data || response.data?.courses || [];
      console.table(fetched);
      console.groupEnd();
      setHistory(fetched);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
    try {
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      };

      // Create Course
      const courseRes = await axios.post(`${API_BASE_URL}/api/admin/courses`, { 
        title: courseName 
      }, config);
      
      console.group("Course Creation Result");
      console.log("Course Payload:", courseRes?.data);
      
      const courseId = courseRes.data?.course?.id || courseRes.data?.data?.id;

      // Create Subjects
      if (courseId) {
        console.log("Creating Subjects for Course ID:", courseId);
        await Promise.all(subjects.filter(s => s.trim()).map(async (subjectName) => {
          const subRes = await axios.post(`${API_BASE_URL}/api/admin/subjects`, {
            name: subjectName,
            course_id: courseId
          }, config);
          console.log(`Subject Created: ${subjectName}`, subRes?.data);
          return subRes;
        }));
      }
      console.groupEnd();

      // Reset
      setCourseName("");
      setSubjects([""]);
      setIsFormVisible(false);
      fetchHistory();
      alert("Course and subjects created successfully!");
    } catch (error) {
      console.error("Error creating course/subjects:", error);
      alert("Failed to create course. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (!isFormVisible) {
    return (
      <div className="space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col items-center justify-center p-16 bg-white/40 backdrop-blur-xl rounded-[48px] border-2 border-dashed border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all hover:border-[#BB9E7F]/30 overflow-hidden relative">
           {/* Decorative blobs */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#BB9E7F]/5 rounded-full blur-3xl"></div>
           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0F2843]/5 rounded-full blur-3xl"></div>

           <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl border border-gray-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <BookOpenIcon className="w-10 h-10 text-[#BB9E7F]" />
           </div>
           
           <h3 className="text-2xl font-black text-[#0F2843] mb-3">Begin a New Course</h3>
           <p className="text-gray-400 font-medium text-center max-w-sm mb-10 leading-relaxed">
             Expand your curriculum by adding new courses and their associated subjects to the system.
           </p>

           <button 
             onClick={() => setIsFormVisible(true)}
             className="px-12 py-5 bg-[#0F2843] text-white font-black rounded-2xl shadow-[0_20px_40px_rgba(15,40,67,0.3)] hover:translate-y-[-4px] active:scale-95 transition-all text-lg flex items-center gap-3 group"
           >
             <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
             Create Course/Subject
           </button>
        </div>

        {/* History Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                <ClockIcon className="w-6 h-6 text-[#BB9E7F]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#0F2843] uppercase tracking-wider">Creation History</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5 ml-0.5">Recently added programs</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.length > 0 ? history.map((item, idx) => (
              <div key={item.id || idx} className="bg-white p-8 rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-50 hover:shadow-2xl hover:translate-y-[-4px] transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#BB9E7F]/10 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="flex flex-col gap-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-4 py-1.5 bg-[#BB9E7F]/10 text-[#BB9E7F] text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Course</span>
                    <AcademicCapIcon className="w-5 h-5 text-gray-200 group-hover:text-[#BB9E7F] transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-black text-[#0F2843] group-hover:text-[#BB9E7F] transition-colors leading-tight min-h-[56px] flex items-center">{item.title}</h3>
                  
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#76D287] shadow-[0_0_10px_rgba(118,210,135,0.5)]"></div>
                      <span className="text-[11px] text-gray-400 font-bold">Live Status</span>
                    </div>
                    <span className="text-[11px] text-gray-300 font-bold italic">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Active'}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center bg-white/30 backdrop-blur-sm rounded-[40px] border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <ClockIcon className="w-10 h-10 text-gray-200" />
                </div>
                <h4 className="text-lg font-black text-gray-400">Empty History</h4>
                <p className="text-gray-400 text-sm font-medium">No courses have been created yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white p-12 rounded-[56px] shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#BB9E7F]/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#0F2843]/5 to-transparent rounded-full blur-3xl -ml-32 -mb-32"></div>

        <div className="relative">
          <div className="flex items-center gap-6 mb-12">
             <div className="w-16 h-16 bg-[#0F2843] rounded-[24px] flex items-center justify-center shadow-xl shadow-[#0F2843]/20">
                <PlusIcon className="w-8 h-8 text-white rotate-0 group-hover:rotate-90 transition-transform" />
             </div>
             <div>
                <h2 className="text-3xl font-black text-[#0F2843] tracking-tight">NEW CURRICULUM</h2>
                <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1 ml-0.5">Creation Interface</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-3 group">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 group-focus-within:text-[#BB9E7F] transition-colors">Course Primary Designation</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Enter Course Title..."
                  required
                  className="w-full px-8 py-6 bg-gray-50/80 rounded-[24px] border-2 border-transparent focus:border-[#BB9E7F]/30 focus:bg-white focus:shadow-xl font-black text-xl text-[#0F2843] placeholder-gray-200 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between ml-2">
                <div className="flex items-center gap-2">
                   <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Subjects Library</span>
                   <span className="w-5 h-5 bg-gray-100 text-[#0F2843] text-[10px] font-black rounded-lg flex items-center justify-center">{subjects.length}</span>
                </div>
                <button 
                  type="button"
                  onClick={addSubjectField}
                  className="px-6 py-2.5 bg-white text-[#BB9E7F] border border-[#BB9E7F]/20 hover:border-[#BB9E7F] hover:bg-[#BB9E7F] hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 shadow-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Sub-category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {subjects.map((subject, index) => (
                  <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex-1 relative group">
                      <input 
                        type="text" 
                        value={subject}
                        onChange={(e) => handleSubjectChange(index, e.target.value)}
                        placeholder="Subject Name"
                        className="w-full px-7 py-5 bg-gray-50/50 rounded-2xl border-2 border-transparent focus:border-[#BB9E7F]/20 focus:bg-white font-bold text-[#0F2843] placeholder-gray-300 transition-all outline-none"
                      />
                    </div>
                    {subjects.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeSubjectField(index)}
                        className="p-4 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm hover:shadow-red-200 active:scale-90"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 pt-8 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setIsFormVisible(false)}
                className="flex-1 py-5 bg-gray-50 text-gray-400 hover:text-gray-600 font-black rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
              >
                Return
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] py-5 bg-[#0F2843] text-white font-black rounded-2xl shadow-2xl shadow-[#0F2843]/20 hover:translate-y-[-2px] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-sm"
              >
                {loading ? "Registering..." : "Finalize Creation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
