"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import PostListItem from "./PostListItem";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "next/navigation";
import { getPostsAction } from "@/app/actions";
import { type PostWithUser } from "@/lib/db/schema";

const PostList = () => {
  const searchParams = useSearchParams();

  const { data, error, fetchNextPage, hasNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ["posts", searchParams.toString()],
      queryFn: async ({ pageParam = 1 }) => {
        const searchParamsObj = Object.fromEntries(new URLSearchParams(searchParams.toString()));
        return await getPostsAction(pageParam as number, searchParamsObj);
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) =>
        lastPage.hasMore ? pages.length + 1 : undefined,
    });

  if (isPending) return "Chargement...";

  if (error) return "Une erreur est survenue : " + error.message;

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <>
      {allPosts.length === 0 ? (
        <p className="flex h-14 w-44 items-center justify-center rounded bg-gray-100 text-center">
          Aucun Post trouvé
        </p>
      ) : (
        <InfiniteScroll
          dataLength={allPosts.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={<h4>Chargement de plus de posts...</h4>}
        >
          {allPosts.map((post: PostWithUser) => (
            <PostListItem key={post._id} post={post} />
          ))}
        </InfiniteScroll>
      )}
    </>
  );
};

export default PostList;
