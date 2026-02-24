import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import signup_img from "../../../assets/images/student_sign_up.jpg";
import Paystack from "../../../components/Paystack";

export default function GuardianTrainingPayment() {
  const navigate = useNavigate();

  const [guardianData, setGuardianData] = useState(null);
  const [selectedDurations, setSelectedDurations] = useState({});
  const [gateway, setGateway] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  /* ================= INIT ================= */
  useEffect(() => {
    const stored = localStorage.getItem("guardianStudentsDuration");

    if (!stored) {
      navigate("/register/guardian/training/duration");
      return;
    }

    const parsed = JSON.parse(stored);
    setGuardianData(parsed);

    // Aggregate all durations across all students for total calculation
    const allDurations = {};
    parsed.forEach((student, sIndex) => {
      Object.entries(student.selectedDurations || {}).forEach(
        ([courseId, duration]) => {
          allDurations[`${sIndex}_${courseId}`] = duration;
        }
      );
    });
    setSelectedDurations(allDurations);
  }, [navigate]);

  /* ================= TOTAL ================= */
  const totalAmount = useMemo(() => {
    return Object.values(selectedDurations)
      .filter(Boolean)
      .reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [selectedDurations]);

  /* ================= EMAIL ================= */
  const payerEmail = useMemo(() => {
    if (!guardianData?.length) return "guardian@example.com";
    return guardianData[0]?.email || "guardian@example.com";
  }, [guardianData]);

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
    if (!guardianData) return;

    setProcessing(true);

    try {
      // Loop through each guardian's student
      for (const student of guardianData) {
        const selectedSubjects = student.selectedSubjects;
        const studentId = student.id; 

        if (!studentId) {
          console.error(`No student ID found for ${student.firstname}`);
          alert(`Missing ID for ${student.firstname}. Skipping enrollment.`);
          continue;
        }

        // Loop through courses for this student
        for (const [courseId, duration] of Object.entries(
          student.selectedDurations
        )) {
          if (!duration) continue;

          console.log(
            `Starting enrollment for ${student.firstname} (ID: ${studentId}) - course ${courseId}...`
          );

          // 1️⃣ COURSE ENROLLMENT
          let courseEnrollmentId;
          try {
            const courseRes = await axios.post(
              `${API_BASE_URL}/api/course/enrollment`,
              {
                student_id: studentId,
                course_id: Number(courseId),
                billing_cycle: duration.duration,
              }
            );
            courseEnrollmentId = courseRes.data.enrollment.id;
            console.log(
              `Course ${courseId} enrolled successfully with ID ${courseEnrollmentId}`
            );
          } catch (err) {
            console.error(
              `Course enrollment failed for ${student.firstname} - course ${courseId}:`,
              err.response?.data || err
            );
            alert(
              `Enrollment failed for ${student.firstname} - course ${courseId}. Skipping.`
            );
            continue;
          }

          const paymentReference = `TC-G-${Date.now()}-${courseId}-${Math.floor(
            Math.random() * 1000
          )}`;

          // 2️⃣ SUBJECT ENROLLMENT
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
                err.response?.data || err
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
              paid_at: Date.now(),
              meta: {
                channel: response.channel,
                paid_at: response.paid_at,
              },
            });
            console.log(
              `Payment recorded for ${student.firstname} - course ${courseId}`
            );
          } catch (err) {
            console.error(
              `Payment recording failed for course ${courseId}:`,
              err.response?.data || err
            );
            alert(
              `Payment was successful for course ${courseId}, but logging failed.`
            );
          }
        }
      }

      // Cleanup guardian localStorage
      localStorage.removeItem("guardianTel");
      localStorage.removeItem("guardianStudents");
      localStorage.removeItem("guardianStudentsBiodata");
      localStorage.removeItem("guardianStudentsTraining");
      localStorage.removeItem("guardianStudentsSubjects");
      localStorage.removeItem("guardianStudentsDuration");
      navigate("/login");
    } catch (err) {
      console.error("Unexpected error during enrollment/payment:", err);
      alert("An unexpected error occurred. Please contact support.");
    } finally {
      setProcessing(false);
      closeModal();
    }
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* LEFT */}
      <div className="w-full md:w-1/2 bg-[#F4F4F4] px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        <div className="relative flex justify-center mb-6">
          <button
            onClick={() => navigate("/register/guardian/training/duration")}
            className="absolute left-0 p-2 hover:bg-gray-200 rounded-full"
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
            className="w-full mb-4 bg-white border rounded-lg px-4 py-4 font-semibold flex justify-between hover:bg-gray-50 transition-colors"
          >
            <span>{item}</span>
            <span>→</span>
          </button>
        ))}
      </div>

      {/* RIGHT */}
      <div
        className="w-full h-[192px] md:w-1/2 md:h-full bg-cover bg-center relative order-1 md:order-2"
        style={{ backgroundImage: `url(${signup_img})` }}
      >
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">{gateway} Payment</h2>

            <div className="text-2xl font-bold text-center mb-6">
              ₦{totalAmount.toLocaleString()}
            </div>

            {gateway === "Paystack" && (
              <Paystack
                amount={totalAmount}
                email={payerEmail}
                reference={`TC-G-${Date.now()}`}
                onSuccess={handlePaystackSuccess}
                onClose={closeModal}
              />
            )}

            <button
              onClick={closeModal}
              disabled={processing}
              className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
