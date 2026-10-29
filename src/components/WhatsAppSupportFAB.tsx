"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function WhatsAppSupportFAB() {
  const pathname = usePathname();

  // Sembunyikan tombol bantuan WA di halaman login dan register
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const phone = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "6281234567890";
  const message = encodeURIComponent(
    "Halo Admin Pengelola Parengge Kita / TPI Galesong Utara, saya ingin bertanya terkait sistem pencatatan gabus dan logistik..."
  );
  const waUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <aside aria-label="Bantuan Langsung">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi Bantuan Pengelola via WhatsApp"
        className="fixed bottom-6 right-4 md:right-6 z-40 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-xl hover:shadow-emerald-600/30 transition-all hover:scale-105 group"
      >
        <MessageCircle className="w-5 h-5 text-white animate-pulse" />
        <span className="text-xs sm:text-sm font-bold tracking-wide">
          Bantuan WA
        </span>
      </a>
    </aside>
  );
}
