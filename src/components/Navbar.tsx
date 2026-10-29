"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Anchor,
  LogOut,
  Navigation,
} from "lucide-react";
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

  // Handler untuk secret login via logo:
  // Mendukung:
  // 1. Double tap di layar sentuh HP / mobile
  // 2. Double click di mouse / laptop
  // 3. Tekan & tahan (Long press ~700ms) di mobile
  const lastClickRef = React.useRef<number>(0);
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    const DOUBLE_CLICK_DELAY = 400; // ms

    if (now - lastClickRef.current < DOUBLE_CLICK_DELAY) {
      // Ketukan kedua terdeteksi (Double tap / double click)
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      lastClickRef.current = 0;
      router.push("/login");
    } else {
      // Ketukan pertama
      lastClickRef.current = now;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      clickTimeoutRef.current = setTimeout(() => {
        // Jika tidak ada ketukan kedua, baru navigasi normal ke Beranda
        router.push("/");
        clickTimeoutRef.current = null;
      }, DOUBLE_CLICK_DELAY);
    }
  };

  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      router.push("/login");
    }, 700);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const getDashboardHref = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "kapal_pengangkut") return "/dashboard/pengangkut";
    return "/dashboard/nelayan";
  };

  // Sembunyikan Navbar di halaman login dan register
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  // Khusus Navbar di Dashboard (Nelayan, Admin, & Pengangkut)
  if (
    pathname.startsWith("/dashboard/nelayan") ||
    pathname.startsWith("/dashboard/admin") ||
    pathname.startsWith("/dashboard/pengangkut")
  ) {
    const dashboardTitle = pathname.startsWith("/dashboard/admin")
      ? "Dashboard Admin"
      : pathname.startsWith("/dashboard/pengangkut")
        ? "Dashboard Pengangkut"
        : "Dashboard Nelayan";

    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-800 border-b border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            {/* Logo Brand di Kiri */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className="select-none flex items-center touch-manipulation cursor-pointer"
            >
              <Link
                href="/"
                onClick={handleLogoClick}
                className="flex items-center gap-2.5 sm:gap-3 group"
              >
                <img
                  src="/assets/LOGO_KAPAL.png"
                  alt="Logo Parengge Kita"
                  className="w-10 h-10 sm:w-11 sm:h-11 object-contain transition-transform group-hover:scale-105"
                />
                <div className="hidden sm:flex items-center gap-1 tracking-wider text-base md:text-lg">
                  <h1 className="font-extrabold text-primary">PARENGGE</h1>
                  <span className="font-bold text-slate-400">KITA</span>
                </div>
              </Link>
            </div>

            {/* Tulisan Dashboard di Tengah */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
              <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight whitespace-nowrap">
                {dashboardTitle}
              </span>
            </div>

            {/* Identitas & Tombol Logout di Kanan */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user && (
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                    {user.nama_kapal || "Petugas TPI"}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {user.nama_juragan || user.username}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                title="Keluar Akun"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-colors shadow-xs"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-800 border-b border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-center md:justify-between h-16">
          {/* Logo Brand dengan Akses Login Rahasia (Tepat di tengah pada mobile, di kiri pada desktop) */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className="select-none flex items-center justify-center touch-manipulation cursor-pointer"
          >
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-3 group"
            >
              <img
                src="/assets/LOGO_KAPAL.png"
                alt="Logo Parengge Kita"
                className="w-11 h-11 object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex items-center gap-1 tracking-wider text-base sm:text-lg">
                <h1 className="font-extrabold text-primary">PARENGGE</h1>
                <span className="font-bold text-slate-400">KITA</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/"
              className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors ${
                pathname === "/"
                  ? "text-primary font-bold bg-slate-100/80"
                  : "text-slate-600 hover:text-primary hover:bg-slate-50"
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/#peta-tracking"
              className="group text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Navigation className="w-4 h-4 text-sky-500 group-hover:text-primary transition-colors" />
              <span>Peta Live Tracking</span>
            </Link>
            <Link
              href="/#rekap-muatan"
              className="group text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Anchor className="w-4 h-4 text-amber-500 group-hover:text-amber-600 transition-colors" />
              <span>Rekap Muatan Gabus</span>
            </Link>
          </nav>

          {/* User Auth: Hanya tampil jika sudah login (Logout & Identitas Akun) */}
          {user ? (
            <div className="absolute right-0 md:static flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                  {user.nama_kapal}
                </span>
                <span className="text-[10px] text-slate-500">
                  {user.nama_juragan || user.username}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Keluar Akun"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
