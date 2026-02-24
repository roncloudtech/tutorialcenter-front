import axios from "axios";
import React, { useState, useRef } from "react";
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
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstname: "",
    surname: "",
    gender: "",
    date_of_birth: "",
    location: "",
    address: "",
    department: "",
    display_picture: null,
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const email = localStorage.getItem("studentEmail");
  const tel = localStorage.getItem("studentTel");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setToast({ type: "error", message: "Please upload an image file." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, display_picture: reader.result }));
      };
      reader.readAsDataURL(file);
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

    const payload = { ...formData };
    if (email) payload.email = email;
    else if (tel) payload.tel = tel;
    else {
      setToast({ type: "error", message: "Session expired. Please restart registration." });
      setTimeout(() => navigate("/register"), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/students/biodata`, payload);
      if (response.status === 200 || response.status === 201) {
        setToast({ type: "success", message: "Biodata saved successfully!" });
        localStorage.setItem('studentdata', JSON.stringify({ data: response.data.student }));
        setTimeout(() => navigate('/register/student/training/selection'), 2000);
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Something went wrong.",
      });
      setErrors(error?.response?.data?.errors || {});
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
            Filling in your student biometric data.
          </p>
        </div>

        {/* Card Container */}
        <div className="w-full max-w-[480px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 md:p-10 border border-gray-100 flex flex-col items-center">
          
          {/* Profile Upload */}
          <div className="flex flex-col items-center mb-10 w-full">
            <div 
              onClick={() => fileInputRef.current.click()}
              className="relative cursor-pointer group"
            >
              <div className="w-28 h-28 rounded-full border-4 border-[#FDF2F2] overflow-hidden bg-[#F7EFEF] flex items-center justify-center transition-all group-hover:scale-105" title="Click to upload photo">
                {formData.display_picture ? (
                  <img src={formData.display_picture} alt="Preview" className="w-full h-full object-cover" />
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
              Display picture <span className="text-gray-300 font-normal">(optional)</span>
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
                    placeholder="input first na..."
                    className={getInputStyles("firstname").input}
                  />
                </div>
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
                    placeholder="input last na..."
                    className={getInputStyles("surname").input}
                  />
                </div>
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
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">Gender</label>
                <div className={getInputStyles("gender").container}>
                  <UserCircleIcon className={getInputStyles("gender").icon} />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("gender")}
                    onBlur={() => setFocusedField(null)}
                    className={`${getInputStyles("gender").input} ${dropdownTheme.select}`}
                  >
                    <option value="">select ge...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </select>
                  <ChevronLeftIcon className={dropdownTheme.chevron} />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">Deparment</label>
                <div className={getInputStyles("department").container}>
                  <AcademicCapIcon className={getInputStyles("department").icon} />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("department")}
                    onBlur={() => setFocusedField(null)}
                    className={`${getInputStyles("department").input} ${dropdownTheme.select}`}
                  >
                    <option value="">select dep...</option>
                    <option value="art">Art</option>
                    <option value="science">Science</option>
                    <option value="commercial">Commercial</option>
                  </select>
                  <ChevronLeftIcon className={dropdownTheme.chevron} />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#555555] uppercase tracking-widest px-1">Location</label>
                <div className={getInputStyles("location").container}>
                  <MapPinIcon className={getInputStyles("location").icon} />
                  <input
                    name="location"
                    list="nigeria-states"
                    value={formData.location}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("location")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="input locat..."
                    className={getInputStyles("location").input}
                  />
                  <ChevronLeftIcon className={dropdownTheme.chevron} />
                  <datalist id="nigeria-states">
                    {location.map((loc) => (
                      <option key={loc.code} value={`${loc.state}, ${loc.country}`} />
                    ))}
                  </datalist>
                </div>
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
