"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ship, LogIn, Lock, User as UserIcon, AlertCircle, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { MOCK_USERS } from "@/lib/mockData";
import { setSessionUser } from "@/lib/session";
import { User } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username.trim().toLowerCase())
        .single();

      let matchedUser: User | null = null;

      if (!error && data) {
        if (data.password_hash === password.trim()) {
          matchedUser = data as User;
        } else {
          setErrorMsg("Password yang Anda masukkan salah.");
          setIsLoading(false);
          return;
        }
      } else {
        const mockMatch = MOCK_USERS.find(
          (u) =>
            u.username.toLowerCase() === username.trim().toLowerCase() &&
            (password.trim() === "password123" || password.trim() === "admin"),
        );
        if (mockMatch) {
          matchedUser = mockMatch;
        }
      }

      if (matchedUser) {
        setSessionUser(matchedUser);

        if (matchedUser.role === "admin") {
          router.push("/dashboard/admin");
        } else if (matchedUser.role === "kapal_pengangkut") {
          router.push("/dashboard/pengangkut");
        } else {
          router.push("/dashboard/nelayan");
        }
      } else {
        setErrorMsg(
          "Akun tidak ditemukan. Silakan periksa kembali username Anda.",
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Terjadi gangguan koneksi. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100vh] flex items-center justify-center p-4 py-16 sm:py-12">
      {/* Tombol Kembali ke Landing Page */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200/80 hover:border-coral-300 shadow-sm text-coral hover:text-coral-hover hover:bg-coral-50/60 font-bold text-xs sm:text-sm transition-all hover:-translate-x-0.5 group"
      >
        <LogOut className="w-4 h-4 text-coral group-hover:scale-105 transition-transform" />
        <span>Kembali</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src="/assets/LOGO_KAPAL.png"
            alt="Logo Parengge Kita"
            className="w-16 h-16 mx-auto object-contain"
          />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Masuk ke Parengge Kita
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Masuk sebagai Kapal Nelayan, Kapal Pengangkut, atau Pengelola TPI
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Clean Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda..."
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? "Memeriksa Akun..." : "Masuk Sekarang"}</span>
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-600">
            Belum memiliki akun kapal?{" "}
            <Link
              href="/register"
              className="text-sky-600 font-bold hover:underline"
            >
              Daftar Kapal Baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
