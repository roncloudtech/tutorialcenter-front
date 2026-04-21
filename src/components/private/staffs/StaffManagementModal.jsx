import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { 
  // XMarkIcon,
  // CheckCircleIcon,
  // ArrowPathIcon
} from "@heroicons/react/24/outline";

/**
 * Reusable input for the staff profile matching the reference image style
 */
const ModalInput = ({ 
  label, 
  icon, 
  value, 
  name, 
  onChange, 
  disabled, 
  type = "text", 
  placeholder = "", 
  isSelect = false, 
  options = [],
  className = "" 
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-[11px] font-bold text-gray-400 ml-1">{label}</label>
      <div className="relative group/input">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 z-10">
          <Icon icon={icon} className="w-5 h-5" />
        </div>
        
        {isSelect ? (
          <select
            name={name}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            className="w-full bg-[#fcfcfc] border border-gray-200 rounded-xl pl-12 pr-10 py-3.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-[#0F2843]/10 focus:border-[#0F2843] transition-all appearance-none disabled:bg-gray-50/50"
          >
            <option value="" disabled>{placeholder || `Select ${label}`}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full bg-[#fcfcfc] border border-gray-200 rounded-xl pl-12 pr-10 py-3.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-[#0F2843]/10 focus:border-[#0F2843] transition-all disabled:bg-gray-50/50"
          />
        )}

        {/* Right side icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSelect ? (
            <Icon icon="heroicons:chevron-down" className="w-4 h-4 text-gray-400" />
          ) : (
            <Icon icon="lucide:square-pen" className="w-4 h-4 text-gray-300 group-hover/input:text-gray-400 transition-colors" />
          )}
        </div>
      </div>
    </div>
  );
};

export default function StaffManagementModal({ staffId, onClose, onSuccess }) {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [staffClasses, setStaffClasses] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  const [imagePreview, setImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch full staff details & classes
  const fetchStaffDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [res, classesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/staffs/${staffId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/admin/classes/all`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
        }).catch(err => ({ data: { classes: [] } }))
      ]);

      const data = res.data?.staff || res.data?.data || res.data;
      setStaff(data);
      if (data.profile_picture) {
        setImagePreview(`${API_BASE_URL}/storage/${data.profile_picture}`);
      }

      // Filter classes to find only the ones associated with this staff ID
      const allFetchedClasses = classesRes.data?.classes || classesRes.data?.data || [];
      const staffsClasses = allFetchedClasses.filter(cls => 
        cls.staffs?.some(s => String(s.id) === String(data.id) || String(s.staff_id) === String(data.staff_id))
      );
      
      setStaffClasses(staffsClasses);
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
    if (!isEditing) return; // Only allow image change in edit mode
    const file = e.target.files[0];
    if (file) {
      setStaff(prev => ({ ...prev, profile_picture: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isEditing) return;
    
    setSubmitting(true);

    const data = new FormData();
    data.append("_method", "PUT");

    Object.keys(staff).forEach(key => {
      const value = staff[key];
      if (key === "profile_picture") {
        if (value instanceof File) {
          data.append(key, value);
        }
      } else if (value !== null && value !== "" && key !== "staff_id") {
        data.append(key, value);
      }
    });

    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/staffs/update/${staffId}`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setToast({ type: "success", message: res.data.message || "Staff updated successfully" });
      setIsEditing(false); // Exit edit mode on success
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
            {toast.type === "success" ? (
              <Icon icon="heroicons:check-circle" className="w-5 h-5"/>
            ) : (
              <Icon icon="heroicons:x-mark" className="w-5 h-5"/>
            )}
          </div>
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      <div className="bg-white w-full max-w-[650px] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative text-[#0F2843] font-sans">
        
        {/* Main Content Scrollable Area */}
        <div className={`flex-1 overflow-y-auto p-8 md:p-10 ${isSuspended ? "opacity-60 grayscale-[0.2]" : ""}`}>
          
          {/* Header */}
          <h1 className="text-xl md:text-2xl font-black mb-8 uppercase tracking-tight">
            STAFF PROFILE [{staff.firstname} {staff.middlename} {staff.surname}]
          </h1>

          {/* Top Section: Avatar + Primary Fields */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
            {/* Avatar Selection */}
            <div 
              className="w-44 h-44 shrink-0 relative cursor-pointer group"
              onClick={() => isEditing && document.getElementById('modalStaffImage').click()}
            >
              <div className="w-full h-full rounded-[20px] overflow-hidden border border-gray-200">
                <img 
                  src={imagePreview || `https://ui-avatars.com/api/?name=${staff.firstname}`}
                  className="w-full h-full object-cover"
                  alt="Profile" 
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon icon="heroicons:camera" className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                id="modalStaffImage" 
                hidden 
                accept="image/*" 
                onChange={handleImageChange} 
              />
              {isSuspended && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                  Suspended
                </div>
              )}
            </div>

            {/* Name/Email Inputs (2 columns inside) */}
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-4">
              <ModalInput 
                label="First Name" 
                icon="heroicons:user-solid" 
                name="firstname" 
                value={staff.firstname} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="First Name"
              />
              <ModalInput 
                label="Last Name" 
                icon="heroicons:user-solid" 
                name="surname" 
                value={staff.surname} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="Surname"
              />
              <ModalInput 
                label="Middle Name" 
                icon="heroicons:user-solid" 
                name="middlename" 
                value={staff.middlename} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="Middle Name"
              />
              <ModalInput 
                label="Email" 
                icon="heroicons:envelope-solid" 
                name="email" 
                value={staff.email} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="Email Address"
              />
            </div>
          </div>

          {/* Grid Section for secondary details */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-4">
              <ModalInput 
                label="Gender" 
                icon="ph:gender-male-bold" 
                name="gender" 
                value={staff.gender} 
                onChange={handleChange} 
                disabled={!isEditing}
                isSelect={true}
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Others", value: "others" }
                ]}
              />
              <ModalInput 
                label="Date of Birth" 
                icon="heroicons:calendar-days-solid" 
                name="date_of_birth" 
                value={staff.date_of_birth?.split('T')[0]} 
                onChange={handleChange} 
                disabled={!isEditing}
                type="date"
              />
            </div>

            {/* Role - Full Width */}
            <ModalInput 
              label="Role" 
              icon="heroicons:user-group-solid" 
              name="role" 
              value={staff.role} 
              onChange={handleChange} 
              disabled={!isEditing}
              isSelect={true}
              options={[
                { label: "Admin", value: "admin" },
                { label: "Tutor", value: "tutor" },
                { label: "Moderator", value: "moderator" }
              ]}
            />

            {/* Teaching Info (Classes) */}
            <div className="grid grid-cols-1 gap-4">
              <ModalInput 
                label="Assigned Classes" 
                icon="heroicons:user-group-solid" 
                name="classes" 
                value={staffClasses.map(c => c.title).join(", ") || "No classes assigned"} 
                disabled={true} // Display only as per feedback
                placeholder="Classes taken"
              />
            </div>

            {/* Status & Location */}
            <div className="space-y-6">
              <ModalInput 
                label="Status" 
                icon="heroicons:user-group-solid" 
                name="status" 
                value={isSuspended ? "suspended" : "active"} 
                disabled={true}
                isSelect={true}
                options={[
                  { label: "Active", value: "active" },
                  { label: "Suspended", value: "suspended" }
                ]}
                className={isSuspended ? "text-red-500" : "text-green-500"}
              />

              <ModalInput 
                label="Location" 
                icon="heroicons:map-pin-solid" 
                name="location" 
                value={staff.location} 
                onChange={handleChange} 
                disabled={!isEditing}
                isSelect={true}
                placeholder="select location"
                options={[
                    { label: "Lagos", value: "Lagos" },
                    { label: "Abuja", value: "Abuja" },
                    { label: "Port Harcourt", value: "Port Harcourt" }
                ]}
              />
            </div>

            {/* Home Address (Label above as in image) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 ml-1">Home Address</label>
              <textarea 
                name="address"
                value={staff.address || ""}
                onChange={handleChange}
                disabled={!isEditing}
                rows={1}
                placeholder="Full Home Address"
                className="w-full bg-[#fcfcfc] border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-[#0F2843]/10 focus:border-[#0F2843] transition-all disabled:bg-gray-50/50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Area with Action Buttons */}
        <div className="px-8 pb-8 flex items-center gap-4">
          {/* Left Action: Back/Suspend */}
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-[#E83831] text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isEditing ? "Cancel" : "Back"}
          </button>

          {/* Right Action: Save/Edit */}
          <button 
            type={isEditing ? "submit" : "button"}
            form={isEditing ? "staffUpdateForm" : undefined}
            onClick={() => !isEditing && setIsEditing(true)}
            onSubmit={isEditing ? handleUpdate : undefined}
            disabled={submitting}
            className="flex-1 py-4 bg-[#0F2843] text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
                isEditing ? "Save Changes" : "Edit Profile"
            )}
          </button>
        </div>

        {/* Hidden Form Submit Trigger */}
        <form id="staffUpdateForm" onSubmit={handleUpdate} className="hidden" />

        {/* Suspend/Restore Logic (Floating or separate button if needed) */}
        {!isEditing && (
            <button 
                onClick={isSuspended ? handleRestore : handleSuspend}
                className={`absolute top-10 right-10 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-colors ${isSuspended ? "hover:text-green-500" : "hover:text-red-500"}`}
            >
                {isSuspended ? "Restore" : "Suspend Staff"}
            </button>
        )}
      </div>
    </div>
  );
}
