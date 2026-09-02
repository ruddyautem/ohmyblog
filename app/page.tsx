import Link from "next/link";
import { Suspense } from "react";
import MainCategories from "@/components/MainCategories";
import FeaturedPosts from "@/components/FeaturedPosts";
import PostList from "@/components/PostList";

const Homepage = () => {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Header Card */}
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-zinc-50/50 p-8 sm:p-12 lg:p-14 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center rounded-full border border-zinc-200/80 bg-white px-3.5 py-1 text-xs font-medium text-zinc-600 shadow-2xs">
              <span>Articles & Récits</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.08]">
              Partagez un peu de vous avec les autres.
            </h1>

            <p className="text-base sm:text-xl leading-relaxed text-zinc-600 max-w-2xl">
              Voyages, cuisine, astuces ou aventures du quotidien : découvrez des récits inspirants et partagez votre propre vision du monde.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/write"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 hover:shadow-sm"
              >
                <span>✍️ Commencer à écrire</span>
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 shadow-2xs transition-colors hover:bg-zinc-50"
              >
                Explorer les articles
              </Link>
            </div>
          </div>

          {/* Modern Interactive Draft Preview Card */}
          <div className="hidden lg:block w-80 flex-shrink-0 self-center">
            <Link
              href="/write"
              className="group relative block rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs transition-colors duration-200 hover:border-zinc-400 hover:bg-zinc-50/50"
            >
              {/* Window dots & Status tag */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80"></span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Prêt à publier
                </span>
              </div>

              {/* Story Prompt Preview */}
              <div className="py-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">✨</span>
                  <span className="text-sm font-bold text-zinc-900">Une histoire à raconter ?</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed italic">
                  &ldquo;Chaque expérience mérite d&apos;être partagée avec la communauté...&rdquo;
                </p>
              </div>

              {/* Action Button inside card */}
              <div className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-3 text-xs font-semibold text-white shadow-xs transition-colors group-hover:bg-zinc-800">
                <span>Rédiger mon article</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES BAR */}
      <Suspense fallback={<div className="h-16 rounded-2xl bg-zinc-100 animate-pulse"></div>}>
        <MainCategories />
      </Suspense>

      {/* FEATURED POSTS */}
      <FeaturedPosts />

      {/* RECENT POSTS FEED WITH BORDERED SIDEBAR */}
      <section className="pt-4">
        <div className="flex flex-col-reverse lg:flex-row lg:items-start gap-10 lg:gap-12">
          {/* Main Feed Column */}
          <div className="w-full lg:w-8/12">
            <div className="mb-8 flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Articles récents</h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">Les dernières publications de la communauté</p>
              </div>
              <Link
                href="/posts"
                className="text-xs sm:text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors flex items-center gap-1"
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
            <div className="rounded-3xl border border-zinc-200/80 bg-zinc-900 p-7 text-white shadow-xs">
              <div className="text-2xl mb-2">💡</div>
              <h3 className="text-lg font-bold">Une idée en tête ?</h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Racontez vos voyages, vos recettes ou vos astuces. Votre voix a de la valeur pour la communauté.
              </p>
              <Link
                href="/write"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-xs font-bold text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                ✍️ Rédiger un nouvel article
              </Link>
            </div>

            {/* Popular Topics Card */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-7 shadow-xs">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Thématiques</h3>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { label: "🌍 Voyages", cat: "voyages" },
                  { label: "🍳 Cuisine", cat: "cuisine" },
                  { label: "🐾 Animaux", cat: "animaux" },
                  { label: "💡 Astuces", cat: "astuces" },
                ].map((item) => (
                  <Link
                    key={item.cat}
                    href={`/posts?cat=${item.cat}`}
                    className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Community Links Card */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-7 shadow-xs">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400">À la une</h3>
              <div className="space-y-2.5 text-sm">
                <Link
                  href="/posts?sort=popular"
                  className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-zinc-50 font-medium text-zinc-800"
                >
                  <span className="flex items-center gap-2.5">
                    <span>📈</span>
                    <span>Les plus visités</span>
                  </span>
                  <span className="text-xs text-zinc-400">→</span>
                </Link>
                <Link
                  href="/posts?sort=featured"
                  className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-zinc-50 font-medium text-zinc-800"
                >
                  <span className="flex items-center gap-2.5">
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



