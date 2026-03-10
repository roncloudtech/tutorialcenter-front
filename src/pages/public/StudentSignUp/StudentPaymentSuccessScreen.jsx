import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import signup_img from "../../../assets/images/student_sign_up.jpg";

export const StudentPaymentSuccessScreen = () => {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPaymentData = () => {
      try {
        const stored = localStorage.getItem("studentdata");
        if (!stored) {
          navigate("/register/student");
          return;
        }

        const studentData = JSON.parse(stored);

        // --- Debug: confirm what's stored ---
        console.log("[PaymentSuccess] availableTrainings:", studentData.availableTrainings);
        console.log("[PaymentSuccess] selectedTraining:", studentData.selectedTraining);

        // --- Getting Names by ID from the stored data ---
        const enrichedCourses = (studentData.selectedTraining || []).map((id) => {
          // We look into the trainings list already in your localStorage
          const courseDetail = studentData.availableTrainings?.find((c) => c.id === id);
          console.log(`[PaymentSuccess] id=${id} → courseDetail:`, courseDetail);
          return {
            id,
            name: courseDetail?.title || `Course ${id}`, // Dynamic name
            duration: studentData.selectedDurations[id]?.duration || "Access Granted",
          };
        });

        setPaymentData({
          studentName: `${studentData.data.firstname} ${studentData.data.surname}`,
          courses: enrichedCourses,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error loading payment data:", error);
        setLoading(false);
      }
    };
    loadPaymentData();
  }, [navigate]);

  const handleGoToDashboard = () => {
    ["studentEmail", "studentdata", "studentTel", "studentVerified"].forEach((k) =>
      localStorage.removeItem(k)
    );
    navigate("/student/login");
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="w-screen h-screen flex overflow-hidden font-sans">
      
      {/* LEFT SIDE: Content Area with a floating card */}
      <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col items-center justify-center px-6 md:px-10">
        
        {/* THE WHITE CARD (Everything from Success Message to Button) */}
        <div className="bg-white w-full max-w-[448px] shadow-xl rounded-[24px] p-8 md:p-12 flex flex-col items-center border border-gray-100">
          
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-[#09314F] flex items-center justify-center mb-6">
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl md:text-3xl font-black text-[#09314F] text-center mb-2">
            Payment Successful!
          </h1>

          {/* Student Name */}
          <p className="text-gray-500 text-center mb-8">
            Welcome, <span className="font-bold text-[#09314F]">{paymentData.studentName}</span>
          </p>

          {/* Access Information */}
          <div className="w-full mb-8">
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Your Subscriptions
            </p>
            
            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2">
              {paymentData.courses.map((course) => (
                <div 
                  key={course.id}
                  className="flex flex-col items-center py-3 px-4 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <p className="text-sm font-bold text-[#09314F] text-center">
                    {course.name}
                  </p>
                  <p className="text-[11px] text-[#76D287] font-bold uppercase mt-1">
                    {course.duration}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Button */}
          <button
            onClick={handleGoToDashboard}
            className="w-full py-4 text-white font-bold text-lg rounded-xl shadow-lg transition-all active:scale-95"
            style={{ background: "linear-gradient(90deg, #0F2C45 0%, #A92429 100%)" }}
          >
            Login to Dashboard
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: The Visual Image */}
      <div 
        className="hidden md:block md:w-1/2 h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${signup_img})` }}
      >
        <div className="w-full h-full bg-[#09314F]/10"></div>
      </div>
    </div>
  );
};

