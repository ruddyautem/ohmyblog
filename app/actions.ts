"use server";
import { db, client } from "@/lib/db";
import { ensureDbInitialized } from "@/lib/db/init";
import { posts, comments, savedPosts, users } from "@/lib/db/schema";
import { eq, and, ilike } from "drizzle-orm";
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

  let slug = cleanTitle;
  let existing = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  let counter = 2;
  while (existing) {
    slug = `${cleanTitle}-${counter}`;
    existing = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
    counter++;
  }

  let finalImg = data.img || "";
  let finalContent = data.content || "";

  // Automatically ensure all images are in posts/${slug}/ on Cloudflare R2
  try {
    const { CopyObjectCommand, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const { r2Client } = await import("@/lib/r2");
    const bucket = process.env.R2_BUCKET_NAME || "ohmyblog-uploads";
    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-dc8f3ebfad6f443b920c49b37078af5c.r2.dev";
    const targetFolder = `posts/${slug}`;

    const moveR2Object = async (oldUrl: string): Promise<string> => {
      if (!oldUrl.startsWith(publicUrl)) return oldUrl;
      const oldKey = oldUrl.replace(`${publicUrl}/`, "");
      const fileName = oldKey.split("/").pop() || "image.jpg";
      const newKey = `${targetFolder}/${fileName}`;
      if (oldKey === newKey) return oldUrl;

      await r2Client.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${encodeURIComponent(oldKey)}`,
          Key: newKey,
        })
      );
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: oldKey,
        })
      );
      return `${publicUrl}/${newKey}`;
    };

    // 1. Move cover image
    if (finalImg && finalImg.startsWith(publicUrl)) {
      finalImg = await moveR2Object(finalImg);
    }

    // 2. Move content images
    const urlPattern = new RegExp(`${publicUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/[^\\s"'<>]+`, "g");
    const matches = finalContent.match(urlPattern) || [];
    for (const oldUrl of matches) {
      const newUrl = await moveR2Object(oldUrl);
      if (newUrl !== oldUrl) {
        finalContent = finalContent.replaceAll(oldUrl, newUrl);
      }
    }
  } catch (err) {
    console.error("Erreur lors de l'organisation R2 des images de l'article:", err);
  }

  const newPost = {
    _id: crypto.randomUUID(),
    userId: user._id,
    slug,
    title: data.title,
    desc: data.desc,
    category: data.category,
    content: finalContent,
    img: finalImg,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.insert(posts).values(newPost);
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
    with: { user: true },
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

  // 1. Delete associated images on Cloudflare R2
  try {
    const { DeleteObjectsCommand, ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    const { r2Client } = await import("@/lib/r2");
    const bucket = process.env.R2_BUCKET_NAME || "ohmyblog-uploads";
    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-dc8f3ebfad6f443b920c49b37078af5c.r2.dev";

    const keysToDelete: Set<string> = new Set();

    // A. Check cover image
    if (post.img && post.img.includes(publicUrl)) {
      const key = post.img.replace(`${publicUrl}/`, "");
      if (key) keysToDelete.add(key);
    }

    // B. Check images embedded in content
    if (post.content) {
      const urlPattern = new RegExp(`${publicUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/([^\\s"'<>]+)`, "g");
      let match;
      while ((match = urlPattern.exec(post.content)) !== null) {
        if (match[1]) keysToDelete.add(match[1]);
      }
    }

    // C. Also check if there's a folder posts/<slug>/ on R2
    if (post.slug) {
      const cleanSlugFolder = `posts/${post.slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase()}/`;
      const listRes = await r2Client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: cleanSlugFolder,
        })
      );
      listRes.Contents?.forEach((obj) => {
        if (obj.Key) keysToDelete.add(obj.Key);
      });
    }

    // Execute bulk delete on Cloudflare R2
    if (keysToDelete.size > 0) {
      await r2Client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: Array.from(keysToDelete).map((Key) => ({ Key })),
          },
        })
      );
    }
  } catch (err) {
    console.error("Erreur lors de la suppression des images sur Cloudflare R2:", err);
  }

  // 2. Cascade delete (comments, bookmarks, and post)
  await db.delete(comments).where(eq(comments.postId, postId));
  await db.delete(savedPosts).where(eq(savedPosts.postId, postId));
  await db.delete(posts).where(eq(posts._id, postId));

  revalidatePath("/");
  revalidatePath("/posts");
  if (post.slug) {
    revalidatePath(`/${post.slug}`);
  }
  revalidatePath("/sitemap.xml");
  return true;
}

export async function getPostsAction(page: number, searchParamsObj: Record<string, string>) {
  await ensureDbInitialized(client);
  const conditions = [];
  if (searchParamsObj.cat) conditions.push(eq(posts.category, searchParamsObj.cat));
  if (searchParamsObj.search) conditions.push(ilike(posts.title, `%${searchParamsObj.search}%`));
  if (searchParamsObj.author) {
    const user = await db.query.users.findFirst({ where: eq(users.username, searchParamsObj.author) });
    if (user) conditions.push(eq(posts.userId, user._id));
  }
  if (searchParamsObj.featured || searchParamsObj.sort === "featured") conditions.push(eq(posts.isFeatured, true));
  
  const safePage = Math.max(1, page || 1);
  const parsedLimit = parseInt(searchParamsObj.limit) || 10;
  const limit = Math.min(Math.max(1, parsedLimit), 50);
  const offset = (safePage - 1) * limit;

  const fetchedPosts = await db.query.posts.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { user: true },
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

export async function getPresignedUploadUrlAction(filename: string, contentType: string, folder?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

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
    "image/svg+xml",
  ];
  if (!ALLOWED_MIME_TYPES.includes(contentType.toLowerCase())) {
    throw new Error("Type de fichier non autorisé. Seules les images (JPEG, PNG, WebP, GIF, AVIF, SVG) sont acceptées.");
  }

  // 3. Strict File Extension Whitelist
  const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "avif", "svg"];
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

  const cleanFilename = `${cleanBaseName}.${ext}`;

  const cleanFolder = folder
    ? `posts/${folder.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase()}`
    : "uploads";

  // Unique UUID prefix to prevent collisions and accidental file overwrites
  const fileId = crypto.randomUUID().slice(0, 8);
  const uniqueKey = `${cleanFolder}/${fileId}-${cleanFilename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || "ohmyblog-uploads",
    Key: uniqueKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
  const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-dc8f3ebfad6f443b920c49b37078af5c.r2.dev";
  const publicUrl = `${publicBaseUrl}/${uniqueKey}`;

  return {
    uploadUrl,
    publicUrl,
    key: uniqueKey,
  };
}
