import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

// Client LibSQL untuk Turso Cloud atau SQLite lokal
const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

