import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ExclamationTriangleIcon, UserMinusIcon, BookOpenIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function DisenrolledCourses() {
  const [disenrollments, setDisenrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  const fetchDisenrolled = useCallback(async () => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get(`${API_BASE_URL}/api/admin/courses/disenrollments`, config);
      console.group("Disenrolled Courses Fetching");
      console.log("Payload:", response?.data);
      const fetched = response.data?.disenrollments || response.data?.data || [];
      console.table(fetched);
      console.groupEnd();
      setDisenrollments(fetched);
    } catch (error) {
      console.error("Error fetching disenrolled courses:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchDisenrolled();
  }, [fetchDisenrolled]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-12 h-12 border-4 border-[#0F2843]/10 border-t-[#0F2843] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white/40 backdrop-blur-xl p-10 rounded-[48px] border border-white/20 shadow-xl">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0F2843] tracking-tight uppercase">Disenrolled Courses</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1 ml-0.5">Student Withdrawal Monitoring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disenrollments.length > 0 ? disenrollments.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-2 h-full bg-red-500 opacity-20"></div>
               
               <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                     <span className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-full uppercase tracking-wider">
                        <UserMinusIcon className="w-3 h-3" />
                        Disenrolled
                     </span>
                     <ClockIcon className="w-5 h-5 text-gray-200" />
                  </div>

                  <div>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-0.5">Program Name</span>
                     <h3 className="text-xl font-black text-[#0F2843] group-hover:text-red-500 transition-colors leading-tight">
                        {item.course_title || item.title || "Unknown Course"}
                     </h3>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Student</span>
                         <span className="text-xs font-black text-gray-600">{item.student_name || "N/A"}</span>
                      </div>
                      <div className="text-right">
                         <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Date</span>
                         <span className="text-xs font-bold text-gray-400 block">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}</span>
                      </div>
                  </div>
               </div>
            </div>
          )) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white/30 rounded-[48px] border-2 border-dashed border-gray-200">
               <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                  <BookOpenIcon className="w-10 h-10 text-gray-200" />
               </div>
               <h3 className="text-2xl font-black text-gray-400 uppercase tracking-wider">No Disenrollments</h3>
               <p className="text-gray-400 text-sm font-medium mt-2">There are currently no records of students disenrolling from courses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
