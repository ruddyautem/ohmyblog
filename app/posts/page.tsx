"use client";
import { useState, Suspense } from "react";
import PostList from "@/components/PostList";
import SideMenu from "@/components/SideMenu";

const PostListPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Tous les articles
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Explorez l&apos;ensemble des récits, tutoriels et partages d&apos;expérience
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-xs transition-colors hover:bg-zinc-50 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span>{open ? "✕ Fermer les filtres" : "🔍 Filtrer & Rechercher"}</span>
        </button>
      </div>

      {/* Main Grid: Feed + Sidebar */}
      <div className="flex flex-col-reverse gap-8 md:flex-row md:items-start">
        <div className="w-full md:w-2/3 lg:w-3/4">
          <Suspense fallback={<div className="py-12 text-center text-zinc-400">Chargement des articles...</div>}>
            <PostList />
          </Suspense>
        </div>
        <div className={`${open ? "block" : "hidden"} w-full md:block md:w-1/3 lg:w-1/4`}>
          <Suspense fallback={<div className="py-12 text-center text-zinc-400">Chargement des filtres...</div>}>
            <SideMenu />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default PostListPage;

