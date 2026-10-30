"use client";

import React, { useState, useEffect } from "react";
import { Trip, User, LokasiMuat } from "@/types";
import {
  X,
  Plus,
  Trash2,
  Save,
  Package,
  AlertCircle,
  Navigation,
} from "lucide-react";

interface ManifestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    tripData: Partial<Trip>,
    manifestRows: {
      nama_kapal_nelayan: string;
      jumlah_gabus: number;
      nelayan_id?: string | null;
    }[],
  ) => Promise<void>;
  initialTrip?: Trip | null;
  registeredNelayan: User[];
  currentTransporter: User;
  availableTransporters?: User[];
  isTransporterRole?: boolean;
}

export default function ManifestFormModal({
  isOpen,
  onClose,
  onSave,
  initialTrip,
  registeredNelayan,
  currentTransporter,
  availableTransporters,
  isTransporterRole,
}: ManifestFormModalProps) {
  const getCurrentTimeString = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [selectedTransporterId, setSelectedTransporterId] = useState<string>(
    initialTrip?.pengangkut_id ||
      availableTransporters?.[0]?.id ||
      currentTransporter?.id ||
      "",
  );
  const [lokasi, setLokasi] = useState<LokasiMuat>("Puma");
  const [tanggalBerangkat, setTanggalBerangkat] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [jamOtw, setJamOtw] = useState(getCurrentTimeString());
  const [manifestRows, setManifestRows] = useState<
    {
      nama_kapal_nelayan: string;
      jumlah_gabus: number;
      nelayan_id?: string | null;
    }[]
  >(
    isTransporterRole
      ? []
      : [{ nama_kapal_nelayan: "", jumlah_gabus: 10, nelayan_id: null }],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTrip) {
      setSelectedTransporterId(initialTrip.pengangkut_id);
      setLokasi(initialTrip.lokasi);
      setTanggalBerangkat(initialTrip.tanggal_berangkat);
      setJamOtw(initialTrip.jam_otw || getCurrentTimeString());
      if (initialTrip.manifests && initialTrip.manifests.length > 0) {
        setManifestRows(
          initialTrip.manifests.map((m) => {
            const match = registeredNelayan.find(
              (n) => n.id === m.nelayan_id || n.nama_kapal === m.nama_kapal_nelayan,
            );
            return {
              nama_kapal_nelayan: m.nama_kapal_nelayan,
              jumlah_gabus: m.jumlah_gabus,
              nelayan_id: m.nelayan_id || match?.id || null,
            };
          }),
        );
      } else {
        setManifestRows([]);
      }
    } else {
      const defaultTrans =
        availableTransporters && availableTransporters.length > 0
          ? availableTransporters[0]
          : currentTransporter;
      const initialLokasi =
        (defaultTrans?.lokasi_default as LokasiMuat) || "Puma";
      const initialAreaNelayan = registeredNelayan.filter(
        (n) => n.lokasi_default === initialLokasi,
      );

      setSelectedTransporterId(defaultTrans?.id || "");
      setLokasi(initialLokasi);
      setTanggalBerangkat(new Date().toISOString().split("T")[0]);
      setJamOtw(getCurrentTimeString());

      if (isTransporterRole) {
        setManifestRows([]);
      } else {
        setManifestRows([
          {
            nama_kapal_nelayan: initialAreaNelayan[0]?.nama_kapal || "",
            jumlah_gabus: 14,
            nelayan_id: initialAreaNelayan[0]?.id || null,
          },
        ]);
      }
    }
  }, [
    initialTrip,
    isOpen,
    availableTransporters,
    currentTransporter,
    registeredNelayan,
    isTransporterRole,
  ]);

  if (!isOpen) return null;

  const activeTransporter =
    (availableTransporters &&
      availableTransporters.find((t) => t.id === selectedTransporterId)) ||
    (initialTrip?.pengangkut as User) ||
    currentTransporter;

  // Filter nelayan ketat hanya untuk area yang sedang dipilih
  const filteredNelayan = registeredNelayan.filter(
    (n) => n.lokasi_default === lokasi,
  );

  const handleLokasiChange = (newLokasi: LokasiMuat) => {
    setLokasi(newLokasi);
    // Kosongkan baris nelayan yang tidak terdaftar di area baru
    setManifestRows((prev) =>
      prev.map((row) => {
        const match = registeredNelayan.find(
          (n) => n.id === row.nelayan_id || n.nama_kapal === row.nama_kapal_nelayan,
        );
        if (match && match.lokasi_default === newLokasi) {
          return {
            ...row,
            nelayan_id: match.id,
            nama_kapal_nelayan: match.nama_kapal,
          };
        }
        return {
          ...row,
          nama_kapal_nelayan: "",
          nelayan_id: null,
        };
      }),
    );
  };

  const handleTransporterChange = (newTransporterId: string) => {
    setSelectedTransporterId(newTransporterId);
    if (availableTransporters) {
      const matched = availableTransporters.find(
        (t) => t.id === newTransporterId,
      );
      if (matched?.lokasi_default) {
        handleLokasiChange(matched.lokasi_default as LokasiMuat);
      }
    }
  };

  const totalGabus = manifestRows.reduce(
    (sum, row) => sum + (Number(row.jumlah_gabus) || 0),
    0,
  );

  // Deteksi nelayan duplikat di antara seluruh baris
  const nelayanCountMap = manifestRows.reduce<Record<string, number>>(
    (acc, row) => {
      if (row.nelayan_id) {
        acc[row.nelayan_id] = (acc[row.nelayan_id] || 0) + 1;
      }
      return acc;
    },
    {},
  );

  const hasDuplicateNelayan = Object.values(nelayanCountMap).some(
    (count) => count > 1,
  );

  const handleAddRow = () => {
    // Cari nelayan dari filteredNelayan yang belum dipilih jika ada
    const usedIds = new Set(
      manifestRows.map((r) => r.nelayan_id).filter(Boolean),
    );
    const available =
      filteredNelayan.find((n) => !usedIds.has(n.id)) || filteredNelayan[0];

    setManifestRows([
      ...manifestRows,
      {
        nama_kapal_nelayan: available?.nama_kapal || "",
        jumlah_gabus: 10,
        nelayan_id: available?.id || null,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (manifestRows.length <= 1) return;
    setManifestRows(manifestRows.filter((_, i) => i !== index));
  };

  const handleNelayanSelect = (index: number, nelayanId: string) => {
    const chosen = registeredNelayan.find((n) => n.id === nelayanId);
    const updated = [...manifestRows];
    updated[index].nelayan_id = chosen ? chosen.id : null;
    updated[index].nama_kapal_nelayan = chosen ? chosen.nama_kapal : "";
    setManifestRows(updated);
  };

  const handleJumlahGabusChange = (index: number, value: number) => {
    const updated = [...manifestRows];
    updated[index].jumlah_gabus = Number(value);
    setManifestRows(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isTransporterRole && manifestRows.length === 0) return;

    if (manifestRows.length > 0) {
      const hasEmptyNelayan = manifestRows.some(
        (r) => !r.nelayan_id || !r.nama_kapal_nelayan,
      );
      if (hasEmptyNelayan) {
        alert("Harap pilih kapal nelayan yang valid untuk semua baris muatan.");
        return;
      }

      if (hasDuplicateNelayan) {
        alert(
          "Terdapat kapal nelayan yang dipilih lebih dari satu kali (duplikat). Harap ubah agar setiap kapal hanya dipilih satu kali.",
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const tripData: Partial<Trip> = {
        lokasi,
        tanggal_berangkat: tanggalBerangkat,
        jam_otw: jamOtw,
        zona_waktu: `Waktu ${lokasi}`,
        total_gabus: isTransporterRole && !initialTrip ? 0 : totalGabus,
        pengangkut_id: selectedTransporterId || currentTransporter.id,
        is_tracking_active: true,
      };
      await onSave(tripData, manifestRows);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#0A2E4D] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-extrabold text-lg text-white">
              {isTransporterRole && !initialTrip
                ? "Mulai Pelayaran Baru"
                : initialTrip
                  ? "Edit Laporan Muatan"
                  : "Buat Laporan Muatan Gabus"}
            </h3>
            <p className="text-xs text-slate-300">
              Kapal: {activeTransporter?.nama_kapal || "Belum dipilih"}{" "}
              {activeTransporter?.nama_juragan
                ? `(${activeTransporter.nama_juragan})`
                : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Pilihan Kapal Pengangkut (Tampil untuk Admin / jika ada multiple armada) */}
          {availableTransporters && availableTransporters.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                <span>Kapal Pengangkut (Pembawa Muatan)</span>
                <span className="text-[11px] font-semibold text-sky-600">
                  {availableTransporters.length} Armada Terdaftar
                </span>
              </label>
              <select
                value={selectedTransporterId}
                onChange={(e) => handleTransporterChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white shadow-sm"
              >
                {availableTransporters.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama_kapal} — Juragan: {t.nama_juragan || "-"}{" "}
                    {t.lokasi_default
                      ? `(Basis: Area ${t.lokasi_default})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Lokasi Muat / Lokasi Tujuan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                {isTransporterRole && !initialTrip
                  ? "Lokasi Tujuan"
                  : "Lokasi Muat"}
              </label>
              <select
                value={lokasi}
                onChange={(e) => handleLokasiChange(e.target.value as LokasiMuat)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Puma">Area Puma</option>
                <option value="Kalmas">Area Kalmas</option>
              </select>
            </div>

            {/* Tanggal Berangkat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Tanggal Keberangkatan
              </label>
              <input
                type="date"
                value={tanggalBerangkat}
                onChange={(e) => setTanggalBerangkat(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Jam OTW */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                {isTransporterRole && !initialTrip
                  ? "Jam Keberangkatan"
                  : "Jam OTW (Estimasi)"}
              </label>
              <input
                type="text"
                value={jamOtw}
                onChange={(e) => setJamOtw(e.target.value)}
                placeholder="14:00"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Kondisi Muatan: Jika Kapal Pengangkut Berangkat Baru -> Muatan Masih Kosong (0 Gabus) */}
          {isTransporterRole && !initialTrip ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-sky-100">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Muatan Awal: 0 Gabus (Kapal Berangkat Kosong)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Kapal bertolak dari dermaga TPI menuju{" "}
                    <strong>Area {lokasi}</strong>. Pelacakan navigasi GPS akan
                    otomatis aktif setelah Anda menekan tombol di bawah.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Rincian Muatan Nelayan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-sky-600" />
                    <span>Rincian Gabus Setiap Kapal Nelayan</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Nelayan</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {manifestRows.map((row, index) => {
                    const isDuplicate = row.nelayan_id
                      ? (nelayanCountMap[row.nelayan_id] || 0) > 1
                      : false;

                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-2 p-2 rounded-xl border transition-colors ${
                          isDuplicate
                            ? "bg-red-50/30 border-red-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-400 w-5 text-right pt-2">
                          {index + 1}.
                        </span>

                        {/* Dropdown Pilihan Kapal Nelayan Terdaftar di Area */}
                        <div className="flex-1">
                          <select
                            value={row.nelayan_id || ""}
                            onChange={(e) =>
                              handleNelayanSelect(index, e.target.value)
                            }
                            required
                            className={`w-full px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 bg-white transition-colors ${
                              isDuplicate
                                ? "border-red-400 text-red-700 bg-red-50/50 focus:ring-red-500"
                                : !row.nelayan_id
                                  ? "border-amber-400 text-amber-700 bg-amber-50/40 focus:ring-sky-500"
                                  : "border-slate-300 text-slate-800 focus:ring-sky-500"
                            }`}
                          >
                            <option value="">
                              -- Pilih Kapal Nelayan ({lokasi}) --
                            </option>
                            {filteredNelayan.map((nel) => (
                              <option key={nel.id} value={nel.id}>
                                {nel.nama_kapal}{" "}
                                {nel.nama_juragan
                                  ? `(Juragan: ${nel.nama_juragan})`
                                  : ""}
                              </option>
                            ))}
                          </select>
                          {isDuplicate && (
                            <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                              <span>
                                Kapal ini terduplikasi (dipilih lebih dari satu
                                kali)
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Input Jumlah Gabus */}
                        <div className="w-24 flex items-center gap-1 pt-0.5">
                          <input
                            type="number"
                            min="1"
                            value={row.jumlah_gabus}
                            onChange={(e) =>
                              handleJumlahGabusChange(
                                index,
                                Number(e.target.value),
                              )
                            }
                            required
                            className="w-full px-2 py-1.5 text-center font-bold text-xs sm:text-sm font-mono-numbers rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                          />
                          <span className="text-xs font-bold text-slate-500">
                            G
                          </span>
                        </div>

                        {/* Remove row button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          disabled={manifestRows.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30 mt-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Gabus Display */}
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900 uppercase">
                  Total Muatan yang Dihitung:
                </span>
                <span className="text-xl font-black font-mono-numbers text-sky-950">
                  {totalGabus}{" "}
                  <span className="text-xs font-bold text-sky-700">GABUS</span>
                </span>
              </div>
            </>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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
              disabled={
                isSubmitting ||
                (!isTransporterRole && manifestRows.length === 0)
              }
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              {isTransporterRole && !initialTrip ? (
                <Navigation className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {isSubmitting
                  ? "Menyimpan..."
                  : isTransporterRole && !initialTrip
                    ? "Mulai Berlayar Sekarang"
                    : "Simpan Laporan Muatan"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
