import Link from "next/link";
import { Suspense } from "react";
import Search from "@/components/Search";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center text-center px-4 py-12 sm:py-20">
      {/* 404 Badge */}
      <div className="mb-4 inline-flex items-center rounded-full border border-zinc-200/80 dark:border-indigo-500/30 bg-zinc-50 dark:bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-zinc-700 dark:text-indigo-300 shadow-2xs">
        Erreur 404
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
        Oups, page introuvable !
      </h1>

      <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-slate-400 max-w-md leading-relaxed">
        L&apos;article ou la page que vous recherchez a peut-être été déplacé, supprimé ou n&apos;a jamais existé.
      </p>

      {/* Perfectly Centered & Sized Search Bar */}
      <div className="mt-8 w-full max-w-lg mx-auto flex flex-col items-center">
        <p className="mb-2 text-xs font-medium text-zinc-400 dark:text-slate-500">
          Rechercher un récit, une recette ou une astuce :
        </p>
        <div className="w-full">
          <Suspense fallback={<div className="h-11 w-full rounded-full bg-zinc-100 dark:bg-[#121826] animate-pulse" />}>
            <Search
              className="w-full h-11 sm:h-12 border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#121826] shadow-xs hover:border-zinc-300 dark:hover:border-indigo-500/40"
              placeholder="Ex : road trip, chocolat, dressage..."
            />
          </Suspense>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-linear-to-r dark:from-indigo-600 dark:to-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 dark:hover:from-indigo-500 dark:hover:to-blue-500"
        >
          ← Retour à l&apos;accueil
        </Link>
        <Link
          href="/posts"
          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-[#121826] px-5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-slate-200 shadow-2xs transition-colors hover:bg-zinc-50 dark:hover:bg-[#182032]"
        >
          Explorer tous les posts
        </Link>
      </div>
    </div>
  );
}
