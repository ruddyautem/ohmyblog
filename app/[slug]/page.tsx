import Image from "@/components/Image";
import PostMenuActions from "@/components/PostMenuActions";
import Comments from "@/components/Comments";
import { formatTimeAgo } from "@/lib/timeago-fr";
import DOMPurify from "isomorphic-dompurify";
import { db, client } from "@/lib/db";
import { ensureDbInitialized } from "@/lib/db/init";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

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

  // Fast server-side HTML sanitization with isomorphic-dompurify
  const cleanContent = DOMPurify.sanitize(post.content);

  // Background visit increment (non-blocking)
  db.update(posts).set({ visit: (post.visit || 0) + 1 }).where(eq(posts._id, post._id)).execute();

  return (
    <article className="mt-4 space-y-8">
      {/* Article Header with Balanced Side Cover Image */}
      <header className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 pb-6 border-b border-zinc-100">
        <div className="flex flex-col gap-4 flex-1">
          {/* Category & Date Badge */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
            <Link
              href={`/posts?cat=${post.category}`}
              className="rounded-full bg-zinc-900 px-3 py-1 font-semibold text-white capitalize shadow-xs transition-colors hover:bg-zinc-800"
            >
              {post.category}
            </Link>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-500">{formatTimeAgo(post.createdAt)}</span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-500 font-medium">{(post.visit ?? 0)} vue{(post.visit ?? 0) > 1 ? "s" : ""}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
            {post.title}
          </h1>

          {/* Short Description */}
          {post.desc && (
            <p className="text-base sm:text-lg leading-relaxed text-zinc-600 font-normal">
              {post.desc}
            </p>
          )}

          {/* Author Bio Bar */}
          <div className="flex items-center gap-3 pt-2">
            {post.user?.img && (
              <Image
                src={post.user.img}
                alt={post.user.username}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-zinc-200"
                w="40"
                h="40"
              />
            )}
            <div>
              <div className="text-sm font-bold text-zinc-900 capitalize">
                <Link href={`/posts?author=${post.user?.username}`} className="hover:underline">
                  {post.user?.username}
                </Link>
              </div>
              <p className="text-xs text-zinc-400">Auteur & Contributeur</p>
            </div>
          </div>
        </div>

        {/* Compact & Controlled Cover Image */}
        {post.img && (
          <div className="w-full md:w-5/12 lg:w-4/12 flex-shrink-0">
            <div className="relative aspect-video max-h-72 w-full overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-100 shadow-sm">
              <Image
                src={post.img}
                alt={post.title}
                className="h-full w-full object-cover"
                w="600"
              />
            </div>
          </div>
        )}
      </header>

      {/* Content & Sidebar Grid */}
      <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
        {/* Main Content Body */}
        <div
          className="prose max-w-none flex-1 text-zinc-800 leading-relaxed lg:text-lg [&_img]:my-8 [&_img]:rounded-2xl [&_img]:shadow-sm [&_p]:mb-6 [&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-900 [&_blockquote]:pl-4 [&_blockquote]:italic [&_iframe]:my-8 [&_iframe]:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />

        {/* Sidebar Cards */}
        <aside className="w-full lg:w-80 lg:flex-shrink-0 space-y-6 sticky top-24">
          {/* Author Card */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400">À propos de l&apos;auteur</h3>
            <div className="flex items-center gap-4">
              {post.user?.img && (
                <Image
                  src={post.user.img}
                  alt={post.user.username}
                  className="h-12 w-12 rounded-2xl object-cover ring-1 ring-zinc-200"
                  w="48"
                  h="48"
                />
              )}
              <div>
                <Link
                  className="text-base font-bold text-zinc-900 capitalize hover:underline"
                  href={`/posts?author=${post.user?.username}`}
                >
                  {post.user?.username}
                </Link>
                <p className="text-xs text-zinc-500">Contributeur OhMyBlog</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link href="#" className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-colors">
                <Image src="/facebook.svg" alt="Facebook" w={16} h={16} />
              </Link>
              <Link href="#" className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-colors">
                <Image src="/instagram.svg" alt="Instagram" w={16} h={16} />
              </Link>
            </div>
          </div>

          {/* Post Action Menu */}
          <PostMenuActions post={post} />

          {/* Categories Card */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Catégories</h3>
            <div className="flex flex-wrap gap-2">
              {["general", "voyages", "cuisine", "animaux", "astuces"].map((cat) => (
                <Link
                  key={cat}
                  href={`/posts?cat=${cat}`}
                  className="rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-900 hover:text-white transition-colors capitalize"
                >
                  {cat === "general" ? "Toutes" : cat}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Discussion & Comments */}
      <div className="border-t border-zinc-100 pt-10">
        <Comments postId={post._id} />
      </div>
    </article>
  );
}
