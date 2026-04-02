import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { location } from "../../../data/locations";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import signup_img from "../../../assets/images/Student_sign_up.jpg";
import { dropdownTheme } from "../../../utils/dropdownTheme";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ChevronLeftIcon,
  EnvelopeIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  AcademicCapIcon,
  CameraIcon,
  UserCircleIcon,
  MapIcon,
  PhoneIcon
} from "@heroicons/react/24/outline";

export default function StudentRegistration() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verifiedVia, setVerifiedVia] = useState("email"); // 'email' or 'phone'
  
  // Biodata UI states
  const [focusedField, setFocusedField] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const genderRef = useRef(null);
  const departmentRef = useRef(null);

  const [formData, setFormData] = useState({
    firstname: "",
    surname: "",
    email: "",
    tel: "",
    password: "",
    confirmPassword: "",
    gender: "",
    date_of_birth: "",
    location: "",
    address: "",
    department: "",
    profile_picture: null,
    profile_picture_preview: null,
    rememberMe: false,
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // Click outside handler for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (genderRef.current && !genderRef.current.contains(event.target)) {
        setIsGenderOpen(false);
      }
      if (departmentRef.current && !departmentRef.current.contains(event.target)) {
        setIsDepartmentOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setToast({ type: "error", message: "Please upload an image file." });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setToast({ type: "error", message: "Image size must be less than 2MB." });
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, profile_picture: file, profile_picture_preview: previewUrl }));
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleFileChange({ target: { files } });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstname.trim()) newErrors.firstname = "First name is required";
    if (!formData.surname.trim()) newErrors.surname = "Last name is required";
    
    // Check if at least one contact method is provided
    if (!formData.email.trim() && !formData.tel.trim()) {
      newErrors.email = "Email or Phone required";
      newErrors.tel = "Email or Phone required";
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!/\d/.test(formData.password)) {
        newErrors.password = "Password must contain at least one number";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one symbol";
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

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
    
    // Determine verification priority (Email first)
    const verificationType = formData.email.trim() ? "email" : "phone";
    setVerifiedVia(verificationType);

    setLoading(true);

    try {
      // Register Account and Submit Biodata together
      const combinedPayload = new FormData();
      if (formData.email.trim()) combinedPayload.append('email', formData.email.trim());
      if (formData.tel.trim()) combinedPayload.append('tel', formData.tel.trim());
      combinedPayload.append('password', formData.password);
      combinedPayload.append('confirmPassword', formData.confirmPassword);
      combinedPayload.append('password_confirmation', formData.confirmPassword);
      combinedPayload.append('firstname', formData.firstname);
      combinedPayload.append('surname', formData.surname);
      combinedPayload.append('gender', formData.gender);
      combinedPayload.append('date_of_birth', formData.date_of_birth);
      combinedPayload.append('location', formData.location);
      combinedPayload.append('address', formData.address || '');
      combinedPayload.append('department', formData.department);
      
      if (formData.profile_picture) {
        combinedPayload.append('profile_picture', formData.profile_picture);
      }

      const registerRes = await axios.post(`${API_BASE_URL}/api/students/register`, combinedPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (registerRes.status === 200 || registerRes.status === 201) {
        if (registerRes.data?.student) {
          localStorage.setItem('studentdata', JSON.stringify({ data: registerRes.data.student }));
        }
        setToast({ type: "success", message: "Registration Successful!" });
        setShowModal(true);
      }
    } catch (error) {
      console.error("Submit error:", error.response?.data || error);
      const backendMessage = error?.response?.data?.message || "";
      const backendErrors = error.response?.data?.errors || {};

      if (Object.keys(backendErrors).length > 0) {
        const firstErrorKey = Object.keys(backendErrors)[0];
        const firstErrorMessage = backendErrors[firstErrorKey][0];
        setToast({ type: "error", message: backendMessage || firstErrorMessage || "Validation failed." });
        setErrors(backendErrors);
      } else {
        setToast({ type: "error", message: backendMessage || "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmRegistration = () => {
    setShowModal(false);
    if (verifiedVia === "email") {
      navigate(`/register/student/email/verify?email=${formData.email}`);
    } else {
      navigate(`/register/student/phone/verify?tel=${formData.tel}`);
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
          className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-xl shadow-2xl text-white transition-all duration-300 transform translate-y-0 scale-100 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          } animate-in fade-in slide-in-from-top-4`}
        >
           <div className="flex items-center gap-3">
             <div className="p-1 bg-white/20 rounded-full">
               {toast.type === "success" ? "✓" : "✕"}
             </div>
             <p className="font-bold">{toast.message}</p>
          </div>
        </div>
      )}

      {/* LEFT SIDE: Content Area */}
      <div className="w-full md:w-1/2 h-full bg-[#F8F9FA] flex flex-col items-center py-8 px-6 lg:px-20 overflow-y-auto order-2 md:order-1 pb-40">
        {/* Top Navigation */}
        <div className="w-full relative flex items-center mb-10">
          <button
            onClick={() => navigate("/register")}
            className="p-3 hover:bg-white rounded-full transition-all duration-200 shadow-sm"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Logo and Headings */}
        <div className="flex flex-col items-center mb-8">
          <img src={TC_logo} alt="Logo" className="h-20 w-auto mb-6 object-contain" />
          <h1 className="text-3xl font-extrabold text-[#09314F] mb-2">Sign Up</h1>
          <p className="text-[#888888] font-medium mb-1 italic text-sm text-center">Fill in your student registration & biodata.</p>
        </div>

        {/* Registration Card */}
        <div className="w-full max-w-lg bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 md:p-10 border border-gray-100 flex flex-col items-center">
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            
            {/* Profile Picture Upload - THE CIRCLE BUBBLE */}
            <div className="flex flex-col items-center py-6 w-full border-y border-gray-50">
              <div 
                onClick={() => fileInputRef.current.click()}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                className="relative cursor-pointer group"
              >
                <div className={`w-24 h-24 rounded-full border-4 transition-all group-hover:scale-105 overflow-hidden flex items-center justify-center ${
                  isDragging ? "border-[#09314F] bg-blue-50 scale-105" : "border-[#FDF2F2] bg-[#F7EFEF]"
                }`} style={{ boxShadow: isDragging ? "0 0 30px rgba(9, 49, 79, 0.2)" : "none" }}>
                  {formData.profile_picture_preview ? (
                    <img src={formData.profile_picture_preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-[#888888]">
                      <CameraIcon className="w-7 h-7 mb-1" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-center px-2">Upload Photo</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-50">
                  <CameraIcon className="h-4 w-4 text-[#E83831]" />
                </div>
                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
              </div>
              <p className="mt-3 text-[10px] font-bold text-[#888888]">Profile Picture (Optional)</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
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
                    placeholder="first name"
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
                    placeholder="last name"
                    className={getInputStyles("surname").input}
                  />
                </div>
                {errors.surname && <p className="text-xs text-red-500 font-bold px-1">{errors.surname}</p>}
              </div>
            </div>

            {/* Email & Phone Number - SIDE BY SIDE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">Email</label>
                <div className={getInputStyles("email").container}>
                  <EnvelopeIcon className={getInputStyles("email").icon} />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@email.com"
                    className={getInputStyles("email").input}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-bold px-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">Phone Number</label>
                <div className={getInputStyles("tel").container}>
                  <PhoneIcon className={getInputStyles("tel").icon} />
                  <input
                    name="tel"
                    type="tel"
                    value={formData.tel}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("tel")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="+234..."
                    className={getInputStyles("tel").input}
                  />
                </div>
                {errors.tel && <p className="text-xs text-red-500 font-bold px-1">{errors.tel}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1 text-left block">Password</label>
                <div className={getInputStyles("password").container}>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="mr-3">
                    {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                  </button>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className={getInputStyles("password").input}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500 font-bold px-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1 text-left block">Confirm Password</label>
                <div className={getInputStyles("confirmPassword").container}>
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="mr-3">
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                  </button>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    className={getInputStyles("confirmPassword").input}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 font-bold px-1">{errors.confirmPassword}</p>}
              </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">Date of Birth</label>
                <div className={getInputStyles("date_of_birth").container}>
                  <CalendarIcon 
                    className={`${getInputStyles("date_of_birth").icon} cursor-pointer hover:text-[#09314F] transition-colors`} 
                    onClick={() => dateInputRef.current?.showPicker?.()}
                  />
                  <input
                    ref={dateInputRef}
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
                    {isGenderOpen && (
                      <div className={dropdownTheme.overlay.container}>
                        <div className={dropdownTheme.overlay.header}>Select Gender</div>
                        {["male", "female", "others"].map(option => (
                          <div key={option} className={dropdownTheme.overlay.item(formData.gender === option, false)}
                            onClick={() => { setFormData(prev => ({ ...prev, gender: option })); setIsGenderOpen(false); }}>
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
                    {isDepartmentOpen && (
                      <div className={dropdownTheme.overlay.container}>
                        <div className={dropdownTheme.overlay.header}>Select Department</div>
                        {["art", "science", "commercial"].map(option => (
                          <div key={option} className={dropdownTheme.overlay.item(formData.department === option, false)}
                            onClick={() => { setFormData(prev => ({ ...prev, department: option })); setIsDepartmentOpen(false); }}>
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
                  <input
                    list="locations-list"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("location")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="select location"
                    className={getInputStyles("location").input}
                  />
                  <datalist id="locations-list">
                    {location.map(loc => <option key={loc.code} value={`${loc.state}, ${loc.country}`} />)}
                  </datalist>
                </div>
                {errors.location && <p className="text-xs text-red-500 font-bold px-1">{errors.location}</p>}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">Address <span className="text-gray-300 font-normal lowercase">(optional)</span></label>
              <div className={getInputStyles("address").container}>
                <MapIcon className={getInputStyles("address").icon} />
                <textarea
                  name="address"
                  rows="1"
                  value={formData.address}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("address")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="input home address"
                  className={`${getInputStyles("address").input} resize-none`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-[22px] font-bold text-lg text-white shadow-xl transition-all active:scale-[0.98] mt-4 ${
                loading
                  ? "bg-gray-400 opacity-70 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:shadow-[#E8383155] hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : "Sign Up"}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative flex items-center justify-center w-full my-8">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-4 text-xs font-bold text-[#888888] absolute uppercase tracking-widest">Or</span>
          </div>

          {/* Google Button */}
          <button className="w-full py-4 border-2 border-[#EEEEEE] rounded-[22px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-sm active:scale-95">
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
             <span className="font-bold text-[#555555]">Sign up with Google</span>
          </button>

          {/* Mobile Login Link */}
          <div className="mt-8 text-center md:hidden">
            <p className="text-sm text-gray-500 font-bold">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-[#09314F] hover:underline transition-all"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Visual Image */}
      <div
        className="w-full h-[300px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2"
        style={{ backgroundImage: `url(${signup_img})` }}
      >
        <div className="hidden md:block absolute bottom-[60px] left-0">
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-4 bg-white text-[#09314F] font-black hover:bg-gray-100 transition-all shadow-xl rounded-r-full active:scale-95"
          >
            Login
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09314F99] backdrop-blur-sm animate-in fade-in duration-200 p-6">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-[#76D28722] rounded-full flex items-center justify-center mx-auto mb-6">
               <div className="w-12 h-12 bg-[#76D287] rounded-full flex items-center justify-center text-white text-2xl font-bold">✓</div>
            </div>
            <h2 className="text-2xl font-black text-[#09314F] mb-4">Success!</h2>
            {verifiedVia === "email" ? (
              <p className="text-[#555555] font-medium mb-8 leading-relaxed">
                Your account is ready.
                <br />
                <span className="text-sm font-bold text-[#E83831] mt-2 block">
                  An OTP code has been sent to your email.
                </span>
              </p>
            ) : (
              <p className="text-[#555555] font-medium mb-8 leading-relaxed">
                Account created successfully.
                <br />
                <span className="text-sm font-bold text-[#E83831] mt-2 block">
                  An OTP has been sent to your phone.
                </span>
              </p>
            )}
            <button
              type="button"
              onClick={confirmRegistration}
              className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-[#09314F] to-[#E83831] shadow-[0_10px_30px_rgba(232,56,49,0.3)] hover:shadow-lg active:scale-95 transition-all text-lg"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          pointer-events: none;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
