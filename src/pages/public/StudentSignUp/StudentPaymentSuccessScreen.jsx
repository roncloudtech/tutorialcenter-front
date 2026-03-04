import React, {useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {CheckCircleIcon} from "@heroicons/react/24/outline";
import signup_img from "../../../assets/images/student_sign_up.jpg";

export const StudentPaymentSuccessScreen = () => {
    const navigate = useNavigate();
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{
        const loadPaymentData = () => {
          try{
            const stored = localStorage.getItem("studentdata");

            if (!stored){
                navigate("/register/student");
                return;
            }

            const studentData = JSON.parse(stored);

            const paymentInfo = {
                 studentName: `${studentData.data.firstname} ${studentData.data.surname}`,
          selectedTraining: studentData.selectedTraining || [],
          selectedDurations: studentData.selectedDurations || {},
            };

            setPaymentData(paymentInfo);
            setLoading(false);

          } catch (error){
            console.error("Error loading payment data:", error);
            setLoading(false);
          }
        };

        loadPaymentData();
    }, [navigate]);

    const handleGoToDashboard = () => {
        localStorage.removeItem("studentEmail");
         localStorage.removeItem("studentdata");
    localStorage.removeItem("studentTel");
    localStorage.removeItem("studentVerified");

    navigate("/student/dashboard");
    };

    if (loading){
        return(
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center"> 
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#09314f] mx-auto mb-4">
                        <p>loading...</p>
                    </div>
                </div>
            </div>
        );
    }


    if(!paymentData){
        return(
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md text-center">
          <p className="text-gray-600 mb-4">No payment data found</p>
          <button
            onClick={() => navigate("/register/student")}
            className="px-6 py-3 bg-gradient-to-r from-[#09314F] to-[#E83831] text-white font-bold rounded-xl"
          >
            Start Registration
          </button>
        </div>
            </div>
        )
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="flex flex-col md:flex-row max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* LEFT SIDE - Success Card */}
        <div className="w-full md:w-1/2 p-12 flex flex-col items-center justify-center bg-white">
          
          {/* Success Icon */}
          <div className="w-24 h-24 rounded-full bg-[#09314F] flex items-center justify-center mb-8">
            <CheckCircleIcon className="w-16 h-16 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-black text-[#09314F] text-center mb-4">
            Payment Successful!
          </h1>

          {/* Student Name */}
          <p className="text-xl text-gray-600 text-center mb-8">
            Welcome, <span className="font-bold text-[#09314F]">{paymentData.studentName}</span>
          </p>

          {/* Access Information */}
          <div className="w-full mb-8">
            <p className="text-center text-gray-600 font-medium mb-4">
              You now have access for
            </p>
            
            <div className="space-y-3">
              {paymentData.selectedTraining.map((courseId) => {
                const duration = paymentData.selectedDurations[courseId];
                
                return (
                  <div 
                    key={courseId}
                    className="text-center py-2 px-4 bg-gray-50 rounded-xl"
                  >
                    <p className="text-sm font-bold text-[#09314F] uppercase tracking-wide">
                      Course {courseId}
                    </p>
                    {duration && (
                      <p className="text-xs text-gray-500 capitalize mt-1">
                        {duration.duration}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dashboard Button */}
          <button
            onClick={handleGoToDashboard}
            className="w-full py-4 bg-gradient-to-r from-[#09314F] to-[#E83831] text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            Go To Dashboard
          </button>
        </div>

        {/* RIGHT SIDE - Image */}
        <div 
          className="hidden md:block w-full md:w-1/2 bg-cover bg-center min-h-[500px]"
         style={{ backgroundImage: `url(${signup_img})` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#09314F]/20 to-[#E83831]/20"></div>
        </div>
      </div>
    </div>
  );
};
