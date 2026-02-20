import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import signup_img from "../../../assets/images/student_sign_up.jpg";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function StudentPhoneVerification() {
  const navigate = useNavigate(); // Initializing navigation
  const [msg, setMsg] = useState("");
  const [count, setCount] = useState(60);
  const [searchParams] = useSearchParams();
  const tel = searchParams.get("tel");
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    num1: "",
    num2: "",
    num3: "",
    num4: "",
    num5: "",
    num6: "",
  });
  
  // Redirect back to registration if no phone number is provided
  useEffect(() => {
    if (!tel) {
      navigate("/register/student");
    }
  }, [tel, navigate]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const num1 = useRef(null);
  const num2 = useRef(null);
  const num3 = useRef(null);
  const num4 = useRef(null);
  const num5 = useRef(null);
  const num6 = useRef(null);

  const inputRefs = { num1, num2, num3, num4, num5, num6 };

  useEffect(() => {
    // 1. Only start timer if count is greater than 0
    if (count > 0) {
      const timer = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);

      // 2. Cleanup the timer on unmount or when count changes
      return () => clearInterval(timer);
    }
  }, [count]);

  useEffect(() => {
    num1.current?.focus(); 
  }, []);

  // Handle input changes and auto-focus to next field
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (value.length > 1) return; // prevent more than 1 character

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Move to next input
    if (value) {
      const nextInput = {
        num1: "num2",
        num2: "num3",
        num3: "num4",
        num4: "num5",
        num5: "num6",
      }[name];

      if (nextInput && inputRefs[nextInput]) {
        inputRefs[nextInput].current.focus();
      }
    }
  };

  const handleKeyDown = (e, name) => {
    if (e.key === "Backspace" && !formData[name]) {
      const prevInput = {
        num2: "num1",
        num3: "num2",
        num4: "num3",
        num5: "num4",
        num6: "num5",
      }[name];

      if (prevInput && inputRefs[prevInput]) {
        inputRefs[prevInput].current.focus();
      }
    }
  };

  // Basic validation to ensure all fields are filled
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) newErrors[key] = `${key} is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission and OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const otp =
      formData.num1 +
      formData.num2 +
      formData.num3 +
      formData.num4 +
      formData.num5 +
      formData.num6;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/students/verify-phone`,
        {
          tel: tel,
          otp: otp,
        },
      );

      if (response.status === 200) {
        setToast({ type: "success", message: response.data.message });
        setMsg(<span className="text-green-500">{response.data.message}</span>);
        localStorage.setItem("studentTel", tel); // Store phone number for later steps
        setTimeout(() => {
          navigate("/register/student/biodata");
        }, 5000);
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Verification failed",
      });
      setMsg(
        <span className="text-red-500">{error?.response?.data?.error}</span>,
      );
      console.log(error?.response);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/students/resend-phone-otp`,
        { tel: tel },
      );
      setToast({ type: "success", message: response.data.message });
      setMsg(<span className="text-green-500">{response.data.message}</span>);
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to resend OTP",
      });
      setMsg(
        <span className="text-red-500">{error?.response?.data?.error}</span>,
      );
    } finally {
      setCount(60); // Reset timer after clicking resend
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
          <div className="flex items-center gap-3 text-sm">
             <div className="p-1 bg-white/20 rounded-full">
               {toast.type === "success" ? "✓" : "✕"}
             </div>
             <p className="font-bold">{toast.message}</p>
          </div>
        </div>
      )}

      {/* LEFT SIDE: Content Area */}
      <div className="w-full md:w-1/2 h-full bg-white flex flex-col px-6 py-10 lg:px-[100px] lg:y-[60px] order-2 md:order-1 overflow-y-auto">
        
        {/* Top Navbar */}
        <div className="relative w-full flex items-center justify-center mb-10">
          <button 
            onClick={() => navigate("/register/student")}
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
        <div className="w-full max-w-[480px] mx-auto my-auto text-center">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#09314F] mb-3">
              Phone Verification
            </h1>
            <p className="text-[#888888] font-medium leading-relaxed">
              We've sent an OTP to <br/>
              <span className="text-[#09314F] font-bold">Student {tel}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center justify-between gap-2 max-w-[400px] mx-auto">
              {["num1", "num2", "num3", "num4", "num5", "num6"].map((field) => (
                <input
                  key={field}
                  ref={inputRefs[field]}
                  name={field}
                  type="text"
                  inputMode="numeric"
                  value={formData[field]}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, field)}
                  maxLength="1"
                  placeholder="0"
                  className={`w-full h-14 md:h-16 text-2xl font-black text-center rounded-2xl border-2 transition-all outline-none 
                    ${errors[field] ? "border-red-400 bg-red-50" : "border-transparent bg-[#F7EFEF] focus:border-[#09314F] focus:bg-white"}
                    ${formData[field] ? "text-[#09314F]" : "text-gray-300"}`}
                />
              ))}
            </div>

            {msg && <p className="text-sm text-red-500 font-bold animate-pulse">{msg}</p>}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-[20px] font-bold text-lg text-white shadow-xl transition-all active:scale-[0.98] ${
                  loading
                    ? "bg-gray-400 opacity-70 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:shadow-[#E8383155] hover:-translate-y-0.5"
                }`}
              >
                {loading ? "Verifying..." : "Verify Phone Number"}
              </button>

              <div className="py-2">
                <p className="text-sm font-bold text-gray-400">
                  Didn't receive the code?{" "}
                  {count > 0 ? (
                    <span className="text-[#E83831]">Resend in {count}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-[#09314F] hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </p>
              </div>
            </div>
          </form>

          {/* Testing Hint */}
          <div className="mt-12 p-4 bg-[#F7EFEF] rounded-2xl inline-block border border-dashed border-gray-300">
             <p className="text-xs font-bold text-gray-500">
               DEVELOPER HINT: Use <span className="text-[#E83831]">123456</span> for testing
             </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Visual Image */}
      <div
        className="w-full h-[200px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2"
        style={{ backgroundImage: `url(${signup_img})` }}
      >
        <div className="hidden md:block absolute bottom-[70px] left-0 -translate-x-9">
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-4 bg-white text-[#09314F] font-extrabold hover:bg-gray-100 transition-all shadow-xl rounded-full active:scale-95"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
