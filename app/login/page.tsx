import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login | Sistem Logistik Proyek Konstruksi",
  description: "Halaman masuk sistem inventaris material proyek konstruksi",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}

