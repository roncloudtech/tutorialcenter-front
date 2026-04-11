import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import Career_img from "../../assets/images/Career.jpg";
import crowd from "../../assets/svg/Transmission-Virus-Crowd--Streamline-Covid.svg";
import handCup from "../../assets/images/handCup.jpg";
import SectionHeading from "../../components/public/SectionHeading";

const Career = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="relative z-30 w-full h-[273px]">
        {/* background image */}
        <div
          className="bg-image absolute w-full h-full bg-cover bg-no-repeat bg-center"
          style={{
            backgroundImage: `url(${Career_img})`,
          }}
        />
        {/* overlay */}
        <div className="overlay absolute w-full h-full bg-black opacity-30"></div>
        {/* content */}
        <div className="w-full h-full flex items-center justify-center relative z-50">
          <h1 className="uppercase text-white text-3xl font-bold">Career</h1>
        </div>
      </div>

      {/* --- GLOBAL GRADIENT BACKGROUND WRAPPER --- */}
      <div className="bg-gradient-to-r from-[#09314F] to-[#E83831]">
        <div className="w-full bg-white py-16">
          <div className="max-w-7xl mx-auto px-6 relative lg:px-8 2xl:px-9">
            <div className="text-sm">
              <h2 className="text-2xl md:text-4xl font-bold text-primary leading-tight mb-8 max-w-sm uppercase">
                Meet the team work behind our success
              </h2>

              <div className="space-y-6 text-gray-600 leading-relaxed max-w-6xl text-sm md:text-base">
                <p>
                  The Tutorial Center is an innovative educational platform
                  designed to strengthen academic performance, career clarity,
                  and institutional efficiency across Africa. By integrating
                  Tutors, Course Advisors, and Administrative Leadership into
                  one coordinated system, the platform addresses critical gaps
                  in African education — including poor guidance, inconsistent
                  teaching quality, and weak academic monitoring systems.
                </p>
                <p>
                  The platform is built to improve access, quality, and
                  structure in learning environments in senior secondary school.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-16 mt-8">
                {/* Mission Card */}
                <div className="bg-[#FFF5F5] rounded-[30px] p-8 flex gap-6 shadow-sm">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#EF4444] rounded-xl flex items-center justify-center shadow-[2px_2px_4px_0px_rgba(0,0,0,0.25)]">
                      {/* Substitute with actual Icon */}
                      <img
                        src={crowd}
                        alt="Crowd"
                        className="brightness-0 invert text-2xl"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#09314F] mb-3">
                      Mission
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

                {/* Vision Card */}
                <div className="bg-[#FFF5F5] rounded-[30px] p-8 flex gap-6 shadow-sm">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#EF4444] rounded-xl flex items-center justify-center shadow-[2px_2px_4px_0px_rgba(0,0,0,0.25)]">
                      {/* Substitute with actual Icon */}
                      {/* < className="text-white text-2xl" /> */}
                      <img
                        src={crowd}
                        alt="Crowd"
                        className="brightness-0 invert text-2xl"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#09314F] mb-3">
                      Vision
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

              <div>
                <h4 className="text-[#3B82F6] font-bold text-lg mb-6 uppercase tracking-wide">
                  Available Roles
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <button
                    onClick={() => window.open("https://forms.gle/bCaEdo4yMhsHFBca6", "_blank", "noopener,noreferrer")}
                    className="w-full bg-[#09314F] text-white font-bold py-4 rounded-xl shadow-[1px_1px_4px_0px_rgba(0,0,0,0.25)] hover:opacity-90 transition-all"
                  >
                    Apply as Tutor
                  </button>

                  <button
                    onClick={() => alert("Course Advisor applications are currently closed. Please check back later!")}
                    className="w-full bg-white text-[#09314F] border border-[#09314F] font-bold py-4 rounded-xl shadow-[1px_1px_4px_0px_rgba(0,0,0,0.25)] hover:bg-gray-50 transition-all"
                  >
                    Apply as Course Advisor
                  </button>

                  <button
                    onClick={() => alert("Administrator applications are currently closed. Please check back later!")}
                    className="w-full bg-gradient-to-r from-[#09314F] to-[#C23A3A] text-white font-bold py-4 rounded-xl shadow-[1px_1px_4px_0px_rgba(0,0,0,0.25)] hover:brightness-110 transition-all"
                  >
                    Apply as Administrator
                  </button>

                  <button
                    onClick={() => navigate("/staff/login")}
                    className="w-full bg-[#09314F] text-white font-bold py-4 rounded-xl shadow-[1px_1px_4px_0px_rgba(0,0,0,0.25)] hover:opacity-90 transition-all"
                  >
                    Staff Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="w-full bg-white font-sans pb-16">
          {/* 1. FULL-WIDTH BANNER */}
          <SectionHeading
            title="Tutor"
            position_right={true}
            fullWidth={true}
          />

          {/* 2. CONTENT AREA */}
          <div className="max-w-7xl mx-auto px-6 mt-20 flex flex-col md:flex-row items-start gap-16">
            {/* Left Side: Requirements and Positions */}
            <div className="w-full md:w-1/2">
              <div className="mb-10">
                <h4 className="text-[#3B82F6] font-extrabold text-base mb-4 uppercase tracking-wider">
                  Role Requirement
                </h4>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Empowering Students With The Tools, Resources, And Guidance
                  They Need To Excel. At Tutorial Center, We Provide
                  Comprehensive Tutorials, Interactive Masterclasses, And
                  Advanced Learning Solutions Tailored For Success In JAMB,
                  WAEC, NECO, And GCE Exams.
                </p>
              </div>

              <div className="mb-12">
                <h4 className="text-[#3B82F6] font-extrabold text-base mb-6 uppercase tracking-wider">
                  Available Position
                </h4>

                <div className="flex flex-wrap gap-3">
                  {[
                    "Mathematics Tutor",
                    "Use Of English Tutor",
                    "Physics Tutor",
                    "Chemistry Tutor",
                    "Economics Tutor",
                    "Yoruba Language Tutor",
                    "Agricultural Science Tutor",
                    "Literature Tutor",
                    "Further Mathematics Tutor",
                  ].map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-[#BEE3F8] text-[#09314F] px-5 py-2.5 rounded-xl text-[12px] font-bold shadow-[2px_2px_4px_0px_rgba(0,0,0,0.15)] hover:bg-[#A5D8F7] transition-colors"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => window.open("https://forms.gle/bCaEdo4yMhsHFBca6", "_blank", "noopener,noreferrer")}
                className="px-14 py-4 text-white font-bold text-lg rounded-2xl shadow-lg hover:brightness-110 transition-all active:scale-95"
                style={{
                  background:
                    "linear-gradient(90deg, #0F2C45 0%, #A92429 100%)",
                }}
              >
                Apply Now
              </button>
            </div>

            {/* Right Side: Featured Image */}
            <div className="w-full md:w-1/2 flex justify-end">
              <div className="w-full max-w-[500px] h-[400px] md:h-[500px] rounded-[50px] overflow-hidden shadow-2xl border-[2px] border-white ring-1 ring-gray-100">
                <img
                  src={handCup}
                  alt="Success Trophy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- COURSE ADVISOR SECTION --- */}
        <section className="w-full bg-white font-sans pb-16">
          {/* 1. FULL-WIDTH BANNER */}
          <SectionHeading
            title="Course Advisor"
            position_right={false}
            fullWidth={true}
          />

          {/* 2. CONTENT AREA */}
          <div className="max-w-7xl mx-auto px-6 mt-20 flex flex-col md:flex-row items-center gap-16">
            {/* Featured Image */}
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <div className="w-full max-w-[500px] h-[400px] md:h-[500px] rounded-[50px] overflow-hidden shadow-2xl  border-white ring-1 ring-gray-100">
                <img
                  src={handCup}
                  alt="Course Advisor Success"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="w-full md:w-1/2 order-1 md:order-2">
              <div className="mb-10">
                <h4 className="text-[#3B82F6] font-extrabold text-base mb-4 uppercase tracking-wider">
                  Role Requirement
                </h4>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Empowering Students With The Tools, Resources, And Guidance
                  They Need To Excel. At Tutorial Center, We Provide
                  Comprehensive Tutorials, Interactive Masterclasses, And
                  Advanced Learning Solutions Tailored For Success In JAMB,
                  WAEC, NECO, And GCE Exams.
                </p>
              </div>

              <div className="mb-12">
                <h4 className="text-[#3B82F6] font-extrabold text-base mb-6 uppercase tracking-wider">
                  Available Position
                </h4>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-[#BEE3F8] text-[#09314F] px-6 py-3 rounded-xl text-[13px] font-bold shadow-[2px_2px_4px_0px_rgba(0,0,0,0.15)]">
                    Student Course Advisor
                  </span>
                </div>
              </div>

              <button
                onClick={() => alert("Course Advisor applications are currently closed. Please check back later!")}
                className="px-14 py-4 text-white font-bold text-lg rounded-2xl shadow-lg hover:brightness-110 transition-all active:scale-95"
                style={{
                  background:
                    "linear-gradient(90deg, #0F2C45 0%, #A92429 100%)",
                }}
              >
                Apply Now
              </button>
            </div>
          </div>
        </section>

        {/* --- ADMINISTRATION SECTION (Final Section) --- */}
        {/* OUTER WRAPPER: This is an external background in this section alone*/}
        {/* --- ADMINISTRATION SECTION --- */}
        <section className="w-full bg-white rounded-b-[80px] md:rounded-b-[180px] overflow-hidden pb-24 font-sans">
          {/* 1. FULL-WIDTH BANNER */}
          <SectionHeading
            title="Administration"
            position_right={true}
            fullWidth={true}
          />

          {/* 2. CONTENT AREA */}
          <div className="max-w-7xl mx-auto px-6 mt-20 flex flex-col md:flex-row items-center gap-16">
            {/* Left Side: Text */}
            <div className="w-full md:w-1/2">
              <div className="mb-10">
                <h4 className="text-[#3B82F6] font-extrabold text-base mb-4 uppercase tracking-wider">
                  Role Requirement
                </h4>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Empowering Students With The Tools, Resources, And Guidance
                  They Need To Excel. At Tutorial Center, We Provide
                  Comprehensive Tutorials, Interactive Masterclasses, And
                  Advanced Learning Solutions Tailored For Success In JAMB,
                  WAEC, NECO, And GCE Exams.
                </p>
              </div>

              <div className="mb-12">
                <h4 className="text-[#3B82F6] font-extrabold text-base mb-6 uppercase tracking-wider">
                  Available Position
                </h4>

                <div className="flex flex-wrap gap-3">
                  {[
                    "Administrator",
                    "Customer Service Agent",
                    "Data Analyst / Scientist",
                  ].map((job, idx) => (
                    <span
                      key={idx}
                      className="bg-[#BEE3F8] text-[#09314F] px-5 py-2.5 rounded-xl text-[12px] font-bold shadow-[2px_2px_4px_0px_rgba(0,0,0,0.15)]"
                    >
                      {job}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => alert("Administrator applications are currently closed. Please check back later!")}
                className="px-14 py-4 text-white font-bold text-lg rounded-2xl shadow-lg hover:brightness-110 transition-all active:scale-95"
                style={{
                  background:
                    "linear-gradient(90deg, #0F2C45 0%, #A92429 100%)",
                }}
              >
                Apply Now
              </button>
            </div>

            {/* Right Side: Image */}
            <div className="w-full md:w-1/2 flex justify-end">
              <div className="w-full max-w-[500px] h-[400px] md:h-[500px] rounded-[50px] overflow-hidden shadow-2xl border-[2px] border-white">
                <img
                  src={handCup}
                  alt="Administration Success"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Career;
