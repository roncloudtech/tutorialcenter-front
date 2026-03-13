// pages/students/StudentPaymentDisplay.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PaymentLayout from "../../components/private/Student/PaymentLayout.jsx";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function StudentPaymentDisplay() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const token = localStorage.getItem("student_token");

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/students/payments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Payments response:", response.data);
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to load payments"
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRemovePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to remove this payment?")) return;

    try {
      // TODO: Implement remove payment endpoint
      console.log("Removing payment:", paymentId);
      
      setToast({
        type: "success",
        message: "Payment removed successfully"
      });
      
      fetchPayments();
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to remove payment"
      });
    }
  };

  return (
    <PaymentLayout onPaymentAdded={fetchPayments}>
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white transition-all duration-500 ${
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/20 rounded-full">
              {toast.type === "success" ? "✓" : "✕"}
            </div>
            <p className="font-bold text-sm">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
        >
          <ChevronLeftIcon className="w-6 h-6 text-[#09314F] dark:text-white" />
        </button>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Back / Renew Payment</p>
        </div>
      </div>

      {/* Ongoing Training Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#09314F] dark:text-white mb-6">Ongoing Training</h2>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#09314F] dark:border-white mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No active payments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Course Name */}
                    <h3 className="text-lg font-bold text-[#09314F] dark:text-white mb-2">
                      Course Enrollment #{payment.course_enrollment_id}
                    </h3>

                    {/* Payment Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Subscription</p>
                        <p className="text-gray-800 dark:text-gray-200 font-bold capitalize">
                          {payment.billing_cycle}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Status</p>
                        <p className={`font-bold capitalize ${
                          payment.status === 'successful' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {payment.status}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Amount</p>
                        <p className="text-gray-800 dark:text-gray-200 font-bold">
                          {payment.currency} {parseFloat(payment.amount).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Paid At</p>
                        <p className="text-gray-800 dark:text-gray-200 font-bold">
                          {new Date(payment.paid_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleRemovePayment(payment.id)}
                    className="w-full py-3 bg-[#09314F] dark:bg-gray-700 text-white font-bold rounded-xl hover:bg-opacity-90 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PaymentLayout>
  );
}