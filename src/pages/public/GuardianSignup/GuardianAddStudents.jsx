import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import signup_img from "../../../assets/images/Student_sign_up.jpg";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ChevronLeftIcon,
  ChevronDownIcon,
  PlusIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";
import { dropdownTheme } from "../../../utils/dropdownTheme";

export default function GuardianAddStudents() {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [students, setStudents] = useState([{ name: "", email: "", expanded: true }]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // ── Helpers ────────────────────────────────────────────────────────────────
  const cleanInput = (input) => {
    if (!input) return input;
    return input.replace(/[\s\-().]/g, "");
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^(\+234|234|0)(70|80|81|90|91)\d{8}$/;
    return phoneRegex.test(cleanInput(phone));
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ── Student list actions ───────────────────────────────────────────────────
  const toggleStudent = (index) => {
    setStudents((prev) =>
      prev.map((s, i) => (i === index ? { ...s, expanded: !s.expanded } : s))
    );
  };

  const handleStudentChange = (index, field, value) => {
    setStudents((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const addStudent = () => {
    setStudents((prev) => [
      ...prev.map((s) => ({ ...s, expanded: false })),
      { name: "", email: "", expanded: true },
    ]);
  };

  const removeStudent = (index) => {
    if (students.length <= 1) {
      setToast({ type: "error", message: "You must add at least one student" });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setStudents((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};

    // Step 1: Validate each student's name and email/phone
    students.forEach((student, i) => {
      if (!student.name.trim()) {
        newErrors[`student_${i}_name`] = "Name is required";
      }
      if (!student.email.trim()) {
        newErrors[`student_${i}_email`] = "Email or phone is required";
      } else {
        const input = student.email.trim();
        if (input.includes("@")) {
          if (!isValidEmail(input)) newErrors[`student_${i}_email`] = "Invalid email format";
        } else {
          if (!isValidPhone(input)) newErrors[`student_${i}_email`] = "Invalid phone format (use 08012345678)";
        }
      }
    });

    // Step 2: Validate shared password
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Password must contain a lowercase letter";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain an uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain a number";
    } else if (!/[@$!%*#?&]/.test(password)) {
      newErrors.password = "Password must contain a special character (@$!%*#?&)";
    }

    // Step 3: Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (password && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    // Step 4: Expand the first student section that has an error
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey?.startsWith("student_")) {
      const studentIndex = parseInt(firstErrorKey.split("_")[1]);
      setStudents((prev) =>
        prev.map((s, i) => ({ ...s, expanded: i === studentIndex }))
      );
    }

    return Object.keys(newErrors).length === 0;
  };

  // ── API: Register email students ───────────────────────────────────────────
  const registerEmailStudents = async (emailStudents, sharedPassword) => {
    const count = { success: 0, failed: 0 };
    for (const student of emailStudents) {
      try {
        await axios.post(`${API_BASE_URL}/api/Students/register`, {
          email: student.cleanedEmail,
          password: sharedPassword,
          confirmPassword: sharedPassword,
          password_confirmation: sharedPassword,
        });
        count.success++;
        console.log(`✓ Email sent to ${student.name}`);
      } catch (err) {
        count.failed++;
        console.error(`✗ Failed to register ${student.name}:`, err.response?.data);
      }
    }
    return count;
  };

  // ── Form submission ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1: Validate — abort if errors
    if (!validateForm()) {
      setToast({ type: "error", message: "Please fix the errors above" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setLoading(true);

    try {
      // Step 2: Retrieve guardian phone saved from earlier registration step
      const guardianTel = localStorage.getItem("guardianTel");

      // Step 3: Process students — split into email vs phone
      const processedStudents = students.map((s) => {
        const input = s.email.trim();
        const hasAt = input.includes("@");
        return {
          name: s.name,
          email: s.email,
          cleanedEmail: hasAt ? input : null,
          cleanedTel: hasAt ? null : cleanInput(input),
          isEmail: hasAt,
        };
      });

      const emailStudents = processedStudents.filter((s) => s.isEmail);
      const phoneStudents = processedStudents.filter((s) => !s.isEmail);

      // Step 4: Persist student data to localStorage for subsequent pages
      localStorage.setItem(
        "guardianStudents",
        JSON.stringify({
          guardianTel,
          students: processedStudents.map((s) => ({ name: s.name, email: s.email })),
          password,
        })
      );

      // Step 5: Register email students with the backend
      if (emailStudents.length > 0) {
        const result = await registerEmailStudents(emailStudents, password);
        console.log(`Registered: ${result.success} success, ${result.failed} failed`);
      }

      // Step 6: Navigate — phone students need OTP, email students go straight to biodata
      if (phoneStudents.length > 0) {
        setToast({ type: "success", message: `${phoneStudents.length} student(s) need phone verification` });
        setTimeout(() => {
          setLoading(false);
          navigate("/register/guardian/student/otp-verification");
        }, 2000);
      } else {
        setToast({ type: "success", message: "Verification emails sent! Proceeding to biodata..." });
        setTimeout(() => {
          setLoading(false);
          navigate("/register/guardian/student/biodata");
        }, 2000);
      }
    } catch (err) {
      console.error("Error:", err);
      setToast({ type: "error", message: "Something went wrong. Please try again." });
      setTimeout(() => setToast(null), 3000);
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden bg-[#F4F4F4]">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[200] px-6 py-4 rounded-[20px] shadow-2xl text-white animate-fadeIn ${
          toast.type === "success" ? "bg-[#7FD093]" : "bg-[#E83831]"
        }`}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg">
              {toast.type === "success" ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* LEFT SIDE — Form Section */}
      <div className="w-full md:w-1/2 min-h-screen md:h-screen flex flex-col items-center bg-[#F4F4F4] relative order-2 md:order-1 overflow-y-auto pt-12 pb-20 px-6 lg:px-[80px]">
        {/* Navigation */}
        <div className="w-full max-w-[480px] flex items-center justify-between mb-12">
          <button
            onClick={() => navigate("/register/guardian")}
            className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-black/5"
          >
            <ChevronLeftIcon className="h-5 w-5 text-[#09314F]" />
          </button>
          <img src={TC_logo} alt="Tutorial Center" className="h-[70px] w-auto object-contain" />
          <div className="w-11" /> {/* Spacer for centering */}
        </div>

        <div className="w-full max-w-[480px]">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-[28px] font-black text-[#09314F] leading-tight mb-3">Add Student</h1>
            <p className="text-[#888888] font-medium max-w-[320px] mx-auto text-sm leading-relaxed">
              Add your child(ren) through email, they will receive a confirmation email to be able to access their information.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Card */}
            <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 p-8 space-y-8">
              {/* Student Accordion */}
              <div className="space-y-4">
                {students.map((student, index) => (
                  <div key={index} className="space-y-4 animate-fadeIn">
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleStudent(index)}
                      className="w-full flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-[#09314F] uppercase tracking-[0.15em]">
                          Student {index + 1}
                        </span>
                        {student.name && <span className="text-[10px] font-bold text-gray-300 uppercase truncate max-w-[150px]">— {student.name}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        {students.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeStudent(index); }}
                            className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                        <ChevronDownIcon className={`h-4 w-4 text-[#09314F] transition-transform duration-300 ${student.expanded ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {student.expanded && (
                      <div className="space-y-6 pt-2 animate-fadeIn">
                        {/* Name Input */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-[#09314F] uppercase tracking-wider ml-1">Name</label>
                          <div className={dropdownTheme.inputContainer(errors[`student_${index}_name`], false)}>
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <input
                              type="text"
                              value={student.name}
                              onChange={(e) => handleStudentChange(index, "name", e.target.value)}
                              placeholder="first and last name"
                              className="bg-transparent w-full outline-none text-[#09314F] font-bold text-sm placeholder:text-gray-400/60"
                            />
                          </div>
                          {errors[`student_${index}_name`] && (
                            <p className="text-[10px] font-bold text-[#E83831] ml-1">{errors[`student_${index}_name`]}</p>
                          )}
                        </div>

                        {/* Email/Phone Input */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-[#09314F] uppercase tracking-wider ml-1">Email</label>
                          <div className={dropdownTheme.inputContainer(errors[`student_${index}_email`], false)}>
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <input
                              type="text"
                              value={student.email}
                              onChange={(e) => handleStudentChange(index, "email", e.target.value)}
                              placeholder="you@example.com or +234xxxxxxxxx"
                              className="bg-transparent w-full outline-none text-[#09314F] font-bold text-sm placeholder:text-gray-400/60"
                            />
                          </div>
                          {errors[`student_${index}_email`] && (
                            <p className="text-[10px] font-bold text-[#E83831] ml-1">{errors[`student_${index}_email`]}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {index < students.length - 1 && <div className="h-px bg-gray-50 w-full" />}
                  </div>
                ))}
              </div>

              {/* Add Another Button */}
              <button
                type="button"
                onClick={addStudent}
                className="w-full py-4 px-6 rounded-2xl border-2 border-dashed border-gray-100 hover:border-[#09314F22] hover:bg-gray-50/50 transition-all flex items-center justify-between group"
              >
                <span className="text-sm font-black text-[#09314F] transition-colors">Add another</span>
                <PlusIcon className="h-5 w-5 text-[#09314F] group-hover:scale-110 transition-transform" />
              </button>

              {/* Shared Password Section */}
              <div className="pt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#09314F] uppercase tracking-wider ml-1">General Password</label>
                    <div className={dropdownTheme.inputContainer(errors.password, false)}>
                      <button type="button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeSlashIcon className="h-4 w-4 text-gray-400 mr-2" /> : <EyeIcon className="h-4 w-4 text-gray-400 mr-2" />}
                      </button>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-transparent w-full outline-none text-[#09314F] font-bold text-sm"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#09314F] uppercase tracking-wider ml-1">Confirm Password</label>
                    <div className={dropdownTheme.inputContainer(errors.confirmPassword, false)}>
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4 text-gray-400 mr-2" /> : <EyeIcon className="h-4 w-4 text-gray-400 mr-2" />}
                      </button>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-transparent w-full outline-none text-[#09314F] font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>
                {errors.password && <p className="text-[10px] font-bold text-[#E83831] ml-1">{errors.password}</p>}
                {errors.confirmPassword && !errors.password && <p className="text-[10px] font-bold text-[#E83831] ml-1">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-xl transition-all duration-300 relative overflow-hidden group ${
                  loading ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:scale-[1.02] active:scale-[0.98] hover:shadow-[#09314F44]"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing Up...</span>
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE — Split Image Section */}
      <div 
        className="w-full md:w-1/2 h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2 hidden md:block"
        style={{ backgroundImage: `url(${signup_img})` }}
      >
        <div className="absolute inset-0 bg-[#09314F11]" />
        
        {/* Floating Login Button */}
        <div className="absolute bottom-12 left-0">
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-5 bg-white text-[#09314F] font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-2xl rounded-r-3xl border-y border-r border-black/5"
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
      `}</style>
    </div>
  );
}
