import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import signup_img from "../../../assets/images/Student_sign_up.jpg";

export default function PaymentMethod() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);

  const paymentMethods = [
    { id: "paystack", name: "Paystack" },
    { id: "paypal", name: "Paypal" },
    { id: "interswitch", name: "Inter-switch" },
  ];

  /* ================= LOAD TOTAL FROM STORAGE ================= */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("studentdata"));
    if (stored) {
      setStudentData(stored);
    }
  }, []);

  const totalAmount = useMemo(() => {
    if (!studentData?.selectedDurations) return 0;
    return Object.values(studentData.selectedDurations)
      .filter(Boolean)
      .reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [studentData]);

  const handleContinue = async () => {
    if (!selectedMethod) {
      alert("Please select a preferred payment method to proceed.");
      return;
    }

    setLoading(true);

    try {
      // The Backend movement will be here.
      // Simulate a small delay for the backend to calculate
    } catch (error) {
      setLoading(false);
      console.error("Payment initialization failed", error);
    }
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* LEFT */}
      <div className="w-full md:w-1/2 bg-[#F8F9FA] flex flex-col items-center py-8 px-6 lg:px-8 xl:px-[100px] overflow-y-auto pb-32 order-2 md:order-1">
        
        {/* NAV & HEADER */}
        <div className="w-full max-w-[500px] mb-10 text-center">
          <div className="flex items-center relative h-12 mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="absolute left-0 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90"
            >
              <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
            </button>
            <div className="w-full flex justify-center">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#09314F]">
                Payment Method
              </h1>
            </div>
          </div>
        </div>

        {/* Card Container */}
        <div className="w-full max-w-[500px] bg-white rounded-[8px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 mb-8 p-8 md:p-10 flex flex-col">
          
          <p className="text-[#888888] font-medium text-sm mb-8 text-center">
            Select a preferred method of payment
          </p>

          <div className="flex flex-col space-y-4 mb-10">
            {paymentMethods.map((method) => {
              const isChosen = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                    isChosen 
                      ? "border-[#09314F] bg-blue-50" 
                      : "border-gray-200 hover:border-[#09314F] bg-white"
                  }`}
                >
                  <span className={`font-bold text-sm md:text-base ${isChosen ? "text-[#09314F]" : "text-gray-600"}`}>
                    {method.name}
                  </span>
                  <span className="text-[#09314F] font-bold text-lg">
                    {isChosen ? "●" : "›"}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleContinue}
            disabled={loading}
            className={`w-full py-5 rounded-[12px] font-bold text-lg text-white shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:shadow-[#E8383144]"
            }`}
          >
            {loading ? "Initializing..." : `Continue = ₦${totalAmount.toLocaleString()}`}
          </button>
        </div>

        {/* Brand */}
        <div className="mt-auto py-10 opacity-30 grayscale pointer-events-none">
          <img src={signup_img} alt="Tutorial Center" className="h-10" />
        </div>
      </div>

      {/* RIGHT SIDE: Visual Image */}
      <div
        className="w-full h-[250px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2"
        style={{ backgroundImage: `url(${signup_img})` }}
      />
    </div>
  );
}