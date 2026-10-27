"use client";

import React, { useState } from "react";
import { Trip, User } from "@/types";
import { formatDateIndo, generateWhatsAppManifestText } from "@/lib/utils";
import { Clock, Copy, Check, ChevronDown, ChevronUp, Edit3, Trash2, Package } from "lucide-react";

interface ManifestCardProps {
  trip: Trip;
  currentUser?: User | null;
  onEdit?: (trip: Trip) => void;
  onDelete?: (tripId: string) => void;
}

export default function ManifestCard({
  trip,
  currentUser,
  onEdit,
  onDelete,
}: ManifestCardProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const manifests = trip.manifests || [];
  const initialLimit = 4;
  const hasMore = manifests.length > initialLimit;
  const displayedManifests = isExpanded ? manifests : manifests.slice(0, initialLimit);

  const canManage =
    currentUser &&
    (currentUser.role === "admin" || currentUser.id === trip.pengangkut_id);

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppManifestText(trip);
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isPuma = trip.lokasi === "Puma";

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col justify-between">
      {/* Top Header Bar */}
      <div>
        <div
          className={`px-4 py-3 flex items-center justify-between text-white ${
            isPuma ? "bg-[#0A2E4D]" : "bg-[#0A2E4D]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                isPuma
                  ? "bg-sky-500 text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              📍 Area {trip.lokasi}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {formatDateIndo(trip.tanggal_berangkat)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm text-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-300" />
            <span>OTW Jam {trip.jam_otw}</span>
          </div>
        </div>

        {/* Vessel & Captain Info */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <span>🚢</span>
                <span>{trip.pengangkut?.nama_kapal || "KMN Pengangkut"}</span>
              </h4>
              <p className="text-sm text-slate-600 font-medium mt-0.5">
                👨‍✈️ Juragan:{" "}
                <span className="font-semibold text-slate-900">
                  {trip.pengangkut?.nama_juragan || "Juragan Kapal"}
                </span>
              </p>
            </div>

            <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {trip.is_tracking_active ? "Sedang Berlayar" : "Sudah Sandar"}
            </span>
          </div>
        </div>

        {/* Fisherman Fish Manifest List */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Daftar Rincian Muatan Nelayan
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {manifests.length} Kapal Nelayan
            </span>
          </div>

          {manifests.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              Belum ada rincian muatan nelayan.
            </p>
          ) : (
            <div className="space-y-2">
              {displayedManifests.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50/60 hover:bg-slate-100/80 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-400 w-4 text-right">
                      {idx + 1}.
                    </span>
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {item.nama_kapal_nelayan}
                    </span>
                  </div>

                  <span className="shrink-0 px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-mono-numbers font-bold text-sm border border-sky-100">
                    {item.jumlah_gabus} G
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Expand / Collapse toggle */}
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 w-full py-2 text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center justify-center gap-1 transition-colors border border-sky-100"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Sembunyikan Sebagian
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Lihat Selengkapnya (+{manifests.length - initialLimit} nelayan lagi)
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Footer Total & Actions */}
      <div className="px-4 py-3 sm:px-5 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wide">
            <Package className="w-4 h-4 text-amber-500" />
            <span>Total Muatan:</span>
          </div>
          <span className="text-lg font-black font-mono-numbers text-slate-900">
            {trip.total_gabus}{" "}
            <span className="text-xs font-bold text-slate-500 uppercase font-sans">
              GABUS
            </span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyWhatsApp}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Format WA Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-emerald-600" />
                <span>Salin Format WhatsApp</span>
              </>
            )}
          </button>

          {canManage && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(trip)}
                  title="Edit Laporan"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(trip.id)}
                  title="Hapus Laporan"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
