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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Main Hero Featured Post */}
        <div className="lg:col-span-7">
          <article className="group relative flex h-full flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-4.5 sm:p-6 lg:p-7 shadow-xs transition-colors duration-200 hover:border-zinc-300 hover:shadow-md cursor-pointer">
            {/* Master Stretched Link */}
            <Link
              href={`/${posts[0].slug}`}
              className="absolute inset-0 z-0 rounded-3xl"
              aria-label={posts[0].title}
            />

            <div>
              {posts[0].img && (
                <div className="relative z-10 block aspect-video w-full overflow-hidden rounded-2xl bg-zinc-100">
                  <Image
                    src={posts[0].img}
                    alt={posts[0].title}
                    className="h-full w-full object-cover"
                    w="950"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                      ⭐ En vedette
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 sm:mt-5 flex items-center gap-3 text-xs text-zinc-500 relative z-20">
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

              <h2 className="relative z-10 mt-3 text-xl font-bold tracking-tight text-zinc-900 transition-colors sm:text-2xl lg:text-3xl group-hover:text-zinc-700">
                {posts[0].title}
              </h2>

              {posts[0].desc && (
                <p className="relative z-10 mt-2 text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                  {posts[0].desc}
                </p>
              )}
            </div>

            <div className="relative z-10 mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors inline-flex items-center gap-1">
                <span>Lire l&apos;article complet</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </span>
            </div>
          </article>
        </div>

        {/* Side Ranked Featured Posts with Bordered Frame */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-3xl border border-zinc-200/80 bg-zinc-50/60 p-4.5 sm:p-6 lg:p-7 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Sélection populaire</span>
            <span className="text-xs font-medium text-zinc-400">Top 3 de la semaine</span>
          </div>

          <div className="flex flex-col gap-3.5 flex-1">
            {posts.slice(1, 4).map((post, idx) => {
              const number = `0${idx + 2}`;

              return (
                <article
                  key={post._id}
                  className="group relative flex flex-col sm:flex-row gap-3.5 sm:gap-4 rounded-2xl border border-zinc-200/80 bg-white p-3.5 sm:p-4 shadow-2xs transition-colors duration-200 hover:border-zinc-400 hover:bg-zinc-50/50 cursor-pointer"
                >
                  {/* Master Stretched Link */}
                  <Link
                    href={`/${post.slug}`}
                    className="absolute inset-0 z-0 rounded-2xl"
                    aria-label={post.title}
                  />

                  {post?.img && (
                    <div className="relative z-10 block aspect-video sm:aspect-auto w-full sm:h-32 sm:w-40 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                      <Image
                        src={post.img}
                        alt={post.title}
                        className="h-full w-full object-cover"
                        w="450"
                      />
                    </div>
                  )}

                  <div className="relative z-10 flex flex-1 flex-col justify-between py-0.5 min-w-0">
                    <div>
                      <div className="flex items-center gap-2 text-xs relative z-20">
                        <span className="font-mono text-xs font-bold text-zinc-400 transition-colors group-hover:text-zinc-900">
                          {number}
                        </span>
                        <Link
                          href={`/posts?cat=${post.category}`}
                          className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 capitalize transition-colors hover:bg-zinc-900 hover:text-white"
                        >
                          {post.category}
                        </Link>
                        <span className="text-zinc-400">•</span>
                        <span className="text-zinc-400 text-xs">{format(post.createdAt, "fr")}</span>
                      </div>

                      <h3 className="mt-2 text-sm sm:text-base font-bold text-zinc-900 transition-colors line-clamp-2 leading-snug group-hover:text-zinc-600">
                        {post.title}
                      </h3>

                      {post.desc && (
                        <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {post.desc}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-zinc-100/80 pt-2">
                      <span className="text-xs font-semibold text-zinc-800 group-hover:text-zinc-600 transition-colors inline-flex items-center gap-1">
                        <span>Lire l&apos;article</span>
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>

                      <span className="text-xs font-medium text-zinc-400">
                        {(post.visit ?? 0)} vue{(post.visit ?? 0) > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosts;
