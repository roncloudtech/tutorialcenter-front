import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import signup_img from "../../../assets/images/student_sign_up.jpg";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

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
        await axios.post(`${API_BASE_URL}/api/students/register`, {
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
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">

      {/* Left side — form */}
      <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">

        {/* Nav: back button + logo */}
        <div className="relative w-full flex items-center justify-center mb-8 md:mb-10">
          <button
            onClick={() => navigate("/register/guardian")}
            className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
          >
            <img src={ReturnArrow} alt="Back" className="h-6 w-6 lg:h-5 lg:w-5" />
          </button>
          <img src={TC_logo} alt="Logo" className="h-[60px] md:h-[80px] w-auto object-contain" />
        </div>

        <div className="flex flex-col items-center w-full">

          {/* Heading */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-[#09314F]">Add Students</h1>
            <p className="text-gray-500 italic text-sm mt-1">Add students and set a shared password</p>
          </div>

          {/* Form card */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-6 flex flex-col items-center w-full">

            {/* Toast notification */}
            {toast && (
              <div
                className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-lg shadow-xl text-white transition-all duration-300 ${
                  toast.type === "success" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  {toast.type === "success" ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-medium">{toast.message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-4">

              {/* Student accordion cards */}
              <div className="space-y-3">
                {students.map((student, index) => (
                  <div key={index} className="w-full border border-gray-200 rounded-lg overflow-hidden">

                    {/* Card header — click to expand/collapse */}
                    <button
                      type="button"
                      onClick={() => toggleStudent(index)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#09314F] uppercase tracking-wide">
                          Student {index + 1}
                        </span>
                        {student.name && (
                          <span className="text-xs text-gray-400">— {student.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {students.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeStudent(index); }}
                            className="text-red-500 hover:text-red-700 text-sm font-medium px-2"
                          >
                            Remove
                          </button>
                        )}
                        <svg
                          className={`w-5 h-5 text-[#09314F] transition-transform duration-200 ${student.expanded ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Card body — name + email/phone inputs */}
                    {student.expanded && (
                      <div className="px-4 py-4 space-y-4 border-t border-gray-200">
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">Student Name</label>
                          <input
                            type="text"
                            value={student.name}
                            onChange={(e) => handleStudentChange(index, "name", e.target.value)}
                            placeholder="e.g. John Doe"
                            className={`w-full px-4 py-2 border rounded-lg ${
                              errors[`student_${index}_name`] ? "border-red-500" : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                          />
                          {errors[`student_${index}_name`] && (
                            <p className="text-sm text-red-500 mt-1">{errors[`student_${index}_name`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">Email or Phone Number</label>
                          <input
                            type="text"
                            value={student.email}
                            onChange={(e) => handleStudentChange(index, "email", e.target.value)}
                            placeholder="student@email.com or 08012345678"
                            className={`w-full px-4 py-2 border rounded-lg ${
                              errors[`student_${index}_email`] ? "border-red-500" : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                          />
                          {errors[`student_${index}_email`] && (
                            <p className="text-sm text-red-500 mt-1">{errors[`student_${index}_email`]}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            📧 Email → verify via link | 📱 Phone → verify via OTP
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add another student */}
              <button
                type="button"
                onClick={addStudent}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors font-medium"
              >
                + Add Another Student
              </button>

              {/* Shared password section */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Set Shared Password</h3>
                <p className="text-sm text-gray-500">All students will use this password to log in</p>

                {/* Password field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-blue-900 mb-2">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter shared password"
                    className={`w-full px-4 py-2 pr-10 border rounded-lg ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                  <p className="text-xs text-gray-500 mt-1">Min 8 chars, uppercase, lowercase, number, special char</p>
                </div>

                {/* Confirm password field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-blue-900 mb-2">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full px-4 py-2 pr-10 border rounded-lg ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                  {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-all ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90"
                } text-white`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right side — background image + login button */}
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