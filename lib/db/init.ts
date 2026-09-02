import postgres from "postgres";

let isInitialized = false;

export async function ensureDbInitialized(client: postgres.Sql) {
  if (isInitialized) return;

  try {
    // Create PostgreSQL tables if they don't exist
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS users (
        _id TEXT PRIMARY KEY,
        "clerkUserId" TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        img TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS posts (
        _id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
        img TEXT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        "desc" TEXT,
        category TEXT DEFAULT 'general',
        content TEXT NOT NULL,
        "isFeatured" BOOLEAN DEFAULT FALSE,
        visit INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS comments (
        _id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
        "postId" TEXT NOT NULL REFERENCES posts(_id) ON DELETE CASCADE,
        "desc" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "savedPosts" (
        "userId" TEXT NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
        "postId" TEXT NOT NULL REFERENCES posts(_id) ON DELETE CASCADE,
        PRIMARY KEY ("userId", "postId")
      );
    `);

    isInitialized = true;
  } catch (err) {
    console.error("Auto-init PostgreSQL error:", err);
    throw err;
  }
}


