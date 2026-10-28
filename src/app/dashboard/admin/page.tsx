"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { MOCK_TRIPS, MOCK_USERS, MOCK_LOGISTICS } from "@/lib/mockData";
import { User, Trip, LogisticRequest } from "@/types";
import ManifestCard from "@/components/ManifestCard";
import ManifestFormModal from "@/components/ManifestFormModal";
import LogisticChatDrawer from "@/components/LogisticChatDrawer";
import { ShieldCheck, Plus, Package, Snowflake, Navigation, MessageCircle } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [requests, setRequests] = useState<LogisticRequest[]>([]);
  const [transporters, setTransporters] = useState<User[]>([]);
  const [fishermen, setFishermen] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"muatan" | "dispatcher">("muatan");

  // Selection states for assignment
  const [selectedTransporterMap, setSelectedTransporterMap] = useState<
    Record<string, string>
  >({});

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [selectedChatRequest, setSelectedChatRequest] = useState<LogisticRequest | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: tripsData } = await supabase
        .from("trips")
        .select(`
          *,
          pengangkut:users!trips_pengangkut_id_fkey(*),
          manifests:trip_manifests(*)
        `)
        .order("tanggal_berangkat", { ascending: false });

      if (tripsData && tripsData.length > 0) {
        setTrips(tripsData as Trip[]);
      } else {
        setTrips(MOCK_TRIPS);
      }

      const { data: logData } = await supabase
        .from("logistic_requests")
        .select(`
          *,
          nelayan:users!logistic_requests_nelayan_id_fkey(*),
          pengangkut:users!logistic_requests_pengangkut_id_fkey(*),
          messages:logistic_messages(
            *,
            sender:users!logistic_messages_sender_id_fkey(*)
          )
        `)
        .order("created_at", { ascending: false });

      if (logData && logData.length > 0) {
        setRequests(logData as LogisticRequest[]);
      } else {
        setRequests(MOCK_LOGISTICS);
      }

      const { data: usersData } = await supabase.from("users").select("*");
      const allUsers: User[] = usersData && usersData.length > 0 ? (usersData as User[]) : MOCK_USERS;
      setTransporters(allUsers.filter((u) => u.role === "kapal_pengangkut"));
      setFishermen(allUsers.filter((u) => u.role === "kapal_nelayan"));
    } catch (e) {
      console.warn("Using fallback mock for admin", e);
      setTrips(MOCK_TRIPS);
      setRequests(MOCK_LOGISTICS);
      setTransporters(MOCK_USERS.filter((u) => u.role === "kapal_pengangkut"));
      setFishermen(MOCK_USERS.filter((u) => u.role === "kapal_nelayan"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = getSessionUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "admin") {
      router.push(user.role === "kapal_pengangkut" ? "/dashboard/pengangkut" : "/dashboard/nelayan");
      return;
    }
    setCurrentUser(user);
    loadData();
  }, []);

  if (!currentUser) return null;

  // Handle assigning transporter to logistic request
  const handleAssignTransporter = async (requestId: string) => {
    const chosenTransporterId = selectedTransporterMap[requestId];
    if (!chosenTransporterId) {
      alert("Silakan pilih kapal pengangkut terlebih dahulu!");
      return;
    }

    const { error } = await supabase
      .from("logistic_requests")
      .update({
        pengangkut_id: chosenTransporterId,
        status: "DITUGASKAN_KE_PENGANGKUT",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (!error) {
      const matchTrans = transporters.find((t) => t.id === chosenTransporterId);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                pengangkut_id: chosenTransporterId,
                status: "DITUGASKAN_KE_PENGANGKUT",
                pengangkut: matchTrans,
              }
            : r
        )
      );
    }
    alert("Kapal pengangkut berhasil ditugaskan!");
  };

  const handleSaveTrip = async (
    tripData: Partial<Trip>,
    manifestRows: { nama_kapal_nelayan: string; jumlah_gabus: number; nelayan_id?: string | null }[]
  ) => {
    if (editingTrip) {
      await supabase.from("trips").update(tripData).eq("id", editingTrip.id);
      await supabase.from("trip_manifests").delete().eq("trip_id", editingTrip.id);
      const rows = manifestRows.map((r) => ({
        trip_id: editingTrip.id,
        nama_kapal_nelayan: r.nama_kapal_nelayan,
        jumlah_gabus: r.jumlah_gabus,
        nelayan_id: r.nelayan_id || null,
      }));
      await supabase.from("trip_manifests").insert(rows);
    } else {
      const { data: newTrip } = await supabase
        .from("trips")
        .insert([tripData])
        .select()
        .single();

      if (newTrip) {
        const rows = manifestRows.map((r) => ({
          trip_id: newTrip.id,
          nama_kapal_nelayan: r.nama_kapal_nelayan,
          jumlah_gabus: r.jumlah_gabus,
          nelayan_id: r.nelayan_id || null,
        }));
        await supabase.from("trip_manifests").insert(rows);
      }
    }
    loadData();
    setEditingTrip(null);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm("Hapus laporan keberangkatan kapal ini?")) return;
    await supabase.from("trips").delete().eq("id", tripId);
    setTrips(trips.filter((t) => t.id !== tripId));
  };

  const handleSendMessage = async (requestId: string, text: string) => {
    const { data: newMsg, error } = await supabase
      .from("logistic_messages")
      .insert([
        {
          request_id: requestId,
          sender_id: currentUser.id,
          pesan: text,
        },
      ])
      .select(`*, sender:users(*)`)
      .single();

    if (!error && newMsg) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, messages: [...(r.messages || []), newMsg as any] }
            : r
        )
      );
      if (selectedChatRequest && selectedChatRequest.id === requestId) {
        setSelectedChatRequest((prev) =>
          prev ? { ...prev, messages: [...(prev.messages || []), newMsg as any] } : null
        );
      }
    }
  };

  const totalGabus = trips.reduce((s, t) => s + (t.total_gabus || 0), 0);
  const pendingRequests = requests.filter((r) => r.status === "MENUNGGU_ADMIN").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0A2E4D] text-white flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 uppercase">
                Pusat Kendali Admin TPI
              </span>
              <span className="text-xs text-slate-500">
                TPI Galesong Utara
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase mt-0.5">
              {currentUser.nama_kapal}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Petugas: {currentUser.nama_juragan || "Admin Pengelola"} • WA:{" "}
              {currentUser.no_whatsapp}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingTrip(null);
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto px-5 py-3 rounded-2xl bg-[#0A2E4D] hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 text-sky-400" />
          <span>Input Muatan Kapal Pengangkut</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">
              Total Seluruh Gabus
            </span>
            <span className="text-2xl font-black font-mono-numbers text-slate-900 block mt-1">
              {totalGabus} G
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">
              Kapal Pengangkut Aktif
            </span>
            <span className="text-2xl font-black font-mono-numbers text-emerald-600 block mt-1">
              {trips.filter((t) => t.is_tracking_active).length} Kapal
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Navigation className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">
              Pesanan Butuh Penugasan
            </span>
            <span className="text-2xl font-black font-mono-numbers text-sky-600 block mt-1">
              {pendingRequests} Tiket
            </span>
          </div>
          <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
            <Snowflake className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("muatan")}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "muatan"
              ? "border-[#0A2E4D] text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Package className="w-4 h-4 text-amber-500" />
          <span>Seluruh Laporan Muatan ({trips.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("dispatcher")}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "dispatcher"
              ? "border-[#0A2E4D] text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Snowflake className="w-4 h-4 text-sky-500" />
          <span>Dispatcher Penugasan Logistik ({requests.length})</span>
        </button>
      </div>

      {/* Tab 1: All Manifests (Full CRUD) */}
      {activeTab === "muatan" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <ManifestCard
              key={trip.id}
              trip={trip}
              currentUser={currentUser}
              showCopyButton={true}
              onEdit={(t) => {
                setEditingTrip(t);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteTrip}
            />
          ))}
        </div>
      )}

      {/* Tab 2: Dispatcher Logistik */}
      {activeTab === "dispatcher" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-sky-600 uppercase">
                      📍 Area {req.lokasi_tujuan}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                      {req.nelayan?.nama_kapal || "Kapal Nelayan"}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Juragan: {req.nelayan?.nama_juragan || "Nelayan"} • WA: {req.nelayan?.no_whatsapp}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      req.status === "MENUNGGU_ADMIN"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : req.status === "DITUGASKAN_KE_PENGANGKUT"
                        ? "bg-sky-50 text-sky-700 border border-sky-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {req.status === "MENUNGGU_ADMIN"
                      ? "⏳ Butuh Ditugaskan"
                      : req.status === "DITUGASKAN_KE_PENGANGKUT"
                      ? "🚢 Sedang Dibawa"
                      : "✅ Selesai"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">
                    📦 Kebutuhan yang Diminta:
                  </span>
                  <p className="text-slate-800 font-semibold">{req.rincian_barang}</p>
                </div>

                {/* Dispatcher Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    {req.status === "MENUNGGU_ADMIN" ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedTransporterMap[req.id] || ""}
                          onChange={(e) =>
                            setSelectedTransporterMap({
                              ...selectedTransporterMap,
                              [req.id]: e.target.value,
                            })
                          }
                          className="flex-1 text-xs px-2.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="">-- Pilih Kapal Pengangkut --</option>
                          {transporters.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.nama_kapal} ({t.nama_juragan})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignTransporter(req.id)}
                          className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow transition-colors"
                        >
                          Tugaskan
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">
                        Ditugaskan ke:{" "}
                        <strong className="text-slate-900">
                          {req.pengangkut?.nama_kapal || "Kapal Pengangkut"}
                        </strong>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedChatRequest(req);
                      setIsChatOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Ruang Chat ({req.messages?.length || 0})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manifest Modal */}
      <ManifestFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTrip(null);
        }}
        onSave={handleSaveTrip}
        initialTrip={editingTrip}
        registeredNelayan={fishermen}
        currentTransporter={transporters[0] || currentUser}
      />

      {/* Chat Drawer */}
      <LogisticChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setSelectedChatRequest(null);
        }}
        request={selectedChatRequest}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
