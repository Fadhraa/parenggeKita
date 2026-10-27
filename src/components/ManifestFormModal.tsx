"use client";

import React, { useState, useEffect } from "react";
import { Trip, User, LokasiMuat } from "@/types";
import { X, Plus, Trash2, Save, Package } from "lucide-react";

interface ManifestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tripData: Partial<Trip>, manifestRows: { nama_kapal_nelayan: string; jumlah_gabus: number; nelayan_id?: string | null }[]) => Promise<void>;
  initialTrip?: Trip | null;
  registeredNelayan: User[];
  currentTransporter: User;
}

export default function ManifestFormModal({
  isOpen,
  onClose,
  onSave,
  initialTrip,
  registeredNelayan,
  currentTransporter,
}: ManifestFormModalProps) {
  const [lokasi, setLokasi] = useState<LokasiMuat>("Puma");
  const [tanggalBerangkat, setTanggalBerangkat] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [jamOtw, setJamOtw] = useState("14:00");
  const [manifestRows, setManifestRows] = useState<
    { nama_kapal_nelayan: string; jumlah_gabus: number; nelayan_id?: string | null }[]
  >([{ nama_kapal_nelayan: "", jumlah_gabus: 10, nelayan_id: null }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTrip) {
      setLokasi(initialTrip.lokasi);
      setTanggalBerangkat(initialTrip.tanggal_berangkat);
      setJamOtw(initialTrip.jam_otw);
      if (initialTrip.manifests && initialTrip.manifests.length > 0) {
        setManifestRows(
          initialTrip.manifests.map((m) => ({
            nama_kapal_nelayan: m.nama_kapal_nelayan,
            jumlah_gabus: m.jumlah_gabus,
            nelayan_id: m.nelayan_id,
          }))
        );
      }
    } else {
      setLokasi(currentTransporter.lokasi_default || "Puma");
      setTanggalBerangkat(new Date().toISOString().split("T")[0]);
      setJamOtw("14:00");
      setManifestRows([
        {
          nama_kapal_nelayan: registeredNelayan[0]?.nama_kapal || "Tinggi Moncong Mb",
          jumlah_gabus: 14,
          nelayan_id: registeredNelayan[0]?.id || null,
        },
      ]);
    }
  }, [initialTrip, isOpen]);

  if (!isOpen) return null;

  const totalGabus = manifestRows.reduce(
    (sum, row) => sum + (Number(row.jumlah_gabus) || 0),
    0
  );

  const handleAddRow = () => {
    const nextNelayan = registeredNelayan[manifestRows.length % registeredNelayan.length];
    setManifestRows([
      ...manifestRows,
      {
        nama_kapal_nelayan: nextNelayan?.nama_kapal || "",
        jumlah_gabus: 10,
        nelayan_id: nextNelayan?.id || null,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (manifestRows.length <= 1) return;
    setManifestRows(manifestRows.filter((_, i) => i !== index));
  };

  const handleRowChange = (
    index: number,
    field: "nama_kapal_nelayan" | "jumlah_gabus" | "nelayan_id",
    value: any
  ) => {
    const updated = [...manifestRows];
    if (field === "nama_kapal_nelayan") {
      const match = registeredNelayan.find((n) => n.nama_kapal === value);
      updated[index].nama_kapal_nelayan = String(value);
      updated[index].nelayan_id = match ? match.id : null;
    } else if (field === "jumlah_gabus") {
      updated[index].jumlah_gabus = Number(value);
    } else if (field === "nelayan_id") {
      updated[index].nelayan_id = value ? String(value) : null;
    }
    setManifestRows(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manifestRows.length === 0) return;
    setIsSubmitting(true);
    try {
      const tripData: Partial<Trip> = {
        lokasi,
        tanggal_berangkat: tanggalBerangkat,
        jam_otw: jamOtw,
        zona_waktu: `Waktu ${lokasi}`,
        total_gabus: totalGabus,
        pengangkut_id: currentTransporter.id,
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
              {initialTrip ? "Edit Laporan Muatan" : "Buat Laporan Muatan Gabus"}
            </h3>
            <p className="text-xs text-slate-300">
              Kapal: {currentTransporter.nama_kapal} ({currentTransporter.nama_juragan})
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Lokasi Muat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Lokasi Muat
              </label>
              <select
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value as LokasiMuat)}
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
                Jam OTW (Estimasi)
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
              {manifestRows.map((row, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200"
                >
                  <span className="text-xs font-bold text-slate-400 w-5 text-right">
                    {index + 1}.
                  </span>

                  {/* Dropdown / Input Nama Kapal Nelayan */}
                  <div className="flex-1">
                    <input
                      type="text"
                      list="nelayan-suggestions"
                      value={row.nama_kapal_nelayan}
                      onChange={(e) =>
                        handleRowChange(index, "nama_kapal_nelayan", e.target.value)
                      }
                      placeholder="Nama Kapal Nelayan..."
                      required
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Input Jumlah Gabus */}
                  <div className="w-24 flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={row.jumlah_gabus}
                      onChange={(e) =>
                        handleRowChange(index, "jumlah_gabus", e.target.value)
                      }
                      required
                      className="w-full px-2 py-1.5 text-center font-bold text-xs sm:text-sm font-mono-numbers rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-500">G</span>
                  </div>

                  {/* Remove row button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    disabled={manifestRows.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <datalist id="nelayan-suggestions">
              {registeredNelayan.map((nel) => (
                <option key={nel.id} value={nel.nama_kapal}>
                  {nel.nama_juragan ? `(Juragan: ${nel.nama_juragan})` : ""}
                </option>
              ))}
            </datalist>
          </div>

          {/* Total Gabus Display */}
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900 uppercase">
              Total Muatan yang Dihitung:
            </span>
            <span className="text-xl font-black font-mono-numbers text-sky-950">
              {totalGabus} <span className="text-xs font-bold text-sky-700">GABUS</span>
            </span>
          </div>

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
              disabled={isSubmitting || manifestRows.length === 0}
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Laporan Muatan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
