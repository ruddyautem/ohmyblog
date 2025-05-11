import { Link } from "react-router";
import writeIcon from "/writeblog.svg";
import MainCategories from "../components/MainCategories";
import FeaturedPosts from "../components/FeaturedPosts";
import PostList from "../components/PostList";

const Homepage = () => {
  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* BreadCrumbs */}
      <div className="flex gap-4">
        <Link to="/">Accueil</Link>
        <span>•</span>
        <span className="font-semibold underline">Posts et Articles</span>
      </div>
      {/* INTRO */}
      <div className="flex items-center justify-between">
        {/* titles */}
        <div className="text-center md:text-start xl:mr-14">
          <h1 className="text-2xl font-bold text-gray-800 md:text-5xl lg:text-6xl">
            Partagez un peu de vous avec les autres!
          </h1>
          <p className="text-md mt-8 md:text-xl">
            Que ce soit un voyage, une découverte, ou une expérience de vie, vos
            récits ont le pouvoir de connecter des gens et de créer des échanges
            riches.
          </p>
        </div>
        <Link to="write" className="relative hidden md:block">
          <svg
            viewBox="0 0 200 200"
            width="200"
            height="200"
            className="animatedButton animate-spin text-lg tracking-widest"
          >
            <path
              id="circlePath"
              fill="none"
              d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1, 1 -150,0"
            />
            <text>
              <textPath href="#circlePath" startOffset="0%">
                Vos Histoires •
              </textPath>
              <textPath href="#circlePath" startOffset="50%">
                Vos Aventures •
              </textPath>
            </text>
          </svg>
          <div className="absolute inset-0 top-0 flex items-center justify-center rounded-full">
            <img src={writeIcon} alt="" />
          </div>
        </Link>
        {/* animated button */}
      </div>
      {/* CATEGORIES */}
      <MainCategories />
      {/* FEATURED POSTS */}
      <FeaturedPosts />
      {/* POST LIST */}
      <div className="">
        <h1 className="my-8 text-center text-2xl text-gray-600 xl:text-start">
          Posts Récents
        </h1>
        <PostList />
      </div>
    </div>
  );
};

export default Homepage;
