"use client";

import React, { useState, useEffect } from "react";
import { LokasiMuat, User } from "@/types";
import {
  X,
  Snowflake,
  Send,
  Fuel,
  Droplet,
  Box,
  PackagePlus,
} from "lucide-react";

interface LogisticRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestData: {
    lokasi_tujuan: LokasiMuat;
    rincian_barang: string;
    items_custom?: string[];
    bbm_jenis?: "Solar" | "Bensin" | null;
    bbm_jumlah?: number;
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
    currentUser.lokasi_default || "Puma",
  );
  // Preset items
  const [esBalok, setEsBalok] = useState<number>(20);
  const [berasKarung, setBerasKarung] = useState<number>(2);
  const [bbmJenis, setBbmJenis] = useState<"Solar" | "Bensin">("Solar");
  const [bbmJerigen, setBbmJerigen] = useState<number>(0);
  const [airGalon, setAirGalon] = useState<number>(0);
  // Opsi Kebutuhan Lainnya (1 kolom fix, baru muncul setelah dipilih)
  const [isCustomActive, setIsCustomActive] = useState(false);
  const [kebutuhanLainnya, setKebutuhanLainnya] = useState("");
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kunci scroll halaman utama saat modal terbuka agar GPU fokus ke scroll modal
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const parts: string[] = [];
      if (esBalok > 0) parts.push(`Es Balok: ${esBalok} Batang`);
      if (berasKarung > 0) parts.push(`Beras: ${berasKarung} Karung`);
      if (bbmJerigen > 0)
        parts.push(`BBM (${bbmJenis}): ${bbmJerigen} Jerigen`);
      if (airGalon > 0) parts.push(`Air Bersih: ${airGalon} Galon`);
      if (isCustomActive && kebutuhanLainnya.trim()) {
        parts.push(`Lainnya: ${kebutuhanLainnya.trim()}`);
      }
      if (catatan.trim()) parts.push(`Catatan: ${catatan.trim()}`);

      if (parts.length === 0) {
        alert("Silakan masukkan minimal satu kebutuhan pokok.");
        setIsSubmitting(false);
        return;
      }

      const rincian_barang = parts.join(" | ");
      const items_custom =
        isCustomActive && kebutuhanLainnya.trim()
          ? [kebutuhanLainnya.trim()]
          : [];

      await onSubmit({
        lokasi_tujuan: lokasiTujuan,
        rincian_barang,
        items_custom,
        bbm_jenis: bbmJerigen > 0 ? bbmJenis : null,
        bbm_jumlah: bbmJerigen,
      });

      // Reset kebutuhan lainnya & catatan setelah kirim berhasil
      setIsCustomActive(false);
      setKebutuhanLainnya("");
      setCatatan("");
      setBbmJerigen(0);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim permintaan logistik.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overscroll-contain">
      {/* Backdrop overlay di layer mandiri (tanpa backdrop-blur berat agar 60fps konstan dan lancar) */}
      <div
        className="fixed inset-0 bg-slate-950/70 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card terisolasi dengan transform-gpu */}
      <div className="relative z-10 bg-white w-full max-w-lg rounded-2xl shadow-xl  overflow-hidden flex flex-col max-h-[90vh] transform-gpu">
        {/* Header */}
        <div className="bg-primary text-white px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between ">
          <div className="flex items-center gap-2.5">
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

        {/* Body Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden min-h-0"
        >
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain transform-gpu [will-change:scroll-position]">
            {/* Lokasi Tujuan Pengantaran di Laut */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Lokasi Pengantaran di Laut
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLokasiTujuan("Puma")}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-colors duration-150 ${
                    lokasiTujuan === "Puma"
                      ? "bg-[#0A2E4D] text-white border-[#0A2E4D] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Area Puma
                </button>
                <button
                  type="button"
                  onClick={() => setLokasiTujuan("Kalmas")}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-colors duration-150 ${
                    lokasiTujuan === "Kalmas"
                      ? "bg-[#0A2E4D] text-white border-[#0A2E4D] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Area Kalmas
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
                    onChange={(e) =>
                      setBerasKarung(parseInt(e.target.value) || 0)
                    }
                    className="w-16 px-2 py-1 text-center font-bold text-sm bg-white rounded-lg border border-emerald-300 font-mono-numbers text-emerald-900"
                  />
                  <span className="text-xs font-semibold text-slate-600">
                    Karung
                  </span>
                </div>
              </div>

              {/* 3. Bahan Bakar (BBM: Solar / Bensin) */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3">
                {/* Baris Atas: Sejajar Sempurna dengan Baris Preset Lainnya */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Fuel className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Bahan Bakar (BBM)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {bbmJenis === "Solar"
                          ? "Bahan bakar mesin diesel kapal"
                          : "Bahan bakar mesin tempel / ketinting"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={bbmJerigen}
                      onChange={(e) =>
                        setBbmJerigen(parseInt(e.target.value) || 0)
                      }
                      className="w-16 px-2 py-1 text-center font-bold text-sm bg-white rounded-lg border border-amber-300 font-mono-numbers text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-xs font-semibold text-slate-600">
                      Jerigen
                    </span>
                  </div>
                </div>

                {/* Baris Bawah: Segmented Selector Lebar, Bersih, & Nyaman Ditekan */}
                <div className="grid grid-cols-2 p-1 bg-amber-100/70 rounded-lg border border-amber-200/80 gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setBbmJenis("Solar")}
                    className={`py-1.5 rounded-md transition-all text-center ${
                      bbmJenis === "Solar"
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                        : "text-amber-800 hover:bg-amber-200/60 hover:text-amber-950"
                    }`}
                  >
                    Solar
                  </button>
                  <button
                    type="button"
                    onClick={() => setBbmJenis("Bensin")}
                    className={`py-1.5 rounded-md transition-all text-center ${
                      bbmJenis === "Bensin"
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                        : "text-amber-800 hover:bg-amber-200/60 hover:text-amber-950"
                    }`}
                  >
                    Bensin
                  </button>
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

              {/* 5. Kebutuhan Lainnya (Form hanya muncul setelah dipilih / diklik) */}
              <div
                className={`rounded-xl border-2 transition-colors duration-150 p-3.5 ${
                  isCustomActive
                    ? "border-slate-900 bg-slate-50 shadow-xs"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300"
                }`}
              >
                <div
                  onClick={() => {
                    const next = !isCustomActive;
                    setIsCustomActive(next);
                    if (!next) {
                      setKebutuhanLainnya("");
                    }
                  }}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <PackagePlus
                      className={`w-5 h-5 shrink-0 transition-colors duration-150 ${
                        isCustomActive ? "text-slate-900" : "text-slate-600"
                      }`}
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Kebutuhan Lainnya
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Roti, kopi, mie instan, rokok, obat-obatan, dll.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form input dengan transisi expand halus */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${
                    isCustomActive
                      ? "grid-rows-[1fr] opacity-100 mt-3 pt-2.5 border-t border-slate-200"
                      : "grid-rows-[0fr] opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="overflow-hidden">
                    <input
                      type="text"
                      value={kebutuhanLainnya}
                      onChange={(e) => setKebutuhanLainnya(e.target.value)}
                      placeholder="Tulis barang & jumlahnya (contoh: Roti 3 bungkus, Kopi 1 renteng)..."
                      autoFocus={isCustomActive}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors duration-150"
                    />
                  </div>
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
          </div>

          {/* Action Footer (Sticky / Fixed at Bottom) */}
          <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-sky-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-sky-500/25 transition-all disabled:opacity-50"
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
