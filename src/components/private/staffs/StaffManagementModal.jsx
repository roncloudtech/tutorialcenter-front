import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CameraIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  PencilSquareIcon,
  NoSymbolIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

export default function StaffManagementModal({ staffId, onClose, onSuccess }) {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  const [imagePreview, setImagePreview] = useState(null);

  // Fetch full staff details
  const fetchStaffDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/staffs/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.staff || res.data?.data || res.data;
      setStaff(data);
      if (data.profile_picture) {
        setImagePreview(`${API_BASE_URL}/storage/${data.profile_picture}`);
      }
    } catch (error) {
      console.error("Failed to fetch staff details", error);
      setToast({ type: "error", message: "Failed to load staff details" });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, staffId, token]);

  useEffect(() => {
    if (staffId) fetchStaffDetails();
  }, [staffId, fetchStaffDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStaff(prev => ({ ...prev, profile_picture: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    // Laravel handles PUT with FormData via _method trick
    data.append("_method", "PUT");

    Object.keys(staff).forEach(key => {
      const value = staff[key];
      // Only append if value is not null and not empty
      // CRITICAL: We only send profile_picture if it's a new File object
      if (key === "profile_picture") {
        if (value instanceof File) {
          data.append(key, value);
        }
      } else if (value !== null && value !== "" && key !== "staff_id") {
        data.append(key, value);
      }
    });

    try {
      // Use POST with _method=PUT for multipart/form-data support in Laravel
      const res = await axios.post(`${API_BASE_URL}/api/admin/staffs/update/${staffId}`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setToast({ type: "success", message: res.data.message || "Staff updated successfully" });
      setTimeout(() => onSuccess(), 1500);
    } catch (error) {
      setErrors(error.response?.data?.errors || {});
      setToast({ type: "error", message: error.response?.data?.message || "Update failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspend = async () => {
    if (!window.confirm("Are you sure you want to suspend this staff member?")) return;
    setSubmitting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/staffs/destroy/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: "success", message: "Staff suspended successfully" });
      fetchStaffDetails(); // Refresh to show "dimmed" state
      setTimeout(() => onSuccess(), 1500);
    } catch (error) {
      setToast({ type: "error", message: "Failed to suspend staff" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestore = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/admin/staffs/restore/${staffId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: "success", message: "Staff restored successfully" });
      fetchStaffDetails();
      setTimeout(() => onSuccess(), 1500);
    } catch (error) {
      setToast({ type: "error", message: "Failed to restore staff" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-12 text-center shadow-2xl">
        <div className="w-12 h-12 border-4 border-[#0F2843]/20 border-t-[#0F2843] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-gray-500">Loading profile...</p>
      </div>
    </div>
  );

  const isSuspended = staff?.deleted_at !== null;

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
        <div className={`flex-1 overflow-y-auto p-10 lg:p-14 ${isSuspended ? "opacity-50 grayscale-[0.3] pointer-events-none select-none" : ""}`}>
          
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row items-center gap-10 mb-12">
            <div className="relative group/avatar cursor-pointer" onClick={() => document.getElementById('modalStaffImage').click()}>
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[2.5rem] overflow-hidden border-4 border-gray-100 shadow-xl relative">
                 <img 
                   src={imagePreview || `https://ui-avatars.com/api/?name=${staff.firstname}`}
                   className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                   alt="Profile" 
                 />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <CameraIcon className="w-8 h-8 text-white" />
                 </div>
              </div>
              <input 
                type="file" 
                id="modalStaffImage" 
                hidden 
                accept="image/*" 
                onChange={handleImageChange} 
              />
              {isSuspended && (
                <div className="absolute -top-3 -right-3 bg-[#E83831] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-10">
                  Suspended
                </div>
              )}
            </div>

            <div className="text-center lg:text-left flex-1">
              <h2 className="text-4xl lg:text-5xl font-black text-[#0F2843] mb-2 uppercase tracking-tighter">
                {staff.firstname} {staff.surname}
              </h2>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <span className="px-5 py-2 bg-blue-50 text-[#0F2843] rounded-2xl text-xs font-black uppercase tracking-widest border border-blue-100">
                  {staff.role}
                </span>
                <span className="text-gray-400 font-bold text-sm flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" /> {staff.email}
                </span>
                <span className="text-gray-400 font-bold text-sm flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" /> {staff.tel}
                </span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form id="staffUpdateForm" onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1: Personal */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">First Name</label>
                  <input name="firstname" value={staff.firstname || ""} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#0F2843] focus:ring-2 focus:ring-[#BB9E7F] transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Surname</label>
                  <input name="surname" value={staff.surname || ""} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#0F2843] focus:ring-2 focus:ring-[#BB9E7F] transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Middle Name</label>
                <input name="middlename" value={staff.middlename || ""} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#0F2843] focus:ring-2 focus:ring-[#BB9E7F] transition-all" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Gender</label>
                <select name="gender" value={staff.gender || ""} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#0F2843] focus:ring-2 focus:ring-[#BB9E7F] transition-all appearance-none">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Date of Birth</label>
                <input type="date" name="date_of_birth" value={staff.date_of_birth?.split('T')[0] || ""} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#0F2843] focus:ring-2 focus:ring-[#BB9E7F] transition-all" />
              </div>
            </div>

            {/* Column 2: Job & Metadata */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Contact & Role</h3>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                 <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Staff ID</p>
                    <p className="text-sm font-black text-[#0F2843]">{staff.staff_id || "N/A"}</p>
                 </div>
                 <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Attendance</p>
                    <p className="text-sm font-black text-[#22C55E]">98%</p> {/* Hardcoded for now */}
                 </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Role</label>
                <select name="role" value={staff.role || ""} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#0F2843] focus:ring-2 focus:ring-[#BB9E7F] transition-all appearance-none">
                  <option value="tutor">Tutor</option>
                  <option value="advisor">Advisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Location</label>
                <input name="location" value={staff.location || ""} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#0F2843] focus:ring-2 focus:ring-[#BB9E7F] transition-all" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Address</label>
                <input name="address" value={staff.address || ""} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#0F2843] focus:ring-2 focus:ring-[#BB9E7F] transition-all" />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-8 lg:p-10 bg-gray-50 border-t border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {isSuspended ? (
              <button 
                onClick={handleRestore}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-4 bg-[#239561] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                <ArrowPathIcon className="w-4 h-4" /> {submitting ? "Restoring..." : "Restore Access"}
              </button>
            ) : (
              <button 
                onClick={handleSuspend}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-4 bg-[#E83831] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                <NoSymbolIcon className="w-4 h-4" /> {submitting ? "Processing..." : "Suspend Staff"}
              </button>
            )}
            
            {!isSuspended && (
               <button 
                 onClick={onClose}
                 className="px-8 py-4 bg-white border border-gray-200 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all"
               >
                 Cancel
               </button>
            )}
          </div>

          {!isSuspended && (
            <button 
              form="staffUpdateForm"
              type="submit"
              disabled={submitting}
              className="w-full lg:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-[#0F2843] text-white font-black text-sm uppercase tracking-widest rounded-3xl shadow-2xl hover:shadow-[#0F2843]/30 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
            >
              <PencilSquareIcon className="w-5 h-5" /> {submitting ? "Saving..." : "Save Changes"}
            </button>
          )}

          {isSuspended && (
             <button 
               onClick={onClose}
               className="px-8 py-4 bg-white border border-gray-200 text-[#0F2843] font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all"
             >
               Go Back
             </button>
          )}
        </div>

        {/* Suspended Dimmer Overlay (Absolute for when inactive) */}
        {isSuspended && (
          <div className="absolute inset-0 z-[5] bg-white/10 pointer-events-none" />
        )}

      </div>
    </div>
  );
}
