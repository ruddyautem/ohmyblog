import type { Metadata } from "next";
import Image from "@/components/Image";
import PostMenuActions from "@/components/PostMenuActions";
import Comments from "@/components/Comments";
import { formatTimeAgo } from "@/lib/timeago-fr";
import DOMPurify from "isomorphic-dompurify";
import { db, client } from "@/lib/db";
import { ensureDbInitialized } from "@/lib/db/init";
import { posts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBaseUrl } from "@/lib/site-url";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    await ensureDbInitialized(client);
    const params = await props.params;
    const decodedSlug = decodeURIComponent(params.slug);
    const post = await db.query.posts.findFirst({
      where: eq(posts.slug, decodedSlug),
      with: { user: true },
    });

    if (!post) {
      return {
        title: "Article introuvable",
      };
    }

    const baseUrl = getBaseUrl();
    const postUrl = `${baseUrl}/${encodeURIComponent(post.slug)}`;
    const ogImages = post.img
      ? [post.img.startsWith("http") ? post.img : `${baseUrl}${post.img.startsWith("/") ? "" : "/"}${post.img}`]
      : [];

    return {
      title: post.title,
      description: post.desc || post.title,
      alternates: {
        canonical: postUrl,
      },
      openGraph: {
        title: post.title,
        description: post.desc || undefined,
        url: postUrl,
        siteName: "OhMyBlog!",
        type: "article",
        publishedTime: post.createdAt.toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.desc || undefined,
        images: ogImages,
      },
    };
  } catch (error) {
    console.error("[generateMetadata] Error fetching post metadata:", error);
    return {
      title: "Article | OhMyBlog!",
    };
  }
}

export default async function SinglePostPage(props: { params: Promise<{ slug: string }> }) {
  await ensureDbInitialized(client);
  const params = await props.params;
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, decodedSlug),
    with: { user: true }
  });

  if (!post) {
    return notFound();
  }

  const baseUrl = getBaseUrl();
  const postUrl = `${baseUrl}/${encodeURIComponent(post.slug)}`;

  // Fast server-side HTML sanitization with isomorphic-dompurify (allowing safe video iframes)
  const cleanContent = DOMPurify.sanitize(post.content, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "class"],
  });

  // Atomic background visit increment (non-blocking and safely caught)
  db.update(posts)
    .set({ visit: sql`COALESCE(${posts.visit}, 0) + 1` })
    .where(eq(posts._id, post._id))
    .execute()
    .catch((err) => console.error("[Visit Counter] Error updating visits:", err));

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.desc || post.title,
    image: post.img
      ? [post.img.startsWith("http") ? post.img : `${baseUrl}${post.img.startsWith("/") ? "" : "/"}${post.img}`]
      : undefined,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.user?.username || "Auteur",
    },
    publisher: {
      "@type": "Organization",
      name: "OhMyBlog!",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  return (
    <article className="mt-2 sm:mt-4 space-y-6 sm:space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      {/* Article Header with Balanced Side Cover Image */}
      <header className="flex flex-col-reverse md:flex-row items-center justify-between gap-5 sm:gap-8 pb-5 sm:pb-6 border-b border-zinc-100 dark:border-slate-800">
        <div className="flex flex-col gap-3.5 sm:gap-4 flex-1">
          {/* Category & Date Badge */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <Link
              href={`/posts?cat=${post.category}`}
              className="rounded-full bg-zinc-900 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 px-3 py-1 font-semibold text-white capitalize shadow-xs transition-colors hover:bg-zinc-800 dark:hover:from-indigo-500 dark:hover:to-blue-500 text-xs"
            >
              {post.category}
            </Link>
            <span className="text-zinc-400 dark:text-slate-500">•</span>
            <span suppressHydrationWarning className="text-zinc-500 dark:text-slate-400">{formatTimeAgo(post.createdAt)}</span>
            <span className="text-zinc-400 dark:text-slate-500">•</span>
            <span className="text-zinc-500 dark:text-slate-400 font-medium">{(post.visit ?? 0)} vue{(post.visit ?? 0) > 1 ? "s" : ""}</span>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          {/* Short Description */}
          {post.desc && (
            <p className="text-sm sm:text-lg leading-relaxed text-zinc-600 dark:text-slate-300 font-normal">
              {post.desc}
            </p>
          )}

          {/* Author Bio Bar */}
          <div className="flex items-center gap-3 pt-1 sm:pt-2">
            {post.user?.img && (
              <Image
                src={post.user.img}
                alt={post.user.username}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-slate-700"
                w="40"
                h="40"
              />
            )}
            <div>
              <div className="text-sm font-bold text-zinc-900 dark:text-white capitalize">
                <Link href={`/posts?author=${post.user?.username}`} className="hover:underline dark:hover:text-indigo-400 transition-colors">
                  {post.user?.username}
                </Link>
              </div>
              <p className="text-xs text-zinc-400 dark:text-slate-500">Auteur & Contributeur</p>
            </div>
          </div>
        </div>

        {/* Compact & Controlled Cover Image */}
        {post.img && (
          <div className="w-full md:w-5/12 lg:w-4/12 flex-shrink-0">
            <div className="relative aspect-video max-h-72 w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-zinc-100 dark:bg-[#182032] shadow-sm">
              <Image
                src={post.img}
                alt={post.title}
                className="h-full w-full object-cover"
                w="600"
                priority={true}
              />
            </div>
          </div>
        )}
      </header>

      {/* Content & Sidebar Grid */}
      <div className="flex flex-col gap-8 sm:gap-12 lg:flex-row lg:items-start">
        {/* Main Content Body */}
        <div
          className="prose dark:prose-invert max-w-none flex-1 text-zinc-800 dark:text-slate-200 leading-relaxed text-sm sm:text-base lg:text-lg [&_img]:my-6 sm:[&_img]:my-8 [&_img]:rounded-xl sm:[&_img]:rounded-2xl [&_img]:shadow-sm [&_p]:mb-4 sm:[&_p]:mb-6 [&_h1]:mt-8 sm:[&_h1]:mt-10 [&_h1]:mb-3 sm:[&_h1]:mb-4 [&_h1]:text-xl sm:[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-zinc-900 dark:[&_h1]:text-white [&_h2]:mt-6 sm:[&_h2]:mt-8 [&_h2]:mb-2.5 sm:[&_h2]:mb-3 [&_h2]:text-lg sm:[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-zinc-900 dark:[&_h2]:text-white [&_h3]:text-zinc-900 dark:[&_h3]:text-white [&_a]:text-indigo-600 dark:[&_a]:text-indigo-400 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-900 dark:[&_blockquote]:border-indigo-500 [&_blockquote]:pl-3 sm:[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-700 dark:[&_blockquote]:text-slate-300 [&_iframe]:my-6 sm:[&_iframe]:my-8 [&_iframe]:rounded-xl sm:[&_iframe]:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />

        {/* Sidebar Cards */}
        <aside className="w-full lg:w-80 lg:flex-shrink-0 space-y-4 sm:space-y-6 sticky top-24">
          {/* Author Card */}
          <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#121826] p-4 sm:p-6 shadow-xs">
            <h3 className="mb-3 sm:mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500">À propos de l&apos;auteur</h3>
            <div className="flex items-center gap-3.5 sm:gap-4">
              {post.user?.img && (
                <Image
                  src={post.user.img}
                  alt={post.user.username}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl object-cover ring-1 ring-zinc-200 dark:ring-slate-700"
                  w="48"
                  h="48"
                />
              )}
              <div>
                <Link
                  className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white capitalize hover:underline dark:hover:text-indigo-400 transition-colors"
                  href={`/posts?author=${post.user?.username}`}
                >
                  {post.user?.username}
                </Link>
                <p className="text-xs text-zinc-500 dark:text-slate-400">Contributeur OhMyBlog</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link href="#" className="p-2 rounded-xl bg-zinc-100 dark:bg-[#182032] hover:bg-zinc-200 dark:hover:bg-[#1e293b] transition-colors">
                <Image src="/facebook.svg" alt="Facebook" w={16} h={16} className="dark:invert" />
              </Link>
              <Link href="#" className="p-2 rounded-xl bg-zinc-100 dark:bg-[#182032] hover:bg-zinc-200 dark:hover:bg-[#1e293b] transition-colors">
                <Image src="/instagram.svg" alt="Instagram" w={16} h={16} className="dark:invert" />
              </Link>
            </div>
          </div>

          {/* Post Action Menu */}
          <PostMenuActions post={post} />

          {/* Categories Card */}
          <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-slate-800 bg-white dark:bg-[#121826] p-4 sm:p-6 shadow-xs">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500">Catégories</h3>
            <div className="flex flex-wrap gap-2">
              {["general", "voyages", "cuisine", "animaux", "astuces"].map((cat) => (
                <Link
                  key={cat}
                  href={`/posts?cat=${cat}`}
                  className="rounded-xl bg-zinc-100 dark:bg-[#182032] border border-transparent dark:border-slate-700/60 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-slate-300 hover:bg-zinc-900 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white dark:hover:border-indigo-500 transition-colors capitalize"
                >
                  {cat === "general" ? "Toutes" : cat}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Discussion & Comments */}
      <div className="border-t border-zinc-100 dark:border-slate-800 pt-6 sm:pt-10">
        <Comments postId={post._id} />
      </div>
    </article>
  );
}
