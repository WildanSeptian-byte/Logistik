import { NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasUrl = Boolean(process.env.TURSO_DATABASE_URL);
  const hasToken = Boolean(process.env.TURSO_AUTH_TOKEN);
  const rawUrl = process.env.TURSO_DATABASE_URL || "";

  // Sensor URL untuk keamanan (hanya tampilkan prefix dan domain)
  const maskedUrl = rawUrl
    ? rawUrl.substring(0, 15) + "..." + rawUrl.substring(rawUrl.length - 10)
    : "TIDAK DITEMUKAN (KOSONG)";

  try {
    // Uji coba query ke database Turso
    const testQuery = await db.select().from(items).limit(1);

    return NextResponse.json({
      status: "SUCCESS",
      message: "Koneksi ke Turso DB Berhasil!",
      hasUrl,
      hasToken,
      maskedUrl,
      itemCountInDb: testQuery.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "DATABASE_ERROR",
        message: "Gagal menghubungkan ke Turso DB dari server Vercel",
        errorName: err?.name || "UnknownError",
        errorMessage: err?.message || String(err),
        hasUrl,
        hasToken,
        maskedUrl,
      },
      { status: 200 }
    );
  }
}
