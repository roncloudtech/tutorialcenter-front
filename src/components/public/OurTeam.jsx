import TeamCard from "./TeamCard.jsx";
import { AllTeams } from "../../data/data.js";
import SectionHeading from "./SectionHeading.jsx";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect, useCallback } from "react";

const OurTeam = () => {
    // List of team departments
    const [listallTeams, setListAllTeams] = useState([
        {
            developers: "Development team",
            open: true,
        },
        {
            developers: "EDUCATION team",
            open: false,
        },
        {
            developers: "marketing / operations",
            open: false,
        },
        {
            developers: "Advisory team",
            open: false,
        },
    ]);
  
    // Manual carousel state management
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Handle team category toggle
    const handleTeamState = (index) => {
        setListAllTeams((prev) =>
            prev.map((items, i) => ({
                ...items,
                open: i === index
            }))
        );
        // Reset carousel when changing categories
        setCurrentSlide(0);
    };

    // Determine slides to show based on screen size
    const getSlidesToShow = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 1024) return 3;
            return 1;
        }
        return 3;
    };

    const [slidesToShow, setSlidesToShow] = useState(getSlidesToShow());

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setSlidesToShow(getSlidesToShow());
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    // Filter team members based on active category
    const filteredTeam = AllTeams.filter((item) => 
        listallTeams.find(team => team.developers.split(" ")[0].toLowerCase() === item.category && team.open)
    );

    const maxSlide = Math.max(0, filteredTeam.length - slidesToShow);

    // Next slide function wrapped in useCallback to prevent infinite re-renders
    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, [maxSlide]);

    // Previous slide function
    const prevSlide = () => {
        setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
    };

    // Autoplay functionality
    useEffect(() => {
        if (isAutoPlaying && filteredTeam.length > slidesToShow) {
            const interval = setInterval(nextSlide, 2000);
            return () => clearInterval(interval);
        }
    }, [isAutoPlaying, filteredTeam.length, slidesToShow, nextSlide]);

    // Reset to first slide if current slide exceeds available slides
    useEffect(() => {
        if (currentSlide > maxSlide) {
            setCurrentSlide(0);
        }
    }, [maxSlide, currentSlide]);

    return (
        <>
            <SectionHeading title="Meet the team" position_right={false} fullWidth={true} />
            <div className="Container py-14 lg:py-16">
                <div className="area-wrapper">
                    
                    {/* Team category tabs */}
                    <div className="flex justify-between items-center flex-wrap max-sm:gap-3">
                        {listallTeams.map((items, i) => (
                            <button
                                key={i}
                                className={`${
                                    items.open
                                        ? "border-solid border-b-[1.5px] border-b-ascent text-ascent"
                                        : "text-mainGrey"
                                } flex-1 w-full text-base max-sm:text-sm font-bold uppercase pb-0.5`}
                                onClick={() => handleTeamState(i)}
                            >
                                {items.developers}
                            </button>
                        ))}
                    </div>
                    
                    <div className="text-xs mt-4 text-center">
                        <span>
                            Good Teachers and teaching system Good Teachers and teaching system
                            Good Teachers and teaching system Good Teachers and teaching system
                            Good Teachers and teaching system Good Teachers and teaching system{" "}
                        </span>
                    </div>
                    
                    {/* Custom carousel implementation */}
                    {filteredTeam.length > 0 ? (
                        <div className="mt-20 relative">
                            <div className="overflow-hidden">
                                <div 
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{ 
                                        transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)` 
                                    }}
                                    onMouseEnter={() => setIsAutoPlaying(false)}
                                    onMouseLeave={() => setIsAutoPlaying(true)}
                                >
                                    {filteredTeam.map((items, i) => (
                                        <div 
                                            key={i} 
                                            style={{ 
                                                minWidth: `${100 / slidesToShow}%`,
                                                padding: '0 10px'
                                            }}
                                        >
                                            <TeamCard name={items.name} role={items.role} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation buttons - only show if more items than visible slides */}
                            {filteredTeam.length > slidesToShow && (
                                <>
                                    <button
                                        onClick={prevSlide}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                                        aria-label="Previous slide"
                                    >
                                        <Icon icon="mdi:chevron-left" width="24" height="24" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                                        aria-label="Next slide"
                                    >
                                        <Icon icon="mdi:chevron-right" width="24" height="24" />
                                    </button>

                                    {/* Dot indicators */}
                                    <div className="flex justify-center gap-2 mt-6">
                                        {Array.from({ length: maxSlide + 1 }).map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentSlide(index)}
                                                className={`w-2 h-2 rounded-full transition-colors ${
                                                    currentSlide === index ? 'bg-ascent' : 'bg-gray-300'
                                                }`}
                                                aria-label={`Go to slide ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        // Show message when no team members in category
                        <div className="mt-20 text-center text-gray-500">
                            <p>No team members in this category yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default OurTeam;