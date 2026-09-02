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
        <div className="h-44 rounded-3xl bg-zinc-100 animate-pulse"></div>
        <div className="h-44 rounded-3xl bg-zinc-100 animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-600">
        Une erreur est survenue : {error.message}
      </div>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  if (allPosts.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-200/80 bg-zinc-50/50 p-12 text-center">
        <p className="text-base font-semibold text-zinc-700">Aucun article trouvé</p>
        <p className="mt-1 text-xs text-zinc-400">Essayez de modifier vos filtres ou effectuez une autre recherche.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allPosts.map((post: PostWithUser) => (
        <PostListItem key={post._id} post={post} />
      ))}

      {/* IntersectionObserver Trigger */}
      <div ref={loadMoreRef} className="py-4 text-center">
        {isFetchingNextPage && (
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"></span>
            <span>Chargement des articles suivants...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;
