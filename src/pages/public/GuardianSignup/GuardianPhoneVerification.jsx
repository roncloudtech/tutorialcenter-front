import axios from "axios";
import { useEffect, useRef, useState } from "react";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import { useNavigate, useSearchParams } from "react-router-dom";
import signup_img from "../../../assets/images/otpparent.jpg";

export default function GuardianPhoneVerification() {
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
      navigate("/register/guardian");
    }
  }, [tel, navigate]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const inputRefs = {
    num1: useRef(null),
    num2: useRef(null),
    num3: useRef(null),
    num4: useRef(null),
    num5: useRef(null),
    num6: useRef(null),
  };

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    inputRefs.num1.current.focus(); // autofocus on first load
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
        `${API_BASE_URL}/api/guardians/verify-phone`,
        {
          tel: tel,
          otp: otp,
        },
      );

      if (response.status === 200) {
        setToast({ type: "success", message: response.data.message });
        setMsg(<span className="text-green-500">{response.data.message}</span>);
        localStorage.setItem("guardianTel", tel); // Store phone number for later steps
        setTimeout(() => {
          navigate("/register/guardian/addstudent");
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
        `${API_BASE_URL}/api/guardians/resend-phone-otp`,
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
    <>
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
        {/* LEFT SIDE: Content Area */}
        <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
          {/* 1. TOP NAV */}
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

          {/* 2. CENTER PIECE */}
          <div className="flex flex-col items-center w-full">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-[#09314F]">
                Guardian Phone Number Verification  
              </h1>
              <p className="text-gray-500 italic text-sm">
                Verify Your Phone Number
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
                      We've sent an OTP to{" "}
                      <span className="text-black font-semibold">
                        Guardian {tel}
                      </span>
                    </p>
                    {/* <p className="text-sm text-gray-400 mt-2">
                      Please check your phone and enter the 6-digit code below
                    </p> */}
                    <h2 className="text-sm text-gray-500 mt-1">
                      (Hint: The code is 123456 for testing)
                    </h2>
                    <p className="text-center text-sm text-red-500">{msg}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Didn't receive the code?{" "}
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
                          Resend OTP
                        </button>
                      )}
                    </p>
                  </div>

                  <div className="verification-otp my-5 w-full flex items-center justify-evenly gap-2">
                    {["num1", "num2", "num3", "num4", "num5", "num6"].map(
                      (field) => (
                        <input
                          key={field}
                          ref={inputRefs[field]}
                          name={field}
                          type="text"
                          value={formData[field]}
                          onChange={handleChange}
                          maxLength="1"
                          placeholder="0"
                          className={`p-2 ring-1 rounded-sm ring-gray-300 text-center text-sm text-blue-900 w-10 h-10 border ${
                            errors[field] ? "border-red-500" : "border-gray-300"
                          } focus:ring-2 focus:ring-blue-900`}
                        />
                      ),
                    )}
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
                    {loading ? "Verifying..." : "Verify Phone Number"}
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
