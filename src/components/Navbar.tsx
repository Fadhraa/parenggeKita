"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Ship, Anchor, LogIn, LogOut, LayoutDashboard, Navigation } from "lucide-react";
import { getSessionUser, clearSessionUser } from "@/lib/session";
import { User } from "@/types";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(getSessionUser());
    const interval = setInterval(() => {
      setUser(getSessionUser());
    }, 1500);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleLogout = () => {
    clearSessionUser();
    setUser(null);
    router.push("/");
  };

  const getDashboardHref = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "kapal_pengangkut") return "/dashboard/pengangkut";
    return "/dashboard/nelayan";
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A2E4D] text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Ship className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  PARENGGE KITA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-sky-200 border border-white/10">
                  MVP
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-300 font-normal">
                Digitalisasi Rantai Pasok Nelayan Galesong
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-white ${
                pathname === "/" ? "text-sky-400 font-bold" : "text-slate-200"
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/#peta-tracking"
              className="text-sm font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Navigation className="w-4 h-4 text-sky-400" />
              Peta Live Tracking
            </Link>
            <Link
              href="/#rekap-muatan"
              className="text-sm font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Anchor className="w-4 h-4 text-amber-400" />
              Rekap Muatan Gabus
            </Link>
          </nav>

          {/* User Auth / Dashboard Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href={getDashboardHref()}
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm shadow transition-all hover:shadow-sky-500/20"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {user.role === "admin"
                      ? "Dashboard Admin"
                      : user.role === "kapal_pengangkut"
                      ? "Dashboard Pengangkut"
                      : "Dashboard Nelayan"}
                  </span>
                  <span className="sm:hidden">Dashboard</span>
                </Link>

                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-sky-200 truncate max-w-[120px]">
                    {user.nama_kapal}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    {user.nama_juragan || user.username}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Keluar Akun"
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-sky-500/25 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk / Daftar</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
