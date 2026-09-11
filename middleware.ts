import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "logistik_proyek_konstruksi_secret_key_jwt_2026"
);

const COOKIE_NAME = "auth_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Jalur publik yang tidak memerlukan login
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".") // file statis seperti .svg, .png
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      isAuthenticated = true;
    } catch (err) {
      isAuthenticated = false;
    }
  }

  // 1. Jika membuka halaman login:
  if (pathname === "/login") {
    // Kalau sudah login, langsung arahkan ke Dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 2. Jika membuka halaman lain (Dashboard, Master Barang, Transaksi, Laporan, dll):
  // Kalau belum login, wajib diarahkan ke /login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Simpan URL yang dituju agar bisa diarahkan kembali setelah login (opsional)
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

