import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { ensureDbInitialized } from './init';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ohmyblog';

// Disable prefetch/prepare for serverless & edge compatibility
export const client = postgres(connectionString, {
  prepare: false,
});

export const db = drizzle(client, { schema });

// Automatically initialize tables and seed data if database is empty
if (process.env.DATABASE_URL) {
  ensureDbInitialized(client).catch(console.error);
}


