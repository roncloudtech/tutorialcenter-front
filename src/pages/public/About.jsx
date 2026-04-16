import { benefitData } from "../../data/data";
import { programData } from "../../data/data";
import vector from "../../assets/images/Vector.png";
import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import OurTeam from "../../components/public/OurTeam";
import handCup from "../../assets/images/handCup.jpg";
import image from "../../assets/images/handshake.png";
import conversation from "../../assets/images/conversations.jpg";
import SectionHeading from "../../components/public/SectionHeading";
import WhatWeProvideCard from "../../components/public/WhatWeProvideCard";
import CommunityGrowthLayout from "../../components/public/CommunityGrowthLayout";


const About = () => {
  return (
    <>
      <Navbar />

      {/* Hero Banner */}
      <div className="relative z-30 w-full h-[273px]">
        {/* background image */}
        <div
          className="bg-image absolute w-full h-full bg-cover bg-no-repeat bg-center"
          style={{
            backgroundImage: `url(${conversation})`,
          }}
        />
        {/* overlay */}
        <div className="overlay absolute w-full h-full bg-black opacity-40"></div>
        {/* content */}
        <div className="w-full h-full flex items-center justify-center relative z-50">
          <h1 className="uppercase text-white text-3xl md:text-4xl font-black tracking-widest">About us</h1>
        </div>
      </div>

      {/* --- GLOBAL GRADIENT BACKGROUND WRAPPER --- */}
      <div className="bg-gradient-to-r from-[#09314F] to-[#E83831]">

        {/* introduction section */}
        <div className="w-full bg-white py-16">
          <div className="Container mt-11">
            <div className="area-wrapper text-sm">
              <div className="grid sm:grid-cols-12 gap-3">
                <div className="column col-span-5">
                  <h2 className="font-bold text-2xl text-primary leading-8">
                    INTRODUCTION TO THE BEST ONLINE WORKING EXAM EDUCATIONAL SYSTEMS
                    FOR AFRICANS!
                  </h2>
                </div>
                <div className="col-span-7 sm:flex gap-5">
                  <div className="flex-1">
                    <p className="leading-5">
                      At Tutorial Center, we are redefining education for African
                      students with our innovative and comprehensive online learning
                      platform. Tailored to address the unique challenges faced by
                      students preparing for JAMB, WAEC, NECO, and GCE exams, we
                      combine advanced technology with expert-led instruction to
                      deliver a seamless and
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="leading-5">
                      effective learning experience. Our system is designed to empower
                      students with the knowledge, skills, and confidence needed to
                      excel in their academic pursuits and beyond. With features such
                      as live interactive classes, on-demand tutorials, and progress
                      tracking tools, we ensure every learner receives the support
                      they deserve.
                    </p>
                  </div>
                </div>
              </div>
              <div className="my-10">
                <p className="leading-5 ">
                  Whether you are looking for flexibility, quality, or convenience,
                  Tutorial Center offers it all. We aim to bridge the gap in access to
                  quality education by providing an inclusive platform that caters to
                  diverse learning needs. By leveraging the expertise of seasoned
                  educators and incorporating modern e-learning strategies, we are
                  creating opportunities for African students to thrive academically
                  and compete globally. At Tutorial Center, we believe education is
                  the key to unlocking potential, and we are committed to helping
                  students achieve their dreams.
                </p>
              </div>

              {/* benefits section */}
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                {benefitData.map((item, index) => (
                  <div
                    key={index}
                    className="column1 flex px-3 py-4 gap-3 bg-[#E336290D] shadow-xl rounded-2xl"
                  >
                    <div className="">
                      <div className="w-[40px] h-[40px] flex justify-center items-center bg-sencondary rounded-full">
                        <img src={vector} alt="" width={20} height={20} />
                      </div>
                    </div>
                    <div className="">
                      <h4 className="font-semibold mb-3">{item.title}</h4>
                      <p className=" text-xs leading-5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative my-20">
                <div
                  style={{ backgroundImage: `url(${handCup})` }}
                  className="w-[650px] h-[400px] max-w-full rounded-2xl bg-center bg-cover bg-no-repeat"
                ></div>
                <div className="lg:absolute top-11 right-4">
                  <video
                    className="w-[500px] h-[300px] bg-no-repeat bg-cover bg-center rounded-2xl relative border-[3px] border-white border-solid "
                    src="https://youtu.be/-O8t__3Vu9I"
                    controls
                    autoPlay
                  ></video>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* community growth section */}
        <CommunityGrowthLayout
          title={"Join our growing community"}
          semititle={"Attend classes with your pairs"}
          desc={
            "We invite you to enroll in our online Master Class, where you can immerse yourself in advanced learning and gain valuable insights from our tutors."
          }
          Sdesc={"Be present for your future!"}
          btnTitle={"Apply Now"}
          imgPath={image}
        />

        {/* What we Provide */}
        <div className="bg-white">
          <SectionHeading title="What We provide" position_right={true} fullWidth={true} />
          <div className="Container py-14 lg:py-16">
            <div className="area-wrapper">
              <div className="text-center mb-8">
                <p>
                  Empowering students with the tools, resources, and guidance they
                  need to excel. At Tutorial Center, we provide comprehensive
                  tutorials, interactive masterclasses, and advanced learning
                  solutions tailored for success in JAMB, WAEC, NECO, and GCE exams.
                </p>
              </div>
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5">
                {programData.map((item, index) => (
                  <WhatWeProvideCard key={index} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Our Team Section */}
        <section className="w-full bg-white rounded-b-[80px] md:rounded-b-[180px] overflow-hidden pb-24 font-sans">
          <OurTeam />
        </section>

      </div>
      <Footer />
    </>
  );
}

export default About;
