import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Bersihkan tanda kutip ganda/tunggal jika pengguna tidak sengaja menyalin tanda kutip ke Vercel
const rawUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
const url = rawUrl.replace(/^["']|["']$/g, "").trim();

const rawToken = process.env.TURSO_AUTH_TOKEN;
const authToken = rawToken ? rawToken.replace(/^["']|["']$/g, "").trim() : undefined;

// Client LibSQL untuk Turso Cloud atau SQLite lokal
const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
