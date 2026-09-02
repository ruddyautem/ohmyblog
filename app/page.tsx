import Link from "next/link";
import { Suspense } from "react";
import MainCategories from "@/components/MainCategories";
import FeaturedPosts from "@/components/FeaturedPosts";
import PostList from "@/components/PostList";
import Image from "next/image";

const Homepage = () => {
  return (
    <div className="flex flex-col gap-10">
      {/* Breadcrumb Chip */}
      <div className="flex items-center gap-2 pt-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
          <Link href="/" className="hover:text-zinc-900 transition-colors">Accueil</Link>
          <span className="text-zinc-400">•</span>
          <span className="text-zinc-900 font-semibold">Articles & Histoires</span>
        </span>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-4">
        {/* Headline & Description */}
        <div className="max-w-2xl text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            Partagez un peu de vous avec les autres<span className="text-zinc-400">.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-600">
            Voyages, cuisine, astuces ou aventures du quotidien : découvrez des récits inspirants et partagez votre propre vision du monde.
          </p>
        </div>

        {/* Rotating Write CTA */}
        <Link href="/write" className="group relative flex-shrink-0">
          <svg
            viewBox="0 0 200 200"
            width="180"
            height="180"
            className="animatedButton animate-spin text-sm font-semibold uppercase tracking-widest text-zinc-700 transition-transform group-hover:scale-105"
          >
            <path
              id="circlePath"
              fill="none"
              d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1, 1 -150,0"
            />
            <text fill="currentColor">
              <textPath href="#circlePath" startOffset="0%">
                Vos Histoires •
              </textPath>
              <textPath href="#circlePath" startOffset="50%">
                Vos Aventures •
              </textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 shadow-lg ring-4 ring-zinc-100 transition-transform duration-300 group-hover:scale-110 group-hover:bg-zinc-800">
              <Image
                src="/writeblog.svg"
                alt="Écrire un post"
                width={48}
                height={48}
                className="h-10 w-10 brightness-0 invert"
              />
            </div>
          </div>
        </Link>
      </div>

      {/* CATEGORIES BAR */}
      <Suspense fallback={<div className="h-14 rounded-2xl bg-zinc-100 animate-pulse"></div>}>
        <MainCategories />
      </Suspense>

      {/* FEATURED POSTS */}
      <FeaturedPosts />

      {/* POST LIST */}
      <div className="mt-6">
        <div className="mb-8 flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Articles récents</h2>
            <p className="text-sm text-zinc-500 mt-1">Les dernières publications de la communauté</p>
          </div>
          <Link
            href="/posts"
            className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-1"
          >
            Tout voir →
          </Link>
        </div>
        <Suspense fallback={<div className="py-12 text-center text-zinc-400">Chargement des articles...</div>}>
          <PostList />
        </Suspense>
      </div>
    </div>
  );
};

export default Homepage;



