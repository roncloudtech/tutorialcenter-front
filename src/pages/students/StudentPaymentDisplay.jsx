// pages/students/StudentPaymentDisplay.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PaymentLayout from "../../components/private/students/PaymentLayout.jsx";
import RemoveTraining from "../../components/private/students/RemoveTraining.jsx";
import AddTraining from "../../components/private/students/AddTraining.jsx";
import PaymentMethodModal from "../../components/private/students/PaymentMethodModal.jsx";
import { BellIcon, ChevronLeftIcon} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext.jsx";

export default function StudentPaymentDisplay() {
  const { student } = useAuth();
  const [payments, setPayments] = useState([]); // Payment history
  const [activeCourses, setActiveCourses] = useState([]); // For "On-going Training"
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeView, setActiveView] = useState("main"); // "main" | "renew" | "remove" | "add"
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [allCourses, setAllCourses] = useState([]); // Base prices
  const [selectedMethod, setSelectedMethod] = useState("");
  const [renewLoading, setRenewLoading] = useState(false);

  const DURATION_OPTIONS = [
    { key: "monthly", label: "Monthly", months: 1 },
    { key: "quarterly", label: "Quarterly", months: 3 },
    { key: "semi_annual", label: "Semi-Annual", months: 6 },
    { key: "annual", label: "Annual", months: 12 },
  ];

  // Calculate expiry date from start date + billing cycle
  const calculateExpiryDate = (startDate, billingCycle) => {
    if (!startDate || !billingCycle) return null;
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return null;
    
    const monthsMap = {
      monthly: 1,
      quarterly: 3,
      semi_annual: 6,
      annual: 12,
    };
    const months = monthsMap[billingCycle] || 1;
    const expiry = new Date(start);
    expiry.setMonth(expiry.getMonth() + months);
    return expiry;
  };

  const calculatePrice = (basePrice, months) => {
    const total = basePrice * months;
    return months === 1 ? total : total - total * 0.05;
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("student_token");



  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch all payment-related data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Payment History
      const paymentsRes = await axios.get(`${API_BASE_URL}/api/students/payments`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      // The user wants response.data.payments
      setPayments(paymentsRes.data.payments || paymentsRes.data.courses || []);
      console.log("History API Response:", paymentsRes.data);

      // 2. Fetch Active Enrolled Courses (these have the titles and dates we need for "On-going Training")
      const coursesRes = await axios.get(`${API_BASE_URL}/api/students/courses`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      const activeData = coursesRes.data.courses || coursesRes.data.data || [];
      setActiveCourses(activeData);
      console.log("Courses API Response:", coursesRes.data);

      // 3. Fetch All Courses (for base prices)
      const allCoursesRes = await axios.get(`${API_BASE_URL}/api/courses`);
      setAllCourses(allCoursesRes.data.courses || []);

    } catch (error) {
      console.error("Failed to fetch payment data:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to load payment info"
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const handleRenewClick = (payment) => {
    setSelectedPayment(payment);
    setSelectedDuration("");
    setCalculatedPrice(0);
    setShowDurationModal(true);
  };

  const handleDurationContinue = () => {
    if (!selectedDuration) {
      setToast({ type: "error", message: "Please select a duration." });
      return;
    }
    setShowDurationModal(false);
    setShowPaymentModal(true);
  };

  const handleRenewContinue = async (response) => {
    if (!selectedMethod) {
      setToast({ type: "error", message: "Please select a payment method." });
      return;
    }

    setRenewLoading(true);
    try {
      const payload = {
        student_id: student?.id,
        course_enrollment_id: selectedPayment.enrollment_id,
        amount: calculatedPrice,
        billing_cycle: selectedDuration,
        payment_method: "card",
        gateway: selectedMethod,
        status: "successful",
        gateway_reference: response?.reference || `TC-REN-${Date.now()}-${student?.id}`,
        paid_at: new Date().toISOString(),
        email: student?.email
      };

      console.log("Sending renewal payment:", payload);

      await axios.post(`${API_BASE_URL}/api/payments`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      setToast({ type: "success", message: "Payment renewed successfully!" });
      setShowPaymentModal(false);
      fetchData();
    } catch (error) {
      console.error("Renewal failed:", error);
      setToast({ 
        type: "error", 
        message: error.response?.data?.message || "Renewal failed. Please try again." 
      });
    } finally {
      setRenewLoading(false);
    }
  };

  // ===================== MAIN VIEW =====================
  const MainView = () => (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-[#0F2843] tracking-tighter uppercase">Payment</h1>
        <button className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <BellIcon className="w-6 h-6 text-[#0F2843]" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#E83831] border-2 border-white rounded-full" />
        </button>
      </div>

      <div className="space-y-3 mb-10">
        <button 
          onClick={() => setActiveView("add")}
          className="w-full text-left px-6 py-4 bg-white border border-gray-200 rounded-xl text-[15px] font-bold text-[#0F2843] hover:shadow-md hover:border-gray-300 transition-all active:scale-[0.99]"
        >
          Add Training
        </button>
        {/* <button
          onClick={() => setActiveView("remove")}
          className="w-full text-left px-6 py-4 bg-white border border-gray-200 rounded-xl text-[15px] font-bold text-[#0F2843] hover:shadow-md hover:border-gray-300 transition-all active:scale-[0.99]"
        >
          Remove Training
        </button> */}
        <button
          onClick={() => setActiveView("renew")}
          className="w-full text-left px-6 py-4 bg-white border border-gray-200 rounded-xl text-[15px] font-bold text-[#0F2843] hover:shadow-md hover:border-gray-300 transition-all active:scale-[0.99]"
        >
          Renew Payment
        </button>
      </div>

      <div>
        <h2 className="text-lg font-black text-[#0F2843] mb-6">History</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#09314F] mx-auto" />
            <p className="mt-4 text-gray-500 font-bold text-sm">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 font-bold">No payment history found.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {payments.map((payment, index) => {
              // Match payment's course_enrollment_id with enrollment_id from courses API
              const relatedCourse = activeCourses.find(c => 
                Number(c.enrollment_id) === Number(payment.course_enrollment_id) ||
                Number(c.course_id) === Number(payment.course_id)
              );
              
              const displayTitle = payment.course?.title || payment.course_title || payment.course_name || relatedCourse?.course?.title || payment.name || `Payment #${payment.id}`;

              return (
                <div
                  key={payment.id || `history-${index}`}
                  className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-gray-200 last:border-0"
                >
                  <span className={`text-sm font-bold min-w-[80px] ${payment.status === 'cancelled' || payment.status === 'removed' ? 'text-red-500' : 'text-[#0F2843]'}`}>
                    {displayTitle}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-gray-500 font-medium whitespace-nowrap">
                      Paid - {formatDate(payment.start_date || payment.paid_at || payment.created_at)}
                    </span>
                    {(payment.status === 'cancelled' || payment.status === 'removed') && (
                      <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-tighter border border-red-100 shadow-sm">
                        Cancelled
                      </span>
                    )}
                    {(() => {
                      const isCancelled = payment.status === 'cancelled' || payment.status === 'removed';
                      const startDate = payment.start_date || payment.paid_at || payment.created_at;
                      const computedExpiry = calculateExpiryDate(startDate, payment.billing_cycle);
                      const expiryDisplay = computedExpiry ? formatDate(computedExpiry) : formatDate(payment.end_date || payment.expires_at || payment.expiry_date);
                      return (
                        <span className={`text-[12px] font-medium whitespace-nowrap ${isCancelled ? 'text-red-400' : 'text-gray-500'}`}>
                          {isCancelled ? 'Expired - --' : `Expires - ${expiryDisplay}`}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  // ===================== RENEW VIEW (ON-GOING TRAINING) =====================
  const RenewView = () => (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-[#0F2843] tracking-tighter uppercase">Payment</h1>
        <button className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <BellIcon className="w-6 h-6 text-[#0F2843]" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#E83831] border-2 border-white rounded-full" />
        </button>
      </div>

      <button
        onClick={() => setActiveView("main")}
        className="flex items-center gap-2 mb-8 group"
      >
        <ChevronLeftIcon className="w-4 h-4 text-gray-500 group-hover:text-[#0F2843] transition-colors" />
        <span className="text-sm text-gray-500 group-hover:text-[#0F2843] transition-colors">
          Back / <span className="font-bold text-[#0F2843]">Renew Payment</span>
        </span>
      </button>

      <div>
        <h3 className="text-sm font-bold text-gray-600 mb-5">On-going Training</h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#09314F] mx-auto" />
          </div>
        ) : activeCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 font-bold">No active trainings found.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {activeCourses.map((item, index) => {
              const iStatus = item.status?.toLowerCase();
              const isCancelled = iStatus === 'cancelled' || iStatus === 'removed' || iStatus === 'inactive';
              
              return (
                <div
                  key={item.enrollment_id || item.id || `active-${index}`}
                  className={`bg-white border rounded-xl p-5 hover:shadow-sm transition-all ${isCancelled ? 'border-red-100 bg-red-50/10' : 'border-gray-200'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[15px] font-bold text-[#0F2843]">
                        {item.course?.title || item.course_name || `Enrollment #${item.enrollment_id}`}
                      </h4>
                      <div>
                        {isCancelled ? (
                          <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-tighter border border-red-100 shadow-sm">
                            Cancelled
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-tighter border border-green-100 shadow-sm">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Sub: <span className="font-bold text-gray-700 ml-2 capitalize">{item.billing_cycle || "—"}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(item.start_date)} - {formatDate(item.end_date)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRenewClick(item)}
                    className={`mt-4 w-full py-2 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-[0.99] ${isCancelled ? 'bg-red-500 hover:bg-red-600' : 'bg-[#09314F] hover:bg-[#0a3d63]'}`}
                  >
                    {isCancelled ? "Re-enroll Training" : "Renew Training"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  // ===================== MODAL =====================
  const DurationModal = () => {
    const courseInfo = allCourses.find(c => Number(c.id) === Number(selectedPayment?.course_id));
    
    const handleSelect = (key) => {
      setSelectedDuration(key);
      const option = DURATION_OPTIONS.find(d => d.key === key);
      const price = calculatePrice(courseInfo?.price || 0, option.months);
      setCalculatedPrice(price);
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDurationModal(false)} />
        <div className="relative bg-white rounded-3xl p-8 md:p-10 w-[90%] max-w-md shadow-2xl z-10">
          <button onClick={() => setShowDurationModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-400">✕</button>
          <h2 className="text-2xl font-black text-[#09314F] mb-6 text-center">Select Duration</h2>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Training</p>
            <p className="font-black text-[#0F2843]">{selectedPayment?.course?.title || selectedPayment?.course_name}</p>
          </div>
          <div className="space-y-3 mb-8">
            {DURATION_OPTIONS.map((opt) => (
              <button key={opt.key} onClick={() => handleSelect(opt.key)} className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all ${selectedDuration === opt.key ? "border-[#09314F] bg-blue-50" : "border-gray-200 hover:border-[#09314F] bg-white"}`}>
                <span className={`font-bold text-sm ${selectedDuration === opt.key ? "text-[#09314F]" : "text-gray-600"}`}>{opt.label}</span>
                {selectedDuration === opt.key && <span className="text-[#09314F] font-bold">₦{calculatedPrice.toLocaleString()}</span>}
              </button>
            ))}
          </div>
          <button onClick={handleDurationContinue} className="w-full py-4 px-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-[0.98]">
            Proceed to Payment
          </button>
        </div>
      </div>
    );
  };


  return (
    <PaymentLayout>
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[120] px-6 py-4 rounded-2xl shadow-2xl text-white ${toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831] transition-all"}`}>
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}
      {showDurationModal && <DurationModal />}
      {showPaymentModal && <PaymentMethodModal />}
      
      <div className="p-6 max-w-5xl mx-auto w-full min-h-screen">
        {activeView === "main" ? (
          <MainView />
        ) : activeView === "renew" ? (
          <RenewView />
        ) : activeView === "add" ? (
          <AddTraining onBack={() => setActiveView("main")} />
        ) : (
          <RemoveTraining 
            activeCourses={activeCourses}
            loading={loading}
            fetchData={fetchData}
            setToast={setToast}
            setActiveView={setActiveView}
            API_BASE_URL={API_BASE_URL}
            token={token}
            formatDate={formatDate}
          />
        )}
      </div>

      {showPaymentModal && (
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedDuration={selectedDuration}
          amount={calculatedPrice}
          email={student?.email}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
          onContinue={handleRenewContinue}
          loading={renewLoading}
        />
      )}
    </PaymentLayout>
  );
}