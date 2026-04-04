import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import SectionHeading from "./SectionHeading.jsx";

const FaqSection = () => {

    // faq data stored in state
    const [faqs, setFaqs] = useState([
        {
            questions: "What is Tutorial Center?",
            answers:
                " Tutorial Center is an online e-learning platform designed to help Nigerian students prepare for major exams like JAMB,  WAEC, NECO, and GCE through interactive tutorials, live  classes, and exam-focused resources.",
            open: true,
        },
        {
            questions: "What subjects are covered on Tutorial Center?",
            answers:
                " Tutorial Center is an online e-learning platform designed to help Nigerian students prepare for major exams like JAMB,  WAEC, NECO, and GCE through interactive tutorials, live  classes, and exam-focused resources.",
            open: false,
        },
        {
            questions: "How much does it cost to enroll in a program?",
            answers:
                " Tutorial Center is an online e-learning platform designed to help Nigerian students prepare for major exams like JAMB,  WAEC, NECO, and GCE through interactive tutorials, live  classes, and exam-focused resources.",
            open: false,
        },
        {
            questions: "How do I register for classes? ",
            answers:
                " Tutorial Center is an online e-learning platform designed to help Nigerian students prepare for major exams like JAMB,  WAEC, NECO, and GCE through interactive tutorials, live  classes, and exam-focused resources.",

            open: false,
        },
        {
            questions: "Can I attend classes at my convenience?",
            answers:
                " Tutorial Center is an online e-learning platform designed to help Nigerian students prepare for major exams like JAMB,  WAEC, NECO, and GCE through interactive tutorials, live  classes, and exam-focused resources.",
            open: false,
        },
        {
            questions: "Are the classes taught by qualified teachers?",
            answers:
                " Tutorial Center is an online e-learning platform designed to help Nigerian students prepare for major exams like JAMB,  WAEC, NECO, and GCE through interactive tutorials, live  classes, and exam-focused resources.",
            open: false,
        },
        {
            questions: "What happens if I miss a live class?",
            answers:
                " Tutorial Center is an online e-learning platform designed to help Nigerian students prepare for major exams like JAMB,  WAEC, NECO, and GCE through interactive tutorials, live  classes, and exam-focused resources.",
            open: false,
        },
        {
            questions: "How do I make payments?",
            answers:
                " Tutorial Center is an online e-learning platform designed to help Nigerian students prepare for major exams like JAMB,  WAEC, NECO, and GCE through interactive tutorials, live  classes, and exam-focused resources.",
            open: false,
        },
    ]);

    // function to toggle the display of the faqs answers when the question is clicked
    const toggleFaq = (index) => {
        setFaqs(
            faqs.map((faq, i) => {
                if (i === index) {
                    faq.open = !faq.open;
                } else {
                    faq.open = false;
                }
                return faq;
            })
        );
    };

    return (
        <>
            <SectionHeading title={"faq"} position_right={false} fullWidth={true} />
            <div className="w-full">
                <div className="Container !overflow-visible">
                    <div className="area-wrapper !pt-16 !pb-0">
                        <div className="text-center mb-10">
                            <h2 className="header-title text-primary mb-2">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-sm">
                                Here are the most frequently asked questions
                            </p>
                        </div>
                        <div className="faqs space-y-3">
                            {faqs.map((faq, index) => (
                                <div
                                    className={`w-full text-start  ${
                                        faq.open ? "bg-[#E336290D]" : "bg-white shadow"
                                        } border border-solid border-[rgb(169,193,211)] rounded-xl`}
                                    key={index}
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full h-full flex justify-between items-center p-3 relative"
                                    >
                                        <span
                                            className={`${
                                                faq.open ? "text-[#8695A0]" : "text-primary"
                                                } text-primary text-sm font-semibold  pr-6`}
                                        >
                                            {faq.questions}
                                        </span>
                                        <div className="absolute top-1/2 -translate-y-1/2 right-[9.6px] ">
                                            <Icon
                                                icon="hugeicons:arrow-up-01"
                                                width="35"
                                                height="35"
                                                style={{ color: "#000" }}
                                                className={`${
                                                    faq.open ? "rotate-180" : "rotate-90"
                                                } transition-drop-down`}
                                            />
                                        </div>
                                    </button>
                                    <div
                                        className={`${
                                            faq.open ? "max-h-full py-2" : "max-h-0 invisible opacity-0"
                                        } md:pr-4 px-3 transition-drop-down overflow-y-hidden`}
                                    >
                                    <p className="text-xs leading-5">{faq.answers}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mb-3 mt-10 max-w-[650px] mx-auto">
                            <h2 className="header-title text-primary mb-2">
                                Still have questions?
                            </h2>
                            <p className="text-sm ">
                                If you cannot find answers to your questions in our FAQs, you can
                                always contact us. We will answer you shortly.{" "}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default FaqSection;
