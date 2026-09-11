"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { ensureDatabaseInitialized } from "@/db/init";

export type AuthResponse = {
  success: boolean;
  message: string;
};

// 1. Server Action: Login Pengguna
export async function loginAction(formData: FormData): Promise<AuthResponse> {
  try {
    const username = (formData.get("username") as string)?.trim().toLowerCase();
    const password = (formData.get("password") as string)?.trim();

    if (!username || !password) {
      return {
        success: false,
        message: "Username dan password wajib diisi!",
      };
    }

    // Pastikan tabel users dan akun default sudah ada
    await ensureDatabaseInitialized();

    // Cari pengguna di database
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (!userRecord) {
      return {
        success: false,
        message: "Username atau password yang Anda masukkan salah!",
      };
    }

    // Bandingkan hash password
    const isPasswordValid = await bcrypt.compare(password, userRecord.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Username atau password yang Anda masukkan salah!",
      };
    }

    // Buat JWT session token
    const token = await createSessionToken({
      id: userRecord.id,
      username: userRecord.username,
      name: userRecord.name,
      role: userRecord.role,
    });

    // Simpan ke HttpOnly Cookie yang aman
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
      sameSite: "lax",
    });

    return {
      success: true,
      message: `Selamat datang, ${userRecord.name}!`,
    };
  } catch (error) {
    console.error("Error loginAction:", error);
    return {
      success: false,
      message: "Terjadi gangguan sistem saat memproses login.",
    };
  }
}

// 2. Server Action: Logout Pengguna
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

