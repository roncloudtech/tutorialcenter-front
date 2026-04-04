import icon from "../../assets/svg/tc_icon.svg";

const SectionHeading = ({ title, position_right, fullWidth = false }) => {
    return (
        <div className={`bg-primary py-3 relative w-full ${fullWidth ? "" : "xl:max-w-[1300px] mx-auto"} mb-10 md:mb-20`}>
            <div className="max-w-7xl mx-auto px-6 relative">
                <h1 className="semi-title text-center text-white uppercase">{title}</h1>
                <img 
                    src={icon} 
                    alt="Tutorial center" 
                    className={`absolute bottom-0 translate-y-full ${position_right ? "right-1 md:right-10" : "left-1 md:left-10"} w-[80px] lg:w-[100px] z-20`} 
                />
            </div>
        </div>
    );
}
 
export default SectionHeading;