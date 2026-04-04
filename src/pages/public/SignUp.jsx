import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import signup_img from "../../assets/images/Student_sign_up.jpg";
import TC_logo from "../../assets/images/tutorial_logo.png";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import ComingSoon from "../../components/public/ComingSoon";

export default function SignUp() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("");
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleSubmit = () => {
    console.log("Selected Role:", userRole); // Debugging line
    if (userRole === "student") {
      navigate("/register/student");
    } else if (userRole === "guardian") {
      setShowComingSoon(true);
    }
  };
  if (showComingSoon) {
    return <ComingSoon onBack={() => setShowComingSoon(false)} />;
  }

  return (
    <>
      <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
        <style>{`
        @keyframes bluePulse {
          0% { box-shadow: 0 0 0px rgba(59, 130, 246, 0); border-color: transparent; }
          50% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); border-color: #3b82f6; }
          100% { box-shadow: 0 0 0px rgba(59, 130, 246, 0); border-color: transparent; }
        }
        .animate-glow { animation: bluePulse 0.8s ease-in-out 2; }
      `}</style>

        {/* LEFT SIDE: Content Area */}
        <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col justify-center relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
          {/* 1. TOP NAV */}
          <div className="relative w-full flex items-center justify-center mb-8 md:mb-10">
            <button
               onClick={() => navigate("/")}
               className="absolute left-0 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90 z-10"
             >
               <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
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
              <h1 className="text-3xl font-bold text-[#09314F]">Sign Up</h1>
              <p className="text-gray-500 italic text-sm">Select a user-type</p>
            </div>

            <div
              className="bg-white shadow-sm border border-gray-100 rounded-lg p-6 flex flex-col items-center w-full max-w-[369px] md:w-[369px] md:min-h-[309px]"
            >
              {/* Student Button */}
              <button
                onClick={() => setUserRole("student")}
                className={`w-full h-[50px] mb-4 rounded-xl flex items-center justify-between px-6 font-semibold text-base transition-all border-2 ${!userRole ? "animate-glow" : ""}
                  ${userRole === "student" ? "bg-[#76D287] text-white border-transparent" : "bg-[#FFF5F5] text-[#09314F] border-transparent"}`}
              >
                STUDENT
                {userRole === "student" && <span>✓</span>}
              </button>

              {/* Guardian Button */}
              <button
                onClick={() => setUserRole("guardian")}
                className={`w-full h-[50px] mb-4 rounded-xl flex items-center justify-between px-6 font-semibold text-base transition-all border-2 ${!userRole ? "animate-glow" : ""}
                  ${userRole === "guardian" ? "bg-[#76D287] text-white border-transparent" : "bg-[#FFF5F5] text-[#09314F] border-transparent"}`}
              >
                GUARDIAN / PARENT
                {userRole === "guardian" && <span>✓</span>}
              </button>

              {/* Continue Button (Inside Card for All Screens) */}
              <div className="w-full mt-6 md:mt-auto">
                <button
                  onClick={handleSubmit}
                  className="w-full h-[60px] text-white rounded-xl font-bold transition-all duration-500 shadow-md active:scale-95"
                  style={{
                    background: userRole
                      ? "linear-gradient(90deg, #09314F 0%, #E33629 100%)"
                      : "#5F5F5F",
                  }}
                >
                  Continue
                </button>
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
