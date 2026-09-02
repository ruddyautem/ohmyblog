"use client";
import { useState, Suspense } from "react";
import PostList from "@/components/PostList";
import SideMenu from "@/components/SideMenu";

const PostListPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="">
      <h1 className="mb-8 text-2xl">Tous les posts</h1>
      <button
        className="mb-4 rounded bg-gray-200 px-4 py-2 md:hidden"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "Fermer" : "Filtrer ou rechercher"}
      </button>
      <div className="flex flex-col-reverse gap-8 md:flex-row">
        <div className="md:w-2/3 lg:w-3/4">
          <Suspense fallback="Chargement des posts...">
             <PostList />
          </Suspense>
        </div>
        <div className={`${open ? "block" : "hidden"} md:block md:w-1/3 lg:w-1/4`}>
          <Suspense fallback="Chargement des filtres...">
            <SideMenu />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default PostListPage;

