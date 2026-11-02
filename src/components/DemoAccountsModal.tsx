"use client";

import React, { useState } from "react";
import { X, KeyRound, Copy, Check, ShieldCheck, Ship, Anchor } from "lucide-react";

interface DemoAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount?: (username: string, password: string) => void;
}

interface DemoAccount {
  roleName: string;
  roleBadge: string;
  roleBadgeColor: string;
  icon: React.ReactNode;
  username: string;
  password: string;
  namaKapal: string;
  juragan: string;
  area: string;
}

export default function DemoAccountsModal({
  isOpen,
  onClose,
  onSelectAccount,
}: DemoAccountsModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const demoAccounts: DemoAccount[] = [
    {
      roleName: "Pengelola TPI (Admin)",
      roleBadge: "Admin",
      roleBadgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
      username: "admin_galesong",
      password: "password123",
      namaKapal: "Kantor TPI Galesong Utara",
      juragan: "Pengelola TPI",
      area: "TPI Galesong",
    },
    {
      roleName: "Kapal Pengangkut",
      roleBadge: "Pengangkut",
      roleBadgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      icon: <Ship className="w-4 h-4 text-sky-600" />,
      username: "kmn_nadita",
      password: "password123",
      namaKapal: "KMN BINTANG NADITA",
      juragan: "Jrg Pak Kambong",
      area: "Area Puma",
    },
    {
      roleName: "Kapal Pengangkut",
      roleBadge: "Pengangkut",
      roleBadgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      icon: <Ship className="w-4 h-4 text-sky-600" />,
      username: "kmn_yasing",
      password: "password123",
      namaKapal: "KMN YASING JAYA",
      juragan: "Jrg Dg Sutte",
      area: "Area Kalmas",
    },
    {
      roleName: "Kapal Nelayan",
      roleBadge: "Nelayan",
      roleBadgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <Anchor className="w-4 h-4 text-emerald-600" />,
      username: "tinggi_moncong",
      password: "password123",
      namaKapal: "Tinggi Moncong Mb",
      juragan: "Kapten Basir",
      area: "Area Puma",
    },
    {
      roleName: "Kapal Nelayan",
      roleBadge: "Nelayan",
      roleBadgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <Anchor className="w-4 h-4 text-emerald-600" />,
      username: "tabbing_dtb",
      password: "password123",
      namaKapal: "Tabbing DTB",
      juragan: "Kapten Daeng Taba",
      area: "Area Kalmas",
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#0A2E4D] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Daftar Akun Demo
              </h3>
              <p className="text-xs text-slate-300">
                Pilih atau salin akun untuk eksplorasi sistem
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
        <div className="p-5 sm:p-6 space-y-3 max-h-[68vh] overflow-y-auto">
          <p className="text-xs text-slate-600 leading-relaxed">
            Klik tombol <strong>Gunakan</strong> untuk mengisi form login secara otomatis, atau salin kredensial username & password berikut:
          </p>

          <div className="space-y-2.5">
            {demoAccounts.map((acc, index) => {
              const copyKey = `acc-${index}`;
              const isCopied = copiedKey === copyKey;

              return (
                <div
                  key={index}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-sky-300 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {acc.icon}
                      <span className="text-xs font-bold text-slate-800">
                        {acc.namaKapal}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${acc.roleBadgeColor}`}
                    >
                      {acc.roleBadge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Juragan: <strong className="text-slate-700">{acc.juragan}</strong></span>
                    <span>Basis: <strong className="text-slate-700">{acc.area}</strong></span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2 bg-white p-2 rounded-xl">
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[11px]">User:</span>
                        <code className="text-slate-800 font-bold font-mono text-xs">
                          {acc.username}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[11px]">Pass:</span>
                        <code className="text-slate-600 font-mono text-xs">
                          {acc.password}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `Username: ${acc.username}\nPassword: ${acc.password}`,
                            copyKey,
                          )
                        }
                        title="Salin username dan password"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-slate-50 transition-colors"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {onSelectAccount && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectAccount(acc.username, acc.password);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-colors shadow-xs"
                        >
                          Gunakan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Password semua akun demo adalah <code className="font-mono font-bold text-slate-700">password123</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

