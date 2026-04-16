import SectionHeading from "./SectionHeading.jsx";
import { Link } from "react-router-dom";

const ContactSection = ({ showTitle = true }) => {

    return (
        <>
            <div className="relative w-full h-full top-7 z-50 rounded-b-[40px] bg-white">
                {showTitle && (
                    <div>
                        <SectionHeading
                            title={"contact us"}
                            position_right={true}
                            fullWidth={true}
                        />
                        <div className="h-7" />
                    </div>
                )}
                <div className="w-full">
                    <div className="Container !overflow-visible">
                        <div className="area-wrapper ">
                            <div className="flex max-md:flex-col">

                                <div className="flex-1 py-4 pr-7">
                                    <div className="content mb-8">
                                        <h2 className="text-primary header-title mb-2">
                                            Get in touch
                                        </h2>
                                        <p className="text-sm leading-[28px]">
                                            Use our contact form for all information request or contact
                                            us directly using the contact information below. All
                                            information is treated with complete confidentiality and In
                                            accordance with our data protection statement.
                                        </p>
                                    </div>

                                    <div className="contact-details">
                                        <p className="text-sm font-semibold">
                                            feel free to reach out to us via email or on phone
                                        </p>
                                        <div className="flex sm:flex-row flex-col gap-6 mt-3">
                                            <Link
                                                to=""
                                                className="text-sencondary font-semibold text-sm"
                                            >
                                                tutorialcenter@gmail.com
                                            </Link>
                                            <Link
                                                to=""
                                                className="text-sencondary font-semibold text-sm"
                                            >
                                                +234XXXXXXXXXX
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 py-4 sm:pl-7 [&_input]:w-full [&_input]:shadow [&_input]:border [&_input]:border-[#94A3B8] [&_input]:rounded-lg [&_input]:p-2 ">
                                    {/* form input */}
                                    <form action="" method="post">
                                        <div className="flex max-[466px]:flex-col gap-4 mb-4">
                                            <input type="text" placeholder="First Name" aria-label="input your firstname" />
                                            <input type="text" placeholder="Last Name" aria-label="input your lastname" />
                                        </div>
                                        <input type="text" placeholder="Email" aria-label="input your email" />
                                        <div className="mt-4">
                                            <textarea
                                                placeholder="Message"
                                                rows={3}
                                                className="shadow w-full rounded-lg p-2 border border-[#94A3B8]"
                                            />
                                        </div>
                                        <div className="flex justify-end mt-5">
                                            <button className="btn-title">Submit</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ContactSection;