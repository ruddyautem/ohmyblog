"use server";
import { db } from "@/lib/db";
import { ownedAssetKey, uploadPrefix } from "@/lib/assets";
import { z } from "zod";
import { posts, comments, savedPosts, users } from "@/lib/db/schema";
import { eq, and, ilike, ne, or } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/rate-limit";

async function getOrCreateDbUser(clerkUserId: string) {
  let user = await db.query.users.findFirst({ where: eq(users.clerkUserId, clerkUserId) });
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const username = clerkUser.username || clerkUser.firstName || clerkUserId.slice(-8);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || `${clerkUserId}@clerk.dev`;
    const img = clerkUser.imageUrl || null;
    const _id = crypto.randomUUID();

    try {
      await db.insert(users).values({
        _id,
        clerkUserId,
        username,
        email,
        img,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      user = await db.query.users.findFirst({ where: eq(users.clerkUserId, clerkUserId) });
    } catch (err) {
      console.error("Error auto-syncing Clerk user into PostgreSQL:", err);
    }
  }
  return user;
}

interface CreatePostData {
  title: string;
  desc?: string;
  category: string;
  img?: string;
  content: string;
}

export async function createPostAction(data: CreatePostData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Anti-spam Rate Limiting: Max 5 posts per 10 minutes per user
  const rate = checkRateLimit(`createPost:${userId}`, 5, 10 * 60 * 1000);
  if (!rate.success) {
    throw new Error(`Limite de publication atteinte. Veuillez patienter ${rate.reset} secondes avant de réessayer.`);
  }

  data = z.object({ title: z.string().trim().min(3).max(150), desc: z.string().max(1000).optional(),
    category: z.enum(['general', 'voyages', 'cuisine', 'animaux', 'astuces']),
    img: z.string().max(2048).optional(), content: z.string().min(10).max(200000) }).parse(data);
  // Server-side Input Validation
  const trimmedTitle = data.title?.trim() || "";
  if (trimmedTitle.length < 3 || trimmedTitle.length > 150) {
    throw new Error("Le titre doit contenir entre 3 et 150 caractères.");
  }
  const trimmedContent = data.content?.trim() || "";
  if (trimmedContent.length < 10) {
    throw new Error("Le contenu de l'article doit contenir au moins 10 caractères.");
  }

  const user = await getOrCreateDbUser(userId);
  if (!user) throw new Error("User not found");

  const cleanTitle = trimmedTitle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const slug = cleanTitle || crypto.randomUUID();

  // Uploaded objects are immutable. Publishing never moves or deletes caller URLs.
  const finalImg = data.img || '';
  const finalContent = data.content;

  const newPost = {
    _id: crypto.randomUUID(),
    userId: user._id,
    slug,
    title: trimmedTitle,
    desc: data.desc,
    category: data.category,
    content: finalContent,
    img: finalImg,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  let inserted = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    const result = await db.insert(posts).values(newPost).onConflictDoNothing({ target: posts.slug }).returning({ id: posts._id });
    if (result.length) { inserted = true; break; }
    newPost.slug = `${slug}-${crypto.randomUUID()}`;
  }
  if (!inserted) throw new Error("Publication concurrente : réessaie.");
  revalidatePath('/');
  revalidatePath('/posts');
  revalidatePath('/sitemap.xml');
  return newPost;
}

export async function addCommentAction(postId: string, desc: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Anti-spam Rate Limiting: Max 5 comments per minute per user
  const rate = checkRateLimit(`comment:${userId}`, 5, 60 * 1000);
  if (!rate.success) {
    throw new Error(`Vous commentez trop vite. Veuillez patienter ${rate.reset} secondes avant de réessayer.`);
  }

  const trimmedDesc = desc?.trim() || "";
  if (trimmedDesc.length < 1 || trimmedDesc.length > 2000) {
    throw new Error("Le commentaire doit contenir entre 1 et 2000 caractères.");
  }

  const user = await getOrCreateDbUser(userId);
  if (!user) throw new Error("User not found");

  const newComment = {
    _id: crypto.randomUUID(),
    desc: trimmedDesc,
    userId: user._id,
    postId: postId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(comments).values(newComment);
  revalidatePath(`/[slug]`, 'page');
  return newComment;
}

export async function getCommentsAction(postId: string) {
  const fetchedComments = await db.query.comments.findMany({
    where: eq(comments.postId, postId),
    with: { user: { columns: { username: true, img: true } } },
    orderBy: (comments, { desc }) => [desc(comments.createdAt)],
  });
  return fetchedComments;
}

export async function getSavedPostsAction() {
  const { userId } = await auth();
  if (!userId) return [];
  const user = await getOrCreateDbUser(userId);
  if (!user) return [];
  const saved = await db.query.savedPosts.findMany({ where: eq(savedPosts.userId, user._id) });
  return saved.map((s) => s.postId);
}

export async function toggleSavePostAction(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await getOrCreateDbUser(userId);
  if (!user) throw new Error("User not found");

  const existing = await db.query.savedPosts.findFirst({
    where: and(eq(savedPosts.userId, user._id), eq(savedPosts.postId, postId))
  });

  if (existing) {
    await db.delete(savedPosts).where(and(eq(savedPosts.userId, user._id), eq(savedPosts.postId, postId)));
    return false;
  } else {
    await db.insert(savedPosts).values({ userId: user._id, postId });
    return true;
  }
}

export async function toggleFeaturePostAction(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await getOrCreateDbUser(userId);
  if (!user || user.clerkUserId !== process.env.NEXT_PUBLIC_CLERK_ADMIN_ID) throw new Error("Unauthorized"); // Add your own admin check logic

  const post = await db.query.posts.findFirst({ where: eq(posts._id, postId) });
  if (post) {
    await db.update(posts).set({ isFeatured: !post.isFeatured }).where(eq(posts._id, postId));
  }
  revalidatePath('/');
  return true;
}

export async function deletePostAction(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await getOrCreateDbUser(userId);
  if (!user) throw new Error("Unauthorized");

  const post = await db.query.posts.findFirst({ where: eq(posts._id, postId) });
  if (!post) throw new Error("Post introuvable");

  const isAdmin = !!process.env.NEXT_PUBLIC_CLERK_ADMIN_ID && user.clerkUserId === process.env.NEXT_PUBLIC_CLERK_ADMIN_ID;
  const isOwner = post.userId === user._id;
  if (!isOwner && !isAdmin) throw new Error("Forbidden");

  // The database FK cascade deletes comments/bookmarks atomically with the post.
  await db.delete(posts).where(eq(posts._id, postId));
  try {
    const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (publicBase) {
      const urls = new Set([post.img || '', ...(post.content.match(/https?:[^\s"'<>]+/g) || [])]);
      const keys: string[] = [];
      // Legacy keys have no provable owner: preserve them rather than deleting another author's data.
      for (const url of urls) {
        const key = ownedAssetKey(url, user.clerkUserId, publicBase);
        if (!key) continue;
        const referenced = await db.query.posts.findFirst({ where: and(ne(posts._id, postId), or(eq(posts.img, url), ilike(posts.content, '%' + url.replaceAll('%', '\\%').replaceAll('_', '\\_') + '%'))) });
        if (!referenced) keys.push(key);
      }
      if (keys.length) {
        const { DeleteObjectsCommand } = await import('@aws-sdk/client-s3');
        const { r2Client } = await import('@/lib/r2');
        for (let offset = 0; offset < keys.length; offset += 1000) {
          await r2Client.send(new DeleteObjectsCommand({ Bucket: process.env.R2_BUCKET_NAME || 'ohmyblog-uploads', Delete: { Objects: keys.slice(offset, offset + 1000).map((Key) => ({ Key })) } }));
        }
      }
    }
  } catch (error) { console.error('Asset cleanup pending:', error); }

  revalidatePath("/");
  revalidatePath("/posts");
  if (post.slug) {
    revalidatePath(`/${post.slug}`);
  }
  revalidatePath("/sitemap.xml");
  return true;
}

export async function getPostsAction(page: number, searchParamsObj: Record<string, string>) {
  const conditions = [];
  if (searchParamsObj.cat) conditions.push(eq(posts.category, searchParamsObj.cat));
  if (searchParamsObj.search) conditions.push(ilike(posts.title, `%${searchParamsObj.search}%`));
  if (searchParamsObj.author) {
    const user = await db.query.users.findFirst({ where: eq(users.username, searchParamsObj.author) });
    if (!user) return { posts: [], hasMore: false };
    conditions.push(eq(posts.userId, user._id));
  }
  if (searchParamsObj.featured || searchParamsObj.sort === "featured") conditions.push(eq(posts.isFeatured, true));
  
  const safePage = Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10000) : 1;
  const parsedLimit = parseInt(searchParamsObj.limit) || 10;
  const limit = Math.min(Math.max(1, parsedLimit), 50);
  const offset = (safePage - 1) * limit;

  const fetchedPosts = await db.query.posts.findMany({
    columns: { content: false },
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { user: { columns: { username: true, img: true } } },
    orderBy: (postsTable, { desc, asc }) => {
      if (searchParamsObj.sort === "oldest") return [asc(postsTable.createdAt)];
      if (searchParamsObj.sort === "popular") return [desc(postsTable.visit)];
      return [desc(postsTable.createdAt)];
    },
    limit: limit + 1,
    offset,
  });
  
  const hasMore = fetchedPosts.length > limit;
  if (hasMore) fetchedPosts.pop();
  
  return { posts: fetchedPosts, hasMore };
}

export async function deleteCommentAction(commentId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await getOrCreateDbUser(userId);
  if (!user) throw new Error("User not found");

  const comment = await db.query.comments.findFirst({ where: eq(comments._id, commentId) });
  if (!comment) throw new Error("Comment not found");

  const isAdmin = !!process.env.NEXT_PUBLIC_CLERK_ADMIN_ID && user.clerkUserId === process.env.NEXT_PUBLIC_CLERK_ADMIN_ID;
  const isOwner = comment.userId === user._id;

  if (!isOwner && !isAdmin) throw new Error("Forbidden");

  await db.delete(comments).where(eq(comments._id, commentId));
  revalidatePath(`/[slug]`, "page");
}

export async function getPresignedUploadUrlAction(filename: string, contentType: string, folder: string | undefined, size: number) {
  if (folder !== undefined && (typeof folder !== "string" || folder.length > 150)) throw new Error("Dossier invalide.");
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!Number.isSafeInteger(size) || size < 1 || size > 5 * 1024 * 1024) throw new Error('Fichier trop volumineux (max 5 Mo).');
  if (typeof filename !== 'string' || filename.length > 200 || typeof contentType !== 'string') throw new Error('Fichier invalide.');
  // 1. Anti-spam Rate Limiting: Max 10 uploads per minute per user
  const { checkRateLimit } = await import("@/lib/rate-limit");
  const rate = checkRateLimit(`upload:${userId}`, 10, 60 * 1000);
  if (!rate.success) {
    throw new Error(`Limite d'upload atteinte. Veuillez patienter ${rate.reset} secondes avant de réessayer.`);
  }

  // 2. Strict MIME Type Whitelist
  const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "video/mp4",
    "video/webm",
  ];
  if (!ALLOWED_MIME_TYPES.includes(contentType.toLowerCase())) {
    throw new Error("Type de fichier non autorisé. Seules les images (JPEG, PNG, WebP, GIF, AVIF, MP4, WebM) sont acceptées.");
  }

  // 3. Strict File Extension Whitelist
  const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "avif", "mp4", "webm"];
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error("Extension de fichier non autorisée.");
  }

  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const { r2Client } = await import("@/lib/r2");

  // Keep original clean filename
  const baseName = filename.substring(0, filename.lastIndexOf(".")) || filename;
  const cleanBaseName = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  const mimeExtensions: Record<string, string[]> = { 'image/jpeg': ['jpg', 'jpeg'], 'image/png': ['png'], 'image/webp': ['webp'], 'image/gif': ['gif'], 'image/avif': ['avif'], 'video/mp4': ['mp4'], 'video/webm': ['webm'] };
  if (!mimeExtensions[contentType]?.includes(ext)) throw new Error('Le type et l’extension du fichier ne correspondent pas.');
  const cleanFilename = `${cleanBaseName}.${ext}`;

  const cleanFolder = folder
    ? `posts/${folder.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase()}`
    : "uploads";

  // Unique UUID prefix to prevent collisions and accidental file overwrites
  const fileId = crypto.randomUUID();
  const uniqueKey = `${uploadPrefix(userId)}${cleanFolder}/${fileId}-${cleanFilename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || "ohmyblog-uploads",
    Key: uniqueKey,
    ContentType: contentType,
    ContentLength: size,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300, signableHeaders: new Set(['content-length', 'content-type']) });
  const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-dc8f3ebfad6f443b920c49b37078af5c.r2.dev";
  const publicUrl = `${publicBaseUrl}/${uniqueKey}`;

  return {
    uploadUrl,
    publicUrl,
    key: uniqueKey,
  };
}
