import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { location } from "../../../data/locations";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import signup_img from "../../../assets/images/Student_sign_up.jpg";
import { dropdownTheme } from "../../../utils/dropdownTheme";
import { 
  UserIcon, 
  CalendarIcon, 
  MapPinIcon, 
  AcademicCapIcon, 
  ChevronLeftIcon,
  CameraIcon,
  UserCircleIcon,
  MapIcon
} from "@heroicons/react/24/outline";

export default function GuardianAddedStudentBiodata() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null); // format: "index_fieldName"
  const [isDraggingIndex, setIsDraggingIndex] = useState(null);
  const fileInputRef = useRef(null);
  const [activeFileIndex, setActiveFileIndex] = useState(null);

  const [studentsBiodata, setStudentsBiodata] = useState([]);

 useEffect(() => {
  // Get current guardian's students
  const currentStudents = localStorage.getItem("guardianStudents");
  
  if (!currentStudents) {
    navigate("/register/guardian/addstudent");
    return;
  }

  const currentParsed = JSON.parse(currentStudents);
  
  // Check if saved biodata exists
  const savedBiodata = localStorage.getItem("guardianStudentsBiodata");
  
  if (savedBiodata) {
    try {
      const savedParsed = JSON.parse(savedBiodata);
      
      // ✅ VERIFY: Does saved biodata match current students?
      const emailsMatch = 
        savedParsed.length === currentParsed.students.length &&
        savedParsed.every((saved, idx) => 
          saved.email === currentParsed.students[idx].email
        );

      if (emailsMatch) {
        // ✅ Biodata belongs to current session - load it
        setStudentsBiodata(savedParsed);
        return;
      } else {
        // ❌ Biodata is from a different guardian - clear it
        console.log("Clearing old biodata from different guardian");
        localStorage.removeItem("guardianStudentsBiodata");
      }
    } catch (err) {
      console.error("Failed to load saved biodata:", err);
      localStorage.removeItem("guardianStudentsBiodata");
    }
  }

  // Load fresh data from guardianStudents
  const studentsWithBiodata = currentParsed.students.map((student, index) => ({
    name: student.name,
    email: student.email,
    firstname: student.name.split(" ")[0] || "",
    surname: student.name.split(" ").slice(1).join(" ") || "",
    gender: "",
    date_of_birth: "",
    location: "",
    address: "",
    department: "",
    display_picture: null,
    expanded: index === 0,
  }));
  
  setStudentsBiodata(studentsWithBiodata);
}, [navigate]);

  // Auto-save biodata to localStorage whenever studentsBiodata changes
  useEffect(() => {
    if (studentsBiodata.length > 0) {
      localStorage.setItem("guardianStudentsBiodata", JSON.stringify(studentsBiodata));
    }
  }, [studentsBiodata]);

  const toggleStudent = (index) => {
    setStudentsBiodata((prev) =>
      prev.map((s, i) => (i === index ? { ...s, expanded: !s.expanded } : s))
    );
  };

  const handleChange = (index, field, value) => {
    setStudentsBiodata((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingIndex(null);
  };

  const handleDrop = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingIndex(null);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(index, { target: { files } });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    studentsBiodata.forEach((student, i) => {
      if (!student.firstname.trim()) newErrors[`${i}_firstname`] = "Required";
      if (!student.surname.trim()) newErrors[`${i}_surname`] = "Required";
      if (!student.gender) newErrors[`${i}_gender`] = "Required";
      if (!student.date_of_birth) newErrors[`${i}_date_of_birth`] = "Required";
      if (!student.location.trim()) newErrors[`${i}_location`] = "Required";
      if (!student.department.trim()) newErrors[`${i}_department`] = "Required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updatedStudents = [];
      for (let i = 0; i < studentsBiodata.length; i++) {
        const student = studentsBiodata[i];
        const trimmedEntry = student.email ? student.email.trim() : "";
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEntry);

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
          display_picture: student.display_picture,
        };

        const bioRes = await axios.post(`${API_BASE_URL}/api/Students/biodata`, biodataPayload);
        if (bioRes.data && bioRes.data.student) {
          updatedStudents.push({
            ...student,
            ...bioRes.data.student,
            display_picture: null,
          });
        }
      }

      localStorage.setItem("guardianStudentsBiodata", JSON.stringify(updatedStudents));
      setToast({ type: "success", message: "All biodata submitted successfully!" });
      setTimeout(() => navigate("/register/guardian/training/selection"), 2000);
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to process data." });
    } finally {
      setLoading(false);
    }
  };

  const getInputStyles = (index, fieldName) => {
    const student = studentsBiodata[index];
    const hasValue = !!student[fieldName];
    const fieldId = `${index}_${fieldName}`;
    const isFocused = focusedField === fieldId;
    const hasError = !!errors[fieldId];
    return {
      container: dropdownTheme.inputContainer(hasError, isFocused),
      input: dropdownTheme.getValueStyle(hasValue),
      icon: dropdownTheme.iconStyle(hasValue, isFocused)
    };
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white transition-all duration-500 transform translate-y-0 ${
            toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831]"
          } animate-in fade-in slide-in-from-top-4`}
        >
          <div className="flex items-center gap-3 text-sm">
             <div className="p-1 bg-white/20 rounded-full">
               {toast.type === "success" ? "✓" : "✕"}
             </div>
             <p className="font-bold">{toast.message}</p>
          </div>
        </div>
      )}

      {/* LEFT SIDE: Content Area */}
      <div className="w-full md:w-1/2 h-full bg-[#F8F9FA] flex flex-col items-center py-8 px-6 lg:px-[100px] overflow-y-auto order-2 md:order-1">
        
        {/* Header Section */}
        <div className="w-full max-w-[480px] mb-8 text-center">
          <div className="flex items-center relative h-12 mb-6">
            <button 
              onClick={() => navigate("/register/guardian/addstudent")}
              className="absolute left-0 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90"
            >
              <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5]" />
            </button>
            <div className="w-full flex justify-center">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#09314F]">
                Student Biodata
              </h1>
            </div>
          </div>
          <p className="text-[#888888] font-medium">
            Filling in your student biometric data.
          </p>
        </div>

        {/* Card Container */}
        <div className="w-full max-w-[480px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 md:p-10 border border-gray-100">
          <div className="space-y-10">
            {studentsBiodata.map((student, index) => (
              <div key={index} className="space-y-8 animate-fadeIn">
                {/* Accordion Header (If multiple students) */}
                {studentsBiodata.length > 1 && (
                  <button 
                    onClick={() => toggleStudent(index)}
                    className="w-full flex items-center justify-between p-5 bg-[#F7EFEF] rounded-2xl hover:bg-[#FDF2F2] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#09314F] text-white flex items-center justify-center text-xs font-black">
                        {index + 1}
                      </div>
                      <span className="font-black text-[#09314F] uppercase tracking-wider">{student.name}</span>
                    </div>
                    <ChevronLeftIcon className={`h-5 w-5 text-[#09314F] transition-transform duration-300 ${student.expanded ? "-rotate-90" : "rotate-0"}`} />
                  </button>
                )}

                {student.expanded && (
                  <div className="space-y-8">
                    {/* Profile Upload */}
                    <div className="flex flex-col items-center w-full">
                      <div 
                        onClick={() => {
                          setActiveFileIndex(index);
                          fileInputRef.current.click();
                        }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(index, e)}
                        onMouseEnter={() => setIsDraggingIndex(null)}
                        className="relative cursor-pointer group"
                      >
                        <div className={`w-24 h-24 rounded-full border-4 transition-all group-hover:scale-105 overflow-hidden flex items-center justify-center ${
                          isDraggingIndex === index
                            ? "border-[#09314F] bg-blue-50 scale-105"
                            : "border-[#FDF2F2] bg-[#F7EFEF]"
                        }`} style={{
                          boxShadow: isDraggingIndex === index ? "0 0 25px rgba(9, 49, 79, 0.6), 0 0 50px rgba(59, 130, 246, 0.4)" : "none"
                        }}>
                          {student.display_picture ? (
                            <img src={student.display_picture} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center text-[#888888]">
                              <CameraIcon className="w-7 h-7 mb-0.5" />
                              <span className="text-[8px] font-bold uppercase tracking-wider">Upload Photo</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-1 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-50 group-hover:rotate-12 transition-transform">
                          <CameraIcon className="h-3.5 w-3.5 text-[#E83831]" />
                        </div>
                      </div>
                      <p className="mt-3 text-[10px] font-bold text-[#888888] uppercase tracking-widest">
                        Display picture <span className="text-gray-300 font-normal lowercase">(optional)</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* First Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#555555] uppercase tracking-widest px-1">First Name</label>
                        <div className={getInputStyles(index, "firstname").container}>
                          <UserIcon className={getInputStyles(index, "firstname").icon} />
                          <input
                            type="text"
                            value={student.firstname}
                            onChange={(e) => handleChange(index, "firstname", e.target.value)}
                            onFocus={() => setFocusedField(`${index}_firstname`)}
                            onBlur={() => setFocusedField(null)}
                            placeholder="first name"
                            className={getInputStyles(index, "firstname").input}
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#555555] uppercase tracking-widest px-1">Last Name</label>
                        <div className={getInputStyles(index, "surname").container}>
                          <UserIcon className={getInputStyles(index, "surname").icon} />
                          <input
                            type="text"
                            value={student.surname}
                            onFocus={() => setFocusedField(`${index}_surname`)}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => handleChange(index, "surname", e.target.value)}
                            placeholder="last name"
                            className={getInputStyles(index, "surname").input}
                          />
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#555555] uppercase tracking-widest px-1">Date of Birth</label>
                        <div className={`${getInputStyles(index, "date_of_birth").container} relative`}>
                          <CalendarIcon className={getInputStyles(index, "date_of_birth").icon} />
                          <input
                            type="date"
                            value={student.date_of_birth}
                            onFocus={() => setFocusedField(`${index}_date_of_birth`)}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => handleChange(index, "date_of_birth", e.target.value)}
                            className={getInputStyles(index, "date_of_birth").input}
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#555555] uppercase tracking-widest px-1">Gender</label>
                        <div className={getInputStyles(index, "gender").container}>
                          <UserCircleIcon className={getInputStyles(index, "gender").icon} />
                          <select
                            value={student.gender}
                            onFocus={() => setFocusedField(`${index}_gender`)}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => handleChange(index, "gender", e.target.value)}
                            className={`${getInputStyles(index, "gender").input} ${dropdownTheme.select}`}
                          >
                            <option value="">select ge...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="others">Others</option>
                          </select>
                          <ChevronLeftIcon className={dropdownTheme.chevron} />
                        </div>
                      </div>

                      {/* Department */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#555555] uppercase tracking-widest px-1">Deparment</label>
                        <div className={getInputStyles(index, "department").container}>
                          <AcademicCapIcon className={getInputStyles(index, "department").icon} />
                          <select
                            value={student.department}
                            onFocus={() => setFocusedField(`${index}_department`)}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => handleChange(index, "department", e.target.value)}
                            className={`${getInputStyles(index, "department").input} ${dropdownTheme.select}`}
                          >
                            <option value="">select dep...</option>
                            <option value="art">Art</option>
                            <option value="science">Science</option>
                            <option value="commercial">Commercial</option>
                          </select>
                          <ChevronLeftIcon className={dropdownTheme.chevron} />
                        </div>
                      </div>

                      {/* Location */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#555555] uppercase tracking-widest px-1">Location</label>
                        <div className={getInputStyles(index, "location").container}>
                          <MapPinIcon className={getInputStyles(index, "location").icon} />
                          <input
                            list={`nigeria-states-${index}`}
                            value={student.location}
                            onFocus={() => setFocusedField(`${index}_location`)}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => handleChange(index, "location", e.target.value)}
                            placeholder="input locat..."
                            className={getInputStyles(index, "location").input}
                          />
                          <ChevronLeftIcon className={dropdownTheme.chevron} />
                          <datalist id={`nigeria-states-${index}`}>
                            {location.map((loc) => (
                              <option key={loc.code} value={`${loc.state}, ${loc.country}`} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#555555] uppercase tracking-widest px-1">
                        Address <span className="text-gray-300 font-normal lowercase">(optional)</span>
                      </label>
                      <div className={getInputStyles(index, "address").container}>
                        <MapIcon className={getInputStyles(index, "address").icon} />
                        <textarea
                          rows="1"
                         value={student.address || ""}  
                          onFocus={() => setFocusedField(`${index}_address`)}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => handleChange(index, "address", e.target.value)}
                          placeholder="input address"
                          className={`${getInputStyles(index, "address").input} resize-none`}
                        />
                      </div>
                      <button type="button" className="text-[9px] font-bold text-[#0091FF] flex items-center gap-1 mt-0.5 hover:underline px-1">
                        <div className="w-2.5 h-2.5 rounded-full border border-[#0091FF] flex items-center justify-center">
                          <div className="w-0.5 h-0.5 bg-[#0091FF] rounded-full" />
                        </div>
                        Use current location on map.
                      </button>
                    </div>
                  </div>
                )}
                {index < studentsBiodata.length - 1 && <div className="h-px bg-gray-50 w-full" />}
              </div>
            ))}

            <input 
              ref={fileInputRef}
              type="file" 
              hidden 
              accept="image/*"
              onChange={(e) => handleFileChange(activeFileIndex, e)}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-5 rounded-[22px] font-bold text-lg text-white shadow-xl transition-all active:scale-[0.98] mt-6 ${
                loading
                  ? "bg-gray-400 opacity-70 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:shadow-[#E8383155] hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Completing..." : "Continue"}
            </button>
          </div>
        </div>

        {/* Footer Brand */}
        <div className="mt-auto py-10 opacity-30 grayscale pointer-events-none">
          <img src={TC_logo} alt="Tutorial Center" className="h-10" />
        </div>
      </div>

      {/* RIGHT SIDE: Visual Image */}
      <div
        className="w-full h-[250px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1 md:order-2"
        style={{ backgroundImage: `url(${signup_img})` }}
      >
        <div className="hidden md:block absolute bottom-[70px] left-0">
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-4 bg-white text-[#09314F] font-extrabold hover:bg-gray-100 transition-all shadow-xl rounded-r-full active:scale-95"
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
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        input[type="date"] {
          position: relative;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          cursor: pointer;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
