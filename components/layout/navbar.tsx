"use client";

import React from "react";
import { Menu, Calendar, Building2, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const today = new Date();

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

      <div className="flex items-center space-x-4">
        {/* Tanggal Hari Ini */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{formatDate(today)}</span>
        </div>

        {/* Profile Staf Logistik */}
        <div className="flex items-center space-x-3 pl-2 sm:border-l sm:border-slate-200">
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              Staf Logistik
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              Site Project Office
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

