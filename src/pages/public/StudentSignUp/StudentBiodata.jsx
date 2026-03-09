import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { location } from "../../../data/locations";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import signup_img from "../../../assets/images/student_sign_up.jpg";
import { dropdownTheme } from "../../../utils/dropdownTheme";
import { 
  UserIcon, 
  CalendarIcon, 
  MapPinIcon, 
  AcademicCapIcon, 
  ChevronLeftIcon,
  CameraIcon,
  UserCircleIcon,
  MapIcon
} from "@heroicons/react/24/outline";

export default function StudentBiodata() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Custom dropdown states
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Refs for click outside
  const genderRef = useRef(null);
  const departmentRef = useRef(null);
  const locationRef = useRef(null);

  // Click outside handler for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (genderRef.current && !genderRef.current.contains(event.target)) {
        setIsGenderOpen(false);
      }
      if (departmentRef.current && !departmentRef.current.contains(event.target)) {
        setIsDepartmentOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    firstname: "",
    surname: "",
    gender: "",
    date_of_birth: "",
    location: "",
    address: "",
    department: "",
    profile_picture: null,
    profile_picture_preview: null,
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const email = localStorage.getItem("studentEmail");
  const tel = localStorage.getItem("studentTel");

  // Load saved biodata on component mount
  useEffect(() => {
    const savedBiodata = localStorage.getItem("studentBiodata");
    if (savedBiodata) {
      try {
        const parsed = JSON.parse(savedBiodata);
        setFormData(parsed);
      } catch (err) {
        console.error("Failed to load saved biodata:", err);
      }
    }
  }, []);

  // Auto-save biodata to localStorage whenever formData changes
  useEffect(() => {
    const {profile_picture, profile_picture_preview, ...serializableData } = formData;
    localStorage.setItem("studentBiodata", JSON.stringify(serializableData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = ( e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setToast({ type: "error", message: "Please upload an image file." });
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, profile_picture: file, profile_picture_preview: previewUrl}));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange({ target: { files } });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstname.trim()) newErrors.firstname = "First name is required";
    if (!formData.surname.trim()) newErrors.surname = "Last name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.department.trim()) newErrors.department = "Department is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();

     formDataToSend.append('firstname', formData.firstname);
  formDataToSend.append('surname', formData.surname);
  formDataToSend.append('gender', formData.gender);
  formDataToSend.append('date_of_birth', formData.date_of_birth);
  formDataToSend.append('location', formData.location);
  formDataToSend.append('address', formData.address || '');
  formDataToSend.append('department', formData.department);

    if (email) formDataToSend.append('email', email);
    else if (tel) formDataToSend.append('tel', tel);
    else {
      setToast({ type: "error", message: "Session expired. Please restart registration." });
      setTimeout(() => navigate("/register"), 3000);
      return;
    }

    if (formData.profile_picture) {
    formDataToSend.append('profile_picture', formData.profile_picture);
  }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/students/biodata`, formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.status === 200 || response.status === 201) {
        setToast({ type: "success", message: response.data.message || "Biodata saved successfully!" });
        localStorage.setItem('studentdata', JSON.stringify({ data: response.data.student }));
        setTimeout(() => navigate('/register/student/training/selection'), 2000);
      }
    } catch (error) {
      console.error("Submit error:", error.response?.data || error);

      const backendMessage = error?.response?.data?.message || "";
      const backendErrors = error.response?.data?.errors || {};

      if (backendErrors){
        const firstErrorKey = Object.keys(backendErrors)[0];
        const firstErrorMessage = backendErrors[firstErrorKey][0];
        setToast({type: "error", message: backendMessage || firstErrorMessage || "validation failed."});
        setErrors(backendErrors);
      }
      else{
        setToast({ type: "error", message: backendMessage || "Something went wrong. Please try again." });
      }


      // setErrors(error?.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const getInputStyles = (fieldName) => {
    const hasValue = !!formData[fieldName];
    const isFocused = focusedField === fieldName;
    const hasError = !!errors[fieldName];
    return {
      container: dropdownTheme.inputContainer(hasError, isFocused),
      input: dropdownTheme.getValueStyle(hasValue),
      icon: dropdownTheme.iconStyle(hasValue, isFocused)
    };
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white transition-all duration-500 transform translate-y-0 ${
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          } animate-in fade-in slide-in-from-top-4`}
        >
          <div className="flex items-center gap-3 text-sm">
             <div className="p-1 bg-white/20 rounded-full">
               {toast.type === "success" ? "✓" : "✕"}
             </div>
             <p className="font-bold">{toast.message}</p>
          </div>
        </div>
      )}

      {/* LEFT SIDE: Content Area */}
      <div className="w-full md:w-1/2 h-full bg-[#F8F9FA] flex flex-col items-center py-8 px-6 lg:px-[100px] overflow-y-auto order-2 md:order-1">
        
        {/* Header Section */}
        <div className="w-full max-w-[480px] mb-8">
          <div className="flex items-center relative h-12 mb-6">
            <button 
              onClick={() => navigate("/register/student")}
              className="absolute left-0 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90"
            >
              <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
            </button>
            <div className="w-full flex justify-center">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#09314F]">
                Student Biodata
              </h1>
            </div>
          </div>
          <p className="text-center text-[#888888] font-medium">
            Filling in your student Biodata.
          </p>
        </div>

        {/* Card Container */}
        <div className="w-full max-w-lg bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 md:p-10 border border-gray-100 flex flex-col items-center">
          
          {/* Profile Upload */}
          <div className="flex flex-col items-center mb-10 w-full">
            <div 
              onClick={() => fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="relative cursor-pointer group"
            >
              <div className={`w-28 h-28 rounded-full border-4 transition-all group-hover:scale-105 overflow-hidden flex items-center justify-center ${
                isDragging 
                  ? "border-[#09314F] bg-blue-50 scale-105" 
                  : "border-[#FDF2F2] bg-[#F7EFEF]"
              }`} style={{
                boxShadow: isDragging ? "0 0 30px rgba(9, 49, 79, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)" : "none"
              }} title="Click to upload photo or drag and drop">
                {formData.profile_picture_preview ? (
                  <img src={formData.profile_picture_preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-[#888888]">
                    <CameraIcon className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload Photo</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-gray-50 group-hover:rotate-12 transition-transform">
                <CameraIcon className="h-4 w-4 text-[#E83831]" />
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                hidden 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <p className="mt-4 text-xs font-bold text-[#888888]">
              Profile picture <span className="text-gray-300 font-normal">(optional)</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">First Name</label>
                <div className={getInputStyles("firstname").container}>
                  <UserIcon className={getInputStyles("firstname").icon} />
                  <input
                    name="firstname"
                    type="text"
                    value={formData.firstname}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("firstname")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="input first name"
                    className={getInputStyles("firstname").input}
                  />
                </div>
                {errors.firstname && <p className="text-xs text-red-500 font-bold px-1">{errors.firstname}</p>}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">Last Name</label>
                <div className={getInputStyles("surname").container}>
                  <UserIcon className={getInputStyles("surname").icon} />
                  <input
                    name="surname"
                    type="text"
                    value={formData.surname}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("surname")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="input last name"
                    className={getInputStyles("surname").input}
                  />
                </div>
                {errors.surname && <p className="text-xs text-red-500 font-bold px-1">{errors.surname}</p>}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">Date of Birth</label>
                <div className={`${getInputStyles("date_of_birth").container} relative`}>
                  <CalendarIcon className={getInputStyles("date_of_birth").icon} />
                  <input
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("date_of_birth")}
                    onBlur={() => setFocusedField(null)}
                    className={getInputStyles("date_of_birth").input}
                  />
                </div>
                {errors.date_of_birth && <p className="text-xs text-red-500 font-bold px-1">{errors.date_of_birth}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">Gender</label>
                <div className={getInputStyles("gender").container}>
                  <UserCircleIcon className={getInputStyles("gender").icon} />
                  <div className="relative w-full flex items-center" ref={genderRef}>
                    <div 
                      className={`${getInputStyles("gender").input} ${dropdownTheme.select} pr-6 cursor-pointer capitalize`}
                      onClick={() => setIsGenderOpen(!isGenderOpen)}
                    >
                      {formData.gender || "select gender"}
                    </div>
                    <ChevronLeftIcon className={`h-4 w-4 text-gray-400 absolute right-0 pointer-events-none transition-transform duration-300 ${isGenderOpen ? "rotate-90" : "-rotate-90"}`} />
                    
                    {/* Custom Dropdown List */}
                    {isGenderOpen && (
                      <div className={dropdownTheme.overlay.container}>
                        <div className={dropdownTheme.overlay.header}>Select Gender</div>
                        {["male", "female", "others"].map(option => (
                          <div 
                            key={option}
                            className={dropdownTheme.overlay.item(formData.gender === option, false)}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, gender: option }));
                              setIsGenderOpen(false);
                            }}
                          >
                            <span className="capitalize">{option}</span>
                            {formData.gender === option && <span>✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {errors.gender && <p className="text-xs text-red-500 font-bold px-1">{errors.gender}</p>}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">Department</label>
                <div className={getInputStyles("department").container}>
                  <AcademicCapIcon className={getInputStyles("department").icon} />
                  <div className="relative w-full flex items-center" ref={departmentRef}>
                    <div 
                      className={`${getInputStyles("department").input} ${dropdownTheme.select} pr-6 cursor-pointer capitalize`}
                      onClick={() => setIsDepartmentOpen(!isDepartmentOpen)}
                    >
                      {formData.department || "select department"}
                    </div>
                    <ChevronLeftIcon className={`h-4 w-4 text-gray-400 absolute right-0 pointer-events-none transition-transform duration-300 ${isDepartmentOpen ? "rotate-90" : "-rotate-90"}`} />
                    
                    {/* Custom Dropdown List */}
                    {isDepartmentOpen && (
                      <div className={dropdownTheme.overlay.container}>
                        <div className={dropdownTheme.overlay.header}>Select Department</div>
                        {["art", "science", "commercial"].map(option => (
                          <div 
                            key={option}
                            className={dropdownTheme.overlay.item(formData.department === option, false)}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, department: option }));
                              setIsDepartmentOpen(false);
                            }}
                          >
                            <span className="capitalize">{option}</span>
                            {formData.department === option && <span>✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {errors.department && <p className="text-xs text-red-500 font-bold px-1">{errors.department}</p>}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">Location</label>
                <div className={getInputStyles("location").container}>
                  <MapPinIcon className={getInputStyles("location").icon} />
                  <div className="relative w-full flex items-center" ref={locationRef}>
                    <div 
                      className={`${getInputStyles("location").input} ${dropdownTheme.select} pr-6 cursor-pointer capitalize`}
                      onClick={() => setIsLocationOpen(!isLocationOpen)}
                    >
                      {formData.location || "select location"}
                    </div>
                    <ChevronLeftIcon className={`h-4 w-4 text-gray-400 absolute right-0 pointer-events-none transition-transform duration-300 ${isLocationOpen ? "rotate-90" : "-rotate-90"}`} />
                    
                    {/* Custom Dropdown List */}
                    {isLocationOpen && (
                      <div className={`${dropdownTheme.overlay.container} w-full`}>
                        <div className={dropdownTheme.overlay.header}>Select Location</div>
                        {location.map(loc => {
                          const optionValue = `${loc.state}, ${loc.country}`;
                          return (
                            <div 
                              key={loc.code}
                              className={dropdownTheme.overlay.item(formData.location === optionValue, false)}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, location: optionValue }));
                                setIsLocationOpen(false);
                              }}
                            >
                              <span>{optionValue}</span>
                              {formData.location === optionValue && <span>✓</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                {errors.location && <p className="text-xs text-red-500 font-bold px-1">{errors.location}</p>}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">
                Address <span className="text-gray-300 font-normal lowercase">(optional)</span>
              </label>
              <div className={getInputStyles("address").container}>
                <MapIcon className={getInputStyles("address").icon} />
                <textarea
                  name="address"
                  rows="1"
                  value={formData.address}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("address")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="input address"
                  className={`${getInputStyles("address").input} resize-none`}
                />
              </div>
              <button type="button" className="text-[10px] font-bold text-[#0091FF] flex items-center gap-1 mt-1 hover:underline">
                <div className="w-3 h-3 rounded-full border-2 border-[#0091FF] flex items-center justify-center">
                  <div className="w-1 h-1 bg-[#0091FF] rounded-full" />
                </div>
                Use current location on map.
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-[22px] font-bold text-lg text-white shadow-xl transition-all active:scale-[0.98] mt-4 ${
                loading
                  ? "bg-gray-400 opacity-70 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:shadow-[#E8383155] hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Completing..." : "Continue"}
            </button>
          </form>
        </div>

        {/* Footer Brand */}
        <div className="mt-auto py-10 opacity-30 grayscale pointer-events-none">
          <img src={TC_logo} alt="Tutorial Center" className="h-10" />
        </div>
      </div>

      {/* RIGHT SIDE: Visual Image */}
      <div
        className="w-full h-[250px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2"
        style={{ backgroundImage: `url(${signup_img})` }}
      >
        <div className="hidden md:block absolute bottom-[70px] left-0">
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-4 bg-white text-[#09314F] font-extrabold hover:bg-gray-100 transition-all shadow-xl rounded-r-full active:scale-95"
          >
            Login
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        input[type="date"] {
          position: relative;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          cursor: pointer;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
