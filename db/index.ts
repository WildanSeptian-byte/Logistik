import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const rawUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
let url = rawUrl.replace(/^["']|["']$/g, "").trim();

// Konversi otomatis protokol libsql:// ke https:// untuk lingkungan serverless (Vercel)
// Vercel Serverless Function bekerja jauh lebih stabil menggunakan protokol HTTPS murni
if (url.startsWith("libsql://")) {
  url = url.replace("libsql://", "https://");
}

const rawToken = process.env.TURSO_AUTH_TOKEN;
const authToken = rawToken ? rawToken.replace(/^["']|["']$/g, "").trim() : undefined;

// Client LibSQL untuk Turso Cloud (HTTPS) atau SQLite lokal
const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
