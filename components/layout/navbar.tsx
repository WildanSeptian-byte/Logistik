"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Calendar, Building2, User, LogOut, Loader2, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import type { SessionUser } from "@/lib/auth";

interface NavbarProps {
  onOpenMobileMenu: () => void;
  user?: SessionUser | null;
}

export function Navbar({ onOpenMobileMenu, user }: NavbarProps) {
  const today = new Date();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-2xs print:hidden">
      <div className="flex items-center space-x-3">
        {/* Tombol Hamburger Menu (Khusus Mobile) */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-amber-500"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Info Lokasi Proyek */}
        <div className="hidden sm:flex items-center space-x-2 text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60 text-xs font-medium">
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>Proyek Pembangunan Gedung Bertingkat</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Tanggal Hari Ini */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{formatDate(today)}</span>
        </div>

        {/* Tombol Profil Pengguna (Dapat Diklik untuk Membuka Profil & Ganti Password) */}
        <div className="flex items-center space-x-1 sm:space-x-2 pl-2 sm:border-l sm:border-slate-200">
          <Link
            href="/profile"
            className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-all group cursor-pointer ${
              pathname === "/profile"
                ? "bg-amber-50 ring-1 ring-amber-300"
                : "hover:bg-slate-100"
            }`}
            title="Buka Pengaturan Profil & Keamanan"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                pathname === "/profile"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "bg-amber-100 border border-amber-300 text-amber-800 group-hover:bg-amber-200 group-hover:border-amber-400"
              }`}
            >
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-amber-600 transition-colors">
                {user?.name || "Profil Saya"}
              </p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight flex items-center gap-1">
                <span className="text-emerald-600 font-semibold">
                  @{user?.username || "pengguna"}
                </span>
                <span>•</span>
                <span className="capitalize">
                  {user?.role === "admin"
                    ? "Staf Logistik"
                    : user?.role === "sitemanager"
                    ? "Site Manager"
                    : (user?.role || "Staf")}
                </span>
              </p>
            </div>
          </Link>

          {/* Tombol Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            title="Keluar dari Sistem"
            className="p-1.5 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
