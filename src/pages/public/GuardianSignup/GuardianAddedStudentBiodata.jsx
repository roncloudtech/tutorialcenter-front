import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { location } from "../../../data/locations";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import signup_img from "../../../assets/images/student_sign_up.jpg";
import { 
  UserIcon, 
  CalendarIcon, 
  MapPinIcon, 
  AcademicCapIcon, 
  FlagIcon,
  ChevronLeftIcon,
  CameraIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";

export default function GuardianAddedStudentBiodata() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Each student will have their own biodata + expanded state
  const [studentsBiodata, setStudentsBiodata] = useState([]);

  // Load students from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("guardianStudents");
    if (stored) {
      const parsed = JSON.parse(stored);
      const studentsWithBiodata = parsed.students.map((student, index) => ({
        // Info from previous page
        name: student.name,
        email: student.email,
        // Biodata fields
        firstname: student.name.split(" ")[0] || "",
        surname: student.name.split(" ").slice(1).join(" ") || "",
        gender: "",
        date_of_birth: "",
        location: "",
        address: "",
        department: "",
        display_picture: null,
        // UI state
        expanded: index === 0,
      }));
      setStudentsBiodata(studentsWithBiodata);
    } else {
      // No students found, redirect back
      navigate("/register/guardian/addstudent");
    }
  }, [navigate]);

  // Toggle a student's accordion
  const toggleStudent = (index) => {
    setStudentsBiodata((prev) =>
      prev.map((s, i) => (i === index ? { ...s, expanded: !s.expanded } : s))
    );
  };

  // Update a biodata field for a specific student
  const handleChange = (index, field, value) => {
    setStudentsBiodata((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setToast({ type: "error", message: "Please upload an image file." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(index, "display_picture", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setStudentsBiodata((prev) =>
      prev.map((s, i) => (i === index ? { ...s, isDragging: true } : s))
    );
  };

  const handleDragLeave = (index) => {
    setStudentsBiodata((prev) =>
      prev.map((s, i) => (i === index ? { ...s, isDragging: false } : s))
    );
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    setStudentsBiodata((prev) =>
      prev.map((s, i) => (i === index ? { ...s, isDragging: false } : s))
    );
    handleFileChange(index, e);
  };

  // Validate all students' biodata
  const validateForm = () => {
    const newErrors = {};

    studentsBiodata.forEach((student, i) => {
      if (!student.firstname.trim()) {
        newErrors[`${i}_firstname`] = "First name is required";
      }
      if (!student.surname.trim()) {
        newErrors[`${i}_surname`] = "Last name is required";
      }
      if (!student.gender) {
        newErrors[`${i}_gender`] = "Gender is required";
      }
      if (!student.date_of_birth) {
        newErrors[`${i}_date_of_birth`] = "Date of birth is required";
      }
      if (!student.location.trim()) {
        newErrors[`${i}_location`] = "Location is required";
      }
      // Address is optional in mockup
      if (!student.department.trim()) {
        newErrors[`${i}_department`] = "Department is required";
      }
    });

    setErrors(newErrors);

    // If there are errors, expand the first student section that has errors
    if (Object.keys(newErrors).length > 0) {
      const firstErrorIndex = parseInt(Object.keys(newErrors)[0].split("_")[0]);
      setStudentsBiodata((prev) =>
        prev.map((s, i) => ({
          ...s,
          expanded: i === firstErrorIndex,
        }))
      );
    }

    return Object.keys(newErrors).length === 0;
  };

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // Handle form submission — register students and save biodata
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const storedGuardianData = JSON.parse(
      localStorage.getItem("guardianStudents") || "{}"
    );
    const generalPassword = storedGuardianData.password || "Password@123";
    console.log("Guardian data from localStorage:", storedGuardianData);
console.log("Password being used:", generalPassword);

    try {
      const updatedStudents = [];

      for (let i = 0; i < studentsBiodata.length; i++) {
        const student = studentsBiodata[i];
        
        const trimmedEntry = student.email ? student.email.trim() : "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmail = emailRegex.test(trimmedEntry);

        const registerPayload = {
          email: isEmail ? trimmedEntry : null,
          tel: isEmail ? null : trimmedEntry,
          password: generalPassword,
          confirmPassword: generalPassword,
        };

        try {
          const regResponse = await axios.post(
            `${API_BASE_URL}/api/students/register`,
            registerPayload
          );
          console.log("student registered", regResponse.data);
        } catch (regErr) {
          console.error("Registration FAILED for:", student.name);
  console.error("Status:", regErr.response?.status);
  console.error("Errors:", regErr.response?.data?.errors);
  console.error("Message:", regErr.response?.data?.message);
  console.error("Payload sent:", registerPayload);
          console.warn(
            `Registration warning for ${student.name}:`,
            regErr.response?.data
          );
           setToast({
    type: "error",
    message: `Failed to register ${student.name}: ${regErr.response?.data?.message || regErr.message}`
  });
        }

        const biodataPayload = {
          firstname: student.firstname,
          surname: student.surname,
          email: isEmail ? trimmedEntry : null,
          tel: isEmail ? null : trimmedEntry,
          gender: student.gender,
          date_of_birth: student.date_of_birth,
          location: student.location,
          address: student.address,
          department: student.department,
        };

        const bioRes = await axios.post(
          `${API_BASE_URL}/api/students/biodata`,
          biodataPayload
        );

        if (bioRes.data && bioRes.data.student) {
          updatedStudents.push({
            ...student,
            ...bioRes.data.student, 
          });
        } else {
          throw new Error(`Failed to retrieve student ID for ${student.name}`);
        }
      }

      localStorage.setItem(
        "guardianStudentsBiodata",
        JSON.stringify(updatedStudents)
      );

      setToast({ type: "success", message: "All students registered successfully!" });

      setTimeout(() => {
        setLoading(false);
        navigate("/register/guardian/training/selection");
      }, 1500);

    } catch (err) {
      console.error("Error in student registration loop:", err);
      setToast({
        type: "error",
        message: err.message || "Failed to register students.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-xl shadow-2xl text-white transition-all duration-300 transform translate-y-0 scale-100 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* LEFT SIDE: Content Area */}
      <div className="w-full md:w-1/2 h-full bg-[#F8F9FA] flex flex-col items-center py-8 px-4 overflow-y-auto order-2 md:order-1">
        {/* Header with Back Arrow and Title */}
        <div className="w-full max-w-lg mb-8">
          <div className="flex items-center relative h-12 mb-4">
            <button
              onClick={() => navigate("/register/guardian/addstudent")}
              className="absolute left-0 p-3 hover:bg-white rounded-full transition-all duration-200 shadow-sm"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
            </button>
            <div className="w-full flex justify-center">
              <h1 className="text-2xl font-extrabold text-[#333333] tracking-tight">
                Student Biodata
              </h1>
            </div>
          </div>
          <p className="text-center text-[#666666] font-medium">
            Filling in your student biometric data.
          </p>
        </div>

        {/* White Card Container */}
        <div className="w-full max-w-lg bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 border border-gray-50 mb-10">
          <div className="w-full space-y-8">
            {studentsBiodata.map((student, index) => (
              <div key={index} className="w-full">
                {/* Accordion Toggle (For multiple students) */}
                {studentsBiodata.length > 1 && (
                  <button
                    onClick={() => toggleStudent(index)}
                    className="w-full mb-6 flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-[#333333]">Student {index + 1}: {student.name}</span>
                    <ChevronLeftIcon className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${student.expanded ? "-rotate-90" : "rotate-0"}`} />
                  </button>
                )}

                {student.expanded && (
                  <div className="space-y-8 animate-fadeIn">
                    {/* Display Picture Section */}
                  <div className="flex flex-col items-center mb-8">
                    <div 
                      className={`relative group p-2 rounded-full transition-all duration-200 ${student.isDragging ? "bg-[#E8383111] scale-105" : ""}`}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={() => handleDragLeave(index)}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className={`w-32 h-32 rounded-full border-4 ${student.isDragging ? "border-[#E83831] border-dashed" : "border-[#FDF2F2]"} overflow-hidden bg-gray-100 shadow-inner flex items-center justify-center transition-all duration-200`}>
                        {student.display_picture ? (
                          <img src={student.display_picture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircleIcon className="w-24 h-24 text-gray-300" />
                        )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-gray-100 hover:scale-110 transition-transform"
                      >
                        <CameraIcon className="h-5 w-5 text-[#E83831]" />
                      </button>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        hidden 
                        accept="image/*"
                        onChange={(e) => handleFileChange(index, e)}
                      />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#888888]">
                      Display picture <span className="text-gray-300 font-normal">(optional)</span>
                    </p>
                  </div>

                    {/* Input Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                      {/* First Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#444444] px-1">First Name</label>
                        <div className={`flex items-center bg-[#F7EFEF] rounded-2xl px-4 py-4 border-2 transition-all ${errors[`${index}_firstname`] ? "border-red-400" : "border-transparent focus-within:border-[#09314F]"}`}>
                          <UserIcon className="h-5 w-5 text-gray-600 mr-3" />
                          <input
                            type="text"
                            value={student.firstname}
                            onChange={(e) => handleChange(index, "firstname", e.target.value)}
                            placeholder="First Name"
                            className="bg-transparent w-full outline-none text-[#333333] font-semibold placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#444444] px-1">Last Name</label>
                        <div className={`flex items-center bg-[#F7EFEF] rounded-2xl px-4 py-4 border-2 transition-all ${errors[`${index}_surname`] ? "border-red-400" : "border-transparent focus-within:border-[#09314F]"}`}>
                          <UserIcon className="h-5 w-5 text-gray-600 mr-3" />
                          <input
                            type="text"
                            value={student.surname}
                            onChange={(e) => handleChange(index, "surname", e.target.value)}
                            placeholder="Last Name"
                            className="bg-transparent w-full outline-none text-[#333333] font-semibold placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#444444] px-1">Date of Birth</label>
                        <div className={`flex items-center bg-[#F7EFEF] rounded-2xl px-4 py-4 border-2 transition-all ${errors[`${index}_date_of_birth`] ? "border-red-400" : "border-transparent focus-within:border-[#09314F]"}`}>
                          <CalendarIcon className="h-5 w-5 text-gray-600 mr-3" />
                          <input
                            type="date"
                            value={student.date_of_birth}
                            onChange={(e) => handleChange(index, "date_of_birth", e.target.value)}
                            className="bg-transparent w-full outline-none text-[#333333] font-semibold"
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#444444] px-1">Gender</label>
                        <div className={`flex items-center bg-[#F7EFEF] rounded-2xl px-4 py-4 border-2 transition-all ${errors[`${index}_gender`] ? "border-red-400" : "border-transparent focus-within:border-[#09314F]"}`}>
                          <UserCircleIcon className="h-6 w-6 text-gray-600 mr-3" />
                          <select
                            value={student.gender}
                            onChange={(e) => handleChange(index, "gender", e.target.value)}
                            className="bg-transparent w-full outline-none text-[#333333] font-semibold appearance-none cursor-pointer"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="others">Others</option>
                          </select>
                          <ChevronLeftIcon className="h-5 w-5 text-gray-500 -rotate-90 pointer-events-none" />
                        </div>
                      </div>

                      {/* Department */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#444444] px-1">Department</label>
                        <div className={`flex items-center bg-[#F7EFEF] rounded-2xl px-4 py-4 border-2 transition-all ${errors[`${index}_department`] ? "border-red-400" : "border-transparent focus-within:border-[#09314F]"}`}>
                          <AcademicCapIcon className="h-6 w-6 text-gray-600 mr-3" />
                          <select
                            value={student.department}
                            onChange={(e) => handleChange(index, "department", e.target.value)}
                            className="bg-transparent w-full outline-none text-[#333333] font-semibold appearance-none cursor-pointer"
                          >
                            <option value="">Select Department</option>
                            <option value="art">Art</option>
                            <option value="science">Science</option>
                            <option value="commercial">Commercial</option>
                          </select>
                          <ChevronLeftIcon className="h-5 w-5 text-gray-500 -rotate-90 pointer-events-none" />
                        </div>
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#444444] px-1">Location</label>
                        <div className={`flex items-center bg-[#F7EFEF] rounded-2xl px-4 py-4 border-2 transition-all ${errors[`${index}_location`] ? "border-red-400" : "border-transparent focus-within:border-[#09314F]"}`}>
                          <MapPinIcon className="h-6 w-6 text-gray-600 mr-3" />
                          <input
                            list={`nigeria-states-${index}`}
                            value={student.location}
                            onChange={(e) => handleChange(index, "location", e.target.value)}
                            placeholder="Location"
                            className="bg-transparent w-full outline-none text-[#333333] font-semibold"
                          />
                          <ChevronLeftIcon className="h-5 w-5 text-gray-500 -rotate-90 pointer-events-none" />
                          <datalist id={`nigeria-states-${index}`}>
                            {location.map((loc) => (
                              <option key={loc.code} value={`${loc.state}, ${loc.country}`} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-bold text-[#444444] px-1">
                        Address <span className="text-gray-400 font-normal ml-1">(optional)</span>
                      </label>
                      <div className="flex items-start bg-[#F7EFEF] rounded-2xl px-4 py-4 border-2 border-transparent focus-within:border-[#09314F] transition-all">
                        <FlagIcon className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                        <textarea
                          value={student.address}
                          onChange={(e) => handleChange(index, "address", e.target.value)}
                          placeholder="Input address"
                          rows="1"
                          className="bg-transparent w-full outline-none text-[#333333] font-semibold placeholder:text-gray-400 resize-none py-0.5"
                        />
                      </div>
                      <button className="text-[12px] font-bold text-[#0091FF] flex items-center gap-1.5 px-1 hover:underline transition-all">
                        <div className="w-4 h-4 rounded-full border-2 border-[#0091FF] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#0091FF] rounded-full" />
                        </div>
                        Use current location on map.
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Continue Button */}
            <div className="pt-8">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-5 rounded-[20px] font-bold text-lg text-white shadow-xl transition-all active:scale-[0.98] ${
                  loading
                    ? "bg-gray-400 opacity-70 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:shadow-[#E8383155] hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer / Logo branding at bottom of left side */}
        <div className="flex flex-col items-center opacity-40 grayscale mt-auto py-10">
          <img src={TC_logo} alt="Logo" className="h-12" />
        </div>
      </div>

      {/* RIGHT SIDE: Visual Image */}
      <div
        className="w-full h-[300px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2"
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

