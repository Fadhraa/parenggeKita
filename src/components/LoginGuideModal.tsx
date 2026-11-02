"use client";

import React from "react";
import Link from "next/link";
import { X, Smartphone, Monitor, LogIn, ArrowRight } from "lucide-react";

interface LoginGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginGuideModal({
  isOpen,
  onClose,
}: LoginGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#0A2E4D] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <LogIn className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Cara Masuk ke Halaman Login
              </h3>
              <p className="text-xs text-slate-300">
                Panduan akses cepat melalui perangkat Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Halaman publik Parengge Kita didesain bersih dan minimalis untuk masyarakat umum. Untuk nelayan, juragan, maupun pengelola TPI, Anda dapat membuka halaman login menggunakan cara berikut:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Desktop Card */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Monitor className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Desktop / Laptop
                </h4>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>
                  <strong>Klik 2x Cepat (Double Click)</strong> pada <strong>Logo Parengge Kita</strong> di navbar atas.
                </li>
                <li>
                  Atau akses langsung URL <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-sky-600">/login</code> di browser.
                </li>
              </ul>
            </div>

            {/* Mobile Card */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  HP / Mobile Layar Sentuh
                </h4>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>
                  <strong>Ketuk 2x Cepat (Double Tap)</strong> pada <strong>Logo Parengge Kita</strong> di navbar atas.
                </li>
                <li>
                  Atau <strong>Tekan & Tahan (Long Press ~1 detik)</strong> pada logo untuk langsung menuju form login.
                </li>
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-center justify-between gap-3">
            <span className="text-xs text-sky-900 font-medium">
              Ingin langsung masuk ke form login sekarang?
            </span>
            <Link
              href="/login"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-colors shadow-xs shrink-0"
            >
              <span>Buka Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-white transition-colors"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

