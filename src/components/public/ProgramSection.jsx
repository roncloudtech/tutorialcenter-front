import { useCallback, useEffect, useMemo, useState } from "react";
import ProgramCard from "./ProgramCard.jsx";
import SectionHeading from "./SectionHeading.jsx";
import jamb from "../../assets/images/jamb_logo.png";
import waec from "../../assets/images/waec_logo.png";

const ProgramSection = () => {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [slidesToShow, setSlidesToShow] = useState(2);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Adjusts number of visible cards based on screen width
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSlidesToShow(1);
            } else {
                setSlidesToShow(2);
            }
        };

        handleResize();
        
        // Listen for window resize events
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const programDatas = useMemo(() => (
        [
            {
                title: "JAMB",
                logo: jamb,
                subject: "4 Subjects",
                month: "5,000",
                quarter: "14,000",
                year: "55,000",
                topic1: "Comprehensive tutorials",
                topic2: "Weekly masterclasses",
                topic3: "Mock tests and practice questions",
                topic4: "Live Q&A sessions with experts",
                path: "/about",
            },
            {
                title: "NECO",
                subject: "4 Subjects",
                month: "5,000",
                quarter: "14,000",
                year: "55,000",
                topic1: "Comprehensive tutorials",
                topic2: "Weekly masterclasses",
                topic3: "Mock tests and practice questions",
                topic4: "Live Q&A sessions with experts",
                path: "/about",
            },
            {
                title: "WAEC",
                logo: waec,
                subject: "8-9 Subjects",
                month: "8,000",
                quarter: "23,000",
                year: "88,000",
                topic1: "Complete syllabus coverage",
                topic2: "Weekly quizzes and assignments",
                topic3: "Interactive live sessions with subject tutors",
                topic4: "Past question reviews and analysis",
                path: "/about",
            },
            {
                title: "WAEC",
                logo: waec,
                subject: "8-9 Subjects",
                month: "8,000",
                quarter: "23,000",
                year: "88,000",
                topic1: "Complete syllabus coverage",
                topic2: "Weekly quizzes and assignments",
                topic3: "Interactive live sessions with subject tutors",
                topic4: "Past question reviews and analysis",
                path: "/about",
            },
        ]
    ), []);

    //next slide function
    const nextSlide = useCallback(() => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % programDatas.length);

        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning, programDatas.length]);

    //previous slide function
    const prevSlide = () => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 + programDatas.length) % programDatas.length);

        setTimeout(() => setIsTransitioning(false), 500);
    };

    // Auto slide every 3 seconds
    useEffect(() => {

        // runs nextSlide repeatedly
        const interval = setInterval(() => {
            nextSlide();
        }, 3000);

        return () => clearInterval(interval);
    }, [nextSlide]);

    // Calculate transform value for sliding effect
    const getTransformValue = () => {
        const cardWidth = 100 / slidesToShow;
        return `translateX(-${currentIndex * cardWidth}%)`;
    };

    return (
        <>
            <SectionHeading title={"Our program"} position_right={false} fullWidth={true} />
            <div className="relative w-full">
                <div className="programs Container !overflow-visible">
                    <div className="py-10">
                        <div className="mb-9">
                            <p className="text-sm leading-6">
                                At Tutorial Center, we understand the challenges faced by Nigerian
                                students preparing for critical exams like JAMB, WAEC, NECO, and
                                GCE. That's why we've built a platform that not only addresses
                                these challenges but empowers you to achieve your academic goals
                                with confidence and ease
                            </p>
                        </div>
                    
                        <div className="relative">

                            {/* Slider Container */}
                            <div className="overflow-hidden">
                                {/* Main sliding container with all cards */}
                                <div
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{ transform: getTransformValue() }}
                                >
                                    {programDatas.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex-shrink-0"
                                            style={{ width: `${100 / slidesToShow}%` }}
                                        >
                                            <ProgramCard
                                                subject={item.subject}
                                                title={item.title}
                                                logo={item.logo}
                                                month={item.month}
                                                quarter={item.quarter}
                                                year={item.year}
                                                topic1={item.topic1}
                                                topic2={item.topic2}
                                                topic3={item.topic3}
                                                topic4={item.topic4}
                                                path={item.path}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <button
                                onClick={prevSlide}
                                className="group absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-transparent rounded-lg p-2 hover:bg-primary shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-500 z-10 border border-gray-200 backdrop-blur-sm"
                                aria-label="Previous slide"
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary group-hover:text-white transition-all duration-500">
                                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            <button
                                onClick={nextSlide}
                                className="group absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-transparent rounded-lg p-2 hover:bg-primary shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-500 z-10 border border-gray-200 backdrop-blur-sm"
                                aria-label="Next slide"
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary group-hover:text-white transition-all duration-500">
                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            {/* Dots Indicator */}
                            <div className="flex justify-center gap-2 mt-6">
                                {programDatas.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (!isTransitioning) {
                                                setIsTransitioning(true);
                                                setCurrentIndex(index);
                                                setTimeout(() => setIsTransitioning(false), 500);
                                            }
                                        }}
                                        className={`h-2 rounded-full transition-all ${
                                            currentIndex === index
                                            ? 'w-8 bg-primary'
                                            : 'w-2 bg-gray-300'
                                        }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
 
export default ProgramSection;