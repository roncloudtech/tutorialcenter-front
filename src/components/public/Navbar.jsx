import { useEffect, useState } from "react";
import logo from "../../assets/images/tutorial_logo.png";
import { Link, NavLink } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const navigation = [
  { path: "/", name: "Home" },
  { path: "/training", name: "Training / Tuition" },
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
              <Link to="/login" className="mr-7 font-bold">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white px-4 py-2 rounded-full"
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
      icon: "mynaui:home-solid",
    },
    {
      name: "Training",
      path: "/",
      icon: "healthicons:i-training-class",
    },
    {
      name: "About Us",
      path: "/about",
      icon: "ic:outline-info",
    },
    {
      name: "Contact Us",
      path: "/contact",
      icon: "grommet-icons:contact",
    },
    {
      name: "News / Blog",
      path: "/",
      icon: "streamline-logos:bloglovin-logo-solid",
    },
    {
      name: "Login / Signup",
      path: "/login",
      icon: "cuida:login-outline",
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
          : "invisible opacity-0 transition-all ease-in-out duration-1000"
      } w-full h-full fixed  top-0 left-0 bg-black bg-opacity-50 z-[100] flex flex-col items-end justify-end p-2`}
    >
      <div
        onClick={() => setVisible(false)}
        className="w-full h-full absolute top-0 left-0"
      />
      <div
        className={`${
          visible ? "translate-x-0" : "translate-x-full"
        }  z-[500] transition-all ease-in-out duration-500 max-w-56 w-full h-full relative rounded-xl bg-white flex flex-col items-end justify-between p-6`}
      >
        <button
          onClick={() => setVisible(false)}
          className="absolute transition-all top-0 left-0 -translate-y-[10%] -translate-x-1/2 close-modal-button flex items-center justify-center w-[50px] h-[50px] rounded-full shadow-[0_4px_10px_#0000002b] bg-white text-[#563725] z-50"
        >
          <Icon
            icon="uil:plus"
            width="35"
            height="35"
            className={`rotate-45`}
          />
        </button>
        <div className="flex flex-col gap-8 items-end overflow-auto">
          {navLinks.map((items, i) => (
            <Link key={i} to={items.path} onClick={() => setVisible(false)} className="flex items-center gap-3">
              <Icon icon={items.icon} width="24" height="24" />
              <span className="text-sm font-medium dark:text-darkGray">
                {items.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};