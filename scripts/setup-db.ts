import postgres from 'postgres';
import { ensureDbInitialized } from '../lib/db/init';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const client = postgres(process.env.DATABASE_URL);
try { await ensureDbInitialized(client); } finally { await client.end(); }
