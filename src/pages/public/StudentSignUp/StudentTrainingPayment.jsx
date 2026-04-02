import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import signup_img from "../../../assets/images/Student_sign_up.jpg";
import Paystack from "../../../components/Paystack";

export const StudentTrainingPayment = () => {
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(null);
  const [selectedDurations, setSelectedDurations] = useState({});
  const [gateway, setGateway] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Base URL for API, using environment variable with fallback
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
    
  /* ================= INIT ================= */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("studentdata"));

    if (!stored?.data || !stored?.selectedDurations) {
      navigate("/register/student");
      return;
    }

    setStudentData(stored);
    setSelectedDurations(stored.selectedDurations);
  }, [navigate]);

  /* ================= TOTAL ================= */
  const totalAmount = useMemo(() => {
    return Object.values(selectedDurations)
      .filter(Boolean)
      .reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [selectedDurations]);

  /* ================= EMAIL ================= */
  const payerEmail = useMemo(() => {
    // If student has an email, use it. Otherwise, use phone number as a identifier for Paystack.
    // Paystack requires a valid email format, so we append a dummy domain if it's a phone.
    const email = studentData?.data?.email;
    const tel = studentData?.data?.tel;
    
    if (email) return email;
    if (tel) return `${tel}@tutorialcenter.gmail.com`;
    
    return "codewithpidgin@gmail.com";
  }, [studentData]);

  /* ================= MODAL ================= */
  const openGateway = (selected) => {
    setGateway(selected);
    setShowModal(true);
  };

  const closeModal = () => {
    if (!processing) {
      setShowModal(false);
      setGateway(null);
    }
  };

  /* ================= PAYSTACK SUCCESS ================= */
  const handlePaystackSuccess = async (response) => {
    // Robust email retrieval from localStorage
    const storedData = JSON.parse(localStorage.getItem("studentdata"));
    const storedInfo = JSON.parse(localStorage.getItem("student_info"));
    const studentEmail = storedData?.data?.email || storedInfo?.email || storedInfo?.data?.email;
    const studentTel = storedData?.data?.tel || storedInfo?.tel || storedInfo?.data?.tel; 

    
    if (!studentEmail && !studentTel) {
      alert("Student email or phone number not found. Please re-register or log in.");
      return;
    }

    setProcessing(true);

    try {
      const studentId = studentData.data.id;
      const selectedSubjects = studentData.selectedSubjects;

      // Loop through courses sequentially
      for (const [courseId, duration] of Object.entries(selectedDurations)) {
        console.log(`Starting enrollment for course ${courseId}...`);

        // 1️⃣ COURSE ENROLLMENT
        let courseEnrollmentId;
        try {
          const courseRes = await axios.post(
            `${API_BASE_URL}/api/course/enrollment`,
            {
              student_id: studentId,
              course_id: Number(courseId),
              billing_cycle: duration.duration,
            },
          );
          courseEnrollmentId = courseRes.data.enrollment.id;
          console.log(
            `Course ${courseId} enrolled successfully with ID ${courseEnrollmentId}`,
          );
        } catch (err) {
          console.error(
            `Course enrollment failed for course ${courseId}:`,
            err.response?.data || err,
          );
          alert(
            `Enrollment failed for course ${courseId}. Skipping to next course.`,
          );
          continue; // Skip to next course
        }
        const paymentReference = `TC-${Date.now()}-${courseId}-${Math.floor(Math.random() * 1000)}`;
        // 2️⃣ SUBJECT ENROLLMENT (sequentially)
        const subjects = selectedSubjects?.[courseId] || [];
        for (const subjectId of subjects) {
          try {
            await axios.post(`${API_BASE_URL}/api/subject/enrollment`, {
              student_id: studentId,
              course_enrollment_id: courseEnrollmentId,
              subject_id: subjectId,
            });
            console.log(`Subject ${subjectId} enrolled successfully`);
          } catch (err) {
            console.error(
              `Subject enrollment failed for subject ${subjectId}:`,
              err.response?.data || err,
            );
            alert(`Enrollment failed for subject ${subjectId}.`);
          }
        }

        

        // 3️⃣ PAYMENT RECORD
        try {
          await axios.post(`${API_BASE_URL}/api/payments`, {
            student_id: studentId,
            course_enrollment_id: courseEnrollmentId,
            amount: duration.price,
            billing_cycle: duration.duration,
            payment_method: "card",
            gateway: "paystack",
            status: "successful",
            gateway_reference: paymentReference,
            paid_at: new Date().toISOString(),
            email: studentEmail || studentTel,
            meta: {
              channel: response.channel,
              paid_at: response.paid_at,
            },
          });
          console.log(`Payment recorded for course ${courseId}`);
        } catch (err) {
          console.error(
            `Payment recording failed for course ${courseId}:`,
            err.response?.data || err,
          );
          alert(
            `Payment was successful for course ${courseId}, but logging failed.`,
          );
        }
      }

      // Cleanup
      localStorage.removeItem("studentEmail");
      localStorage.removeItem("studentTel");
      navigate("/register/student/training/payment/success");
    } catch (err) {
      console.error("Unexpected error during enrollment/payment:", err);
      alert("An unexpected error occurred. Please contact support.");
    } finally {
      setProcessing(false);
      closeModal();
    }
  };
  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full md:w-1/2 bg-[#F4F4F4] px-6 py-10 lg:px-[100px]">
        <div className="relative flex justify-center mb-6">
          <button
            onClick={() => navigate("/register/student/training/duration")}
            className="absolute left-0 p-2"
          >
            <img src={ReturnArrow} alt="Back" className="h-6 w-6" />
          </button>
          <img src={TC_logo} alt="Logo" className="h-[70px]" />
        </div>

        <h1 className="text-center text-2xl font-bold text-[#09314F] mb-6">
          Select Payment Method
        </h1>

        <div className="bg-white rounded-lg p-4 mb-6 border">
          <div className="flex justify-between font-bold">
            <span>Total Payable</span>
            <span>₦{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {["Paystack", "Flutterwave", "PayPal", "Interswitch"].map((item) => (
          <button
            key={item}
            onClick={() => openGateway(item)}
            className="w-full mb-4 bg-white border rounded-lg px-4 py-4 font-semibold flex justify-between"
          >
            <span>{item}</span>
            <span>→</span>
          </button>
        ))}
      </div>

      {/* RIGHT */}
      <div
        className="w-full md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${signup_img})` }}
      />

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-6 relative">
            <h2 className="text-xl font-bold mb-4">{gateway} Payment</h2>

            <div className="text-2xl font-bold text-center mb-6">
              ₦{totalAmount.toLocaleString()}
            </div>

            {gateway === "Paystack" && (
              <Paystack
                amount={totalAmount}
                email={payerEmail}
                reference={`TC-${Date.now()}`}
                onSuccess={handlePaystackSuccess}
                onClose={closeModal}
              />
            )}

            <button
              onClick={closeModal}
              disabled={processing}
              className="mt-4 w-full text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* LOADING OVERLAY */}
      {processing && (
        <div className="fixed inset-0 bg-[#09314F]/80 backdrop-blur-sm z-[100] flex items-center justify-center transition-all duration-500">
           <div className="bg-white p-10 rounded-[32px] shadow-2xl flex flex-col items-center max-w-[400px] text-center mx-4 animate-in zoom-in-95 duration-300">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-gray-100 border-t-[#E83831] rounded-full animate-spin"></div>
                <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center">
                   <div className="w-12 h-12 bg-[#09314F] rounded-2xl flex items-center justify-center shadow-lg transform rotate-45 animate-pulse">
                      <div className="w-6 h-6 bg-white rounded-full -rotate-45"></div>
                   </div>
                </div>
              </div>
              <h2 className="text-2xl font-black text-[#09314F] mb-3 uppercase tracking-tighter italic">Authenticating Payment</h2>
              <p className="text-gray-400 font-bold text-sm leading-relaxed">
                 We are confirming your transaction and setting up your training dashboard.<br/> 
                 <span className="text-[#E83831] animate-pulse">Please do not refresh this page.</span>
              </p>
           </div>
        </div>
      )}
    </div>
  );
};
