import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error("[Clerk Webhook] Missing CLERK_WEBHOOK_SECRET in environment variables");
      return new Response("Error: CLERK_WEBHOOK_SECRET is missing in environment variables", {
        status: 500,
      });
    }

    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("[Clerk Webhook] Missing svix headers");
      return new Response("Error: Missing svix headers", {
        status: 400,
      });
    }

    const body = await req.text();
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      const verified = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
      evt = (typeof verified === "string"
        ? JSON.parse(verified)
        : (verified || JSON.parse(body))) as WebhookEvent;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Verification failed";
      console.error("[Clerk Webhook] Signature verification failed:", errorMsg);
      return new Response(`Error: Invalid signature - ${errorMsg}`, {
        status: 400,
      });
    }

    if (!evt) {
      try {
        evt = JSON.parse(body) as WebhookEvent;
      } catch (parseErr) {
        console.error("[Clerk Webhook] Failed to parse payload:", parseErr);
        return new Response("Error: Invalid JSON payload", { status: 400 });
      }
    }

    const eventType = evt?.type;
    if (!eventType) {
      console.error("[Clerk Webhook] No event type found in payload:", evt);
      return new Response("Error: Missing event type in payload", { status: 400 });
    }

    console.log(`[Clerk Webhook] Successfully verified and processing event: ${eventType}`);

    if (eventType === "user.created" || eventType === "user.updated") {
      const userData = evt.data;
      const email = userData.email_addresses?.[0]?.email_address || "";
      const baseUsername = userData.username || email.split("@")[0] || `user_${userData.id.slice(-8)}`;
      const img = userData.image_url || null;

      const existingUser = await db.query.users.findFirst({
        where: eq(users.clerkUserId, userData.id!),
      });

      if (existingUser) {
        await db
          .update(users)
          .set({
            username: userData.username || existingUser.username,
            email: email || existingUser.email,
            img: img || existingUser.img,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkUserId, userData.id!));
        console.log(`[Clerk Webhook] Updated existing user ${existingUser.username}`);
      } else {
        let finalUsername = baseUsername;
        const usernameConflict = await db.query.users.findFirst({
          where: eq(users.username, finalUsername),
        });
        if (usernameConflict) {
          finalUsername = `${baseUsername}_${userData.id!.slice(-4)}`;
        }

        await db
          .insert(users)
          .values({
            _id: crypto.randomUUID(),
            clerkUserId: userData.id!,
            username: finalUsername,
            email: email || `${userData.id!}@clerk.dev`,
            img,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoNothing();
        console.log(`[Clerk Webhook] Created new user ${finalUsername}`);
      }
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;
      if (id) {
        console.log(`[Clerk Webhook] Processing deletion for clerkUserId: ${id}`);
        const existingUser = await db.query.users.findFirst({
          where: eq(users.clerkUserId, id),
          with: {
            posts: true,
          },
        });

        if (existingUser) {
          try {
            const { DeleteObjectsCommand } = await import("@aws-sdk/client-s3");
            const { r2Client } = await import("@/lib/r2");
            const bucket = process.env.R2_BUCKET_NAME || "ohmyblog-uploads";
            const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-dc8f3ebfad6f443b920c49b37078af5c.r2.dev";
            const keysToDelete: Set<string> = new Set();

            if (existingUser.img && existingUser.img.includes(publicUrl)) {
              const key = existingUser.img.replace(`${publicUrl}/`, "");
              if (key) keysToDelete.add(key);
            }

            if (existingUser.posts && existingUser.posts.length > 0) {
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
            }

            if (keysToDelete.size > 0) {
              await r2Client.send(
                new DeleteObjectsCommand({
                  Bucket: bucket,
                  Delete: {
                    Objects: Array.from(keysToDelete).map((Key) => ({ Key })),
                    Quiet: true,
                  },
                })
              );
              console.log(`[Clerk Webhook] Cleaned up ${keysToDelete.size} R2 images for user ${existingUser.username}`);
            }
          } catch (r2Err) {
            console.error("[Clerk Webhook] Error cleaning up R2 images (continuing with DB deletion):", r2Err);
          }

          await db.delete(users).where(eq(users._id, existingUser._id));
          console.log(`[Clerk Webhook] Deleted user ${existingUser.username} (${existingUser._id}) and cascaded records.`);
        } else {
          await db.delete(users).where(eq(users.clerkUserId, id));
          console.log(`[Clerk Webhook] Fallback delete for clerkUserId: ${id}`);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, event: eventType }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (globalErr: unknown) {
    const errorMsg = globalErr instanceof Error ? globalErr.message : "Internal Server Error";
    console.error("[Clerk Webhook] Fatal error handling webhook:", globalErr);
    return new Response(`Server Error: ${errorMsg}`, {
      status: 500,
    });
  }
}
