"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Truck,
  HardHat,
  X,
  Layers,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    title: "Utama",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/items", label: "Master Barang", icon: Package },
    ],
  },
  {
    title: "Transaksi Lapangan",
    items: [
      { href: "/incoming", label: "Barang Masuk", icon: ArrowDownLeft },
      { href: "/outgoing", label: "Barang Keluar", icon: ArrowUpRight },
    ],
  },
  {
    title: "Laporan & Referensi",
    items: [
      { href: "/reports", label: "Laporan Mutasi", icon: FileText },
      { href: "/suppliers", label: "Supplier & Vendor", icon: Truck },
      { href: "/categories", label: "Kategori & Satuan", icon: Layers },
    ],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop untuk Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 border-r border-slate-800 print:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Header Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
          <Link href="/" className="flex items-center space-x-3" onClick={onClose}>
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shadow-sm font-bold">
              <HardHat className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-none">
                LOGISTIK PROYEK
              </span>
              <span className="text-[11px] text-amber-400 font-medium tracking-wide">
                Sistem Inventaris Site
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {navItems.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-amber-500 text-slate-950 font-semibold shadow-xs"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive ? "text-slate-950" : "text-slate-400"
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Sidebar (Status KP & Logout) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 space-y-2">
          <div className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <p className="text-[10px] text-slate-400">Status Operasional</p>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-200">
                Database Turso Online
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logoutAction()}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors border border-transparent hover:border-rose-900/50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
}

