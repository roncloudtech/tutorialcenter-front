import axios from "axios";
import { useEffect, useState } from "react";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import { useNavigate, useSearchParams } from "react-router-dom";
import signup_img from "../../../assets/images/student_sign_up.jpg";

export default function StudentEmailVerification() {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test"; // Base URL for API
  const navigate = useNavigate(); // Initializing navigation
  const [msg, setMsg] = useState(""); // State for displaying messages
  const [count, setCount] = useState(60); // Timer state for resend OTP
  const [toast, setToast] = useState(null); // State for toast notifications
  const [loading, setLoading] = useState(false); // Loading state for form submission

  // Extract token and email from URL query parameters
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Timer effect for resend OTP functionality
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

  // Handle form submission and OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true); // Set loading state to true
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/students/verify-email`,
        {
          token: token,
        },
      );

      if (response.status === 200) {
        setToast({ type: "success", message: response.data.message });
        setMsg(<span className="text-green-500">{response.data.message}</span>);
        localStorage.setItem("studentEmail", email); // Store email for later steps
        setTimeout(() => {
          navigate("/register/student/biodata");
        }, 3000);
      }
    } catch (error) {
      console.error("Verification error:", error.response?.data || error);
      const backendMessage = error?.response?.data?.message || "";
      const backendErrorField = error?.response?.data?.error || "";
      const backendErrors = error.response?.data?.errors || {};

      if (Object.keys(backendErrors).length > 0) {
        const firstErrorKey = Object.keys(backendErrors)[0];
        const firstErrorMessage = backendErrors[firstErrorKey][0];
        const finalMsg = backendMessage || firstErrorMessage || "Validation failed.";
        setToast({ type: "error", message: finalMsg });
        setMsg(<span className="text-red-500">{finalMsg}</span>);
      } else {
        const finalMsg = backendMessage || backendErrorField || "Verification failed. Please try again.";
        setToast({ type: "error", message: finalMsg });
        setMsg(<span className="text-red-500">{finalMsg}</span>);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/students/resend-email-verification`,
        { email: email },
      );
      setToast({ type: "success", message: response?.data?.message || "Email verification resent successfully." });
      setMsg(<span className="text-green-500">{response?.data?.message || "Email verification resent successfully."}</span>);
    } catch (error) {
      console.error("Resend email error:", error.response?.data || error);
      const backendMessage = error?.response?.data?.message || "";
      const backendErrorField = error?.response?.data?.error || "";
      const finalMsg = backendMessage || backendErrorField || "Failed to resend verification email. Please try again.";
      
      setToast({ type: "error", message: finalMsg });
      setMsg(<span className="text-red-500">{finalMsg}</span>);
    } finally {
      setCount(60); // Reset timer after clicking resend
    }
  };

  return (
    <>
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
        {/* LEFT SIDE: Content Area */}
        <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
          {/* 1. TOP NAV */}
          <div className="relative w-full flex items-center justify-center mb-8 md:mb-10">
            <button
              onClick={() => navigate("/student/register")}
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
            >
              <img
                src={ReturnArrow}
                alt="Back"
                className="h-6 w-6 lg:h-5 lg:w-5"
              />
            </button>
            <img
              src={TC_logo}
              alt="Logo"
              className="h-[60px] md:h-[80px] w-auto object-contain"
            />
          </div>

          {/* 2. CENTER PIECE */}
          <div className="flex flex-col items-center w-full">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-[#09314F]">
                Student Email Verification
              </h1>
              <p className="text-gray-500 italic text-sm">
                Verify Your Email Address
              </p>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-6 flex flex-col items-center w-full">
              <p>
                {toast && (
                  <div
                    className={`fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white transition-all duration-300 ${
                      toast.type === "success" ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {toast.message}
                  </div>
                )}
              </p>
              <div className="md:block w-full mt-auto">
                <form
                  autoComplete="off"
                  className="space-y-3.5"
                  onSubmit={handleSubmit}
                >
                  <div className="description-text text-center">
                    <p className="text-sm text-gray-500 mt-2">
                      We've sent an a link to{" "}
                      <span className="text-black font-semibold">
                       {email}
                      </span>
                    </p>
                    <p className="text-center text-sm text-red-500">{msg}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Didn't receive the email?{" "}
                      {count > 0 ? (
                        <span className="font-medium text-gray-300">
                          Resend button active in {count}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResend}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Resend Email
                        </button>
                      )}
                    </p>
                  </div>
                  

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90"
                    } text-white transition`}
                  >
                    {loading ? "Verifying..." : "Verify Email Address"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: The Visual Image */}
        <div
          className="w-full h-[192px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2"
          style={{ backgroundImage: `url(${signup_img})` }}
        >
          {/* Login Button */}
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
    </>
  );
}
