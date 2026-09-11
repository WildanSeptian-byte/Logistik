import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = {
  title: "Profil & Keamanan Akun | Sistem Logistik",
  description:
    "Kelola data profil pengguna, ganti username identitas, dan perbarui kata sandi akun sistem inventaris proyek konstruksi.",
};

export default async function ProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    redirect("/login");
  }

  // Ambil record pengguna terkini langsung dari database Turso
  const userRecord = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, sessionUser.id))
    .get();

  if (!userRecord) {
    redirect("/login");
  }

  return <ProfileView initialUser={userRecord} />;
}
