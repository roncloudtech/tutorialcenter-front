import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import signup_img from "../../../assets/images/student_sign_up.jpg";

export default function AddedStudentOTP() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [otp, setOtp] = useState({ num1: "", num2: "", num3: "", num4: "", num5: "", num6: "" });
  const [count, setCount] = useState(60); 
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [registering, setRegistering] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const inputRefs = {
    num1: useRef(null),
    num2: useRef(null),
    num3: useRef(null),
    num4: useRef(null),
    num5: useRef(null),
    num6: useRef(null),
  };

  // Register a student
  const registerStudent = useCallback(async (index, student, password) => {
    setRegistering(true);
    setMsg("");

    try {
      await axios.post(`${API_BASE_URL}/api/students/register`, {
        tel: student.tel,
        password: password,
        confirmPassword: password,
        password_confirmation: password,
      });

      setMsg(<span className="text-green-500">OTP sent to {student.name}</span>);
    } catch (err) {
      console.error("Registration error:", err);
      setMsg(<span className="text-red-500">Failed to send OTP. Please try again.</span>);
    } finally {
      setRegistering(false);
    }
  }, [API_BASE_URL]);

  // Load students from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("guardianStudents");
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Filter only phone students
      const phoneStudents = parsed.students.filter(s => {
        const cleaned = s.email.replace(/[\s\-().]/g, "");
        const phoneRegex = /^(\+234|234|0)(70|80|81|90|91)\d{8}$/;
        return phoneRegex.test(cleaned);
      });

      setStudents(phoneStudents.map(s => ({
        ...s,
        verified: false,
        tel: s.email.replace(/[\s\-().]/g, ""),
        password: parsed.password,
      })));

      // Register first student immediately
      if (phoneStudents.length > 0) {
        registerStudent(0, phoneStudents[0], parsed.password);
      }
    } else {
      navigate("/register/guardian/addstudent");
    }
  }, [navigate, registerStudent]);

  // Timer countdown
  useEffect(() => {
    if (count > 0 && !students[currentIndex]?.verified) {
      const timer = setInterval(() => setCount(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [count, currentIndex, students]);

  // Auto-focus first input (inputRefs is stable — object of refs created at render)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    inputRefs.num1.current?.focus();
  }, [currentIndex]);

  // Handle OTP input
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value.length > 1) return;

    setOtp(prev => ({ ...prev, [name]: value }));

    // Auto-focus next input
    if (value) {
      const nextInput = {
        num1: "num2", num2: "num3", num3: "num4",
        num4: "num5", num5: "num6",
      }[name];

      if (nextInput && inputRefs[nextInput]) {
        inputRefs[nextInput].current.focus();
      }
    }
  };

  // Handle OTP submission
  const handleVerify = async (e) => {
    e.preventDefault();
    
    const otpCode = Object.values(otp).join("");
    if (otpCode.length !== 6) {
      setMsg(<span className="text-red-500">Please enter all 6 digits</span>);
      return;
    }

    setLoading(true);

    try {
      const currentStudent = students[currentIndex];
      
      await axios.post(`${API_BASE_URL}/api/students/verify-phone`, {
        tel: currentStudent.tel,
        otp: otpCode,
      });

      // Mark as verified
      const updatedStudents = [...students];
      updatedStudents[currentIndex].verified = true;
      setStudents(updatedStudents);

      // Check if more students to verify
      if (currentIndex < students.length - 1) {
        // Move to next student
        setCurrentIndex(currentIndex + 1);
        setOtp({ num1: "", num2: "", num3: "", num4: "", num5: "", num6: "" });
        setCount(120); // Reset timer
        setMsg(<span className="text-green-500">✓ {currentStudent.name} verified!</span>);
        
        // Register next student
        setTimeout(() => {
          registerStudent(currentIndex + 1, students[currentIndex + 1], currentStudent.password);
        }, 1000);
      } else {
        // All students verified - proceed to biodata
        setMsg(<span className="text-green-500">✓ All students verified!</span>);
        setTimeout(() => {
          navigate("/register/guardian/student/biodata");
        }, 2000);
      }
    } catch (err) {
      setMsg(<span className="text-red-500">{err.response?.data?.message || "Invalid OTP"}</span>);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    const currentStudent = students[currentIndex];
    
    try {
      await axios.post(`${API_BASE_URL}/api/students/resend-phone-otp`, {
        tel: currentStudent.tel,
      });
      setCount(120);
      setMsg(<span className="text-green-500">OTP resent to {currentStudent.name}</span>);
    } catch (err) {
      setMsg(<span className="text-red-500">Failed to resend OTP</span>);
    }
  };

  const currentStudent = students[currentIndex];
  const progress = students.length > 0 ? ((currentIndex + 1) / students.length) * 100 : 0;

  if (!currentStudent) return <div>Loading...</div>;

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* LEFT SIDE */}
      <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        
        {/* TOP NAV */}
        <div className="relative w-full flex items-center justify-center mb-8">
          <button
            onClick={() => navigate("/register/guardian/addstudent")}
            className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
          >
            <img src={ReturnArrow} alt="Back" className="h-6 w-6" />
          </button>
          <img src={TC_logo} alt="Logo" className="h-[60px] md:h-[80px] w-auto" />
        </div>

        {/* CENTER */}
        <div className="flex flex-col items-center w-full">
          
          {/* Progress Bar */}
          <div className="w-full mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Verifying Students</span>
              <span>{currentIndex + 1} of {students.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#09314F] to-[#E83831] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-[#09314F]">
              Verify Student Phone Number
            </h1>
            <p className="text-gray-500 italic text-sm mt-1">
              Current Student: {currentStudent.name}
            </p>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-6 w-full">
            <form onSubmit={handleVerify} className="space-y-4">
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  OTP sent to <span className="font-semibold">{currentStudent.tel}</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  (Hint: The code is 123456 for testing)
                </p>
                {msg && <p className="mt-2">{msg}</p>}
              </div>

              {/* OTP Inputs */}
              <div className="flex justify-center gap-2 my-6">
                {["num1", "num2", "num3", "num4", "num5", "num6"].map((field) => (
                  <input
                    key={field}
                    ref={inputRefs[field]}
                    name={field}
                    type="text"
                    value={otp[field]}
                    onChange={handleChange}
                    maxLength="1"
                    placeholder="0"
                    className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                ))}
              </div>

              {/* Timer & Resend */}
              <div className="text-center text-sm text-gray-500">
                {count > 0 ? (
                  <span>Resend in {Math.floor(count / 60)}:{String(count % 60).padStart(2, '0')}</span>
                ) : (
                  <button type="button" onClick={handleResend} className="text-blue-600 hover:underline font-medium">
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || registering}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  loading || registering
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90"
                } text-white`}
              >
                {loading ? "Verifying..." : registering ? "Sending OTP..." : "Verify & Continue"}
              </button>
            </form>

            {/* Students List */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Students:</p>
              {students.map((student, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded">
                  <span className={idx === currentIndex ? "font-semibold text-blue-600" : "text-gray-600"}>
                    {idx + 1}. {student.name}
                  </span>
                  {student.verified ? (
                    <span className="text-green-600 font-medium">✓ Verified</span>
                  ) : idx === currentIndex ? (
                    <span className="text-blue-600 font-medium">⏳ Current</span>
                  ) : (
                    <span className="text-gray-400">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="w-full h-[192px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2"
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