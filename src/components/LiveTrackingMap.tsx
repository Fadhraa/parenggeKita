"use client";

import React, { useEffect, useState, useRef } from "react";
import { Trip } from "@/types";
import { formatTimeAgo } from "@/lib/utils";
import { Navigation, RefreshCw } from "lucide-react";

interface LiveTrackingMapProps {
  trips: Trip[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function LiveTrackingMap({
  trips,
  onRefresh,
  isLoading = false,
}: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter active trips with valid coordinates
  const activeTrips = trips.filter(
    (t) => t.is_tracking_active && t.latitude != null && t.longitude != null
  );

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default;

      if (!mapInstanceRef.current && mapContainerRef.current && isMounted) {
        // TPI Galesong coordinate: -5.3216, 119.3625
        const defaultCenter: [number, number] = [-5.26, 119.28];

        const map = L.map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 10,
          scrollWheelZoom: false, // Prevents scroll hijacking on mobile
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when activeTrips change or map finishes loading
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const L = require("leaflet");
    const map = mapInstanceRef.current;

    // Clear existing dynamic markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // 1. TPI Galesong Harbor Marker
    const tpiIcon = L.divIcon({
      className: "custom-port-marker",
      html: `<span>⚓</span>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });

    const tpiMarker = L.marker([-5.3216, 119.3625], { icon: tpiIcon }).addTo(map);
    tpiMarker.bindPopup(`
      <div style="font-family: system-ui; min-width: 180px;">
        <div style="background-color: #059669; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase;">
          Tujuan Sandar
        </div>
        <h4 style="margin: 6px 0 2px; font-size: 14px; font-weight: 700; color: #0f172a;">TPI Galesong Utara</h4>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Tempat Pendaratan & Pelelangan Ikan Utama</p>
      </div>
    `);

    // 2. Active Ships Markers
    activeTrips.forEach((trip) => {
      if (trip.latitude == null || trip.longitude == null) return;

      const shipIcon = L.divIcon({
        className: "custom-ship-marker",
        html: `<span>🚢</span>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -19],
      });

      const marker = L.marker([trip.latitude, trip.longitude], {
        icon: shipIcon,
      }).addTo(map);

      const namaKapal = trip.pengangkut?.nama_kapal || "Kapal Pengangkut";
      const juragan = trip.pengangkut?.nama_juragan || "Juragan";
      const lastUpdate = formatTimeAgo(trip.last_tracked_at);

      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 210px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background-color: #0284c7; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; text-transform: uppercase;">
              Area ${trip.lokasi}
            </span>
            <span style="color: #059669; font-weight: 700; font-size: 11px;">
              ● OTW Jam ${trip.jam_otw}
            </span>
          </div>
          <h4 style="margin: 4px 0 2px; font-size: 15px; font-weight: 800; color: #0f172a;">
            ${namaKapal}
          </h4>
          <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">
            👨‍✈️ ${juragan}
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #64748b;">Muatan:</span>
              <strong style="color: #0284c7;">${trip.total_gabus} Gabus</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">GPS Terakhir:</span>
              <span style="color: #0f172a; font-weight: 600;">${lastUpdate}</span>
            </div>
          </div>
        </div>
      `);
    });
  }, [activeTrips.length, mapLoaded]);

  return (
    <div id="peta-tracking" className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header Bar */}
      <div className="bg-[#0A2E4D] text-white px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <h3 className="font-extrabold text-sm sm:text-base tracking-wide text-white uppercase flex items-center gap-2">
            <Navigation className="w-4 h-4 text-sky-400" />
            Live Tracking Kapal Pengangkut Hari Ini
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/10 text-sky-200 border border-white/10 px-2.5 py-1 rounded-full font-medium">
            {activeTrips.length} Kapal Berlayar
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Perbarui Posisi GPS"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[360px] sm:h-[440px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Legend / Info Helper */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-2.5 shadow-md text-xs space-y-1.5 max-w-[200px] sm:max-w-none">
          <div className="flex items-center gap-2 text-slate-800 font-medium">
            <span className="text-base">🚢</span>
            <span>Kapal Pengangkut OTW</span>
          </div>
          <div className="flex items-center gap-2 text-slate-800 font-medium">
            <span className="text-base">⚓</span>
            <span>TPI Galesong Utara</span>
          </div>
          <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
            Klik marker kapal untuk melihat rincian muatan & jam OTW.
          </p>
        </div>
      </div>
    </div>
  );
}
