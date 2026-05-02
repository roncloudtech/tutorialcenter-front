import BenefitSection from "../../components/public/BenefitSection";
import CommunityGrowth from "../../components/public/CommunityGrowth";
import ContactSection from "../../components/public/ContactSection";
import FaqSection from "../../components/public/FaqSection";
import Footer from "../../components/public/Footer";
import Hero from "../../components/public/Hero";
import Navbar from "../../components/public/Navbar";
import ProgramSection from "../../components/public/ProgramSection";
import StickyButtons from "../../components/public/StickyButtons";
import TestimonialSection from "../../components/public/TestimonialSection";


const Home = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <BenefitSection />
            <CommunityGrowth />
            <ProgramSection />
            <TestimonialSection />
            <FaqSection />
            <ContactSection />
            <Footer />
        </>
    );
}
 
export default Home;