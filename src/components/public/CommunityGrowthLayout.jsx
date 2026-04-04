import { Link } from "react-router-dom";

export default function CommunityGrowthLayout({ title, semititle, desc, Sdesc, btnTitle, btnPath, imgPath}) {
    
    return (
        <>
            <div className="bg-[#09314F] flex flex-col-reverse md:grid md:grid-cols-2 items-stretch min-w-full min-h-[500px]">
                <div className="flex justify-end items-center py-12 md:py-16">
                    <div className="w-full max-w-[600px] px-5 lg:px-8 2xl:px-9">
                        <div className="blockContent mb-14">
                            <h2 className="text-white text-2xl md:text-3xl font-extrabold uppercase mb-5 leading-tight">{title}</h2>
                            <h4 className="text-ascent text-sm md:text-base font-bold mb-4 uppercase tracking-wider">
                                {semititle}
                            </h4>
                            <p className="text-white text-sm md:text-base leading-relaxed mb-6 opacity-90">{desc}</p>
                            <p className="text-xs md:text-sm text-ascent font-medium italic">{Sdesc}</p>
                        </div>
                        <Link
                            className="inline-block text-white text-sm font-bold bg-sencondary px-10 py-4 rounded-2xl shadow-lg hover:brightness-110 transition-all active:scale-95"
                            to={btnPath}
                        >
                            {btnTitle}
                        </Link>
                    </div>
                </div>
                <div className="w-full h-full relative overflow-hidden">
                    <div className="absolute left-0 bottom-0 bg-gradient-to-t md:bg-gradient-to-r from-[#09314F] via-[#09314F]/40 to-transparent w-full h-full z-10"></div>
                    <img src={imgPath} className="w-full h-full object-cover" alt={title} />
                </div>
            </div>
        </>
    );
}
