import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import signup_img from "../../../assets/images/Student_sign_up.jpg";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function StudentEmailVerification() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [count, setCount] = useState(1800); // 30 minutes
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
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

  useEffect(() => {
    if (!email) {
      navigate("/register/student");
    }
  }, [email, navigate]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const num1 = useRef(null);
  const num2 = useRef(null);
  const num3 = useRef(null);
  const num4 = useRef(null);
  const num5 = useRef(null);
  const num6 = useRef(null);

  const inputRefs = { num1, num2, num3, num4, num5, num6 };

  useEffect(() => {
    if (count > 0) {
      const timer = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [count]);

  useEffect(() => {
    num1.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value.length > 1) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) newErrors[key] = `${key} is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        `${API_BASE_URL}/api/students/verify-email-otp`,
        {
          email: email,
          otp: otp,
        },
      );

      if (response.status === 200) {
        setToast({ type: "success", message: "Email verified successfully!" });
        setTimeout(() => {
          navigate("/register/student/training/selection");
        }, 2000);
      }
    } catch (error) {
      console.error("Verification error:", error.response?.data || error);
      const backendMessage = error?.response?.data?.message || "Verification failed. Please try again.";
      setToast({ type: "error", message: backendMessage });
      setMsg(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/students/resend-email-otp`,
        { email: email },
      );
      setToast({ type: "success", message: "OTP resent successfully." });
      setCount(1800);
    } catch (error) {
      setToast({ type: "error", message: "Failed to resend OTP." });
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
      <div className="w-full md:w-1/2 h-full bg-white flex flex-col px-6 py-11 lg:px-[100px] lg:y-[60px] order-2 md:order-1 overflow-y-auto">
        
        <div className="relative w-full flex items-center justify-center mb-10">
          <button 
            onClick={() => navigate("/register/student")}
            className="absolute left-0 p-3 bg-[#F7EFEF] hover:bg-gray-100 rounded-2xl transition-all active:scale-90"
          >
            <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
          </button>
          <img src={TC_logo} alt="Logo" className="h-[60px] md:h-[70px]" />
        </div>

        <div className="w-full max-w-[480px] mx-auto my-auto text-center">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-[#09314F] mb-4 uppercase tracking-tighter">
              Verify Email
            </h1>
            <p className="text-[#888888] font-medium leading-relaxed">
              We've sent a 6-digit OTP to <br/>
              <span className="text-[#E83831] font-black">{email}</span>
              <br/>Enter it below to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex items-center justify-between gap-2 max-w-[420px] mx-auto">
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
                  placeholder="-"
                  className={`w-full h-16 md:h-20 text-3xl font-black text-center rounded-[20px] border-2 transition-all outline-none 
                    ${errors[field] ? "border-red-400 bg-red-50" : "border-transparent bg-[#F7EFEF] focus:border-[#09314F] focus:bg-white focus:shadow-xl focus:shadow-[#09314F11]"}
                    ${formData[field] ? "text-[#09314F]" : "text-gray-300"}`}
                />
              ))}
            </div>

            {msg && <p className="text-sm text-[#E83831] font-black italic">{msg}</p>}

            <div className="space-y-6">
              <div className="bg-[#F8F9FA] py-4 px-6 rounded-2xl border border-gray-100">
                <p className="text-sm font-bold text-[#888888]">
                  Code expires in <span className="text-[#09314F] font-black">{formatTime(count)}</span>
                </p>
                {count === 0 && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="mt-2 text-sm font-black text-[#E83831] hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-[22px] font-black text-xl text-white shadow-2xl transition-all active:scale-[0.98] ${
                  loading
                    ? "bg-gray-400 opacity-70 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:shadow-[#E8383144] hover:-translate-y-1"
                }`}
              >
                {loading ? "Verifying..." : "Confirm & Verify"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="w-full h-[250px] md:w-1/2 md:h-full bg-cover bg-center relative order-1 md:order-2 bg-gray-100"
        style={{ backgroundImage: `url(${signup_img})` }}
      >
        <div className="absolute inset-0 bg-[#09314F44] mix-blend-multiply" />
      </div>
    </div>
  );
}
