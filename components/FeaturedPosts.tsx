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

  if (isPending) {
    return (
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 h-96 rounded-3xl bg-zinc-100 animate-pulse"></div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="h-28 rounded-2xl bg-zinc-100 animate-pulse"></div>
          <div className="h-28 rounded-2xl bg-zinc-100 animate-pulse"></div>
          <div className="h-28 rounded-2xl bg-zinc-100 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) return <div className="py-8 text-center text-red-500">Erreur: {error.message}</div>;

  const posts = data?.posts;
  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Hero Featured Post */}
        <div className="lg:col-span-7">
          <article className="group relative flex h-full flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-zinc-300 hover:shadow-md">
            <div>
              {posts[0].img && (
                <Link
                  href={`/${posts[0].slug}`}
                  className="relative block aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-100"
                >
                  <Image
                    src={posts[0].img}
                    alt={posts[0].title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    w="895"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                      ⭐ En vedette
                    </span>
                  </div>
                </Link>
              )}

              <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500">
                <Link
                  href={`/posts?cat=${posts[0].category}`}
                  className="rounded-full bg-zinc-100 px-2.5 py-1 font-semibold text-zinc-800 capitalize transition-colors hover:bg-zinc-900 hover:text-white"
                >
                  {posts[0].category}
                </Link>
                <span>•</span>
                <span>{format(posts[0].createdAt, "fr")}</span>
                <span>•</span>
                <span>{posts[0].visit} vues</span>
              </div>

              <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-900 transition-colors sm:text-2xl lg:text-3xl group-hover:text-zinc-700">
                <Link href={`/${posts[0].slug}`}>{posts[0].title}</Link>
              </h2>

              {posts[0].desc && (
                <p className="mt-2 text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                  {posts[0].desc}
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <Link
                href={`/${posts[0].slug}`}
                className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors inline-flex items-center gap-1"
              >
                Lire l&apos;article complet →
              </Link>
            </div>
          </article>
        </div>

        {/* Side Ranked Featured Posts */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {posts.slice(1, 4).map((post, idx) => {
            const number = `0${idx + 2}`;

            return (
              <article
                key={post._id}
                className="group flex gap-4 rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-xs transition-all duration-300 hover:border-zinc-300 hover:shadow-sm"
              >
                {post?.img && (
                  <Link
                    href={`/${post.slug}`}
                    className="relative block h-24 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-28 sm:w-32"
                  >
                    <Image
                      src={post.img}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      w="298"
                    />
                  </Link>
                )}

                <div className="flex flex-1 flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-zinc-400">{number}</span>
                      <Link
                        href={`/posts?cat=${post.category}`}
                        className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-800 capitalize hover:bg-zinc-900 hover:text-white transition-colors"
                      >
                        {post.category}
                      </Link>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-400 text-[11px]">{format(post.createdAt, "fr")}</span>
                    </div>

                    <h3 className="mt-1.5 text-sm sm:text-base font-bold text-zinc-900 transition-colors line-clamp-2 group-hover:text-zinc-600">
                      <Link href={`/${post.slug}`}>{post.title}</Link>
                    </h3>
                  </div>

                  <Link
                    href={`/${post.slug}`}
                    className="text-xs font-semibold text-zinc-800 hover:text-zinc-500 transition-colors inline-flex items-center gap-1 mt-2"
                  >
                    Lire →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosts;
