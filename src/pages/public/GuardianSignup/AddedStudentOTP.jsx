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

  const hasRegisteredRef = useRef(false);
  const inputRefs = useRef([]);

  // Helper to clean phone number
  const cleanPhone = useCallback((str) => str.replace(/[\s\-().]/g, ""), []);

  // Register a student
  const registerStudent = useCallback(async (index, student, password) => {
    if (student.verified) return; // Skip if already verified

    setRegistering(true);
    setMsg("");

    try {
      await axios.post(`${API_BASE_URL}/api/students/register`, {
        tel: student.tel,
        password: password,
        confirmPassword: password,
        password_confirmation: password,
      });

      console.log(`✓ OTP sent to ${student.name}`);
      setMsg(<span className="text-green-500">OTP sent to {student.name}</span>);
    } catch (err) {
      console.error("Registration error:", err);
      
      if (err.response?.status === 422 || err.response?.status === 500) {
        const errorMsg = err.response?.data?.errors || err.response?.data?.message || "";
        const errorString = typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg);
        
        if (errorString.includes('UNIQUE') || errorString.includes('already') || errorString.includes('taken')) {
          setMsg(
            <span className="text-yellow-600">
              Student already registered. Use the OTP sent to their phone.
            </span>
          );
          return;
        }
      }
      
      setMsg(
        <span className="text-red-500">
          Failed to send OTP. {err.response?.data?.message || "Please try again"}
        </span>
      );
    } finally {
      setRegistering(false);
    }
  }, [API_BASE_URL]);

  // Load students from localStorage
  useEffect(() => {
    if (hasRegisteredRef.current) return;
    hasRegisteredRef.current = true;

    const stored = localStorage.getItem("guardianStudents");
    if (stored) {
      const parsed = JSON.parse(stored);
      
      const phoneStudents = parsed.students
        .filter(s => {
          const cleaned = cleanPhone(s.email);
          const phoneRegex = /^(\+234|234|0)(70|80|81|90|91)\d{8}$/;
          return phoneRegex.test(cleaned);
        })
        .map(s => ({
          ...s,
          tel: cleanPhone(s.email),
          password: parsed.password,
          verified: !!s.verified, // Check for existing verification
        }));

      setStudents(phoneStudents);

      // Find first unverified student
      const firstUnverifiedIdx = phoneStudents.findIndex(s => !s.verified);
      
      if (firstUnverifiedIdx !== -1) {
        setCurrentIndex(firstUnverifiedIdx);
        const student = phoneStudents[firstUnverifiedIdx];
        registerStudent(firstUnverifiedIdx, student, parsed.password);
      } else if (phoneStudents.length > 0) {
        // All verified
        navigate("/register/guardian/student/biodata");
      }
    } else {
      navigate("/register/guardian/addstudent");
    }
  }, [navigate, registerStudent, cleanPhone]);

  // Timer countdown
  useEffect(() => {
    if (count > 0 && students[currentIndex] && !students[currentIndex].verified) {
      const timer = setInterval(() => setCount(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [count, currentIndex, students]);

  // Auto-focus input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [currentIndex]);

  const updateLocalStorageVerification = (index) => {
    const stored = localStorage.getItem("guardianStudents");
    if (stored) {
      const parsed = JSON.parse(stored);
      // We need to match the student in the original array.
      // PhoneStudents uses the filtered index, but we stored names/emails.
      const currentStudent = students[index];
      const studentToUpdate = parsed.students.find(s => s.name === currentStudent.name && cleanPhone(s.email) === currentStudent.tel);
      
      if (studentToUpdate) {
        studentToUpdate.verified = true;
        localStorage.setItem("guardianStudents", JSON.stringify(parsed));
      }
    }
  };

  // Handle OTP input
  const handleChange = (index, e) => {
    const value = e.target.value;
    if (value.length > 1) return;

    const newOtp = { ...otp, [`num${index + 1}`]: value };
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[`num${index + 1}`] && index > 0) {
      inputRefs.current[index - 1]?.focus();
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

      // Mark as verified in state
      const updatedStudents = [...students];
      updatedStudents[currentIndex].verified = true;
      setStudents(updatedStudents);

      // Mark as verified in localStorage
      updateLocalStorageVerification(currentIndex);

      // Check if more students to verify
      if (currentIndex < students.length - 1) {
        // Move to next student
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setOtp({ num1: "", num2: "", num3: "", num4: "", num5: "", num6: "" });
        setCount(60); 
        setMsg(<span className="text-green-500">✓ {currentStudent.name} verified!</span>);
        
        // Register next student
        setTimeout(() => {
          registerStudent(nextIdx, students[nextIdx], currentStudent.password);
        }, 1000);
      } else {
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
      setCount(60);
      setMsg(<span className="text-green-500">OTP resent to {currentStudent.name}</span>);
    } catch (err) {
      setMsg(<span className="text-red-500">Failed to resend OTP</span>);
    }
  };

  const currentStudent = students[currentIndex];
  const progress = students.length > 0 ? ((currentIndex + 1) / students.length) * 100 : 0;

  if (!currentStudent) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading students...</p>
      </div>
    </div>
  );

  

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
                {process.env.NODE_ENV === "development" && (
                  <p className="text-sm text-gray-400 mt-1">
                    (Hint: The code is 123456 for testing)
                  </p>
                )}
                {msg && <p className="mt-2">{msg}</p>}
              </div>

              {/* OTP Inputs */}
              <div className="flex justify-center gap-2 my-6">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    value={otp[`num${idx + 1}`]}
                    onChange={(e) => handleChange(idx, e)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
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