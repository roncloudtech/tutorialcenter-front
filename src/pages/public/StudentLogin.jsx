import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import login_img from "../../assets/images/login_img.jpg";
import TC_logo from "../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../assets/svg/return arrow.svg";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

export default function StudentLogin() {
  const navigate = useNavigate(); // Initializing navigation
  const { login } = useAuth();
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({}); // Initializing errors
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false); // loading for button press
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    entry: "",
    password: "",
  });
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // Capture each user entries
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate form data before submission
  const validateForm = () => {
    const newErrors = {};

    if (!formData.entry.trim()) {
      newErrors.entry = "Entry is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;


    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/students/login`,
        formData,
      );

      if (response.status === 200) {
        // Use AuthContext login to update both localStorage AND React state
        login(response.data.token, response.data.student);

        setToast({ type: "success", message: response.data.message });
        setMsg({
          text: "Login successful!",
          type: "success",
        });

        setTimeout(() => {
          navigate(`/student/dashboard`);
        }, 3000);
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "Login failed.",
      });

      setMsg({
        text: error?.response?.data?.errors || "Login failed.",
        type: "error",
      });

      setErrors(error?.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
        {/* LEFT SIDE: The Visual Image */}
        <div
          className="w-full h-[250px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1"
          style={{ backgroundImage: `url(${login_img})` }}
        >
          {/* Sign Up Button (Desktop Only) */}
          <div className="hidden md:block absolute bottom-[70px] right-0 translate-x-9">
            <button
              onClick={() => navigate("/register")}
              className="px-10 py-4 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-xl rounded-full"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Content Area */}
        <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
          {/* 1. TOP NAV */}
          <div className="relative w-full flex items-center justify-center mb-8 md:mb-10">
            <button
              onClick={() => navigate("/register")}
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
                Student Login
              </h1>
              <p className="text-gray-500 italic text-sm">
                Login With E-Mail Address Or Phone Number
              </p>
              {msg.text && (
                <h3
                  className={`text-lg font-bold ${
                    msg.type === "success" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {msg.text}
                </h3>
              )}
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-6 flex flex-col items-center w-full">
              {/* Toast */}
              <div>
                {toast && (
                  <div
                    className={`fixed top-5 left-5 z-50 px-4 py-3 rounded shadow-lg text-white transition-all duration-300 ${
                      toast.type === "success" ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {toast.message}
                  </div>
                )}
              </div>
              <div className="md:block w-full mt-auto">
                <form
                  autoComplete="off"
                  action=""
                  method="post"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Email Input or phone number */}
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Email Address Or Phone Number
                    </label>
                    <input
                      name="entry"
                      type="text"
                      value={formData.entry}
                      onChange={handleChange}
                      placeholder="E-mail Address or Phone Number"
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.entry ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-900 focus:border-transparent`}
                    />
                    {(errors.entry || errors.tel || errors.email) && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.entry || errors.tel || errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          errors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-900"
                        }`}
                      />
                      <span
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-5" />
                        ) : (
                          <EyeIcon className="h-4 w-5" />
                        )}
                      </span>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:bg-green-800"
                    } text-white transition-colors`}
                  >
                    login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
