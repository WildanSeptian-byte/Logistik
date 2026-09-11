"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, Loader2, AlertCircle, HardHat } from "lucide-react";
import { loginAction } from "@/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    startTransition(async () => {
      const res = await loginAction(formData);
      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setErrorMessage(res.message);
      }
    });
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand & Logo Proyek */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 mb-2">
          <HardHat className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white uppercase">
          LOGISTIK PROYEK
        </h1>
        <p className="text-xs text-slate-400">
          Sistem Informasi Inventaris & Logistik Material Konstruksi
        </p>
      </div>

      {/* Kartu Form Login */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/40 space-y-5">
        <div>
          <h2 className="text-base font-bold text-white">Masuk ke Sistem</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gunakan akun staf logistik atau pimpinan proyek Anda.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center space-x-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>

        {/* Informasi Akun Demo / Default */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Pilihan Akun Uji Coba (KP Demo):
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill("admin", "admin123")}
              className="p-2 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 rounded-lg text-left transition-colors cursor-pointer"
            >
              <p className="font-semibold text-amber-400">Staf Logistik</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                user: admin
              </p>
              <p className="text-[10px] text-slate-500 font-mono">pass: admin123</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("sitemanager", "manager123")}
              className="p-2 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 rounded-lg text-left transition-colors cursor-pointer"
            >
              <p className="font-semibold text-purple-400">Site Manager</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                user: sitemanager
              </p>
              <p className="text-[10px] text-slate-500 font-mono">pass: manager123</p>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center italic">
            *Klik salah satu kartu di atas untuk mengisi form secara otomatis.
          </p>
        </div>
      </div>
    </div>
  );
}

