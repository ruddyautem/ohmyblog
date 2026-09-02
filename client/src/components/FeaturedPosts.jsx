import { Link } from "react-router";
import Image from "./Image";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { format } from "timeago.js";

const FeaturedPosts = () => {
  const fetchPost = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/posts/?featured=true&limit=4&sort=newest`,
    );
    return res.data;
  };

  const { isPending, error, data } = useQuery({
    queryKey: ["featuredPost"],
    queryFn: fetchPost,
  });

  if (isPending) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  const posts = data.posts;
  if (!posts || posts.length === 0) return "Post not found";

  return (
    <div className="mt-8 flex flex-col gap-8 lg:flex-row">
      {/* First Post */}
      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        {posts[0].img && (
          <Link to={posts[0].slug}>
            <Image
              src={posts[0].img}
              className="max-h-[414px] rounded object-cover"
              w="895"
            />
          </Link>
        )}
        <div className="flex items-center gap-4">
          <h1 className="font-semibold lg:text-lg">01.</h1>
          <Link
            to={`/?cat=${posts[0].category}`}
            className="font-semibold lg:text-lg"
          >
            {posts[0].category}
          </Link>
          <span className="text-gray">{format(posts[0].createdAt, "fr")}</span>
        </div>
        <Link
          to={posts[0].slug}
          className="text-xl font-semibold lg:text-3xl lg:font-bold"
        >
          {posts[0].title}
        </Link>
      </div>

      {/* Other posts */}
      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        {/* Second */}
        {posts[1]?.img && (
          <div className="flex justify-between gap-4 lg:h-1/3">
            <Link
              to={posts[1].slug}
              className="block aspect-video w-1/3 rounded"
            >
              <Image
                src={posts[1].img}
                className="h-full max-h-[414px] w-full rounded object-cover"
                w="298"
              />
            </Link>
            <div className="w-2/3">
              <div className="mb-4 flex items-center gap-4 text-sm lg:text-base">
                <h1 className="font-semibold">02.</h1>
                <Link to={`/?cat=${posts[1].category}`} className="font-bold">
                  {posts[1].category}
                </Link>
                <span className="text-sm text-gray-500">
                  {format(posts[1].createdAt, "fr")}
                </span>
              </div>
              <Link
                to={posts[1].slug}
                className="text-base font-medium sm:text-lg md:text-2xl lg:text-xl xl:text-2xl"
              >
                {posts[1].title}
              </Link>
            </div>
          </div>
        )}

        {/* Third */}
        {posts[2]?.img && (
          <div className="flex justify-between gap-4 lg:h-1/3">
            <Link
              to={posts[2].slug}
              className="block aspect-video w-1/3 rounded"
            >
              <Image
                src={posts[2].img}
                className="h-full max-h-[414px] w-full rounded object-cover"
                w="298"
              />
            </Link>
            <div className="w-2/3">
              <div className="mb-4 flex items-center gap-4 text-sm lg:text-base">
                <h1 className="font-semibold">03.</h1>
                <Link to={`/?cat=${posts[2].category}`} className="font-bold">
                  {posts[2].category}
                </Link>
                <span className="text-sm text-gray-500">
                  {format(posts[2].createdAt, "fr")}
                </span>
              </div>
              <Link
                to={posts[2].slug}
                className="text-base font-medium sm:text-lg md:text-2xl lg:text-xl xl:text-2xl"
              >
                {posts[2].title}
              </Link>
            </div>
          </div>
        )}

        {/* Fourth */}
        {posts[3]?.img && (
          <div className="flex justify-between gap-4 lg:h-1/3">
            <Link
              to={posts[3].slug}
              className="block aspect-video w-1/3 rounded"
            >
              <Image
                src={posts[3].img}
                className="h-full max-h-[414px] w-full rounded object-cover"
                w="298"
              />
            </Link>
            <div className="w-2/3">
              <div className="mb-4 flex items-center gap-4 text-sm lg:text-base">
                <h1 className="font-semibold">04.</h1>
                <Link to={`/?cat=${posts[3].category}`} className="font-bold">
                  {posts[3].category}
                </Link>
                <span className="text-sm text-gray-500">
                  {format(posts[3].createdAt, "fr")}
                </span>
              </div>
              <Link
                to={posts[3].slug}
                className="text-base font-medium sm:text-lg md:text-2xl lg:text-xl xl:text-2xl"
              >
                {posts[3].title}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedPosts;
