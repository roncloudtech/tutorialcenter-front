import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import payment_img from "../../../assets/images/add_student.png";

export default function PaymentMethod() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: "paystack", name: "Paystack" },
    { id: "paypal", name: "Paypal" },
    { id: "interswitch", name: "Inter-switch" },
  ];

  const handleContinue = async () => {
    if (!selectedMethod) {
      alert("Please select a preferred payment method to proceed.");
      return;
    }

    setLoading(true);

    try {
      // The Backend movemenet will be here.
      
      
      // Simulate a small delay for the backend to calculate
      
    } catch (error) {
      setLoading(false);
      console.error("Payment initialization failed", error);
    }
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-[#F4F4F4] font-sans overflow-x-hidden">
      
      {/* IMAGE SECTION */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full relative order-1 md:order-2">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${payment_img})` }}
        />
      </div>

      {/* FORM SECTION */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[500px] mx-auto my-auto flex flex-col">
          
          <div className="relative w-full flex items-center justify-center mb-10 mt-4">
            <button 
              onClick={() => navigate(-1)} 
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <img className="w-5 h-5" src={ReturnArrow} alt="Back" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">Payment Method</h1>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <p className="text-gray-500 text-xs md:text-sm mb-8 text-center">
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
                    <span className="text-[#09314F] font-bold">
                      {isChosen ? "●" : "›"}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleContinue}
              disabled={loading}
              className={`w-full py-4 px-4 rounded-lg font-bold text-white shadow-lg transition-all ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-[0.98]"
              }`}
            >
              {loading ? "Initializing..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}