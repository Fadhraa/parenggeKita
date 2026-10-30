"use client";

import React, { useEffect, useState, useRef } from "react";
import { Trip } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { Anchor, AlertTriangle, Radio } from "lucide-react";
import {
  calculateDistanceInMeters,
  TPI_GALESONG_COORDS,
  DOCKING_GEOFENCE_RADIUS_METERS,
} from "@/lib/utils";

interface GeolocationTrackerProps {
  activeTrip: Trip;
  onTripUpdated?: (updatedTrip: Trip) => void;
}

export default function GeolocationTracker({
  activeTrip,
  onTripUpdated,
}: GeolocationTrackerProps) {
  const [isBroadcasting, setIsBroadcasting] = useState(
    activeTrip.is_tracking_active,
  );
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(
    activeTrip.latitude && activeTrip.longitude
      ? { lat: activeTrip.latitude, lng: activeTrip.longitude }
      : null,
  );
  const [lastUpdate, setLastUpdate] = useState<string>(
    activeTrip.last_tracked_at || "Belum ada",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastSentTimeRef = useRef<number>(0);
  const simStepRef = useRef<number>(0);

  const distanceToDock = currentCoords
    ? calculateDistanceInMeters(
        currentCoords.lat,
        currentCoords.lng,
        TPI_GALESONG_COORDS.lat,
        TPI_GALESONG_COORDS.lng,
      )
    : null;

  // Send coordinates update to Supabase with automatic Geofencing check
  const sendCoordinates = async (lat: number, lng: number) => {
    try {
      const nowIso = new Date().toISOString();
      const distance = calculateDistanceInMeters(
        lat,
        lng,
        TPI_GALESONG_COORDS.lat,
        TPI_GALESONG_COORDS.lng,
      );

      const hasReachedDock = distance <= DOCKING_GEOFENCE_RADIUS_METERS;

      const updatePayload: any = {
        latitude: lat,
        longitude: lng,
        last_tracked_at: nowIso,
        updated_at: nowIso,
      };

      if (hasReachedDock) {
        updatePayload.is_tracking_active = false;
      }

      await supabase
        .from("trips")
        .update(updatePayload)
        .eq("id", activeTrip.id);

      setCurrentCoords({ lat, lng });
      setLastUpdate(nowIso);

      if (hasReachedDock) {
        setIsBroadcasting(false);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        if (onTripUpdated) {
          onTripUpdated({
            ...activeTrip,
            latitude: lat,
            longitude: lng,
            is_tracking_active: false,
            last_tracked_at: nowIso,
          });
        }
        alert(
          `⚓ Geofencing Otomatis: Kapal terdeteksi telah memasuki area dermaga TPI Galesong Utara (${distance} meter). Status otomatis diselesaikan (Kapal Sudah Bersandar).`,
        );
        return;
      }

      if (onTripUpdated) {
        onTripUpdated({
          ...activeTrip,
          latitude: lat,
          longitude: lng,
          last_tracked_at: nowIso,
        });
      }
    } catch (e) {
      console.error("GPS send error", e);
    }
  };

  // HTML5 Geolocation watcher
  useEffect(() => {
    if (
      !isBroadcasting ||
      typeof window === "undefined" ||
      !navigator.geolocation
    ) {
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isBroadcasting, activeTrip.id]);

  // Handle Sudah Sandar (Manual Fallback)
  const handleSudahSandar = async () => {
    if (
      !confirm(
        "Konfirmasi bahwa kapal sudah bersandar di TPI Galesong Utara? Pelacakan lokasi akan diselesaikan.",
      )
    ) {
      return;
    }

    setIsUpdating(true);
    try {
      const nowIso = new Date().toISOString();
      await supabase
        .from("trips")
        .update({
          is_tracking_active: false,
          updated_at: nowIso,
        })
        .eq("id", activeTrip.id);

      setIsBroadcasting(false);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
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
    // Jalur simulasi bertahap:
    // 1. Laut lepas Puma (~7.5 km dari TPI)
    // 2. Mendekati pesisir (~1.4 km dari TPI)
    // 3. Tiba di Dermaga TPI Galesong (< 30 meter -> Geofence Auto Docking!)
    const simulatedRoute = [
      { lat: -5.28, lng: 119.31 },
      { lat: -5.315, lng: 119.352 },
      { lat: -5.3214, lng: 119.3623 },
    ];
    const target = simulatedRoute[simStepRef.current % simulatedRoute.length];
    simStepRef.current = (simStepRef.current + 1) % simulatedRoute.length;
    await sendCoordinates(target.lat, target.lng);
    setIsUpdating(false);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#0A2E4D] to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-700 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Status Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm sm:text-base text-white">
              {isBroadcasting
                ? "Siaran GPS Kapal Sedang Aktif"
                : "Kapal Sudah Sandar di TPI (Pelacakan Selesai)"}
            </h4>
          </div>

          <p className="text-xs text-slate-300">
            Jadwal: Keberangkatan {activeTrip.lokasi} (Jam {activeTrip.jam_otw})
            | Total: {activeTrip.total_gabus} Gabus
          </p>

          {currentCoords && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <p className="text-[11px] text-sky-300 font-mono-numbers">
                Koordinat: {currentCoords.lat.toFixed(4)},{" "}
                {currentCoords.lng.toFixed(4)} • Terakhir:{" "}
                {new Date(lastUpdate).toLocaleTimeString("id-ID")}
              </p>
              {distanceToDock !== null && isBroadcasting && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30">
                  Jarak ke Dermaga:{" "}
                  {distanceToDock >= 1000
                    ? `${(distanceToDock / 1000).toFixed(1)} km`
                    : `${distanceToDock} m`}
                </span>
              )}
            </div>
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
