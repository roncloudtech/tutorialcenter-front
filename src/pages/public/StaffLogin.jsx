import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import login_img from "../../assets/images/login_img.jpg";
import TC_logo from "../../assets/images/tutorial_logo.png";
import { EyeIcon, EyeSlashIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(null); 
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  
  useEffect(() => {
    if (toast && toast.type === "error" && !toast.isRateLimit) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      const role = localStorage.getItem("staff_role");
      if (role === "admin") {
        navigate("/staffs/manage-staffs");
      } else if (role === "course advisor" || role === "advisor") {
        navigate("/staffs/course-advisor/dashboard");
      } else {
        navigate("/staffs/tutor/dashboard");
      }
    }
  }, [countdown, navigate]);

  // ✅ Rate limit countdown
  useEffect(() => {
    if (rateLimitCountdown !== null && rateLimitCountdown > 0) {
      const timer = setTimeout(() => setRateLimitCountdown(rateLimitCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (rateLimitCountdown === 0) {
      // Clear toast when countdown finishes
      setToast(null);
      setRateLimitCountdown(null);
    }
  }, [rateLimitCountdown]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.login.trim()) {
      newErrors.login = "Email or Staff ID is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/staffs/login`,
        formData
      );

      if (response.status === 200) {
        localStorage.setItem("staff_info", JSON.stringify(response.data.staff));
        localStorage.setItem("staff_token", response.data.token);
        localStorage.setItem("staff_role", response.data.role);
        
        setToast({ 
          type: "success", 
          message: response.data.message || "Login successful!",
          showCountdown: true
        });

        setCountdown(3);
      }

    } catch (error) {
      console.error("Login error:", error.response?.data);

      const status = error.response?.status;
      const message = error.response?.data?.message;
      const backendErrors = error.response?.data?.errors;

      // ✅ Handle rate limiting (429) with countdown
      if (status === 429) {
        // Extract seconds from message: "Too many login attempts. Please try again in 57 seconds."
        const match = message?.match(/(\d+)\s*seconds?/i);
        const seconds = match ? parseInt(match[1]) : 60;  // Default to 60 if can't parse
        
        setToast({
          type: "error",
          message: "Too many login attempts.",
          isRateLimit: true,
          baseMessage: message
        });
        
        setRateLimitCountdown(seconds);  // ✅ Start countdown
      }
      else if (status === 403) {
        setToast({
          type: "error",
          message: message || "Your account requires verification."
        });
      }
      else if (status === 422 && backendErrors) {
        const firstError = Object.values(backendErrors)[0][0];
        setToast({
          type: "error",
          message: message || firstError || "Invalid input."
        });
        setErrors(backendErrors);
      }
      else if (status === 401) {
        setToast({
          type: "error",
          message: message || "Invalid credentials."
        });
      }
      else if (!error.response) {
        setToast({
          type: "error",
          message: "Network error. Please check your connection."
        });
      }
      else {
        setToast({
          type: "error",
          message: message || "Login failed. Please try again."
        });
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      
      {/* Toast Notification with Countdown */}
      {toast && (
        <div 
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white transition-all duration-500 ${
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          } animate-in fade-in slide-in-from-top-4`}
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/20 rounded-full">
              {toast.type === "success" ? "✓" : "✕"}
            </div>
            <div>
              <p className="font-bold text-sm">{toast.message}</p>
              
        
              {toast.showCountdown && countdown !== null && (
                <p className="text-xs mt-1 opacity-90">
                  Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>
              )}
              
             
              {toast.isRateLimit && rateLimitCountdown !== null && (
                <p className="text-xs mt-1 opacity-90">
                  Please try again in {rateLimitCountdown} second{rateLimitCountdown !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDE: The Visual Image */}
      <div
        className="w-full h-[250px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1"
        style={{ backgroundImage: `url(${login_img})` }}
      >
        <div className="hidden md:block absolute bottom-[70px] right-0 translate-x-9">
          <button
            onClick={() => navigate("/careers")}
            className="px-10 py-4 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-xl rounded-full active:scale-95"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Content Area */}
      <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        
        {/* TOP NAV */}
        <div className="relative w-full flex items-center justify-center mb-8 md:mb-10">
          <button
            onClick={() => navigate("/")}
            className="absolute left-0 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90 z-10"
          >
            <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
          </button>
          <img
            src={TC_logo}
            alt="Logo"
            className="h-[60px] md:h-[80px] w-auto object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={() => navigate("/")}
          />
        </div>

        {/* CENTER PIECE */}
        <div className="flex flex-col items-center w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#09314F] mb-2">
              Staff Login
            </h1>
            <p className="text-gray-500 text-sm">
              Login with Email or Staff ID
            </p>
          </div>

          <div className="bg-white shadow-lg border border-gray-100 rounded-2xl p-8 w-full max-w-md">
            <form
              autoComplete="off"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Login Input */}
              <div>
                <label className="block text-sm font-bold text-[#09314F] mb-2 uppercase tracking-wide">
                  Email or Staff ID
                </label>
                <input
                  name="login"
                  type="text"
                  value={formData.login}
                  onChange={handleChange}
                  placeholder="staff@email.com or STF00125"
                  className={`w-full px-4 py-3 border rounded-xl transition-all ${
                    errors.login 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-[#09314F]"
                  } focus:ring-2 focus:border-transparent`}
                />
                {errors.login && (
                  <p className="mt-2 text-sm text-red-500 font-semibold">
                    {errors.login}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold text-[#09314F] mb-2 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    placeholder="Enter your password"
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    className={`w-full px-4 py-3 border rounded-xl transition-all ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[#09314F]"
                    } focus:ring-2 focus:border-transparent`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-[#09314F] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500 font-semibold">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Login Button - Disable during rate limit */}
              <button
                type="submit"
                disabled={loading || rateLimitCountdown > 0}  // ✅ Disable during rate limit
                className={`w-full py-4 px-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all ${
                  loading || rateLimitCountdown > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                }`}
              >
                {loading ? "Logging in..." : rateLimitCountdown > 0 ? `Wait ${rateLimitCountdown}s` : "Login"}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/staff/forgot-password")}
                  className="text-sm text-[#09314F] hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}