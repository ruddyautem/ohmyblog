import { useInfiniteQuery } from "@tanstack/react-query";
import PostListItem from "./PostListItem";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "react-router";

const fetchPosts = async (pageParam, searchParams) => {
  const cleanParams = new URLSearchParams([...searchParams]);
  cleanParams.delete('__clerk_handshake'); // Remove Clerk's handshake param

  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts`, {
    params: { 
      page: pageParam, 
      limit: 10, 
      ...Object.fromEntries(cleanParams) 
    },
    withCredentials: true,
  });
  return res.data;
};

const PostList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data, error, fetchNextPage, hasNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ["posts", searchParams.toString()],
      queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam, searchParams),
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) =>
        lastPage.hasMore ? pages.length + 1 : undefined,
    });

  console.log(data);

  if (isFetching) return "Chargement...";

  if (error) return "An error has occurred: " + error.message;

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  console.log(data);

  return (
    <>
      {allPosts.length === 0 ? (
        <p className="flex h-14 w-44 items-center justify-center rounded bg-gray-100 text-center">
          Aucun Post trouvé
        </p>
      ) : (
        <InfiniteScroll
          dataLength={allPosts.length} //This is important field to render the next data
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={<h4>Chargement de plus de posts...</h4>}
          // endMessage={
          //   <p>
          //     <b>All Posts Loaded!</b>
          //   </p>
          // }
        >
          {allPosts.map((post) => (
            <PostListItem key={post._id} post={post} />
          ))}
        </InfiniteScroll>
      )}
    </>
  );
};

export default PostList;
