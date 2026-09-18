import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import FeaturedPosts from "@/components/FeaturedPosts";
import PostList from "@/components/PostList";

const Homepage = () => {
  return (
    <div className="space-y-8 sm:space-y-12 lg:space-y-16">
      {/* Hero Header Card */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-zinc-50/50 dark:bg-[#121826]/70 p-5 sm:p-10 lg:p-14 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-10">
          <div className="max-w-3xl space-y-3.5 sm:space-y-5">
            <div className="inline-flex items-center rounded-full border border-zinc-200/80 dark:border-indigo-500/30 bg-white dark:bg-indigo-500/10 px-3 py-1 text-[11px] sm:text-xs font-medium text-zinc-600 dark:text-indigo-300 shadow-2xs">
              <span>Posts & Récits</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
              Partagez un peu de vous avec les autres.
            </h1>

            <p className="text-sm sm:text-lg lg:text-xl leading-relaxed text-zinc-600 dark:text-slate-400 max-w-2xl">
              Voyages, cuisine, astuces ou aventures du quotidien : découvrez des récits inspirants et partagez votre propre vision du monde.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/write"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-linear-to-r dark:from-indigo-600 dark:to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 dark:hover:from-indigo-500 dark:hover:to-blue-500 dark:shadow-[0_0_20px_rgba(99,102,241,0.35)] text-center"
              >
                <span>✍️ Commencer à écrire</span>
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-[#182032] px-5 py-3 text-sm font-semibold text-zinc-800 dark:text-slate-200 shadow-2xs transition-colors hover:bg-zinc-50 dark:hover:bg-[#1e293b] dark:hover:border-slate-600 text-center"
              >
                Explorer les posts
              </Link>
            </div>
          </div>

          {/* OhMyBlog Brand Creator Box */}
          <div className="hidden lg:block w-96 xl:w-102.5 shrink-0 self-center">
            <Link
              href="/write"
              className="group relative block rounded-3xl border border-zinc-200/90 dark:border-slate-800 bg-white dark:bg-[#121826] p-7 xl:p-8 shadow-xs transition-all duration-200 hover:border-zinc-900 dark:hover:border-indigo-500/50 hover:shadow-md dark:hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)]"
            >
              {/* Brand Header */}
              <div className="flex items-center gap-3.5 border-b border-zinc-100 dark:border-slate-800 pb-5">
                <Image
                  src="/logo.png"
                  alt="OhMyBlog Logo"
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain dark:invert transition-all"
                />
                <div>
                  <span className="text-base font-bold text-zinc-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">OhMyBlog!</span>
                  <span className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400">Espace contributeur</span>
                </div>
              </div>

              {/* Story Prompt */}
              <div className="py-6 space-y-2.5">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-snug">
                  Votre récit a sa place ici.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400 leading-relaxed">
                  Rejoignez les auteurs d&apos;OhMyBlog et partagez vos passions et expériences avec la communauté.
                </p>
              </div>

              {/* Action Button inside card */}
              <div className="flex items-center justify-between rounded-xl bg-zinc-900 dark:bg-linear-to-r dark:from-indigo-600 dark:to-blue-600 px-5 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all group-hover:bg-zinc-800 dark:group-hover:from-indigo-500 dark:group-hover:to-blue-500 dark:shadow-[0_0_16px_rgba(99,102,241,0.3)]">
                <span>✍️ Rédiger un post</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED POSTS */}
      <FeaturedPosts />

      {/* RECENT POSTS FEED WITH BORDERED SIDEBAR */}
      <section className="pt-4">
        <div className="flex flex-col-reverse lg:flex-row lg:items-start gap-8 lg:gap-12">
          {/* Main Feed Column */}
          <div className="w-full lg:w-8/12">
            <div className="mb-5 sm:mb-8 flex items-center justify-between border-b border-zinc-100 dark:border-slate-800 pb-3 sm:pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Posts récents</h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400 mt-0.5 sm:mt-1">Les dernières publications de la communauté</p>
              </div>
              <Link
                href="/posts"
                className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-indigo-400 hover:text-zinc-600 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 shrink-0 ml-2"
              >
                Tout voir →
              </Link>
            </div>
            <Suspense fallback={<div className="py-12 text-center text-zinc-400 dark:text-slate-500">Chargement des posts...</div>}>
              <PostList />
            </Suspense>
          </div>

          {/* Right Sidebar with Bordered Cards */}
          <aside className="w-full lg:w-4/12 space-y-5 sm:space-y-6">
            {/* Write Callout Card */}
            <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-zinc-900 dark:bg-linear-to-br dark:from-[#182032] dark:to-[#121826] p-5 sm:p-7 text-white shadow-xs">
              <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2">💡</div>
              <h3 className="text-base sm:text-lg font-bold">Une idée en tête ?</h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-300 dark:text-slate-400 leading-relaxed">
                Racontez vos voyages, vos recettes ou vos astuces. Votre voix a de la valeur pour la communauté.
              </p>
              <Link
                href="/write"
                className="mt-4 sm:mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white dark:bg-linear-to-r dark:from-indigo-600 dark:to-blue-600 px-4 py-2.5 sm:py-3 text-xs font-bold text-zinc-900 dark:text-white transition-all hover:bg-zinc-100 dark:hover:from-indigo-500 dark:hover:to-blue-500 dark:shadow-[0_0_16px_rgba(99,102,241,0.3)]"
              >
                ✍️ Rédiger un nouveau post
              </Link>
            </div>

            {/* Popular Topics Card */}
            <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#121826] p-5 sm:p-7 shadow-xs">
              <h3 className="mb-3 sm:mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500">Thématiques</h3>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {[
                  { label: "🌍 Voyages", cat: "voyages" },
                  { label: "🍳 Cuisine", cat: "cuisine" },
                  { label: "🐾 Animaux", cat: "animaux" },
                  { label: "💡 Astuces", cat: "astuces" },
                ].map((item) => (
                  <Link
                    key={item.cat}
                    href={`/posts?cat=${item.cat}`}
                    className="rounded-xl border border-zinc-200/70 dark:border-slate-700/80 bg-zinc-50/60 dark:bg-[#182032] px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-medium text-zinc-700 dark:text-slate-300 transition-colors hover:bg-zinc-900 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white dark:hover:border-indigo-500"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Community Links Card */}
            <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#121826] p-5 sm:p-7 shadow-xs">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500 pl-2">À la une</h3>
              <div className="space-y-3 text-sm">
                <Link
                  href="/posts?sort=popular"
                  className="flex items-center justify-between rounded-2xl border border-zinc-200/60 dark:border-slate-800 bg-zinc-50/70 dark:bg-[#182032]/70 p-3.5 transition-colors hover:bg-zinc-100/80 dark:hover:bg-[#1e293b] font-medium text-zinc-800 dark:text-slate-200 shadow-2xs"
                >
                  <span className="flex items-center gap-2.5">
                    <span>📈</span>
                    <span>Les plus visités</span>
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-slate-500 font-semibold">→</span>
                </Link>
                <Link
                  href="/posts?sort=featured"
                  className="flex items-center justify-between rounded-2xl border border-zinc-200/60 dark:border-slate-800 bg-zinc-50/70 dark:bg-[#182032]/70 p-3.5 transition-colors hover:bg-zinc-100/80 dark:hover:bg-[#1e293b] font-medium text-zinc-800 dark:text-slate-200 shadow-2xs"
                >
                  <span className="flex items-center gap-2.5">
                    <span>⭐</span>
                    <span>Sélection éditoriale</span>
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-slate-500 font-semibold">→</span>
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



