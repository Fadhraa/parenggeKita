"use client";

import React, { useEffect, useState, useRef } from "react";
import { Trip } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { Anchor, AlertTriangle, Radio } from "lucide-react";

interface GeolocationTrackerProps {
  activeTrip: Trip;
  onTripUpdated?: (updatedTrip: Trip) => void;
}

export default function GeolocationTracker({
  activeTrip,
  onTripUpdated,
}: GeolocationTrackerProps) {
  const [isBroadcasting, setIsBroadcasting] = useState(activeTrip.is_tracking_active);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(
    activeTrip.latitude && activeTrip.longitude
      ? { lat: activeTrip.latitude, lng: activeTrip.longitude }
      : null
  );
  const [lastUpdate, setLastUpdate] = useState<string>(activeTrip.last_tracked_at || "Belum ada");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastSentTimeRef = useRef<number>(0);

  // Send coordinates update to Supabase
  const sendCoordinates = async (lat: number, lng: number) => {
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("trips")
        .update({
          latitude: lat,
          longitude: lng,
          last_tracked_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", activeTrip.id)
        .select()
        .single();

      if (!error && data) {
        setCurrentCoords({ lat, lng });
        setLastUpdate(nowIso);
        if (onTripUpdated) {
          onTripUpdated({ ...activeTrip, latitude: lat, longitude: lng, last_tracked_at: nowIso });
        }
      }
    } catch (e) {
      console.error("GPS send error", e);
    }
  };

  // HTML5 Geolocation watcher
  useEffect(() => {
    if (!isBroadcasting || typeof window === "undefined" || !navigator.geolocation) {
      return;
    }

    const successCallback = (pos: GeolocationPosition) => {
      const now = Date.now();
      // Throttle GPS update: at most once every 12 seconds
      if (now - lastSentTimeRef.current >= 12000) {
        lastSentTimeRef.current = now;
        sendCoordinates(pos.coords.latitude, pos.coords.longitude);
      }
    };

    const errorCallback = (err: GeolocationPositionError) => {
      setErrorMsg(`Izin GPS: ${err.message}`);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isBroadcasting, activeTrip.id]);

  // Handle Sudah Sandar
  const handleSudahSandar = async () => {
    if (!confirm("Konfirmasi bahwa kapal sudah bersandar di TPI Galesong Utara? Pelacakan lokasi akan diselesaikan.")) {
      return;
    }

    setIsUpdating(true);
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("trips")
        .update({
          is_tracking_active: false,
          updated_at: nowIso,
        })
        .eq("id", activeTrip.id)
        .select()
        .single();

      setIsBroadcasting(false);
      if (onTripUpdated) {
        onTripUpdated({ ...activeTrip, is_tracking_active: false });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick coordinate simulator button for indoor presentation
  const handleSimulateMaritimeCoord = async () => {
    setIsUpdating(true);
    const simulatedPoints = [
      { lat: -5.315, lng: 119.352 },
      { lat: -5.32, lng: 119.358 },
      { lat: -5.28, lng: 119.31 },
    ];
    const target = simulatedPoints[Math.floor(Math.random() * simulatedPoints.length)];
    await sendCoordinates(target.lat, target.lng);
    setIsUpdating(false);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#0A2E4D] to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-700 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Status Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isBroadcasting ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400"></span>
              )}
            </span>
            <h4 className="font-extrabold text-sm sm:text-base text-white">
              {isBroadcasting
                ? "📡 Siaran GPS Kapal Sedang Aktif"
                : "⚓ Kapal Sudah Sandar di TPI (Pelacakan Selesai)"}
            </h4>
          </div>

          <p className="text-xs text-slate-300">
            Jadwal: Keberangkatan {activeTrip.lokasi} (Jam {activeTrip.jam_otw}) | Total: {activeTrip.total_gabus} Gabus
          </p>

          {currentCoords && (
            <p className="text-[11px] text-sky-300 font-mono-numbers">
              Koordinat: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)} • Terakhir:{" "}
              {new Date(lastUpdate).toLocaleTimeString("id-ID")}
            </p>
          )}

          {errorMsg && (
            <p className="text-[11px] text-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errorMsg}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {isBroadcasting && (
            <>
              <button
                type="button"
                onClick={handleSimulateMaritimeCoord}
                disabled={isUpdating}
                title="Perbarui koordinat simulasi rute laut untuk demo presentasi"
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-white/20 transition-all disabled:opacity-50"
              >
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>Simulasi Titik Laut</span>
              </button>

              <button
                type="button"
                onClick={handleSudahSandar}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
              >
                <Anchor className="w-4 h-4" />
                <span>Sudah Sandar di TPI</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
