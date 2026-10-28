"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Trip, User, LokasiMuat } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { MOCK_TRIPS } from "@/lib/mockData";
import { getSessionUser } from "@/lib/session";
import ManifestCard from "@/components/ManifestCard";
import { Package, Navigation, Sparkles, Anchor } from "lucide-react";

// Dynamically import LiveTrackingMap to avoid SSR issues with Leaflet
const LiveTrackingMap = dynamic(() => import("@/components/LiveTrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
      <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
        <Navigation className="w-5 h-5 text-sky-500 animate-spin" />
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

  // Filter trips based on Location
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (selectedLokasi !== "Semua" && trip.lokasi !== selectedLokasi) {
        return false;
      }
      return true;
    });
  }, [trips, selectedLokasi]);

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
      <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-10 lg:p-12 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.04),0_1px_3px_0_rgba(15,23,42,0.02)]">
        {/* Soft Decorative Ambient Blue Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-sky-100/60 via-blue-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-sky-50/50 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12">
          {/* Left Column: Heading, Description & Metrics (Mobile: Below ship, Desktop: Left) */}
          <div className="order-2 lg:order-1 flex-1 space-y-4 sm:space-y-5 max-w-2xl text-center lg:text-left">
            <h1 className="text-xl sm:text-4xl lg:text-[44px] font-black tracking-tight leading-[1.18] text-slate-900">
              Transparansi Rantai Pasok{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-sky-700 to-sky-600">
                Hasil Tangkapan
              </span>{" "}
              & Logistik Nelayan
            </h1>

            <p className="text-xs sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Menghubungkan nelayan penangkap ikan di perairan{" "}
              <strong className="text-slate-900 font-semibold">
                Puma & Kalmas
              </strong>{" "}
              dengan kapal pengangkut menuju{" "}
              <strong className="text-slate-900 font-semibold">
                TPI Galesong Utara
              </strong>
              , dilengkapi pelacakan lokasi kapal real-time serta pemesanan
              kebutuhan pokok es balok dari darat ke laut.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-3.5 pt-2 max-w-md">
              <div className="bg-slate-50/90 hover:bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-sky-300 shadow-sm transition-all group flex flex-col items-center justify-between text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider min-h-[32px] flex items-center justify-center text-center mb-1">
                  Total Muatan Masuk
                </span>
                <div className="flex items-baseline justify-center gap-1.5 mt-auto">
                  <span className="text-2xl sm:text-3xl font-black font-mono-numbers text-slate-900">
                    {totalGabusHariIni}
                  </span>
                  <span className="text-xs font-bold text-sky-600 font-sans tracking-wide">
                    GABUS
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/90 hover:bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-sky-300 shadow-sm transition-all group flex flex-col items-center justify-between text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider min-h-[32px] flex items-center justify-center text-center mb-1">
                  Total Kapal OTW ke TPI
                </span>
                <div className="flex items-baseline justify-center gap-1.5 mt-auto">
                  <span className="text-2xl sm:text-3xl font-black font-mono-numbers text-slate-900">
                    {totalKapalAktif}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 font-sans tracking-wide">
                    KAPAL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ship Illustration (Mobile: On top, Desktop: Right) */}
          <div className="order-1 lg:order-2 relative flex-shrink-0 flex items-center justify-center w-full lg:w-auto">
            <div className="absolute w-44 h-44 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-sky-100/70 to-blue-50/40 blur-2xl -z-10" />
            <div className="relative group">
              <img
                src="/assets/Kapal/Kapal_3.png"
                alt="Ilustrasi Kapal Nelayan Parengge"
                className="w-44 h-44 sm:w-60 sm:h-60 lg:w-96 lg:h-96 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              />
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
              <span className="p-2 rounded-xl bg-sky-50 text-sky-600">
                <Anchor className="w-5 h-5 text-sky-600" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Rekapitulasi Muatan Gabus Komunitas Nelayan
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Daftar muatan ikan kapal pengangkut dari wilayah Puma & Kalmas
              (standar laporan grup nelayan).
            </p>
          </div>

          {/* Location Tabs Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
            {(["Semua", "Puma", "Kalmas"] as const).map((lok) => (
              <button
                key={lok}
                onClick={() => setSelectedLokasi(lok)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedLokasi === lok
                    ? "bg-[#0A2E4D] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lok === "Semua" ? "Semua Lokasi" : `Area ${lok}`}
              </button>
            ))}
          </div>
        </div>

        {/* Manifest Cards Grid */}
        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">
              Tidak ada data muatan gabus yang cocok
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ditemukan laporan kapal untuk filter area yang dipilih.
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
