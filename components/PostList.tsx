"use client";
import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import PostListItem from "./PostListItem";
import { useSearchParams } from "next/navigation";
import { getPostsAction } from "@/app/actions";
import { type PostWithUser } from "@/lib/db/schema";

const PostList = () => {
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isPending,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", searchParams.toString()],
    queryFn: async ({ pageParam = 1 }) => {
      const searchParamsObj = Object.fromEntries(new URLSearchParams(searchParams.toString()));
      return await getPostsAction(pageParam as number, searchParamsObj);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
  });

  // Native IntersectionObserver for smooth infinite loading
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isPending) {
    return (
      <div className="space-y-4 py-6">
        <div className="h-44 rounded-3xl bg-zinc-100 dark:bg-[#121826]/80 animate-pulse"></div>
        <div className="h-44 rounded-3xl bg-zinc-100 dark:bg-[#121826]/80 animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-6 text-center text-sm font-medium text-red-600 dark:text-red-400">
        Une erreur est survenue : {error.message}
      </div>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  if (allPosts.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-zinc-50/50 dark:bg-[#121826]/60 p-12 text-center">
        <p className="text-base font-semibold text-zinc-700 dark:text-slate-300">Aucun post trouvé</p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-slate-500">Essayez de modifier vos filtres ou effectuez une autre recherche.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allPosts.map((post: PostWithUser) => (
        <PostListItem key={post._id} post={post} />
      ))}

      {/* IntersectionObserver Trigger & Bottom Margin Spacer */}
      <div ref={loadMoreRef} className="py-6 text-center">
        {isFetchingNextPage && (
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-slate-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 dark:border-slate-700 border-t-zinc-900 dark:border-t-indigo-500"></span>
            <span>Chargement des posts suivants...</span>
          </div>
        )}
        {!hasNextPage && allPosts.length > 0 && !isFetchingNextPage && (
          <div className="pt-8 pb-12 text-center border-t border-zinc-100 dark:border-slate-800/80 mt-8">
            <p className="text-xs font-medium text-zinc-400 dark:text-slate-500">
              Vous avez atteint la fin des publications ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;
