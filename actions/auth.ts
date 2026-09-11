"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionToken, getCurrentUser, COOKIE_NAME } from "@/lib/auth";
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

// 3. Server Action: Perbarui Informasi Profil & Username
export async function updateProfileInfoAction(
  formData: FormData
): Promise<AuthResponse> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: "Sesi login Anda telah berakhir. Silakan login kembali!",
      };
    }

    const name = (formData.get("name") as string)?.trim();
    const username = (formData.get("username") as string)?.trim().toLowerCase();

    if (!name || name.length < 2) {
      return {
        success: false,
        message: "Nama pengguna minimal 2 karakter!",
      };
    }

    if (!username || username.length < 3) {
      return {
        success: false,
        message: "Username minimal 3 karakter!",
      };
    }

    // Validasi format karakter username (hanya huruf, angka, underscore, titik, minus)
    const validUsernamePattern = /^[a-z0-9_.-]+$/;
    if (!validUsernamePattern.test(username)) {
      return {
        success: false,
        message:
          "Username hanya boleh menggunakan huruf kecil, angka, titik (.), minus (-), dan garis bawah (_).",
      };
    }

    // Periksa apakah username baru sudah digunakan oleh pengguna lain
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, username), ne(users.id, currentUser.id)))
      .get();

    if (existingUser) {
      return {
        success: false,
        message: `Username "${username}" sudah digunakan oleh akun lain! Silakan pilih username yang berbeda.`,
      };
    }

    // Ambil data user saat ini dari database
    const userInDb = await db
      .select()
      .from(users)
      .where(eq(users.id, currentUser.id))
      .get();

    if (!userInDb) {
      return {
        success: false,
        message: "Data akun pengguna tidak ditemukan di database.",
      };
    }

    // Update profil di database
    await db
      .update(users)
      .set({
        name,
        username,
      })
      .where(eq(users.id, currentUser.id));

    // Perbarui JWT Session Token di Cookie
    const newToken = await createSessionToken({
      id: userInDb.id,
      username: username,
      name: name,
      role: userInDb.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    revalidatePath("/profile");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Profil dan username berhasil diperbarui!",
    };
  } catch (error) {
    console.error("Error updateProfileInfoAction:", error);
    return {
      success: false,
      message: "Terjadi gangguan sistem saat memperbarui profil.",
    };
  }
}

// 4. Server Action: Ganti Kata Sandi (Password)
export async function changePasswordAction(
  formData: FormData
): Promise<AuthResponse> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: "Sesi login Anda telah berakhir. Silakan login kembali!",
      };
    }

    const currentPassword = (formData.get("currentPassword") as string)?.trim();
    const newPassword = (formData.get("newPassword") as string)?.trim();
    const confirmPassword = (formData.get("confirmPassword") as string)?.trim();

    if (!currentPassword) {
      return {
        success: false,
        message: "Kata sandi saat ini (lama) wajib diisi!",
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: "Kata sandi baru minimal 6 karakter demi keamanan akun!",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: "Konfirmasi kata sandi baru tidak cocok dengan kata sandi baru!",
      };
    }

    if (currentPassword === newPassword) {
      return {
        success: false,
        message: "Kata sandi baru tidak boleh sama persis dengan kata sandi saat ini!",
      };
    }

    // Ambil data user dari database
    const userInDb = await db
      .select()
      .from(users)
      .where(eq(users.id, currentUser.id))
      .get();

    if (!userInDb) {
      return {
        success: false,
        message: "Data akun pengguna tidak ditemukan di database.",
      };
    }

    // Verifikasi kata sandi lama
    const isOldPasswordValid = await bcrypt.compare(
      currentPassword,
      userInDb.password
    );

    if (!isOldPasswordValid) {
      return {
        success: false,
        message: "Kata sandi saat ini (lama) yang Anda masukkan tidak sesuai!",
      };
    }

    // Enkripsi kata sandi baru dengan bcrypt salt rounds 10
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password di database
    await db
      .update(users)
      .set({
        password: newHashedPassword,
      })
      .where(eq(users.id, currentUser.id));

    revalidatePath("/profile");

    return {
      success: true,
      message:
        "Kata sandi berhasil diperbarui! Silakan gunakan kata sandi baru untuk login berikutnya.",
    };
  } catch (error) {
    console.error("Error changePasswordAction:", error);
    return {
      success: false,
      message: "Terjadi gangguan sistem saat memperbarui kata sandi.",
    };
  }
}

