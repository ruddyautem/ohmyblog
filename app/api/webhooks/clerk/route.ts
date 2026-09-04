import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET in environment variables');
    return new Response('Error: CLERK_WEBHOOK_SECRET is missing in environment variables', {
      status: 500,
    });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- missing svix headers', {
      status: 400
    })
  }

  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as unknown as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return new Response('Error occured -- invalid signature', {
      status: 400
    })
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const userData = evt.data;
    const email = userData.email_addresses?.[0]?.email_address || "";
    const username = userData.username || email.split("@")[0] || `user_${userData.id.slice(-8)}`;
    const img = userData.image_url || null;

    await db.insert(users).values({
      _id: crypto.randomUUID(),
      clerkUserId: userData.id!,
      username,
      email,
      img,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: users.clerkUserId,
      set: {
        username,
        email,
        img,
        updatedAt: new Date(),
      }
    });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      try {
        // 1. Find user in database
        const existingUser = await db.query.users.findFirst({
          where: eq(users.clerkUserId, id),
          with: {
            posts: true,
          },
        });

        if (existingUser) {
          // 2. Collect all R2 images from the user's posts and avatar
          try {
            const { DeleteObjectsCommand } = await import("@aws-sdk/client-s3");
            const { r2Client } = await import("@/lib/r2");
            const bucket = process.env.R2_BUCKET_NAME || "ohmyblog-uploads";
            const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-dc8f3ebfad6f443b920c49b37078af5c.r2.dev";
            const keysToDelete: Set<string> = new Set();

            // A. User avatar image if on R2
            if (existingUser.img && existingUser.img.includes(publicUrl)) {
              const key = existingUser.img.replace(`${publicUrl}/`, "");
              if (key) keysToDelete.add(key);
            }

            // B. Post cover images & embedded content images
            for (const post of existingUser.posts) {
              if (post.img && post.img.includes(publicUrl)) {
                const key = post.img.replace(`${publicUrl}/`, "");
                if (key) keysToDelete.add(key);
              }

              if (post.content) {
                const urlPattern = new RegExp(`${publicUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/([^\\s"'<>]+)`, "g");
                let match;
                while ((match = urlPattern.exec(post.content)) !== null) {
                  if (match[1]) keysToDelete.add(match[1]);
                }
              }
            }

            if (keysToDelete.size > 0) {
              const deleteParams = {
                Bucket: bucket,
                Delete: {
                  Objects: Array.from(keysToDelete).map((Key) => ({ Key })),
                  Quiet: true,
                },
              };
              await r2Client.send(new DeleteObjectsCommand(deleteParams));
              console.log(`[Webhook] Cleaned up ${keysToDelete.size} R2 images for user ${existingUser.username}`);
            }
          } catch (r2Err) {
            console.error("[Webhook] Error cleaning up R2 images for deleted user:", r2Err);
          }

          // 3. Delete user in Postgres (cascades to all posts, comments, savedPosts)
          await db.delete(users).where(eq(users._id, existingUser._id));
          console.log(`[Webhook] Deleted user ${existingUser.username} (${existingUser._id}) and cascaded records.`);
        }
      } catch (err) {
        console.error("[Webhook] Error processing user.deleted:", err);
      }
    }
  }

  return new Response('', { status: 200 })
}
