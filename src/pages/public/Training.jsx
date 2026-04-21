import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import SectionHeading from "../../components/public/SectionHeading";
import Career_img from "../../assets/images/Nile.University_Aerial_view.jpg";
import handCup from "../../assets/images/handCup.jpg";
import jambLogo from "../../assets/images/jamb_logo.png";
import waecLogo from "../../assets/images/waec_logo.png";
import crowd from "../../assets/svg/Transmission-Virus-Crowd--Streamline-Covid.svg";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

/* ═══════════════════════════════════════════════════
   ADMISSION GUIDE DATA
   ═══════════════════════════════════════════════════ */
const admissionSectors = [
  {
    id: 1,
    title: "MEDICAL & HEALTH SCIENCE SECTOR",
    description: "This sector covers professional clinical practice, allied health support, and research.",
    image: handCup,
    courses: [
      "Medicine & Surgery (MBBS)", "Dentistry", "Pharmacy", "Nursing Science", "Optometry",
      "Veterinary Medicine", "Medical Lab Science", "Physiotherapy", "Radiography",
      "Nutrition & Dietetics", "Anatomy", "Physiology", "Medical Biochemistry", "Pharmacology", "Public Health"
    ],
    jamb: ["Use of English", "Biology", "Chemistry", "Physics"],
    olevel: ["English", "Maths", "Biology", "Chemistry", "Physics"],
    criticalNote: "Most top universities strictly require one sitting for Medicine and Nursing. Never choose Mathematics in JAMB for these courses."
  },
  {
    id: 2,
    title: "ENGINEERING & TECHNOLOGY SECTOR",
    description: "Focuses on design, construction, and technical innovation.",
    image: handCup,
    courses: [
      "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
      "Electronic Engineering", "Computer Engineering", "Software Engineering",
      "Mechatronics Engineering", "Petroleum Engineering", "Chemical Engineering", "Marine Engineering"
    ],
    jamb: ["Use of English", "Mathematics", "Physics", "Chemistry"],
    olevel: ["English", "Maths", "Physics", "Chemistry", "+1 Science"],
    criticalNote: null
  },
  {
    id: 3,
    title: "SOCIAL & MANAGEMENT SCIENCES",
    description: "Focuses on business, governance, and societal structures.",
    image: handCup,
    courses: [
      "Accounting / Finance", "Economics", "Political Science", "Mass Communication",
      "Business Administration", "Public Administration", "Sociology", "International Relations"
    ],
    jamb: ["Use of English", "Mathematics", "Economics", "+1 more subj."],
    olevel: ["English", "Maths", "Economics", "View more..."],
    criticalNote: null
  },
  {
    id: 4,
    title: "ARTS & HUMANITIES",
    description: "Focuses on culture, law, languages, and creative expression.",
    image: handCup,
    courses: [
      "Law (Common / Civil / Islamic)", "English Language", "History",
      "Philosophy", "Religious Studies", "Theatre Arts", "Fine Arts", "Music"
    ],
    jamb: ["Use of English", "Government", "Literature-in-English", "+1 more"],
    olevel: ["English", "Maths", "Literature", "Government", "View more..."],
    criticalNote: "Law requires 5 Credits including English, Literature, and at least a pass in Mathematics."
  },
  {
    id: 5,
    title: "AGRICULTURAL & ENVIRONMENTAL SCIENCES",
    description: "Covers food production and the built environment.",
    image: handCup,
    courses: [
      "Agriculture", "Architecture", "Estate Management", "Urban & Regional Planning",
      "Building Technology", "Quantity Surveying", "Forestry", "Fisheries"
    ],
    jamb: ["Use of English", "+3 more subj."],
    olevel: ["English", "Maths", "Chemistry", "Biology/Agric"],
    criticalNote: "Always cross-check the JAMB Brochure for \"Special Waivers.\" Some universities may accept Geography instead of Physics for certain environmental courses."
  },
];

/* ═══════════════════════════════════════════════════
   LOGO MAP — maps course title keywords to logos
   ═══════════════════════════════════════════════════ */
const getLogoForCourse = (title) => {
  const t = (title || "").toLowerCase();
  if (t.includes("jamb") || t.includes("utme")) return jambLogo;
  return waecLogo; // WAEC, NECO, GCE all use waec logo for now
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
const Training = () => {
  const navigate = useNavigate();

  // Programs data from backend
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  // Admission guide
  const [expandedSector, setExpandedSector] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/courses`);
        const fetched = res?.data?.courses || [];
        setCourses(fetched);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const toggleProgramCard = (courseId) => {
    setExpandedCard(prev => (prev === courseId ? null : courseId));
  };

  return (
    <>
      <Navbar />

      {/* ════════════════════════════════════════════
          SECTION 1 — HERO BANNER
          ════════════════════════════════════════════ */}
      <div className="relative z-30 w-full h-[273px]">
        <div
          className="bg-image absolute w-full h-full bg-cover bg-no-repeat bg-center"
          style={{ backgroundImage: `url(${Career_img})` }}
        />
        <div className="overlay absolute w-full h-full bg-black opacity-30" />
        <div className="w-full h-full flex items-center justify-center relative z-50">
          <h1 className="uppercase text-white text-3xl font-bold tracking-wider">
            Training / Tuition
          </h1>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          GLOBAL GRADIENT WRAPPER
          ════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-[#09314F] to-[#E83831]">

        {/* ──────────────────────────────────────────
            SECTION 1b — INTRO + MISSION / VISION
            ────────────────────────────────────────── */}
        <div className="w-full bg-white py-16">
          <div className="Container">
            <div className="text-sm">
              <h2 className="text-2xl md:text-4xl font-bold text-primary leading-tight mb-8 max-w-lg uppercase">
                Empowering Students for Academic Excellence
              </h2>

              <div className="space-y-6 text-gray-600 leading-relaxed max-w-6xl text-sm md:text-base">
                <p>
                  The Tutorial Center offers comprehensive academic training programs
                  designed to help students excel in their JAMB, WAEC, NECO, and GCE
                  examinations. Our curriculum combines expert tutoring, interactive
                  masterclasses, and structured learning paths tailored to each
                  student's needs.
                </p>
                <p>
                  We bridge the gap between classroom learning and exam readiness,
                  ensuring every student has the tools to achieve outstanding results.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-16 mt-8">
                {/* Why Choose Us Card */}
                <div className="bg-[#FFF5F5] rounded-[30px] p-8 flex gap-6 shadow-sm">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#EF4444] rounded-xl flex items-center justify-center shadow-[2px_2px_4px_0px_rgba(0,0,0,0.25)]">
                      <img src={crowd} alt="" className="brightness-0 invert text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#09314F] mb-3">
                      Expert–Led Tutorials
                    </h3>
                    <p className="text-xs text-gray-500 leading-loose">
                      Our Lessons Are Crafted And Delivered By Experienced
                      Educators Who Understand The Unique Challenges Of JAMB,
                      WAEC, NECO, And GCE Exams. With Clear Explanations And
                      Practical Examples, Students Gain The Knowledge And
                      Confidence Needed To Succeed.
                    </p>
                  </div>
                </div>

                {/* Flexible Learning Card */}
                <div className="bg-[#FFF5F5] rounded-[30px] p-8 flex gap-6 shadow-sm">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#EF4444] rounded-xl flex items-center justify-center shadow-[2px_2px_4px_0px_rgba(0,0,0,0.25)]">
                      <img src={crowd} alt="" className="brightness-0 invert text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#09314F] mb-3">
                      Flexible Learning
                    </h3>
                    <p className="text-xs text-gray-500 leading-loose">
                      Access Our Platform Anytime, Anywhere, And Learn At Your
                      Own Pace. Whether You Prefer On-Demand Tutorials Or Live
                      Sessions, We Provide Flexible Solutions To Fit Your
                      Schedule And Learning Style.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────
            SECTION 2 — OUR PROGRAMS (FROM API)
            ────────────────────────────────────────── */}
        <section className="w-full bg-white font-sans pb-20">
          <SectionHeading title="Our Programs" position_right={true} fullWidth={true} />

          <div className="Container mt-16">
            <p className="text-center text-gray-500 text-sm md:text-base mb-12 max-w-2xl mx-auto">
              Select your exam body to view pricing. Click any card below to reveal full duration and pricing details.
            </p>

            {loadingCourses ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-[#09314F]/20 border-t-[#09314F] rounded-full animate-spin" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 font-bold text-lg">No programs available at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {courses.map((course) => {
                  const isExpanded = expandedCard === course.id;
                  const logo = getLogoForCourse(course.title);
                  const basePrice = course.price || 0;

                  // calculated durations with 5% discount for multi-month
                  const monthly = basePrice;
                  const quarterly = Math.round(basePrice * 3 * 0.95);
                  const annually = Math.round(basePrice * 12 * 0.95);

                  return (
                    <div
                      key={course.id}
                      onClick={() => toggleProgramCard(course.id)}
                      className={`
                        relative bg-white rounded-[24px] overflow-hidden cursor-pointer
                        border-2 transition-all duration-500 group
                        shadow-[0_8px_30px_rgba(0,0,0,0.06)]
                        hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]
                        hover:-translate-y-1
                        ${isExpanded
                          ? "border-[#09314F] shadow-[0_12px_40px_rgba(9,49,79,0.15)]"
                          : "border-gray-100 hover:border-[#BB9E7F]/50"
                        }
                      `}
                    >
                      {/* Pink Top Area with Logo */}
                      <div className="bg-[#FFF0F0] flex items-center justify-center py-8 relative">
                        <img
                          src={logo}
                          alt={course.title}
                          className="h-24 w-24 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Red icon badge */}
                        <div className="absolute bottom-4 right-4 w-10 h-10 bg-[#E83831] rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 pb-8">
                        {/* Subject count badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-400 text-sm">📚</span>
                          <span className="text-xs font-bold text-gray-400">
                            {course.title?.toLowerCase().includes("jamb") ? "4 Subjects" : "8-9 Subjects"}
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-[#09314F] uppercase tracking-tight mb-4">
                          {course.title}
                        </h3>

                        {/* Pricing Section — always visible but expands */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                          {/* Duration Pricing */}
                          <div className="mb-4">
                            <p className="text-[10px] font-black text-[#09314F] uppercase tracking-wider mb-2">Duration:</p>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs font-bold text-gray-500">Monthly:</span>
                                <span className="text-xs font-black text-[#09314F]">₦{monthly.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs font-bold text-gray-500">Quarterly:</span>
                                <span className="text-xs font-black text-[#09314F]">₦{quarterly.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs font-bold text-gray-500">Annually:</span>
                                <span className="text-xs font-black text-[#09314F]">₦{annually.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Includes */}
                          <div className="mb-5">
                            <p className="text-[10px] font-black text-[#09314F] uppercase tracking-wider mb-2">Includes:</p>
                            <ul className="space-y-1.5">
                              <li className="text-xs text-gray-500 flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span> Comprehensive tutorials
                              </li>
                              <li className="text-xs text-gray-500 flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span> Weekly masterclasses
                              </li>
                              <li className="text-xs text-gray-500 flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span> Mock tests & practice questions
                              </li>
                              <li className="text-xs text-gray-500 flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span> Live Q&A sessions with experts
                              </li>
                            </ul>
                          </div>

                          {/* Savings callout */}
                          <div className="bg-gray-50 rounded-xl p-3 mb-5">
                            <p className="text-[9px] font-black text-[#09314F] uppercase tracking-widest mb-1">
                              Save up to 5% on multi-month plans
                            </p>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-gray-500 font-bold">Quarterly savings:</span>
                              <span className="text-[10px] font-black text-green-600">₦{Math.round(basePrice * 3 * 0.05).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Apply Now */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/register");
                            }}
                            className="w-full py-3.5 text-white font-bold text-sm rounded-2xl shadow-lg hover:brightness-110 transition-all active:scale-95"
                            style={{ background: "linear-gradient(90deg, #0F2C45 0%, #A92429 100%)" }}
                          >
                            Apply Now
                          </button>
                        </div>

                        {/* "Learn more" CTA when collapsed */}
                        {!isExpanded && (
                          <div className="flex items-center gap-1 text-[#09314F] font-bold text-sm mt-2 group-hover:gap-2 transition-all">
                            Learn more
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ──────────────────────────────────────────
            SECTION 3 — ADMISSION GUIDE
            ────────────────────────────────────────── */}
        <section className="w-full bg-white rounded-b-[80px] md:rounded-b-[100px] overflow-hidden pb-24 font-sans">
          <SectionHeading title="Admission Guide" position_right={false} fullWidth={true} />

          <div className="Container mt-16">
            <p className="text-center text-gray-500 text-sm md:text-base mb-12 max-w-2xl mx-auto">
              2025 Admission Guide — Use this resource to understand the JAMB and O'Level subject
              requirements for your desired course and faculty.
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto mb-12">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search any course/department/faculty..."
                  className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#09314F] focus:border-transparent text-sm font-medium placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* 2-Column Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {admissionSectors.map((sector) => {
                const isOpen = expandedSector === sector.id;

                return (
                  <div
                    key={sector.id}
                    className={`
                      bg-white rounded-[24px] overflow-hidden border-2 transition-all duration-300
                      shadow-[0_6px_24px_rgba(0,0,0,0.06)]
                      hover:shadow-[0_10px_36px_rgba(0,0,0,0.1)]
                      ${isOpen ? "border-[#09314F]" : "border-gray-100"}
                    `}
                  >
                    {/* Card Image */}
                    <div className="relative h-[180px] overflow-hidden">
                      <img
                        src={sector.image}
                        alt={sector.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <h3 className="text-sm font-black text-[#09314F] uppercase tracking-wide mb-2 leading-snug">
                        {sector.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">
                        {sector.description}
                      </p>

                      {/* Subjects Required */}
                      <p className="text-[10px] font-black text-[#3B82F6] uppercase tracking-wider mb-3">
                        Subjects Required
                      </p>

                      <div className="space-y-3 mb-4">
                        {/* JAMB */}
                        <div>
                          <span className="text-[10px] font-black text-[#09314F] uppercase mr-2">JAMB</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {sector.jamb.map((subj, i) => (
                              <span
                                key={i}
                                className="bg-[#BEE3F8] text-[#09314F] px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm"
                              >
                                {subj}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* O'Level */}
                        <div>
                          <span className="text-[10px] font-black text-[#09314F] uppercase mr-2">O'Level</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {sector.olevel.map((subj, i) => (
                              <span
                                key={i}
                                className="bg-[#E2E8F0] text-[#334155] px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm"
                              >
                                {subj}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Expandable: Available Courses + Critical Note */}
                      <button
                        onClick={() => setExpandedSector(isOpen ? null : sector.id)}
                        className="flex items-center gap-1 text-[#09314F] font-bold text-xs hover:text-[#3B82F6] transition-colors mb-3"
                      >
                        {isOpen ? "Show less" : "View available courses"}
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Available Courses</p>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {sector.courses.map((c, i) => (
                              <span key={i} className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-gray-100">
                                {c}
                              </span>
                            ))}
                          </div>

                          {sector.criticalNote && (
                            <div className="bg-[#FFF5F5] border border-red-100 rounded-xl p-3 mt-2">
                              <p className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">⚠ Critical Note</p>
                              <p className="text-[10px] text-red-500 leading-relaxed font-medium">
                                {sector.criticalNote}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pro-Tip */}
            <div className="mt-12 bg-gradient-to-r from-[#09314F] to-[#1a4971] rounded-3xl p-8 text-white text-center shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 text-[#BB9E7F]">Pro Tip</p>
              <p className="text-sm leading-relaxed max-w-2xl mx-auto">
                Always cross-check the <span className="font-black">JAMB Brochure</span> for "Special Waivers."
                Some universities may accept alternative subjects for certain courses.
                Visit <span className="underline font-bold">jamb.gov.ng</span> for the latest information.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Training;
