"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Trip, User, LokasiMuat } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { MOCK_TRIPS } from "@/lib/mockData";
import { getSessionUser } from "@/lib/session";
import ManifestCard from "@/components/ManifestCard";
import { Search, Package, Navigation, Sparkles, Anchor } from "lucide-react";

// Dynamically import LiveTrackingMap to avoid SSR issues with Leaflet
const LiveTrackingMap = dynamic(() => import("@/components/LiveTrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] bg-pale-sky-100 rounded-2xl flex items-center justify-center border border-pale-sky-200">
      <div className="flex items-center gap-2 text-pale-sky-600 font-semibold text-sm">
        <Navigation className="w-5 h-5 text-baltic-blue-500 animate-spin" />
        <span>Memuat Peta Live Tracking...</span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLokasi, setSelectedLokasi] = useState<"Semua" | LokasiMuat>(
    "Semua",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch trips from Supabase (with fallback)
  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("trips")
        .select(
          `
          *,
          pengangkut:users!trips_pengangkut_id_fkey(*),
          manifests:trip_manifests(*)
        `,
        )
        .order("tanggal_berangkat", { ascending: false });

      if (!error && data && data.length > 0) {
        setTrips(data as Trip[]);
      } else {
        setTrips(MOCK_TRIPS);
      }
    } catch (e) {
      console.warn("Using fallback mock trips", e);
      setTrips(MOCK_TRIPS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUser(getSessionUser());
    fetchTrips();

    const interval = setInterval(fetchTrips, 20000);
    return () => clearInterval(interval);
  }, []);

  // Filter trips based on Location and Search Query
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (selectedLokasi !== "Semua" && trip.lokasi !== selectedLokasi) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTransporter =
          trip.pengangkut?.nama_kapal?.toLowerCase().includes(query) ||
          trip.pengangkut?.nama_juragan?.toLowerCase().includes(query);

        const matchFisherman = trip.manifests?.some((m) =>
          m.nama_kapal_nelayan.toLowerCase().includes(query),
        );

        return matchTransporter || matchFisherman;
      }
      return true;
    });
  }, [trips, selectedLokasi, searchQuery]);

  // Statistics calculation
  const totalGabusHariIni = useMemo(() => {
    return trips.reduce((sum, t) => sum + (t.total_gabus || 0), 0);
  }, [trips]);

  const totalKapalAktif = useMemo(() => {
    return trips.filter((t) => t.is_tracking_active).length;
  }, [trips]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-baltic-blue-900 via-baltic-blue-950 to-baltic-blue-800 text-white p-6 sm:p-10 shadow-2xl border border-baltic-blue-700/60">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-baltic-blue-800/80 text-azure-mist-300 border border-baltic-blue-600/40 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            BPC COOPFEST 2026 • Inovasi Maritim
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Transparansi Rantai Pasok Hasil Tangkapan & Logistik Nelayan
          </h1>

          <p className="text-sm sm:text-base text-pale-sky-100 leading-relaxed max-w-2xl">
            Menghubungkan nelayan penangkap ikan di perairan{" "}
            <strong>Puma & Kalmas</strong> dengan kapal pengangkut menuju{" "}
            <strong>TPI Galesong Utara</strong>, dilengkapi pelacakan lokasi
            kapal real-time serta pemesanan kebutuhan pokok es balok dari darat
            ke laut.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 max-w-xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-bold text-azure-mist-200 uppercase block">
                Total Muatan Masuk
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono-numbers text-white">
                {totalGabusHariIni}{" "}
                <span className="text-xs font-bold text-light-blue-300 font-sans">
                  GABUS
                </span>
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-bold text-azure-mist-200 uppercase block">
                Kapal OTW ke TPI
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono-numbers text-platinum-300">
                {totalKapalAktif}{" "}
                <span className="text-xs font-bold text-pale-sky-200 font-sans">
                  KAPAL
                </span>
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-azure-mist-200 uppercase block">
                Target Pendaratan
              </span>
              <span className="text-sm sm:text-base font-extrabold text-azure-mist-300">
                TPI Galesong Utara
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Live Tracking Map Section */}
      <section className="space-y-3">
        <LiveTrackingMap
          trips={trips}
          onRefresh={fetchTrips}
          isLoading={isLoading}
        />
      </section>

      {/* 2. Rekapitulasi Muatan Gabus Section */}
      <section id="rekap-muatan" className="space-y-6 pt-2">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-azure-mist-100 text-baltic-blue-900">
                <Anchor className="w-5 h-5 text-baltic-blue-700" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-baltic-blue-950 tracking-tight">
                Rekapitulasi Muatan Gabus Komunitas Nelayan
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-pale-sky-700 mt-1">
              Daftar muatan ikan kapal pengangkut dari wilayah Puma & Kalmas
              (standar laporan grup nelayan).
            </p>
          </div>

          {/* Location Tabs Filter */}
          <div className="flex items-center bg-pale-sky-200/80 p-1 rounded-2xl w-full sm:w-auto">
            {(["Semua", "Puma", "Kalmas"] as const).map((lok) => (
              <button
                key={lok}
                onClick={() => setSelectedLokasi(lok)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedLokasi === lok
                    ? "bg-baltic-blue-900 text-white shadow-md"
                    : "text-pale-sky-800 hover:text-baltic-blue-950"
                }`}
              >
                {lok === "Semua" ? "Semua Lokasi" : `Area ${lok}`}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-pale-sky-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kapal nelayan atau juragan (contoh: Tinggi Moncong, Ridho DPR, Tabbing DTB)..."
            className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-2xl bg-white border border-pale-sky-300 text-sm font-medium text-pale-sky-950 placeholder-pale-sky-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-baltic-blue-500 focus:border-baltic-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-3.5 text-xs font-bold text-pale-sky-400 hover:text-pale-sky-600"
            >
              Reset
            </button>
          )}
        </div>

        {/* Manifest Cards Grid */}
        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-pale-sky-200 space-y-3">
            <Package className="w-12 h-12 text-pale-sky-300 mx-auto" />
            <h4 className="text-base font-bold text-pale-sky-800">
              Tidak ada data muatan gabus yang cocok
            </h4>
            <p className="text-xs text-pale-sky-600 max-w-md mx-auto">
              Tidak ditemukan laporan kapal dengan filter lokasi atau kata kunci
              pencarian yang dipilih. Coba reset filter pencarian Anda. 1{" "}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <ManifestCard
                key={trip.id}
                trip={trip}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
