"use client";
import Link from "next/link";
import Image from "./Image";
import { format } from "timeago.js";
import "@/lib/timeago-fr";
import { type PostWithUser } from "@/lib/db/schema";

const PostListItem = ({ post }: { post: PostWithUser }) => {
  return (
    <article className="group mb-6 flex flex-col gap-6 rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 hover:border-zinc-300 hover:shadow-md md:flex-row">
      {/* Article Cover Image */}
      {post.img && (
        <Link
          href={`/${post.slug}`}
          className="relative aspect-[16/10] w-full flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-100 md:w-5/12"
        >
          <Image
            src={post.img}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            w="735"
          />
        </Link>
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
                <Link
                  href={`/posts?author=${post.user.username}`}
                  className="font-semibold text-zinc-800 capitalize hover:text-zinc-950 transition-colors"
                >
                  {post.user.username}
                </Link>
              </div>
            )}
            <span>•</span>
            <Link
              href={`/posts?cat=${post.category}`}
              className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-semibold text-zinc-800 capitalize transition-colors hover:bg-zinc-900 hover:text-white"
            >
              {post.category}
            </Link>
            <span>•</span>
            <span>{format(post.createdAt, "fr")}</span>
          </div>

          {/* Title */}
          <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-700">
            <Link href={`/${post.slug}`}>{post.title}</Link>
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
          <Link
            href={`/${post.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 transition-colors hover:text-zinc-600"
          >
            <span>Lire l&apos;article</span>
            <span>→</span>
          </Link>

          <span className="text-xs text-zinc-400 font-medium">
            {(post.visit ?? 0)} vue{(post.visit ?? 0) > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </article>
  );
};

export default PostListItem;

