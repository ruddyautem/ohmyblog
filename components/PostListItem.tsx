"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "./Image";
import { formatTimeAgo } from "@/lib/timeago-fr";
import { type PostWithUser } from "@/lib/db/schema";

const PostListItem = ({ post }: { post: PostWithUser }) => {
  const router = useRouter();

  return (
    <Link
      href={`/${post.slug}`}
      className="group relative mb-4 sm:mb-6 flex flex-col gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#121826] p-4 sm:p-6 shadow-xs transition-all duration-200 hover:border-zinc-300 dark:hover:border-indigo-500/40 hover:shadow-md dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] md:flex-row cursor-pointer"
    >
      {/* Article Cover Image */}
      {post.img && (
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-[#182032] md:w-5/12">
          <Image
            src={post.img}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            w="735"
          />
        </div>
      )}

      {/* Article Details */}
      <div className="flex flex-1 flex-col justify-between py-1">
        <div>
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-slate-400">
            {post.user && (
              <div className="flex items-center gap-2">
                {post.user.img && (
                  <Image
                    src={post.user.img}
                    alt={post.user.username}
                    className="h-5 w-5 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-slate-700"
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
                    router.push(`/posts?author=${post.user?.username}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/posts?author=${post.user?.username}`);
                    }
                  }}
                  className="font-semibold text-zinc-800 dark:text-slate-200 capitalize hover:text-zinc-950 dark:hover:text-indigo-400 transition-colors"
                >
                  {post.user.username}
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
                router.push(`/posts?cat=${post.category}`);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/posts?cat=${post.category}`);
                }
              }}
              className="rounded-full bg-zinc-100 dark:bg-indigo-500/15 border border-transparent dark:border-indigo-500/20 px-2.5 py-0.5 font-semibold text-zinc-800 dark:text-indigo-300 capitalize transition-colors hover:bg-zinc-900 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white"
            >
              {post.category}
            </span>
            <span>•</span>
            <span suppressHydrationWarning>{formatTimeAgo(post.createdAt)}</span>
          </div>

          {/* Title */}
          <h2 className="mt-2.5 sm:mt-3 text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white transition-colors group-hover:text-zinc-700 dark:group-hover:text-indigo-300 leading-snug">
            {post.title}
          </h2>

          {/* Description */}
          {post.desc && (
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-slate-400 line-clamp-2 sm:line-clamp-3">
              {post.desc}
            </p>
          )}
        </div>

        {/* Footer info & Read Link */}
        <div className="mt-4 sm:mt-5 flex items-center justify-between border-t border-zinc-100 dark:border-slate-800 pt-3 sm:pt-4">
          <span className="text-xs text-zinc-400 dark:text-slate-500 font-medium">
            {(post.visit ?? 0)} vue{(post.visit ?? 0) > 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-indigo-400 group-hover:text-zinc-600 dark:group-hover:text-indigo-300 transition-colors">
            <span>Lire le post</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PostListItem;

