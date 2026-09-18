import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getBaseUrl } from "@/lib/site-url";

export const revalidate = 3600; // Cache and periodically revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const currentDate = new Date();

  // Core static and category exploration pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/posts?cat=voyages`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/posts?cat=cuisine`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/posts?cat=animaux`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/posts?cat=astuces`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/posts?cat=general`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic published posts fetched from PostgreSQL database
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const postItems = await db
      .select({
        slug: posts.slug,
        img: posts.img,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .orderBy(desc(posts.updatedAt));

    postRoutes = postItems.map((post) => ({
      url: `${baseUrl}/${encodeURIComponent(post.slug)}`,
      lastModified: post.updatedAt || post.createdAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: post.img
        ? [post.img.startsWith("http") ? post.img : `${baseUrl}${post.img.startsWith("/") ? "" : "/"}${post.img}`]
        : undefined,
    }));
  } catch (error) {
    console.error("[Sitemap] Notice: could not fetch posts from database, returning static routes.", error);
  }

  return [...staticRoutes, ...postRoutes];
}
