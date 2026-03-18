import React, { useState, useEffect } from "react";
import StaffDashboardLayout from "../../components/private/staffs/DashboardLayout.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CameraIcon
} from "@heroicons/react/24/outline";

export default function StaffRegistration() {
  const navigate = useNavigate();

  /* =============================
     CONSTANTS
  ============================= */
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("staff_token");

  /* =============================
     STATE
  ============================= */
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    surname: "",
    email: "",
    tel: "",
    gender: "",
    date_of_birth: "",
    role: "",
    status: "active",
    location: "",
    address: "",
    description: "",
    profile_picture: null
  });

  /* =============================
     EFFECTS
  ============================= */
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  /* =============================
     HANDLERS
  ============================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2048 * 1024) {
        setErrors(prev => ({ ...prev, profile_picture: "Image must be less than 2MB" }));
        return;
      }
      setFormData(prev => ({ ...prev, profile_picture: file }));
      setImagePreview(URL.createObjectURL(file));
      if (errors.profile_picture) {
        setErrors(prev => ({ ...prev, profile_picture: null }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^(\+234|234|0)(70|80|81|90|91)\d{8}$/;

    if (!formData.firstname.trim()) newErrors.firstname = "First name is required";
    if (!formData.surname.trim()) newErrors.surname = "Surname is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    
    if (!formData.tel.trim()) {
      newErrors.tel = "Phone number is required";
    } else if (!phoneRegex.test(formData.tel.trim())) {
      newErrors.tel = "Invalid Nigerian phone number format";
    }

    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.profile_picture) newErrors.profile_picture = "Profile picture is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const data = new FormData();

    // Dynamically append all form fields
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      // Only append if value is not null and not an empty string (for optional fields)
      if (value !== null && value !== "") {
        data.append(key, value);
      }
    });

    // Logging for debugging backend payload
    console.log("Submitting Registration Payload:", Object.fromEntries(data.entries()));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/staffs/register`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        setToast({
          type: "success",
          message: response.data.message || "Staff registered successfully!"
        });
        // Reset form or navigate
        setTimeout(() => navigate("/staffs/manage-staffs"), 2000);
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        const formatted = {};
        Object.keys(backendErrors).forEach(key => {
          formatted[key] = backendErrors[key][0];
        });
        setErrors(formatted);
      }
      setToast({
        type: "error",
        message: error.response?.data?.message || "Registration failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StaffDashboardLayout>
      <div className="max-w-4xl mx-auto p-4 lg:p-6 relative">
        
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-20 right-5 z-[100] px-6 py-4 rounded-2xl shadow-2xl text-white transition-all duration-500 ${
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          } animate-in fade-in slide-in-from-top-4`}>
            <div className="flex items-center gap-3">
              <div className="p-1 bg-white/20 rounded-full">
                {toast.type === "success" ? "✓" : "✕"}
              </div>
              <p className="font-bold text-sm">{toast.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center text-sm">
          <button
             onClick={() => navigate("/staffs/manage-staffs")}
          className="text-gray-500 hover:text-gray-700 transition-colors">
            &lt; Back /
          </button>
          <h2 className="ml-1 font-bold text-gray-900 dark:text-white">
            Staff Information
          </h2>
        </div>

        <section className="bg-gray-50 dark:bg-gray-800 px-6 py-6  rounded-xl shadow-sm border border-gray-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Top Section: Image Upload + Name/Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Image Upload Box */}
              <div className={`lg:col-span-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-56 lg:h-full relative overflow-hidden transition-all ${
                  errors.profile_picture ? "border-red-500 bg-red-50" : "border-gray-300 dark:border-gray-600 hover:border-[#09314F]"
                }`}
                style={{
                  backgroundImage: !imagePreview ? `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)` : 'none',
                  backgroundSize: `20px 20px`,
                  backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`
                }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <CameraIcon className="w-8 h-8 text-gray-400" />
                    <p className="text-xs text-gray-500">Click or drag to upload<br/>profile picture</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {errors.profile_picture && (
                  <p className="absolute bottom-2 text-[10px] text-red-500 font-bold bg-white/90 px-2 py-1 rounded shadow-sm">
                    {errors.profile_picture}
                  </p>
                )}
              </div>

              {/* Name & Contact Inputs */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">First Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      placeholder="first name" 
                      className={`w-full rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.firstname ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                      }`} 
                    />
                  </div>
                  {errors.firstname && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.firstname}</p>}
                </div>

                {/* Middle Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">
                    Middle Name <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      name="middlename"
                      value={formData.middlename}
                      onChange={handleChange}
                      placeholder="middle name" 
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    />
                  </div>
                </div>

                {/* Surname */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Surname</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      placeholder="surname" 
                      className={`w-full rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.surname ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                      }`} 
                    />
                  </div>
                  {errors.surname && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.surname}</p>}
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com" 
                      className={`w-full rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                      }`} 
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.email}</p>}
                </div>

                {/* Phone Number */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Phone Number</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 border-r border-gray-200 pr-2">+234</div>
                    <input 
                      type="tel" 
                      name="tel"
                      value={formData.tel}
                      onChange={handleChange}
                      placeholder="8012345678" 
                      className={`w-full rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-14 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.tel ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                      }`} 
                    />
                  </div>
                  {errors.tel && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.tel}</p>}
                </div>
              </div>
            </div>

            {/* Middle Section: More Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Gender</label>
                <div className="relative">
                  <PencilIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 appearance-none transition-all ${
                      errors.gender ? "border-red-500 focus:ring-red-500 text-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 text-gray-700"
                    }`}
                  >
                    <option value="">select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                {errors.gender && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.gender}</p>}
              </div>

              {/* DOB */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Date of Birth</label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="date" 
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.date_of_birth ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 text-gray-700"
                    }`} 
                  />
                </div>
                {errors.date_of_birth && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.date_of_birth}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Role</label>
                <div className="relative">
                  <UserGroupIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 appearance-none transition-all ${
                      errors.role ? "border-red-500 focus:ring-red-500 text-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 text-gray-700"
                    }`}
                  >
                    <option value="">select role</option>
                    {/* <option value="admin">Admin</option> */}
                    <option value="tutor">Tutor</option>
                    <option value="advisor">Advisor</option>
                  </select>
                </div>
                {errors.role && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.role}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Status</label>
                <div className="relative">
                  <UserGroupIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-700 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Location (State/LGA)</label>
                <div className="relative">
                  <MapPinIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Lagos, Ikeja" 
                    className={`w-full rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.location ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                    }`} 
                  />
                </div>
                {errors.location && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.location}</p>}
              </div>

              {/* Home Address */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Home Address</label>
                <div className="relative">
                  <MapPinIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="enter home address" 
                    className={`w-full rounded-lg border bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.address ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                    }`} 
                  />
                </div>
                {errors.address && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.address}</p>}
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">
                  Description <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <DocumentTextIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3" 
                    placeholder="brief biography or additional notes" 
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl font-bold py-4 text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-[#09314F] hover:bg-[#051b2b] text-white active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering Staff...
                  </>
                ) : "Complete Registration"}
              </button>
            </div>

          </form>
        </section>
      </div>
    </StaffDashboardLayout>
  );
}
