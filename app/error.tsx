"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log runtime errors in development/monitoring
    console.error("[App Error Boundary caught]:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center px-4 py-12 sm:py-20">
      <div className="mb-4 inline-flex items-center rounded-full border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 px-3.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
        Une erreur est survenue
      </div>

      <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Quelque chose s&apos;est mal passé
      </h1>

      <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-slate-400 max-w-md leading-relaxed">
        Nous n&apos;avons pas pu charger cette page correctement. Vous pouvez tenter de recharger ou revenir à l&apos;accueil.
      </p>

      {error?.message && process.env.NODE_ENV === "development" && (
        <pre className="mt-4 max-w-full overflow-x-auto rounded-xl bg-zinc-100 dark:bg-[#121826] p-3 text-left text-xs text-red-600 dark:text-red-400 border border-zinc-200 dark:border-slate-800">
          {error.message}
        </pre>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-linear-to-r dark:from-indigo-600 dark:to-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 dark:hover:from-indigo-500 dark:hover:to-blue-500 cursor-pointer"
        >
          🔄 Réessayer
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-[#121826] px-5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-slate-200 shadow-2xs transition-colors hover:bg-zinc-50 dark:hover:bg-[#182032]"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
