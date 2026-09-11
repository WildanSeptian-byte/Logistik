"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import type { SessionUser } from "@/lib/auth";

interface AppShellProps {
  children: React.ReactNode;
  user?: SessionUser | null;
}

export function AppShell({ children, user }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Jika berada di halaman login, tampilkan layar penuh tanpa sidebar & navbar
  if (pathname === "/login") {
    return <main className="min-h-screen bg-slate-950">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigasi */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 print:lg:pl-0 transition-all duration-200">
        <Navbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          user={user}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
