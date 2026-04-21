import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import Map from "../../components/public/Map";
import image from "../../assets/images/Career.jpg";
import ContactSection from "../../components/public/ContactSection";

const Contact = () => {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="relative z-30 w-full h-[273px]">
        <div
          className="absolute w-full h-full bg-cover bg-no-repeat bg-[center_70%]"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute w-full h-full bg-black opacity-40"></div>

        <div className="relative z-50 w-full h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-white text-3xl md:text-4xl font-black uppercase tracking-widest">
            Contact Us
          </h1>
          <p className="text-white text-sm mt-2 max-w-md">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </p>
        </div>
      </div>

      {/* --- GLOBAL GRADIENT BACKGROUND WRAPPER --- */}
      <div className="bg-gradient-to-r from-[#09314F] to-[#E83831]">
        <div className="bg-white pt-10 pb-16 rounded-b-[80px] md:rounded-b-[100px] overflow-hidden">

          <ContactSection showTitle={false} />

          {/* Map */}
          <div className="Container mt-10">
            <div className="area-wrapper">
              <Map />
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Contact;