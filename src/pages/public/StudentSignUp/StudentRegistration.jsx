import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import signup_img from "../../../assets/images/student_sign_up.jpg";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ChevronLeftIcon 
} from "@heroicons/react/24/outline";

export default function StudentRegistration() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    entry: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.entry.trim()) newErrors.entry = "Email or Phone is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(formData.entry);

    const payload = {
      email: isEmail ? formData.entry : null,
      tel: isEmail ? null : formData.entry,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      password_confirmation: formData.confirmPassword,
    };

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/students/register`, payload);

      if (response.status === 201) {
        setToast({ type: "success", message: "Registration successful!" });
        
        setTimeout(() => {
          if (payload.tel) {
            navigate(`/register/student/phone/verify?tel=${payload.tel}`);
          } else {
            // For now, assuming standard flow — update if email verification is needed
             setToast({ type: "success", message: "Registration successful! Proceeding..." });
          }
        }, 2000);
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Registration failed.",
      });
      setErrors(error?.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
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
          <div className="flex items-center gap-3">
             <div className="p-1 bg-white/20 rounded-full">
               {toast.type === "success" ? "✓" : "✕"}
             </div>
             <p className="font-bold">{toast.message}</p>
          </div>
        </div>
      )}

      {/* LEFT SIDE: Form Area */}
      <div className="w-full md:w-1/2 h-full bg-white flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        
        {/* Top Navbar */}
        <div className="relative w-full flex items-center justify-center mb-10">
          <button 
            onClick={() => navigate("/register")}
            className="absolute left-0 p-3 bg-[#F7EFEF] hover:bg-gray-100 rounded-2xl transition-all active:scale-90"
          >
            <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
          </button>
          
          <img 
            src={TC_logo} 
            alt="Tutorial Center Logo" 
            className="h-[60px] md:h-[70px] drop-shadow-sm" 
          />
        </div>

        {/* Center Contents */}
        <div className="w-full max-w-[480px] mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#09314F] mb-3">
              Student Registration
            </h1>
            <p className="text-[#888888] font-medium italic">
              Register With E-Mail Address Or Phone Number
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email/Phone Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#444444] px-1 text-left block">
                Email Address Or Phone Number
              </label>
              <div className={`flex items-center bg-[#F7EFEF] rounded-2xl px-5 py-4 border-2 transition-all ${errors.entry ? "border-red-400" : "border-transparent focus-within:border-[#09314F]"}`}>
                <input
                  name="entry"
                  type="text"
                  value={formData.entry}
                  onChange={handleChange}
                  placeholder="you@example.com or +234xxxxxxxxxx"
                  className="bg-transparent w-full outline-none text-[#333333] font-semibold placeholder:text-gray-400"
                />
              </div>
              {errors.entry && <p className="text-xs text-red-500 font-bold px-1">{errors.entry}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#444444] px-1 text-left block">
                Password
              </label>
              <div className={`flex items-center bg-[#F7EFEF] rounded-2xl px-5 py-4 border-2 transition-all ${errors.password ? "border-red-400" : "border-transparent focus-within:border-[#09314F]"}`}>
                <div className="relative w-full flex items-center">
                   <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="mr-3"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-transparent w-full outline-none text-[#333333] font-semibold"
                  />
                </div>
              </div>
              {errors.password && <p className="text-xs text-red-500 font-bold px-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#444444] px-1 text-left block">
                Confirm Password
              </label>
              <div className={`flex items-center bg-[#F7EFEF] rounded-2xl px-5 py-4 border-2 transition-all ${errors.confirmPassword ? "border-red-400" : "border-transparent focus-within:border-[#09314F]"}`}>
                <div className="relative w-full flex items-center">
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="mr-3"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-transparent w-full outline-none text-[#333333] font-semibold"
                  />
                </div>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 font-bold px-1">{errors.confirmPassword}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2 px-1 py-1">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-[#09314F] shadow-sm focus:ring-[#09314F] cursor-pointer accent-[#09314F]"
              />
              <label htmlFor="rememberMe" className="text-sm font-bold text-[#555555] cursor-pointer select-none">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-[20px] font-bold text-lg text-white shadow-xl transition-all active:scale-[0.98] ${
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
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Social Sign Up Divider */}
          <div className="relative flex items-center justify-center my-8">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-4 text-xs font-bold text-[#999999] absolute">Or continue with</span>
          </div>

          {/* Google Button */}
          <button className="w-full py-4 border-2 border-[#EEEEEE] rounded-[20px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-sm active:scale-[0.98]">
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
             <span className="font-bold text-[#555555]">Sign up with Google</span>
          </button>
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
            className="px-8 py-3 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-md"
            style={{ borderRadius: "0px 20px 20px 0px" }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
