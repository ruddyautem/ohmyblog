"use client";
import Link from "next/link";
import Image from "./Image";
import { useQuery } from "@tanstack/react-query";
import { format } from "timeago.js";
import "@/lib/timeago-fr";
import { getPostsAction } from "@/app/actions";

const FeaturedPosts = () => {
  const fetchPost = async () => {
    const res = await getPostsAction(1, { featured: "true", limit: "4" });
    return res;
  };

  const { isPending, error, data } = useQuery({
    queryKey: ["featuredPost"],
    queryFn: fetchPost,
  });

  if (isPending) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  const posts = data?.posts;
  if (!posts || posts.length === 0) return "Aucun post trouvé";

  return (
    <div className="mt-8 flex flex-col gap-8 lg:flex-row">
      {/* First Post */}
      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        {posts[0].img && (
          <Link href={`/${posts[0].slug}`} className="block">
            <Image
              src={posts[0].img}
              alt={posts[0].title}
              className="w-full h-full max-h-[414px] rounded object-cover"
              w="895"
            />
          </Link>
        )}
        <div className="flex items-center gap-4">
          <h1 className="font-semibold lg:text-lg">01.</h1>
          <Link
            href={`/?cat=${posts[0].category}`}
            className="font-semibold lg:text-lg capitalize"
          >
            {posts[0].category}
          </Link>
          <span className="text-gray">{format(posts[0].createdAt, "fr")}</span>
        </div>
        <Link
          href={`/${posts[0].slug}`}
          className="text-xl font-semibold lg:text-3xl lg:font-bold"
        >
          {posts[0].title}
        </Link>
      </div>

      {/* Other posts */}
      <div className="flex w-full flex-col gap-4 lg:w-1/2">
        {posts.slice(1, 4).map((post, idx) => {
          if (!post?.img) return null;
          const number = `0${idx + 2}.`;

          return (
            <div key={post._id} className="flex justify-between gap-4 lg:h-1/3">
              <Link
                href={`/${post.slug}`}
                className="block aspect-video w-1/3 rounded"
              >
                <Image
                  src={post.img}
                  alt={post.title}
                  className="h-full max-h-[414px] w-full rounded object-cover"
                  w="298"
                />
              </Link>
              <div className="w-2/3">
                <div className="mb-4 flex items-center gap-4 text-sm lg:text-base">
                  <h1 className="font-semibold">{number}</h1>
                  <Link href={`/?cat=${post.category}`} className="font-bold capitalize">
                    {post.category}
                  </Link>
                  <span className="text-sm text-gray-500">
                    {format(post.createdAt, "fr")}
                  </span>
                </div>
                <Link
                  href={`/${post.slug}`}
                  className="text-base font-medium sm:text-lg md:text-2xl lg:text-xl xl:text-2xl"
                >
                  {post.title}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedPosts;
