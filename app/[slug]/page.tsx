import Image from "@/components/Image";
import PostMenuActions from "@/components/PostMenuActions";
import Search from "@/components/Search";
import Comments from "@/components/Comments";
import { format } from "timeago.js";
import "@/lib/timeago-fr";
import DOMPurify from "dompurify";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JSDOM } from "jsdom";

export default async function SinglePostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, decodedSlug),
    with: { user: true }
  });

  if (!post) {
    return notFound();
  }

  // Sanitize on server using JSDOM
  const window = new JSDOM('').window;
  const purify = DOMPurify(window as unknown as Parameters<typeof DOMPurify>[0]);
  const cleanContent = purify.sanitize(post.content);

  // Background visit increment (non-blocking)
  db.update(posts).set({ visit: (post.visit || 0) + 1 }).where(eq(posts._id, post._id)).execute();

  return (
    <div className="flex flex-col gap-8 mt-12">
      {/* detail */}
      <div className="flex flex-col md:flex-row gap-8">
        {post.img && (
          <div className="w-full md:w-2/5">
            <div className="max-h-72 overflow-hidden rounded">
              <Image src={post.img} alt={post.title} w="600" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
        <div className="flex flex-col gap-8 md:ml-auto md:w-3/5">
          <h1 className="text-xl md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Publié par</span>
            <Link className="text-blue-500 font-semibold hover:text-blue-600 transition-colors capitalize" href={`/posts?author=${post.user?.username}`}>
              {post.user?.username}
            </Link>
            <span>dans</span>
            <Link className="text-blue-500 font-semibold hover:text-blue-600 transition-colors capitalize" href={`/posts?cat=${post.category}`}>
              {post.category}
            </Link>
            <span>{format(post.createdAt, 'fr')}</span>
          </div>
          <p className="text-gray-500 font-medium">{post.desc}</p>
        </div>
      </div>
      
      {/* content */}
      <div className="flex flex-col gap-12 md:flex-row mb-16">
        {/* text */}
        <div
          className="prose max-w-none text-justify lg:text-lg flex-1 [&_img]:my-8 [&_img]:rounded-md [&_img]:shadow-sm [&_p]:mb-6 [&_p]:leading-relaxed [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:mt-6 [&_h2]:mb-3 [&_iframe]:my-8"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
        {/* menu */}
        <div className="sticky top-8 h-max md:px-4">
          <h1 className="mt-8 mb-4 text-sm font-medium">Auteur</h1>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-8">
              {post.user?.img && (
                <Image
                  src={post.user.img}
                  alt={post.user.username}
                  className="w-12 h-12 object-cover rounded-md"
                  w="48"
                  h="48"
                />
              )}
              <Link className="text-blue-800 font-medium capitalize" href={`/posts?author=${post.user?.username}`}>
                {post.user?.username}
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              Contributeur
            </p>
            <div className="flex gap-2">
              <Link href="#">
                <Image src="facebook.svg" alt="Facebook" />
              </Link>
              <Link href="#">
                <Image src="instagram.svg" alt="Instagram" />
              </Link>
            </div>
          </div>
          <PostMenuActions post={post} />
          <h1 className="mt-8 mb-4 text-sm font-medium">Catégories</h1>
          <div className="flex flex-col gap-2 text-sm">
            <Link className="underline" href="/posts?cat=general">Toutes</Link>
            <Link className="underline" href="/posts?cat=voyages">Voyages</Link>
            <Link className="underline" href="/posts?cat=cuisine">Cuisine</Link>
            <Link className="underline" href="/posts?cat=animaux">Animaux</Link>
            <Link className="underline" href="/posts?cat=astuces">Astuces</Link>
          </div>
          <h1 className="mt-8 mb-4 text-sm font-medium">Recherche</h1>
          <Search />
        </div>
      </div>
      <Comments postId={post._id} />
    </div>
  );
}
