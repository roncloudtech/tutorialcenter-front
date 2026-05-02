import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function StickyButtons() {
  const [openChat, setOpenChat] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <>
      <div className="fixed top-[calc(100vh-150px)] sm:right-8 right-3.5 z-[60] space-y-3">
        {/* CHAT WITH US */}
        <div
          onClick={() => setOpenChat(true)}
          className="group relative mb-1 w-[50px] h-[50px] bg-lightGrey text-darkMode rounded-full flex justify-center items-center cursor-pointer"
        >
          <NotifyBadge title="chat with us" />
          <Icon icon="tabler:message-chatbot" width="24" height="24" />
        </div>
        {/* Back To Top */}

        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="relative group mb-2 w-[50px] h-[50px] bg-lightGrey text-darkMode rounded-full flex justify-center items-center"
          >
            <NotifyBadge title="back to top" />
            <Icon icon="octicon:move-to-top-16" width="24" height="24" />
          </button>
        )}
      </div>

      {/*Pop Up */}
      {openChat && (
        <div className="fixed bottom-20 right-4 sm:right-8 w-[260px] bg-white shadow-lg rounded-lg z-[70] p-4">

          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm">Chat with us</span>
            <button onClick={() => setOpenChat(false)}>
              <Icon icon="mdi:close" width="18" height="18" />
            </button>
          </div>

          {/* Message */}
          <p className="text-xs text-gray-600">
            Chat with us is not available for now, please do well to send us an email.
          </p>
        </div>
      )}


    </>
  );
}

const NotifyBadge = ({ title }) => {
  return (
    <>
      <div className="border-[7px] border-solid border-transparent -mt-[5px] border-b-lightGrey bg-transparent absolute top-full left-[calc(50%-7px)] opacity-0 invisible transition-all ease-custom group-hover:visible group-hover:opacity-100 z-50" />
      <span className="text-[12px] invisible transition-all ease-custom group-hover:visible group-hover:opacity-100 group-hover:translate-y-[8px] bg-lightGrey shadow-custom-1 absolute top-full left-1/2 -translate-x-1/2 text-nowrap py-1 px-1.5 rounded-sm opacity-0  z-50">
        {title}
      </span>
    </>
  );
};
