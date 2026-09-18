"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PostList from "@/components/PostList";
import SideMenu from "@/components/SideMenu";

const categoryNames: Record<string, string> = {
  voyages: "Voyages",
  cuisine: "Cuisine",
  animaux: "Animaux",
  astuces: "Astuces",
  general: "Général",
};

const PostListHeaderContent = ({ open, setOpen }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const searchParams = useSearchParams();
  const cat = searchParams.get("cat");
  const sort = searchParams.get("sort");
  const search = searchParams.get("search");
  const isFeatured = sort === "featured" || searchParams.get("featured") === "true";
  const author = searchParams.get("author");

  let title = "Tous les posts";
  let subtitle = "Explorez l'ensemble des récits, tutoriels et partages d'expérience de la communauté";

  if (search) {
    title = `Recherche : « ${search} »`;
    subtitle = "Tous les posts correspondant à vos mots-clés";
  } else if (author) {
    title = `Posts de ${author}`;
    subtitle = `Toutes les publications partagées par ${author}`;
  } else if (cat) {
    const formattedCat = categoryNames[cat.toLowerCase()] || cat.charAt(0).toUpperCase() + cat.slice(1);
    title = `Posts ${formattedCat}`;
    subtitle = `Découvrez tous les posts dédiés à la thématique ${formattedCat.toLowerCase()}`;
  } else if (sort === "popular") {
    title = "Posts populaires";
    subtitle = "Les publications les plus lues et consultées du blog";
  } else if (isFeatured) {
    title = "Posts en vedette";
    subtitle = "Notre sélection éditoriale exclusive et les récits coups de cœur";
  } else if (sort === "oldest") {
    title = "Premiers posts";
    subtitle = "Explorez les premières publications et archives du blog";
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 dark:border-slate-800 pb-4 sm:pb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
          {title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-[#121826] px-4 py-2.5 text-sm font-semibold text-zinc-800 dark:text-slate-200 shadow-xs transition-colors hover:bg-zinc-50 dark:hover:bg-[#182032] md:hidden cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{open ? "✕ Fermer les filtres" : "🔍 Filtrer & Rechercher"}</span>
      </button>
    </div>
  );
};

const PostListPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8 mb-12 sm:mb-6">
      {/* Dynamic Page Header */}
      <Suspense fallback={<div className="h-20 border-b border-zinc-100 dark:border-slate-800 pb-6 animate-pulse bg-zinc-50 dark:bg-[#121826] rounded-2xl"></div>}>
        <PostListHeaderContent open={open} setOpen={setOpen} />
      </Suspense>

      {/* Main Grid: Feed + Sidebar */}
      <div className="flex flex-col-reverse gap-8 md:flex-row md:items-start pb-8 lg:pb-0">
        <div className="w-full md:w-2/3 lg:w-3/4">
          <Suspense fallback={<div className="py-12 text-center text-zinc-400 dark:text-slate-500">Chargement des posts...</div>}>
            <PostList />
          </Suspense>
        </div>
        <div className={`${open ? "block" : "hidden"} w-full md:block md:w-1/3 lg:w-1/4`}>
          <Suspense fallback={<div className="py-12 text-center text-zinc-400 dark:text-slate-500">Chargement des filtres...</div>}>
            <SideMenu />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default PostListPage;

