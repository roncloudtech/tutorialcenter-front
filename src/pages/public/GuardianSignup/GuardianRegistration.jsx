import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import signup_img from "../../../assets/images/Student_sign_up.jpg";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon,
  ChevronLeftIcon,
  CheckIcon
} from "@heroicons/react/24/outline";

export const GuardianRegistration = () => {
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
      const response = await axios.post(`${API_BASE_URL}/api/guardians/register`, payload);

      if (response.status === 201) {
        setToast({ type: "success", message: "Registration successful!" });
        
        // Save minimal data for the next step
        localStorage.setItem("guardianStudents", JSON.stringify({
          entry: formData.entry,
          password: formData.password,
          students: [] // Will be populated in the next steps
        }));

        setTimeout(() => {
        if (payload.tel) {
            navigate(`/register/guardian/phone/verify?tel=${payload.tel}`);
          } else {
            // navigate(`/register/guardian/email/verify?email=${encodeURIComponent(payload.email)}`);
            setToast({ type: "success", message: "Check your email for verification instructions." });
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
      <div className="w-full md:w-1/2 h-full bg-[#F8F9FA] flex flex-col items-center py-8 px-6 lg:px-20 overflow-y-auto order-2 md:order-1">
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
          <img
            src={TC_logo}
            alt="Tutorial Center Logo"
            className="h-20 w-auto mb-6 object-contain"
          />
          <h1 className="text-3xl font-extrabold text-[#333333] mb-2">Sign Up</h1>
          <p className="text-[#666666] font-medium mb-1">Create an account to get started with us.</p>
          <div className="w-full max-w-sm mt-8 border-b-2 border-[#09314F] pb-2 flex justify-center">
             <span className="text-xl font-bold text-[#09314F]">Guardian</span>
          </div>
        </div>

        {/* Registration Card */}
        <div className="w-full max-w-sm bg-white rounded-[24px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-8 border border-gray-50 mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Entry: Email / Phone */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#444444] px-1 text-left block">
                Email / Phone Number
              </label>
              <div className={`flex items-center bg-[#F7EFEF] rounded-2xl px-4 py-4 border-2 transition-all ${errors.entry ? "border-red-400" : "border-transparent focus-within:border-[#09314F]"}`}>
                <EnvelopeIcon className="h-5 w-5 text-gray-600 mr-3" />
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
              <div className={`flex items-center bg-[#F7EFEF] rounded-2xl px-4 py-4 border-2 transition-all ${errors.password ? "border-red-400" : "border-transparent focus-within:border-[#09314F]"}`}>
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
              <div className={`flex items-center bg-[#F7EFEF] rounded-2xl px-4 py-4 border-2 transition-all ${errors.confirmPassword ? "border-red-400" : "border-transparent focus-within:border-[#09314F]"}`}>
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
              <button
                type="button"
                onClick={() => setFormData({ ...formData, rememberMe: !formData.rememberMe })}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  formData.rememberMe
                    ? "bg-white border-[#09314F]"
                    : "border-gray-300 hover:border-[#09314F]"
                } cursor-pointer`}
              >
                {formData.rememberMe && (
                  <CheckIcon className="h-4 w-4 text-[#09314F]" />
                )}
              </button>
              <label className="text-sm font-bold text-[#555555] cursor-pointer select-none">
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
                "Sign Up"
              )}
            </button>
          </form>

          {/* Social Sign Up Divider */}
          <div className="relative flex items-center justify-center my-8">
            <div className="border-t border-gray-300 w-full"></div>
            <span className="bg-white px-4 text-xs font-bold text-[#999999] absolute">Or continue with</span>
          </div>

          {/* Google Button */}
          <button className="w-full py-4 border-2 border-[#EEEEEE] rounded-[20px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-sm">
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
             <span className="font-bold text-[#555555]">Sign up with google</span>
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
};

