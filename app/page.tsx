import Link from "next/link";
import { Suspense } from "react";
import MainCategories from "@/components/MainCategories";
import FeaturedPosts from "@/components/FeaturedPosts";
import PostList from "@/components/PostList";
import Image from "next/image";

const Homepage = () => {
  return (
    <div className="space-y-10">
      {/* Hero Header Card */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-50/50 p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white px-3.5 py-1 text-xs font-semibold text-zinc-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Plateforme d&apos;écriture & de partage</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl leading-[1.1]">
              Partagez un peu de vous avec les autres.
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-zinc-600">
              Voyages, cuisine, astuces ou aventures du quotidien : découvrez des récits inspirants et partagez votre propre vision du monde.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/write"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 hover:shadow-sm"
              >
                <span>✍️ Commencer à écrire</span>
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-50"
              >
                Explorer les articles
              </Link>
            </div>
          </div>

          {/* Rotating Write CTA */}
          <Link href="/write" className="group relative hidden lg:flex flex-shrink-0 self-center">
            <svg
              viewBox="0 0 200 200"
              width="170"
              height="170"
              className="animatedButton animate-spin text-xs font-semibold uppercase tracking-widest text-zinc-700 transition-transform group-hover:scale-105"
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
              <div className="flex h-18 w-18 items-center justify-center rounded-full bg-zinc-900 shadow-lg ring-4 ring-zinc-100 transition-transform duration-300 group-hover:scale-110 group-hover:bg-zinc-800">
                <Image
                  src="/writeblog.svg"
                  alt="Écrire un post"
                  width={40}
                  height={40}
                  className="h-8 w-8 brightness-0 invert"
                />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* CATEGORIES BAR */}
      <Suspense fallback={<div className="h-14 rounded-2xl bg-zinc-100 animate-pulse"></div>}>
        <MainCategories />
      </Suspense>

      {/* FEATURED POSTS */}
      <FeaturedPosts />

      {/* RECENT POSTS FEED WITH BORDERED SIDEBAR */}
      <section className="pt-4">
        <div className="flex flex-col-reverse lg:flex-row lg:items-start gap-8">
          {/* Main Feed Column */}
          <div className="w-full lg:w-8/12">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Articles récents</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Les dernières publications de la communauté</p>
              </div>
              <Link
                href="/posts"
                className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-1"
              >
                Tout voir →
              </Link>
            </div>
            <Suspense fallback={<div className="py-12 text-center text-zinc-400">Chargement des articles...</div>}>
              <PostList />
            </Suspense>
          </div>

          {/* Right Sidebar with Bordered Cards */}
          <aside className="w-full lg:w-4/12 space-y-6 sticky top-24">
            {/* Write Callout Card */}
            <div className="rounded-3xl border border-zinc-200/80 bg-zinc-900 p-6 text-white shadow-xs">
              <div className="text-2xl mb-2">💡</div>
              <h3 className="text-lg font-bold">Une idée en tête ?</h3>
              <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                Racontez vos voyages, vos recettes ou vos astuces. Votre voix a de la valeur pour la communauté.
              </p>
              <Link
                href="/write"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                ✍️ Rédiger un nouvel article
              </Link>
            </div>

            {/* Popular Topics Card */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Thématiques</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "🌍 Voyages", cat: "voyages" },
                  { label: "🍳 Cuisine", cat: "cuisine" },
                  { label: "🐾 Animaux", cat: "animaux" },
                  { label: "💡 Astuces", cat: "astuces" },
                ].map((item) => (
                  <Link
                    key={item.cat}
                    href={`/posts?cat=${item.cat}`}
                    className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Community Links Card */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">À la une</h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="/posts?sort=popular"
                  className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-zinc-50 font-medium text-zinc-800"
                >
                  <span className="flex items-center gap-2">
                    <span>🔥</span>
                    <span>Les plus visités</span>
                  </span>
                  <span className="text-xs text-zinc-400">→</span>
                </Link>
                <Link
                  href="/posts?sort=featured"
                  className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-zinc-50 font-medium text-zinc-800"
                >
                  <span className="flex items-center gap-2">
                    <span>⭐</span>
                    <span>Sélection éditoriale</span>
                  </span>
                  <span className="text-xs text-zinc-400">→</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Homepage;



