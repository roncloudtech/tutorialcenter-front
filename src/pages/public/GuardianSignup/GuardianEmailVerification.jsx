import axios from "axios";
import { useEffect, useState } from "react";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import { useNavigate, useSearchParams } from "react-router-dom";
import signup_img from "../../../assets/images/otpparent.jpg";

export default function GuardianEmailVerification() {
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
    if (count > 0) {
      const timer = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [count]);

  // Handle form submission and OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/guardians/verify-email`,
        {
          token: token,
        },
      );

      if (response.status === 200) {
        setToast({ type: "success", message: response.data.message });
        setMsg(<span className="text-green-500">{response.data.message}</span>);
        localStorage.setItem("guardianEmail", email);
        setTimeout(() => {
          navigate("/register/guardian/addstudent");
        }, 3000);
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Verification failed",
      });
      setMsg(
        <span className="text-red-500">{error?.response?.data?.error || error?.response?.data?.message}</span>,
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
        `${API_BASE_URL}/api/guardians/resend-email`,
        { email: email },
      );
      setToast({ type: "success", message: response.data.message });
      setMsg(<span className="text-green-500">{response.data.message}</span>);
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to resend email",
      });
      setMsg(
        <span className="text-red-500">{error?.response?.data?.error || error?.response?.data?.message}</span>,
      );
    } finally {
      setCount(60);
    }
  };

  return (
    <>
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
          {/* TOP NAV */}
          <div className="relative w-full flex items-center justify-center mb-8 md:mb-10">
            <button
              onClick={() => navigate("/register/guardian")}
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

          {/* CENTER PIECE */}
          <div className="flex flex-col items-center w-full">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-[#09314F]">
                Guardian Email Verification
              </h1>
              <p className="text-gray-500 italic text-sm">
                Verify Your Email Address
              </p>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-6 flex flex-col items-center w-full">
              {toast && (
                <div
                  className={`fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white transition-all duration-300 ${
                    toast.type === "success" ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {toast.message}
                </div>
              )}
              
              <div className="md:block w-full mt-auto">
                <form
                  autoComplete="off"
                  className="space-y-3.5"
                  onSubmit={handleSubmit}
                >
                  <div className="description-text text-center">
                    <p className="text-sm text-gray-500 mt-2">
                      We've sent a verification link to{" "}
                      <span className="text-black font-semibold">
                       {email}
                      </span>
                    </p>
                    <p className="text-center text-sm mt-2">{msg}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Didn't receive the email?{" "}
                      {count > 0 ? (
                        <span className="font-medium text-gray-300">
                          Resend in {count}s
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

        {/* RIGHT SIDE */}
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
