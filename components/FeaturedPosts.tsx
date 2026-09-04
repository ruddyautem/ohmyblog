"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "./Image";
import { useQuery } from "@tanstack/react-query";
import { formatTimeAgo } from "@/lib/timeago-fr";
import { getPostsAction } from "@/app/actions";

const FeaturedPosts = () => {
  const router = useRouter();

  const fetchPost = async () => {
    // 1. Fetch featured post for the hero card
    const featuredRes = await getPostsAction(1, { featured: "true", limit: "1" });
    // 2. Fetch popular posts for the "Sélection populaire" column
    const popularRes = await getPostsAction(1, { sort: "popular", limit: "4" });

    const heroPost = featuredRes?.posts?.[0] || popularRes?.posts?.[0] || null;
    const sidePosts = (popularRes?.posts || [])
      .filter((p) => p._id !== heroPost?._id)
      .slice(0, 3);

    return { heroPost, sidePosts };
  };

  const { isPending, error, data } = useQuery({
    queryKey: ["featuredPost"],
    queryFn: fetchPost,
  });

  if (isPending) {
    return (
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-7 h-130 rounded-3xl bg-zinc-100 animate-pulse"></div>
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="h-40 rounded-3xl bg-zinc-100 animate-pulse"></div>
          <div className="h-40 rounded-3xl bg-zinc-100 animate-pulse"></div>
          <div className="h-40 rounded-3xl bg-zinc-100 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) return <div className="py-8 text-center text-red-500">Erreur: {error.message}</div>;

  const heroPost = data?.heroPost;
  const sidePosts = data?.sidePosts || [];

  if (!heroPost) return null;

  return (
    <section className="mt-6 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Main Hero Featured Post */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900">À la une</span>
              <span className="text-xs text-zinc-400 font-medium">• Le post du moment</span>
            </div>
          </div>

          <Link
            href={`/${heroPost.slug}`}
            className="group relative flex flex-1 flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 lg:p-7 shadow-xs transition-all duration-200 hover:border-zinc-300 hover:shadow-md cursor-pointer"
          >
            <div>
              {heroPost.img && (
                <div className="relative block aspect-video w-full overflow-hidden rounded-2xl bg-zinc-100">
                  <Image
                    src={heroPost.img}
                    alt={heroPost.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    w="950"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                      ⭐ En vedette
                    </span>
                  </div>
                </div>
              )}

              {/* Metadata Row matching PostListItem */}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                {heroPost.user && (
                  <div className="flex items-center gap-2">
                    {heroPost.user.img && (
                      <Image
                        src={heroPost.user.img}
                        alt={heroPost.user.username}
                        className="h-5 w-5 rounded-full object-cover ring-1 ring-zinc-200"
                        w="20"
                        h="20"
                      />
                    )}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/posts?author=${heroPost.user?.username}`);
                      }}
                      className="font-semibold text-zinc-800 capitalize hover:text-zinc-950 transition-colors"
                    >
                      {heroPost.user.username}
                    </span>
                  </div>
                )}
                <span>•</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/posts?cat=${heroPost.category}`);
                  }}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-semibold text-zinc-800 capitalize transition-colors hover:bg-zinc-900 hover:text-white"
                >
                  {heroPost.category}
                </span>
                <span>•</span>
                <span>{formatTimeAgo(heroPost.createdAt)}</span>
              </div>

              <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-900 transition-colors sm:text-2xl lg:text-3xl group-hover:text-zinc-700 leading-tight">
                {heroPost.title}
              </h2>

              {heroPost.desc && (
                <p className="mt-2.5 text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                  {heroPost.desc}
                </p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">
                {(heroPost.visit ?? 0)} vue{(heroPost.visit ?? 0) > 1 ? "s" : ""}
              </span>
              <span className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors inline-flex items-center gap-1.5">
                <span>Lire le post complet</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Side Ranked Featured Posts with Matching Card Design */}
        {sidePosts.length > 0 && (
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900">Sélection populaire</span>
                <span className="text-xs text-zinc-400 font-medium">• Les plus lus</span>
              </div>
              <Link
                href="/posts?sort=popular"
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1"
              >
                Voir le top →
              </Link>
            </div>

            <div className="flex flex-col justify-between gap-4 flex-1">
              {sidePosts.map((post, idx) => (
                <Link
                  key={post._id}
                  href={`/${post.slug}`}
                  className="group relative flex flex-1 flex-col sm:flex-row gap-4 sm:gap-5 rounded-3xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-zinc-300 hover:shadow-md cursor-pointer"
                >
                  {post?.img && (
                    <div className="relative aspect-video sm:aspect-square w-full sm:w-32 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                      <Image
                        src={post.img}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        w="350"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-zinc-900/90 text-xs font-bold text-white shadow-xs backdrop-blur-md">
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
                    <div>
                      {/* Metadata Row matching PostListItem */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        {post.user && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/posts?author=${post.user?.username}`);
                            }}
                            className="font-semibold text-zinc-800 capitalize hover:text-zinc-950 transition-colors"
                          >
                            {post.user.username}
                          </span>
                        )}
                        <span>•</span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/posts?cat=${post.category}`);
                          }}
                          className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-semibold text-zinc-800 capitalize transition-colors hover:bg-zinc-900 hover:text-white"
                        >
                          {post.category}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>

                      <h3 className="mt-2 text-base font-bold text-zinc-900 transition-colors line-clamp-2 leading-snug group-hover:text-zinc-700">
                        {post.title}
                      </h3>

                      {post.desc && (
                        <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {post.desc}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5">
                      <span className="text-xs text-zinc-400 font-medium">
                        {(post.visit ?? 0)} vue{(post.visit ?? 0) > 1 ? "s" : ""}
                      </span>
                      <span className="text-xs font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors inline-flex items-center gap-1">
                        <span>Lire le post</span>
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedPosts;


