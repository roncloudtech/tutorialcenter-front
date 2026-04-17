import icon from "../../assets/svg/tc_icon.svg";

const SectionHeading = ({ title, position_right, fullWidth = false }) => {
    return (
        <div className={`bg-primary py-3 relative ${fullWidth ? "w-full left-0 right-0" : "xl:max-w-[1300px] mx-auto w-full"} mb-10 md:mb-20 transition-all duration-300`}>
            <div className={`${fullWidth ? "w-full" : "xl:max-w-[1200px] mx-auto"} relative px-5 lg:px-8 2xl:px-9`}>
                <h1 className="semi-title text-center text-white uppercase tracking-wider">{title}</h1>
                <img 
                    src={icon} 
                    alt="Tutorial center" 
                    className={`absolute bottom-0 translate-y-full ${position_right ? "right-2 md:right-10" : "left-2 md:left-10"} w-[80px] lg:w-[100px] z-20 transition-all`} 
                />
            </div>
        </div>
    );
}
 
export default SectionHeading;