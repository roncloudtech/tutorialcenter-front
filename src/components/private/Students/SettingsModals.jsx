import React, { useState, useEffect, useRef } from "react";

// --- Generic Modal Wrapper ---
export function ModalWrapper({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200"
      >
        {children}
      </div>
    </div>
  );
}

// --- Contact Input Modal ---
export function ContactInputModal({ isOpen, onClose, type, onSubmit, loading }) {
  const [value, setValue] = useState("");

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold text-[#09314F] dark:text-white mb-2">
        Change {type === "email" ? "Email" : "Phone Number"}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Please enter your new {type === "email" ? "email address" : "phone number"}.
      </p>
      
      <input
        type={type === "email" ? "email" : "tel"}
        placeholder={type === "email" ? "Enter new email" : "Enter new phone"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#09314F] transition-all mb-6"
      />

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl font-bold text-[#09314F] dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(value)}
          disabled={!value || loading}
          className="flex-1 py-3 rounded-xl font-bold text-white bg-[#09314F] hover:bg-[#072439] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Continue"}
        </button>
      </div>
    </ModalWrapper>
  );
}

// --- OTP Modal ---
export function OTPModal({ isOpen, onClose, contactType, onVerify, loading, onResend }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(59);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Countdown timer
  useEffect(() => {
    let timer;
    if (isOpen && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(59);
      if (inputRefs[0].current) inputRefs[0].current.focus();
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    // Only accept numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    // Handle paste of multiple digits
    if (value.length > 1) {
       const digits = value.slice(0, 6).split('');
       digits.forEach((d, i) => {
         if (index + i < 6) newOtp[index + i] = d;
       });
       setOtp(newOtp);
       const nextIndex = Math.min(index + digits.length, 5);
       inputRefs[nextIndex].current?.focus();
       return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length === 6) onVerify(code);
  };

  if (!isOpen) return null;

  const isComplete = otp.every(d => d !== "");

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold text-[#09314F] dark:text-white mb-2">
        OTP Verification
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        We have sent you a verification code to your {contactType}, input OTP below.
      </p>

      {/* Inputs */}
      <div className="flex justify-center gap-3 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            maxLength="6"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-[#F4F5F7] dark:bg-gray-700 text-[#09314F] dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#09314F] border border-transparent focus:border-[#09314F] transition-all"
          />
        ))}
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-[240px]">
        If you didn't get verification code yet.{" "}
        {timeLeft > 0 ? (
          <span className="text-[#C1A58A]">Resend code in {timeLeft} seconds</span>
        ) : (
          <button 
            onClick={() => { onResend(); setTimeLeft(59); }}
            className="text-[#C1A58A] hover:underline cursor-pointer"
          >
            Resend now
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* Verify button (often auto-submits, but good to have explicit) */}
        <button
          onClick={handleVerify}
          disabled={!isComplete || loading}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
            isComplete 
               ? "bg-[#09314F] hover:bg-[#072439] shadow-lg" 
               : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
          }`}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl font-bold text-[#09314F] dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-[#09314F] dark:border-gray-600"
        >
          Cancel
        </button>
      </div>
    </ModalWrapper>
  );
}

// --- Set New Password Modal ---
export function PasswordChangeModal({ isOpen, onClose, onSave, loading }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isMatch = password.length >= 8 && password === confirmPassword;

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold text-[#09314F] dark:text-white mb-2">
        Create New Password
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Your new password must be at least 8 characters long.
      </p>

      <div className="space-y-4 mb-8">
        <div>
           <input
             type="password"
             placeholder="New Password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#09314F] transition-all"
           />
        </div>
        <div>
           <input
             type="password"
             placeholder="Confirm New Password"
             value={confirmPassword}
             onChange={(e) => setConfirmPassword(e.target.value)}
             className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none transition-all ${
               confirmPassword && !isMatch ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-700 focus:ring-[#09314F]"
             }`}
           />
           {confirmPassword && !isMatch && (
              <p className="text-red-500 text-xs mt-1">Passwords do not match.</p>
           )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl font-bold text-[#09314F] dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave({ password, confirmPassword })}
          disabled={!isMatch || loading}
          className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-md ${
            isMatch && !loading
               ? "bg-[#09314F] hover:bg-[#072439] shadow-[#09314F]/30 shadow-lg" 
               : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
          }`}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </ModalWrapper>
  );
}

// --- Success Modal ---
export function SuccessModal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold text-[#09314F] dark:text-white mb-2">
        {title}
      </h2>
      <p className="text-[#34C759] text-sm font-medium mb-8">
        {message}
      </p>

      <button
        onClick={onClose}
        className="w-full py-4 rounded-xl font-bold text-white bg-[#09314F] hover:bg-[#072439] transition-all"
      >
        Done
      </button>
    </ModalWrapper>
  );
}

// --- Forgot Password Input Modal ---
export function ForgotInputModal({ isOpen, onClose, onSubmit, loading }) {
  const [value, setValue] = useState("");

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold text-[#09314F] dark:text-white mb-2">
        Reset Password
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Please enter the email address or phone number associated with your account to receive a reset code.
      </p>
      
      <input
        type="text"
        placeholder="Email or Phone Number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#09314F] transition-all mb-6"
      />

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl font-bold text-[#09314F] dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(value)}
          disabled={!value || loading}
          className="flex-1 py-3 rounded-xl font-bold text-white bg-[#09314F] hover:bg-[#072439] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Continue"}
        </button>
      </div>
    </ModalWrapper>
  );
}
