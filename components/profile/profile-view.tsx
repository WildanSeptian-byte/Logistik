"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Sparkles,
  HardHat,
  Calendar,
  BadgeCheck,
  Building,
  AtSign,
} from "lucide-react";
import { updateProfileInfoAction, changePasswordAction } from "@/actions/auth";
import { formatDate } from "@/lib/utils";

interface ProfileUser {
  id: number;
  username: string;
  name: string;
  role: string;
  createdAt: string;
}

interface ProfileViewProps {
  initialUser: ProfileUser;
}

export function ProfileView({ initialUser }: ProfileViewProps) {
  const router = useRouter();

  // State untuk form ubah username & nama
  const [name, setName] = useState(initialUser.name);
  const [username, setUsername] = useState(initialUser.username);
  const [isPendingProfile, startProfileTransition] = useTransition();
  const [profileFeedback, setProfileFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // State untuk form ganti password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPendingPassword, startPasswordTransition] = useTransition();
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Handler update nama & username
  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileFeedback(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);

    startProfileTransition(async () => {
      const res = await updateProfileInfoAction(formData);
      if (res.success) {
        setProfileFeedback({ type: "success", text: res.message });
        router.refresh();
      } else {
        setProfileFeedback({ type: "error", text: res.message });
      }
    });
  };

  // Handler ubah kata sandi
  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: "error",
        text: "Kata sandi baru minimal 6 karakter!",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: "error",
        text: "Konfirmasi kata sandi baru tidak sesuai!",
      });
      return;
    }

    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    startPasswordTransition(async () => {
      const res = await changePasswordAction(formData);
      if (res.success) {
        setPasswordFeedback({ type: "success", text: res.message });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.refresh();
      } else {
        setPasswordFeedback({ type: "error", text: res.message });
      }
    });
  };

  const isLogistikStaff =
    initialUser.role === "admin" || initialUser.role === "staf_logistik";

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner Profil */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 translate-y-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <HardHat className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {name || initialUser.name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-2xs ${
                    isLogistikStaff
                      ? "bg-amber-500 text-slate-950"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {isLogistikStaff ? "Staf Logistik Site" : "Site Manager"}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 flex items-center gap-2">
                <span className="text-amber-400 font-medium">
                  @{username || initialUser.username}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 text-xs">ID #{initialUser.id}</span>
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Terdaftar: {formatDate(initialUser.createdAt || new Date())}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Sesi Aktif Terverifikasi
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-700/60 pt-4 sm:pt-0">
            <span className="text-xs text-slate-400">Proyek Lapangan:</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Building className="w-4 h-4 text-amber-400" />
              Gedung Bertingkat 2026
            </span>
          </div>
        </div>
      </div>

      {/* 2. Grid Konten: Form Pengaturan Akun & Panduan Keamanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Form Username & Password (8 Kolom) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Ganti Nama & Username */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Informasi Profil & Ganti Username
                  </h2>
                  <p className="text-xs text-slate-500">
                    Perbarui nama lengkap dan username identitas akun Anda
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              {profileFeedback && (
                <div
                  className={`p-3.5 rounded-lg flex items-start space-x-2.5 text-xs font-medium ${
                    profileFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {profileFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  )}
                  <span>{profileFeedback.text}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-name"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Nama Lengkap / Nama Staf
                </label>
                <div className="relative">
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Nama ini akan ditampilkan pada kop laporan dan riwayat aktivitas.
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-username"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Username Akun (Untuk Login)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <AtSign className="w-4 h-4" />
                  </div>
                  <input
                    id="profile-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    required
                    minLength={3}
                    placeholder="Contoh: budi_logistik"
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Gunakan huruf kecil, angka, titik, minus, atau garis bawah (_). Minimal 3 karakter.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isPendingProfile}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPendingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-4 h-4" />
                      <span>Simpan Perubahan Profil</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Ganti Kata Sandi */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Ganti Kata Sandi (Password)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Perbarui kata sandi untuk menjaga keamanan akun inventaris Anda
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {passwordFeedback && (
                <div
                  className={`p-3.5 rounded-lg flex items-start space-x-2.5 text-xs font-medium ${
                    passwordFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {passwordFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  )}
                  <span>{passwordFeedback.text}</span>
                </div>
              )}

              {/* Kata Sandi Saat Ini */}
              <div className="space-y-1.5">
                <label
                  htmlFor="current-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Kata Sandi Saat Ini (Lama)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Masukkan kata sandi lama Anda"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Kata Sandi Baru */}
              <div className="space-y-1.5">
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Gunakan minimal 6 karakter kombinasi huruf dan angka.
                </p>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Ulangi kata sandi baru"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isPendingPassword}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPendingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memperbarui...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Perbarui Kata Sandi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Info Hak Akses & Kriptografi Keamanan (4 Kolom) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card Info Hak Akses Role */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Wewenang & Hak Akses
              </h3>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Peran Sistem:</span>
                <span className="font-semibold text-slate-800">
                  {isLogistikStaff ? "Staf Logistik (Admin)" : "Site Manager"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tingkat Izin:</span>
                <span className="font-semibold text-emerald-600">
                  {isLogistikStaff ? "Penuh (Read/Write)" : "Monitoring & Approval"}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-medium text-slate-800">Cakupan Tugas Lapangan:</p>
              {isLogistikStaff ? (
                <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
                  <li>Input penerimaan material (Surat Jalan / DO).</li>
                  <li>Input pengeluaran barang ke mandor (SPB).</li>
                  <li>Kelola data master material, satuan, supplier.</li>
                  <li>Monitoring peringatan batas stok minimum.</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
                  <li>Pemantauan dasbor analitik & nilai material.</li>
                  <li>Evaluasi laporan mutasi berkala mingguan/bulanan.</li>
                  <li>Pengesahan (Approval) rekapitulasi material.</li>
                  <li>Verifikasi ketersediaan material kritis proyek.</li>
                </ul>
              )}
            </div>
          </div>

          {/* Card Arsitektur Keamanan (Untuk Pembahasan Laporan KP) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Keamanan & Kriptografi
              </h3>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900">
                <p className="font-semibold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Bcrypt Password Hashing
                </p>
                <p className="text-[10px] text-emerald-700 mt-0.5 leading-relaxed">
                  Kata sandi tidak disimpan dalam bentuk teks biasa, melainkan dienkripsi
                  menggunakan algoritma <code>bcryptjs</code> (Salt Rounds 10).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-900">
                <p className="font-semibold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  JWT Session HttpOnly Cookie
                </p>
                <p className="text-[10px] text-blue-700 mt-0.5 leading-relaxed">
                  Token sesi ditandatangani secara kriptografis (HS256) dan dilindungi flag
                  <code>HttpOnly</code> sehingga kebal dari serangan XSS browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

