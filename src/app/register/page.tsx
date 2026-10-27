"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Anchor, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { setSessionUser } from "@/lib/session";
import { User, UserRole, LokasiMuat } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"kapal_nelayan" | "kapal_pengangkut">("kapal_nelayan");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [namaKapal, setNamaKapal] = useState("");
  const [namaJuragan, setNamaJuragan] = useState("");
  const [lokasiDefault, setLokasiDefault] = useState<LokasiMuat>("Puma");
  const [noWhatsapp, setNoWhatsapp] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const newUser: Partial<User> = {
        username: username.trim().toLowerCase(),
        password_hash: password.trim(),
        role: role as UserRole,
        nama_kapal: namaKapal.trim(),
        nama_juragan: namaJuragan.trim(),
        lokasi_default: lokasiDefault,
        no_whatsapp: noWhatsapp.trim(),
      };

      const { data, error } = await supabase
        .from("users")
        .insert([newUser])
        .select()
        .single();

      if (!error && data) {
        setSessionUser(data as User);
        if (role === "kapal_pengangkut") {
          router.push("/dashboard/pengangkut");
        } else {
          router.push("/dashboard/nelayan");
        }
      } else {
        if (error?.code === "23505") {
          setErrorMsg("Username sudah digunakan. Silakan gunakan username lain.");
        } else {
          setErrorMsg(error?.message || "Gagal melakukan pendaftaran.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Terjadi gangguan koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#0A2E4D] text-white flex items-center justify-center mx-auto shadow-lg">
            <Anchor className="w-8 h-8 text-sky-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Pendaftaran Kapal Baru
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftarkan identitas kapal untuk pencatatan muatan gabus & logistik
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            Pilih Peran Kapal Anda
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("kapal_nelayan")}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                role === "kapal_nelayan"
                  ? "border-sky-500 bg-sky-50/70 ring-2 ring-sky-400/20"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  role === "kapal_nelayan"
                    ? "bg-sky-500 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <span>🎣</span>
              </div>
              <div>
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
                  Kapal Nelayan
                </span>
                <span className="text-[11px] text-slate-500">
                  Penangkap ikan di laut
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("kapal_pengangkut")}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                role === "kapal_pengangkut"
                  ? "border-slate-900 bg-slate-100 ring-2 ring-slate-800/20"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  role === "kapal_pengangkut"
                    ? "bg-[#0A2E4D] text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <span>🚢</span>
              </div>
              <div>
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
                  Kapal Pengangkut
                </span>
                <span className="text-[11px] text-slate-500">
                  Kapal ongkir ke darat
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Kapal
              </label>
              <input
                type="text"
                value={namaKapal}
                onChange={(e) => setNamaKapal(e.target.value)}
                placeholder={
                  role === "kapal_pengangkut"
                    ? "Contoh: KMN ⭐ NADITA"
                    : "Contoh: Tinggi Moncong Mb"
                }
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Juragan / Kapten
              </label>
              <input
                type="text"
                value={namaJuragan}
                onChange={(e) => setNamaJuragan(e.target.value)}
                placeholder="Contoh: Jrg Pak Kambong"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Wilayah Tangkap Default
              </label>
              <select
                value={lokasiDefault}
                onChange={(e) => setLokasiDefault(e.target.value as LokasiMuat)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 text-slate-900"
              >
                <option value="Puma">Area Puma</option>
                <option value="Kalmas">Area Kalmas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                No. WhatsApp Aktif
              </label>
              <input
                type="tel"
                value={noWhatsapp}
                onChange={(e) => setNoWhatsapp(e.target.value)}
                placeholder="Contoh: 081234567890"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Username Baru
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Gunakan huruf kecil & angka"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isLoading ? "Mendaftarkan Kapal..." : "Selesaikan Pendaftaran"}</span>
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-600">
            Sudah memiliki akun terdaftar?{" "}
            <Link
              href="/login"
              className="text-sky-600 font-bold hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
