"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Navigation, Package, Snowflake, User as UserIcon } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { User } from "@/types";

export default function BottomNav() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setUser(getSessionUser());
    const interval = setInterval(() => {
      setUser(getSessionUser());
    }, 2000);
    return () => clearInterval(interval);
  }, [pathname]);

  const getDashboardHref = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "kapal_pengangkut") return "/dashboard/pengangkut";
    return "/dashboard/nelayan";
  };

  // Sembunyikan bilah navigasi bawah di seluruh dashboard (admin, nelayan, pengangkut), landing page, login, dan register
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/dashboard")
  ) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A2E4D] border-t border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.3)]">
      <div className="grid grid-cols-5 h-16">
        {/* 1. Beranda */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            pathname === "/" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Beranda</span>
        </Link>

        {/* 2. Live Tracking */}
        <Link
          href="/#peta-tracking"
          className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Navigation className="w-5 h-5 text-sky-400" />
          <span className="text-[10px] tracking-tight">Tracking</span>
        </Link>

        {/* 3. Muatan Gabus */}
        <Link
          href="/#rekap-muatan"
          className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Package className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] tracking-tight">Muatan</span>
        </Link>

        {/* 4. Logistik Es/BBM */}
        <Link
          href={getDashboardHref()}
          className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Snowflake className="w-5 h-5 text-cyan-400" />
          <span className="text-[10px] tracking-tight">Logistik</span>
        </Link>

        {/* 5. Akun / Dashboard */}
        <Link
          href={user ? getDashboardHref() : "/login"}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            pathname.startsWith("/dashboard") || pathname === "/login"
              ? "text-sky-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">
            {user ? "Dashboard" : "Akun"}
          </span>
        </Link>
      </div>
    </div>
  );
}
