import React from "react";
import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import BlogHero from "../../assets/images/Blogs.jpg";
import handCup from "../../assets/images/handCup.jpg";

// ── Placeholder blog data (lorem ipsum — replace with real API later) ──
const FEATURED = {
  image: handCup,
  category: "Lorem Ipsum",
  tag: "Nache",
  title: "Lorem Ipsum Posuere Bibendum Fames Cursus.",
  excerpt:
    "Lorem ipsum dolor sit amet consectetur adipiscing elit. Ultrices pretium eu sit nam arcu. Eam habitasse massa pellentesque posuere pellentesque nec as tortor. Egestas mauris purus, uma nibn. Et tincidunt eros, in vitae facilisi erat eget.",
  author: "Lorem Ipsum",
  date: "Lorem Ipsum",
};

const POSTS = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  image: handCup,
  category: "Lorem Ipsum",
  tag: "Nache",
  title: "Lorem Ipsum Posuere Bibendum Fames Cursus.",
  excerpt:
    "Lorem ipsum dolor sit amet consectetur. Imperdiet vulfare fames ullamcorper diu tortor. Et habitusse massa pellentesque posuere.",
  author: "Lorem Ipsum",
  date: "Lorem Ipsum",
}));

// ── Reusable Blog Card ──
const BlogCard = ({ post, featured = false }) => (
  <article
    className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col ${
      featured ? "md:flex-row gap-0" : ""
    }`}
  >
    {/* Image */}
    <div
      className={`overflow-hidden flex-shrink-0 ${
        featured
          ? "w-full md:w-[42%] h-56 md:h-auto"
          : "w-full h-44"
      }`}
    >
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
      />
    </div>

    {/* Content */}
    <div className={`flex flex-col justify-center p-5 ${featured ? "md:p-8 flex-1" : ""}`}>
      {/* Tags */}
      <div className="flex gap-2 mb-3">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          {post.category}
        </span>
        <span className="text-[11px] font-bold text-[#09314F] bg-[#EBF0F5] px-2 py-0.5 rounded">
          {post.tag}
        </span>
      </div>

      {/* Title */}
      <h2
        className={`font-black text-[#09314F] leading-tight mb-3 uppercase tracking-tight ${
          featured ? "text-2xl md:text-3xl" : "text-[14px]"
        }`}
      >
        {post.title}
      </h2>

      {/* Excerpt */}
      <p
        className={`text-gray-500 leading-relaxed mb-5 ${
          featured ? "text-sm md:text-base" : "text-[12px] line-clamp-3"
        }`}
      >
        {post.excerpt}
      </p>

      {/* Author */}
      <div className="flex items-center gap-2 mt-auto">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#09314F] to-[#E83831] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
          L
        </div>
        <div>
          <p className="text-[11px] font-black text-[#09314F]">{post.author}</p>
          <p className="text-[10px] text-gray-400">{post.date}</p>
        </div>
      </div>
    </div>
  </article>
);

const Blog = () => {
  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <div className="relative z-30 w-full h-[273px]">
        <div
          className="absolute w-full h-full bg-cover bg-no-repeat bg-center"
          style={{ backgroundImage: `url(${BlogHero})` }}
        />
        <div className="absolute w-full h-full bg-black opacity-40" />
        <div className="w-full h-full flex flex-col items-center justify-center relative z-50 gap-2">
          <h1 className="uppercase text-white text-3xl md:text-4xl font-black tracking-widest">
            Blog
          </h1>
          <p className="text-white/70 text-sm font-medium tracking-wide">
            Lorem Ipsum Vitae Felis Morbi Tincidunt St.
          </p>
        </div>
      </div>

      {/* ── GRADIENT WRAPPER (matches Career page pattern) ── */}
      <div className="bg-gradient-to-r from-[#09314F] to-[#E83831]">

        {/* ── FEATURED POST + GRID SECTION ── */}
        <section className="w-full bg-white rounded-b-[80px] md:rounded-b-[100px] overflow-hidden pb-24 font-sans">
          <div className="Container py-14">

            {/* Featured Post */}
            <div className="mb-10">
              <BlogCard post={FEATURED} featured />
            </div>

            {/* Divider */}
            <hr className="border-gray-100 mb-10" />

            {/* Blog Grid — 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {POSTS.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

          </div>
        </section>

      </div>

      <Footer />
    </>
  );
};

export default Blog;
