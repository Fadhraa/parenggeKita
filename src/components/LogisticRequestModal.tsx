"use client";

import React, { useState } from "react";
import { LokasiMuat, User } from "@/types";
import { X, Snowflake, Send, Fuel, Droplet, Box } from "lucide-react";

interface LogisticRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestData: {
    lokasi_tujuan: LokasiMuat;
    rincian_barang: string;
  }) => Promise<void>;
  currentUser: User;
}

export default function LogisticRequestModal({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}: LogisticRequestModalProps) {
  const [lokasiTujuan, setLokasiTujuan] = useState<LokasiMuat>(
    currentUser.lokasi_default || "Puma"
  );
  // Preset items
  const [esBalok, setEsBalok] = useState<number>(20);
  const [berasKarung, setBerasKarung] = useState<number>(2);
  const [solarJerigen, setSolarJerigen] = useState<number>(0);
  const [airGalon, setAirGalon] = useState<number>(0);
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const parts: string[] = [];
      if (esBalok > 0) parts.push(`Es Balok: ${esBalok} Batang`);
      if (berasKarung > 0) parts.push(`Beras: ${berasKarung} Karung`);
      if (solarJerigen > 0) parts.push(`Solar/BBM: ${solarJerigen} Jerigen`);
      if (airGalon > 0) parts.push(`Air Bersih: ${airGalon} Galon`);
      if (catatan.trim()) parts.push(`Catatan: ${catatan.trim()}`);

      if (parts.length === 0) {
        alert("Silakan masukkan minimal satu kebutuhan pokok.");
        setIsSubmitting(false);
        return;
      }

      const rincian_barang = parts.join(" | ");
      await onSubmit({ lokasi_tujuan: lokasiTujuan, rincian_barang });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim permintaan logistik.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-sky-600 text-white px-6 py-4 flex items-center justify-between border-b border-sky-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Pesan Kebutuhan Pokok (Logistik)
              </h3>
              <p className="text-xs text-sky-100">
                Dari Kapal: {currentUser.nama_kapal}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Lokasi Tujuan Pengantaran di Laut */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Lokasi Pengantaran di Laut
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLokasiTujuan("Puma")}
                className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${
                  lokasiTujuan === "Puma"
                    ? "bg-[#0A2E4D] text-white border-[#0A2E4D] shadow"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                📍 Area Puma
              </button>
              <button
                type="button"
                onClick={() => setLokasiTujuan("Kalmas")}
                className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${
                  lokasiTujuan === "Kalmas"
                    ? "bg-[#0A2E4D] text-white border-[#0A2E4D] shadow"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                📍 Area Kalmas
              </button>
            </div>
          </div>

          {/* Quick Preset Nelayan (Es, Beras, Solar, Air) */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-700 uppercase">
              Kebutuhan Pokok yang Dipesan
            </span>

            {/* 1. Es Balok */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-50/80 border border-cyan-200">
              <div className="flex items-center gap-2.5">
                <Snowflake className="w-5 h-5 text-cyan-600" />
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Es Balok
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Pengawet ikan di palka
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={esBalok}
                  onChange={(e) => setEsBalok(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center font-bold text-sm bg-white rounded-lg border border-cyan-300 font-mono-numbers text-cyan-900"
                />
                <span className="text-xs font-semibold text-slate-600">
                  Batang
                </span>
              </div>
            </div>

            {/* 2. Beras */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2.5">
                <Box className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Beras
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Konsumsi juragan & ABK
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={berasKarung}
                  onChange={(e) => setBerasKarung(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center font-bold text-sm bg-white rounded-lg border border-emerald-300 font-mono-numbers text-emerald-900"
                />
                <span className="text-xs font-semibold text-slate-600">
                  Karung
                </span>
              </div>
            </div>

            {/* 3. Solar / BBM */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2.5">
                <Fuel className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Solar / BBM
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bahan bakar mesin kapal
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={solarJerigen}
                  onChange={(e) => setSolarJerigen(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center font-bold text-sm bg-white rounded-lg border border-amber-300 font-mono-numbers text-amber-900"
                />
                <span className="text-xs font-semibold text-slate-600">
                  Jerigen
                </span>
              </div>
            </div>

            {/* 4. Air Bersih */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center gap-2.5">
                <Droplet className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Air Bersih Minum
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Pasokan air tawar
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={airGalon}
                  onChange={(e) => setAirGalon(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center font-bold text-sm bg-white rounded-lg border border-blue-300 font-mono-numbers text-blue-900"
                />
                <span className="text-xs font-semibold text-slate-600">
                  Galon
                </span>
              </div>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Catatan Tambahan (Titik Temu / Waktu)
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Tolong titipkan ke kapal pengangkut yang berangkat siang ini..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Mengirim..." : "Kirim Request ke Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
