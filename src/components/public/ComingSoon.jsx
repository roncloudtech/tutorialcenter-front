import React from "react"; 
import ComingSoonImg from "../../assets/images/comingSoon.jpg";
import TC_logo from "../../assets/images/tutorial_logo.png";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

const ComingSoon = ({ onBack }) => {
  return (
    <div className="w-full h-screen relative overflow-hidden font-sans">
      
      {/* 1. Full Screen Background Image */}
      <img 
        src={ComingSoonImg} 
        alt="Coming Soon Background" 
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Dark Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* 2. Top Navigation Items (Logo & Back Button) */}
      
      {/* Logo - Left Side */}
      <img 
        src={TC_logo} 
        alt="Tutorial Center Logo" 
        className="absolute top-6 left-6 md:top-10 md:left-10 w-28 md:w-36 z-20 object-contain drop-shadow-md"
      />

      {/* Back Button - Top Right */}
      <button 
        onClick={onBack}
        className="absolute top-6 right-6 md:top-10 md:right-10 z-30 p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90 group"
      >
        <ChevronLeftIcon className="h-5 w-5 text-[#09314F] stroke-[2.5] transition-transform group-hover:scale-110" />
      </button>

      {/* 3. Bottom Middle Text */}
      <div className="absolute bottom-10 md:bottom-20 left-0 w-full z-20 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-white text-5xl md:text-7xl font-extrabold tracking-widest uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          Coming Soon
        </h1>
        <div className="w-24 h-1 bg-white mt-4 rounded-full mb-4 shadow-lg"></div>
        <p className="text-gray-200 text-lg md:text-xl font-medium max-w-lg drop-shadow-md">
           We're working hard to bring this page to existence
        </p>
      </div>

    </div>
  );
};

export default ComingSoon;
