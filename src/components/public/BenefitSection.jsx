import { useMemo } from "react";


export default function BenefitSection() {

    // details for the benefit section
    const benefitsData = useMemo(() => (
        [
            {
                title: `Personalized Learning at Your Convenience`,
                description:
                "We provide flexible, on-demand tutorials that allow you to learn at your own pace, from anywhere and at any time. Whether you're revising late at night or catching up over the weekend, our platform fits seamlessly into your schedule.",
            },
            {
                title: "Expert-Led Weekly Masterclasses",
                description:
                "Every week, you’ll have access to live sessions where experienced teachers and subject matter experts break down complex topics, share tips, and answer your questions directly. This interactive experience ensures you gain deep insights and clarity on challenging subjects.",
            },
            {
                title: "Comprehensive Study Resources",
                description:
                "From detailed video lessons and practice questions to past exam papers and study guides, Tutorial Center equips you with a rich library of resources tailored to Nigerian syllabuses. Everything you need to prepare thoroughly is just a click away.",
            },
            {
                title: "Interactive Learning Tools",
                description:
                "Our platform features an intuitive Learning Management System (LMS) designed to enhance engagement and retention. Take quizzes, track your progress, and set study goals to stay motivated and organized throughout your journey.",
            },
            {
                title: "Bridging the Gap to Quality Education",
                description:
                "We’re breaking barriers to education by ensuring that high-quality tutorials and study materials are accessible and affordable for students across Nigeria, regardless of location or financial status.",
            },
            {
                title: "Join a Community of Learners",
                description:
                "When you become part of Tutorial Center, you’re joining a thriving community of learners and educators. Share ideas, collaborate with peers, and find inspiration as you work towards your academic dreams.",
            },
        ]
    ), [])

    return (
        <>
            <div className="py-14 w-full">
                <div className="Container !overflow-visible">
                    <div className="mb-4 area-wrapper">
                        <h3 className="header-title uppercase text-center mb-4">
                            Our Core Benefits
                        </h3>
                        <p className="text-sm leading-6 text-center">
                            At Tutorial Center, we understand the challenges faced by Nigerian
                            students preparing for critical exams like JAMB, WAEC, NECO, and
                            GCE. That’s why we’ve built a platform that not only addresses
                            these challenges but empowers you to achieve your academic goals
                            with confidence and ease
                        </p>
                    </div>
                    <div className="my-6">
                        <h3 className="text-sencondary text-center text-base font-semibold mb-8">
                            Here’s why Tutorial Center is your ultimate e-learning partner:
                        </h3>
                        <div className="grid lg:grid-cols-2 gap-x-10 gap-y-5">
                            {benefitsData.map((item, index) => (
                                <div
                                    className="bg-[#E336290D] shadow-xl py-5 px-5 rounded-3xl border-l-[10px] border-l-[#E83831]"
                                    key={index}
                                >
                                    <h4 className="text-base font-bold text-sencondary mb-3 ">
                                        {item.title}
                                    </h4>
                                    <p className="leading-6 text-[14.5px]">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
