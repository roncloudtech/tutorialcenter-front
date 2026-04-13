import React from "react";
import Paystack from "../../Paystack";

export default function PaymentMethodModal({ 
  isOpen, 
  onClose, 
  selectedDuration, 
  amount, 
  email,
  selectedMethod, 
  setSelectedMethod, 
  onContinue, 
  loading 
}) {
  if (!isOpen) return null;



  const reference = `TC-PAY-${Date.now()}`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[40px] p-8 md:p-10 w-[90%] max-w-md shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-400">✕</button>
        <h2 className="text-2xl font-black text-[#0F2843] mb-2 text-center uppercase tracking-tighter italic">Payment Method</h2>
        <p className="text-gray-400 text-[10px] font-bold text-center uppercase tracking-widest mb-8">Choose your preferred gateway</p>
        
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 mb-8 flex justify-between items-center">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Plan</span>
             <span className="text-sm font-black text-[#0F2843] uppercase italic">{selectedDuration || "Termwise"}</span>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Amount</span>
             <span className="text-xl font-black text-[#0F2843]">₦{amount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col space-y-4 mb-10">
          {["Paystack", "Flutterwave", "PayPal", "Interswitch"].map((item) => {
            const isSelected = selectedMethod === item;
            return (
              <button
                key={item}
                onClick={() => setSelectedMethod(item)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-[#76D287] bg-green-50"
                    : "border-gray-200 hover:border-[#09314F] bg-white"
                }`}
              >
                <span className={`font-bold text-sm md:text-base ${
                  isSelected ? "text-[#09314F]" : "text-gray-600"
                }`}>
                  {item}
                </span>
                <span className={`font-bold text-lg ${
                  isSelected ? "text-[#76D287]" : "text-[#09314F]"
                }`}>
                  {isSelected ? "✓" : "›"}
                </span>
              </button>
            );
          })}
        </div>

        {selectedMethod === "Paystack" ? (
          <Paystack
            amount={amount}
            email={email}
            reference={reference}
            onSuccess={onContinue}
            onClose={() => {}}
          />
        ) : (
          <button 
            onClick={onContinue} 
            disabled={loading || !selectedMethod} 
            className={`w-full py-5 rounded-[12px] font-bold text-lg text-white shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] ${
              selectedMethod
                ? "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:shadow-[#E8383144]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : `Continue = ₦${amount.toLocaleString()}`}
          </button>
        )}
      </div>
    </div>
  );
}
