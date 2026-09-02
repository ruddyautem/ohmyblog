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
      className="group relative mb-6 flex flex-col gap-6 rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs transition-colors duration-200 hover:border-zinc-300 hover:shadow-md md:flex-row cursor-pointer"
    >
      {/* Article Cover Image */}
      {post.img && (
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-zinc-100 md:w-5/12">
          <Image
            src={post.img}
            alt={post.title}
            className="h-full w-full object-cover"
            w="735"
          />
        </div>
      )}

      {/* Article Details */}
      <div className="flex flex-1 flex-col justify-between py-1">
        <div>
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            {post.user && (
              <div className="flex items-center gap-2">
                {post.user.img && (
                  <Image
                    src={post.user.img}
                    alt={post.user.username}
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
                    router.push(`/posts?author=${post.user?.username}`);
                  }}
                  className="font-semibold text-zinc-800 capitalize hover:text-zinc-950 transition-colors"
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
              className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-semibold text-zinc-800 capitalize transition-colors hover:bg-zinc-900 hover:text-white"
            >
              {post.category}
            </span>
            <span>•</span>
            <span>{formatTimeAgo(post.createdAt)}</span>
          </div>

          {/* Title */}
          <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-700">
            {post.title}
          </h2>

          {/* Description */}
          {post.desc && (
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 line-clamp-3">
              {post.desc}
            </p>
          )}
        </div>

        {/* Footer info & Read Link */}
        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
          <span className="text-xs text-zinc-400 font-medium">
            {(post.visit ?? 0)} vue{(post.visit ?? 0) > 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors">
            <span>Lire l&apos;article</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PostListItem;

