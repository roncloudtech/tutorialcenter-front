import { useEffect, useState } from "react";
import logo from "../../assets/images/tutorial_logo.png";
import { Link, NavLink } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const navigation = [
  { path: "/", name: "Home" },
  { path: "/training", name: "Training / Tuition" },
  { path: "/career", name: "Career"},
  { path: "/blog", name: "Blog" },
  { path: "/contact", name: "Contact Us" },
  { path: "/about", name: "About Us" },
];
export default function Navbar() {
  
  const [visible, setVisible] = useState(false);

  return (
    <>
      <div
        className={`bg-white shadow-custom-1 animate-header py-3.5 sticky top-0 z-[80]  w-full  h-[85px] flex items-center justify-center scroll`}
      >
        <div className="Container">
          <div className="flex items-center justify-between">
            {/* Tutotrial Logo */}
            <img src={logo} alt="" className="max-w-[120px]" />
            {/* navigation Links */}
            <div className="hidden lg:block">
              {navigation.map((item, index) => (
                <NavLink
                  to={item.path}
                  key={index}
                  className="text-xs  font-semibold text-mainGrey mx-3 [&.active]:text-mainBlack"
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
            {/* Apply button */}
            <div className="hidden lg:block">
              <Link to="/login" 
              className="mr-7 font-bold px-6 py-2 rounded-[12px] 
             bg-white text-[#09314F]
             shadow-[1px_1px_4px_0px_#00000026] 
             active:shadow-[inset_2px_2px_4px_0px_#00000040] 
             transition-all duration-200">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white px-4 py-2 rounded-[12px]"
              >
                Apply Now
              </Link>
            </div>
            {/* Mobile Menu Navigation Links */}
            <div className="block lg:hidden">
              <button
                onClick={() => setVisible(true)}
                className={`relative z-[500] ${visible ? "hidden" : "block"}`}
              >
                <Icon
                  icon="quill:hamburger"
                  width="26"
                  height="26"
                  className="text-mainBlue"
                />
              </button>
            </div>
            {/* mobile menu ends here */}
          </div>
        </div>
      </div>
      <MobileNavigation setVisible={setVisible} visible={visible} />
    </>
  );
}

const MobileNavigation = ({ setVisible, visible }) => {
  const navLinks = [
    {
      name: "Home",
      path: "/",
      icon: "heroicons:home",
    },
    {
      name: "Training",
      path: "/training",
      icon: "heroicons:academic-cap",
    },
    {
      name: "Career",
      path: "/career",
      icon: "heroicons:briefcase",
    },
    {
      name: "About Us",
      path: "/about",
      icon: "heroicons:information-circle",
    },
    {
      name: "Contact Us",
      path: "/contact",
      icon: "heroicons:phone",
    },
    {
      name: "Blog",
      path: "/blog",
      icon: "heroicons:newspaper",
    },
    {
      name: "Login / Signup",
      path: "/login",
      icon: "heroicons:arrow-right-on-rectangle",
    },
  ];
  useEffect(() => {
    if (visible) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [visible]);
  return (
    <div
      className={`${
        visible
          ? "visible opacity-100"
          : "invisible opacity-0"
      } w-full h-full fixed top-0 left-0 bg-black/40 backdrop-blur-sm z-[100] transition-all duration-300 flex flex-col items-end justify-end`}
    >
      <div
        onClick={() => setVisible(false)}
        className="w-full h-full absolute top-0 left-0"
      />
      <div
        className={`${
          visible ? "translate-x-0" : "translate-x-full"
        } z-[500] transition-transform duration-500 ease-out max-w-[280px] w-full h-full relative bg-white dark:bg-gray-900 flex flex-col p-8 shadow-2xl`}
      >
        <button
          onClick={() => setVisible(false)}
          className="absolute -left-4 top-8 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors z-50 ring-4 ring-black/5"
        >
          <Icon
            icon="heroicons:x-mark"
            width="24"
            height="24"
          />
        </button>

        <div className="flex flex-col gap-1 mt-12 overflow-y-auto">
          {navLinks.map((items, i) => (
            <Link 
              key={i} 
              to={items.path} 
              onClick={() => setVisible(false)} 
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-[#09314F] group-hover:text-white transition-all duration-300">
                <Icon icon={items.icon} width="20" height="20" />
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#09314F] dark:group-hover:text-white transition-colors">
                {items.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-auto pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-[#09314F]/5 dark:bg-blue-600/10 p-5 rounded-3xl">
            <p className="text-[10px] font-black text-[#09314F] dark:text-blue-400 uppercase tracking-widest mb-1 opacity-60">Tutorial Center</p>
            <p className="text-[11px] text-[#09314F]/70 dark:text-gray-400 leading-relaxed font-medium">Empowering minds, achieving excellence through premium education.</p>
          </div>
        </div>
      </div>
    </div>
  );
};