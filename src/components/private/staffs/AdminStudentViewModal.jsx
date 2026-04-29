import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserGroupIcon as UserGroupOutline,
  CheckCircleIcon,
  AcademicCapIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

export default function AdminStudentViewModal({ studentId, onClose, onUpdate }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  // Fetch full student details
  const fetchStudentDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("[AdminStudentViewModal] Fetch results for ID", studentId, ":", res.data);

      let data = res.data?.student || res.data?.data || res.data;
      if (Array.isArray(data)) {
        data = data[0] || {};
      }
      
      // Parse information if it's a JSON string
      if (typeof data?.information === 'string') {
        try {
          data.information = JSON.parse(data.information);
        } catch(e) {
          console.error("Failed to parse information JSON string", e);
        }
      }

      setStudent(data);
    } catch (error) {
      console.error("Failed to fetch student details", error);
      setToast({ type: "error", message: "Failed to load student details" });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, studentId, token]);

  useEffect(() => {
    if (studentId) fetchStudentDetails();
  }, [studentId, fetchStudentDetails]);

  const handleSuspend = async () => {
    if (!window.confirm("Are you sure you want to suspend this student?")) return;
    try {
      const targetId = info?.id || studentId;
      await axios.delete(`${API_BASE_URL}/api/admin/students/destroy/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: "success", message: "Student suspended successfully" });
      fetchStudentDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      setToast({ type: "error", message: "Failed to suspend student" });
    }
  };

  const handleRestore = async () => {
    if (!window.confirm("Are you sure you want to restore this student?")) return;
    try {
      const targetId = info?.id || studentId;
      await axios.post(`${API_BASE_URL}/api/admin/students/restore/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: "success", message: "Student restored successfully" });
      fetchStudentDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      setToast({ type: "error", message: "Failed to restore student" });
    }
  };

  // No longer needed as we use course_information.title from the backend
  // const getCourseName = (id) => { ... }

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-12 text-center shadow-2xl">
        <div className="w-12 h-12 border-4 border-[#0F2843]/20 border-t-[#0F2843] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500">Loading profile...</p>
      </div>
    </div>
  );

  // Parse nested information
  const info = Array.isArray(student?.information) ? student.information[0] : (student?.information || student || {});
  
  const isSuspended = info?.deleted_at != null || student?.deleted_at != null;
  const displayName = (info?.firstname && info?.surname)
    ? `${info.firstname} ${info.surname}`.trim() 
    : info?.username || "Unknown Student";

  const guardians = info?.guardians || student?.guardians || [];
  const attendances = info?.attendances || student?.attendance || [];
  const advisors = info?.advisors || student?.advisors || [];
  const courseEnrolments = student?.courses || info?.courses || student?.course_information || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-8 animate-in fade-in duration-300">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-10 right-10 z-[110] px-6 py-4 rounded-2xl shadow-2xl text-white flex items-center gap-3 animate-in slide-in-from-top-4 ${
          toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
        }`}>
          <div className="p-1 bg-white/20 rounded-full">
            {toast.type === "success" ? <CheckCircleIcon className="w-5 h-5"/> : <XMarkIcon className="w-5 h-5"/>}
          </div>
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative group">
        
        {/* Header with Close */}
        <div className="absolute top-8 right-8 z-10">
          <button 
            onClick={onClose}
            className="p-3 bg-gray-100/50 hover:bg-gray-100 rounded-full transition-all group/btn"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400 group-hover/btn:text-gray-900" />
          </button>
        </div>

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto p-10 lg:p-14 ${isSuspended ? "opacity-70 grayscale-[0.3]" : ""}`}>
          
          {/* Profile Header */}
              <div className="flex flex-col lg:flex-row items-center gap-10 mb-12">
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[2.5rem] overflow-hidden border-4 border-gray-100 shadow-xl relative bg-gray-50 flex items-center justify-center">
                 {info?.profile_picture ? (
                   <img 
                     src={`${API_BASE_URL}/storage/${info.profile_picture}`}
                     className="w-full h-full object-cover"
                     alt="Profile" 
                   />
                 ) : (
                    <span className="text-5xl font-black text-[#0F2843]">{displayName[0]?.toUpperCase()}</span>
                 )}
              </div>
              {isSuspended && (
                <div className="absolute -top-3 -right-3 bg-[#E83831] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-10 border-2 border-white">
                  Suspended
                </div>
              )}
            </div>

            <div className="text-center lg:text-left flex-1">
              <h2 className="text-4xl lg:text-5xl font-black text-[#0F2843] mb-2 uppercase tracking-tighter">
                {displayName}
              </h2>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <span className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border ${
                  isSuspended 
                    ? "bg-red-50 text-red-600 border-red-100" 
                    : student?.account_status === "active" || info?.account_status === "active" || true
                      ? "bg-green-50 text-green-600 border-green-100"
                      : "bg-orange-50 text-orange-600 border-orange-100"
                }`}>
                  {isSuspended ? "Suspended" : (student?.account_status || info?.account_status || "Active")}
                </span>
                
                {guardians.length > 0 && (
                   <span className="px-5 py-2 bg-blue-50 text-[#0F2843] rounded-2xl text-xs font-black uppercase tracking-widest border border-blue-100 flex items-center gap-1">
                      <UserGroupOutline className="w-4 h-4" /> Guardian Attached
                   </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Column 1: Personal & Contact */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-[#BB9E7F] uppercase tracking-[0.2em] mb-4 border-b border-gray-100 pb-2">Student Information</h3>
              
              <div className="grid grid-cols-1 gap-4 text-center">
                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Registered On</p>
                    <p className="text-sm font-black text-[#0F2843]">
                      {info?.created_at ? new Date(info.created_at).toLocaleDateString() : "N/A"}
                    </p>
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-gray-600">
                   <EnvelopeIcon className="w-5 h-5 text-[#BB9E7F]" />
                   <div className="flex-1">
                     <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Email Address</p>
                     <p className="text-sm font-bold">{info?.email || "N/A"}</p>
                   </div>
                </div>

                {info?.tel && (
                  <div className="flex items-center gap-4 text-gray-600">
                     <PhoneIcon className="w-5 h-5 text-[#BB9E7F]" />
                     <div className="flex-1">
                       <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Telephone</p>
                       <p className="text-sm font-bold">{info.tel}</p>
                     </div>
                  </div>
                )}
                
                {info?.date_of_birth && (
                  <div className="flex items-center gap-4 text-gray-600">
                     <CalendarIcon className="w-5 h-5 text-[#BB9E7F]" />
                     <div className="flex-1">
                       <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Date of Birth</p>
                       <p className="text-sm font-bold">{new Date(info.date_of_birth).toLocaleDateString()}</p>
                     </div>
                  </div>
                )}

                {info?.gender && (
                  <div className="flex items-center gap-4 text-gray-600">
                     <UserGroupOutline className="w-5 h-5 text-[#BB9E7F]" />
                     <div className="flex-1">
                       <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Gender</p>
                       <p className="text-sm font-bold capitalize">{info.gender}</p>
                     </div>
                  </div>
                )}
                {(info?.department || info?.biodata?.department) && (
                  <div className="flex items-center gap-4 text-gray-600">
                     <UserGroupOutline className="w-5 h-5 text-[#BB9E7F]" />
                     <div className="flex-1">
                       <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Department</p>
                       <p className="text-sm font-bold capitalize">
                         {info.department || info.biodata?.department}
                       </p>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Guardian & Academic */}
            <div className="space-y-6">
              
              <h3 className="text-xs font-black text-[#BB9E7F] uppercase tracking-[0.2em] mb-4 border-b border-gray-100 pb-2">Guardian Details</h3>
              {guardians.length > 0 ? (
                 <div className="space-y-4">
                   {guardians.map((g, idx) => (
                     <div key={idx} className="bg-blue-50/50 p-6 rounded-3xl border border-blue-50 space-y-4">
                        <div>
                           <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Guardian Name</p>
                           <p className="text-sm font-bold text-[#0F2843]">
                             {g.firstname} {g.surname}
                           </p>
                        </div>
                        <div className="flex items-center gap-3">
                           <EnvelopeIcon className="w-4 h-4 text-blue-400" />
                           <p className="text-sm font-bold text-gray-600">{g.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <PhoneIcon className="w-4 h-4 text-blue-400" />
                           <p className="text-sm font-bold text-gray-600">{g.tel}</p>
                        </div>
                        {g.address && (
                          <div>
                             <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mt-2">Address</p>
                             <p className="text-sm font-bold text-gray-600">{g.address}</p>
                          </div>
                        )}
                     </div>
                   ))}
                 </div>
              ) : (
                 <div className="p-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl text-center mb-6">
                    <p className="text-xs font-bold text-gray-400 italic">No guardians attached.</p>
                 </div>
              )}
              
              <h3 className="text-xs font-black text-[#BB9E7F] uppercase tracking-[0.2em] mb-4 border-b border-gray-100 pb-2 mt-8">Training & Academic</h3>
              
              <div className="space-y-4">
                 {courseEnrolments.length > 0 ? (
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                       <div className="flex items-center gap-3 mb-3 border-b border-gray-200 pb-2">
                         <AcademicCapIcon className="w-5 h-5 text-[#BB9E7F]" />
                         <p className="text-[10px] font-black uppercase text-gray-500">Course Enrolments</p>
                       </div>
                       <div className="space-y-2">
                         {courseEnrolments.map((enrolment, index) => (
                           <div key={index} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                             <p className="text-sm font-bold text-[#0F2843]">
                               {enrolment.course_information?.title || "Unknown Course"}
                             </p>
                           </div>
                         ))}
                       </div>
                    </div>
                 ) : (
                    <div className="p-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl text-center">
                       <p className="text-xs font-bold text-gray-400 italic">No course enrolments found.</p>
                    </div>
                 )}

                 {advisors.length > 0 ? (
                   <div className="space-y-2">
                     {advisors.map((adv, idx) => (
                       <div key={idx} className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                          <div className="flex items-center gap-3 mb-2">
                            <UserGroupOutline className="w-5 h-5 text-emerald-600" />
                            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Course Advisor</p>
                          </div>
                          <p className="text-sm font-bold text-[#0F2843] capitalize">
                            {adv.firstname} {adv.surname}
                          </p>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="p-4 bg-emerald-50/30 border border-dashed border-emerald-200 rounded-xl text-center">
                      <p className="text-xs font-bold text-emerald-600/70 italic">No course advisors assigned.</p>
                   </div>
                 )}

                 {attendances.length > 0 ? (
                   <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                      <div className="flex items-center gap-3 mb-2">
                        <CalendarIcon className="w-5 h-5 text-purple-600" />
                        <p className="text-[10px] font-black uppercase text-purple-600 tracking-widest">Attendance Records</p>
                      </div>
                      <p className="text-xs font-bold text-[#0F2843]">
                        {attendances.length} record(s) logged
                      </p>
                   </div>
                 ) : (
                   <div className="p-4 bg-purple-50/30 border border-dashed border-purple-200 rounded-xl text-center">
                      <p className="text-xs font-bold text-purple-600/70 italic">No attendance records found.</p>
                   </div>
                 )}
              </div>

            </div>
          </div>
          
        </div>

        {/* Footer Actions */}
        <div className="p-8 lg:p-10 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {!isSuspended ? (
              <button 
                onClick={handleSuspend}
                className="px-6 py-4 bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" /> Suspend Student
              </button>
            ) : (
              <button 
                onClick={handleRestore}
                className="px-6 py-4 bg-green-50 text-green-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-green-500 hover:text-white transition-all shadow-sm flex items-center gap-2"
              >
                <CheckCircleIcon className="w-4 h-4" /> Restore Student
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-white border border-gray-200 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all active:scale-95 shadow-sm"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
