import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "logistik_proyek_konstruksi_secret_key_jwt_2026"
);

export const COOKIE_NAME = "auth_session";

export interface SessionUser {
  id: number;
  username: string;
  name: string;
  role: string;
}

// 1. Buat token JWT session
export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Berlaku 7 hari
    .sign(SECRET_KEY);
}

// 2. Verifikasi token JWT session
export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: Number(payload.id),
      username: String(payload.username),
      name: String(payload.name),
      role: String(payload.role),
    };
  } catch (error) {
    return null;
  }
}

// 3. Ambil data pengguna yang sedang login dari cookie (Server Components)
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

