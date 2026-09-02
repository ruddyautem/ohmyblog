"use server";
import { db } from "@/lib/db";
import { posts, comments, savedPosts, users } from "@/lib/db/schema";
import { eq, and, like } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) });
  if (!user) throw new Error("User not found");

  let slug = data.title.replace(/ /g, "-").toLowerCase();
  let existing = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  let counter = 2;
  while (existing) {
    slug = `${data.title.replace(/ /g, "-").toLowerCase()}-${counter}`;
    existing = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
    counter++;
  }

  const newPost = {
    _id: crypto.randomUUID(),
    userId: user._id,
    slug,
    title: data.title,
    desc: data.desc,
    category: data.category,
    content: data.content,
    img: data.img,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.insert(posts).values(newPost);
  revalidatePath('/posts');
  return newPost;
}

export async function addCommentAction(postId: string, desc: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) });
  if (!user) throw new Error("User not found");

  const newComment = {
    _id: crypto.randomUUID(),
    desc,
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
  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) });
  if (!user) return [];
  const saved = await db.query.savedPosts.findMany({ where: eq(savedPosts.userId, user._id) });
  return saved.map((s) => s.postId);
}

export async function toggleSavePostAction(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) });
  if (!user) throw new Error("User not found");

  const existing = await db.query.savedPosts.findFirst({
    where: and(eq(savedPosts.userId, user._id), eq(savedPosts.postId, postId))
  });

  if (existing) {
    await db.delete(savedPosts).where(and(eq(savedPosts.userId, user._id), eq(savedPosts.postId, postId)));
  } else {
    await db.insert(savedPosts).values({ userId: user._id, postId });
  }
  return true;
}

export async function toggleFeaturePostAction(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) });
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
  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) });
  if (!user) throw new Error("Unauthorized");
  
  await db.delete(posts).where(eq(posts._id, postId));
  revalidatePath('/');
  return true;
}

export async function getPostsAction(page: number, searchParamsObj: Record<string, string>) {
  const conditions = [];
  if (searchParamsObj.cat) conditions.push(eq(posts.category, searchParamsObj.cat));
  if (searchParamsObj.search) conditions.push(like(posts.title, `%${searchParamsObj.search}%`));
  if (searchParamsObj.author) {
    const user = await db.query.users.findFirst({ where: eq(users.username, searchParamsObj.author) });
    if (user) conditions.push(eq(posts.userId, user._id));
  }
  if (searchParamsObj.featured) conditions.push(eq(posts.isFeatured, true));
  
  const limit = searchParamsObj.limit ? parseInt(searchParamsObj.limit) : 10;
  const offset = (page - 1) * limit;

  const fetchedPosts = await db.query.posts.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { user: true },
    orderBy: (postsTable, { desc, asc }) => {
      if (searchParamsObj.sort === "oldest") return [asc(postsTable.createdAt)];
      if (searchParamsObj.sort === "popular" || searchParamsObj.sort === "trending") return [desc(postsTable.visit)];
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

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) });
  if (!user) throw new Error("User not found");

  const comment = await db.query.comments.findFirst({ where: eq(comments._id, commentId) });
  if (!comment) throw new Error("Comment not found");

  const isAdmin = user.username === "admin"; // adjust if you have a role field
  const isOwner = comment.userId === user._id;

  if (!isOwner && !isAdmin) throw new Error("Forbidden");

  await db.delete(comments).where(eq(comments._id, commentId));
  revalidatePath(`/[slug]`, "page");
}
