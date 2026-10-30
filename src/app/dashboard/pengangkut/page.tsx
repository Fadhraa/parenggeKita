"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { MOCK_TRIPS, MOCK_USERS, MOCK_LOGISTICS } from "@/lib/mockData";
import { User, Trip, LogisticRequest } from "@/types";
import GeolocationTracker from "@/components/GeolocationTracker";
import ManifestCard from "@/components/ManifestCard";
import ManifestFormModal from "@/components/ManifestFormModal";
import LogisticChatDrawer from "@/components/LogisticChatDrawer";
import {
  Ship,
  Plus,
  Package,
  Snowflake,
  MessageCircle,
  CheckCircle2,
  Navigation,
} from "lucide-react";

export default function PengangkutDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [logisticTasks, setLogisticTasks] = useState<LogisticRequest[]>([]);
  const [registeredNelayan, setRegisteredNelayan] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"manifest" | "logistik">(
    "manifest",
  );

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [selectedChatRequest, setSelectedChatRequest] =
    useState<LogisticRequest | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  const loadData = async (user: User) => {
    setIsLoading(true);
    try {
      const { data: tripsData, error: tripsErr } = await supabase
        .from("trips")
        .select(
          `
          *,
          pengangkut:users!trips_pengangkut_id_fkey(*),
          manifests:trip_manifests(*)
        `,
        )
        .eq("pengangkut_id", user.id)
        .order("tanggal_berangkat", { ascending: false });

      if (!tripsErr && tripsData && tripsData.length > 0) {
        setTrips(tripsData as Trip[]);
      } else {
        const fallback = MOCK_TRIPS.filter((t) => t.pengangkut_id === user.id);
        setTrips(fallback.length > 0 ? fallback : [MOCK_TRIPS[0]]);
      }

      const { data: logData, error: logErr } = await supabase
        .from("logistic_requests")
        .select(
          `
          *,
          nelayan:users!logistic_requests_nelayan_id_fkey(*),
          pengangkut:users!logistic_requests_pengangkut_id_fkey(*),
          messages:logistic_messages(
            *,
            sender:users!logistic_messages_sender_id_fkey(*)
          )
        `,
        )
        .eq("pengangkut_id", user.id)
        .order("created_at", { ascending: false });

      if (!logErr && logData) {
        setLogisticTasks(logData as LogisticRequest[]);
      } else {
        setLogisticTasks(MOCK_LOGISTICS);
      }

      const { data: nelayanData } = await supabase
        .from("users")
        .select("*")
        .eq("role", "kapal_nelayan");

      if (nelayanData && nelayanData.length > 0) {
        setRegisteredNelayan(nelayanData as User[]);
      } else {
        setRegisteredNelayan(
          MOCK_USERS.filter((u) => u.role === "kapal_nelayan"),
        );
      }
    } catch (e) {
      console.warn("Using fallback mock", e);
      setTrips(MOCK_TRIPS.filter((t) => t.pengangkut_id === user.id));
      setLogisticTasks(MOCK_LOGISTICS);
      setRegisteredNelayan(
        MOCK_USERS.filter((u) => u.role === "kapal_nelayan"),
      );
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
    if (user.role !== "kapal_pengangkut" && user.role !== "admin") {
      router.push("/dashboard/nelayan");
      return;
    }
    setCurrentUser(user);
    loadData(user);
  }, []);

  if (!currentUser) return null;

  const activeTripToday = trips.find((t) => t.is_tracking_active);

  const handleSaveTrip = async (
    tripData: Partial<Trip>,
    manifestRows: {
      nama_kapal_nelayan: string;
      jumlah_gabus: number;
      nelayan_id?: string | null;
    }[],
  ) => {
    if (editingTrip) {
      await supabase.from("trips").update(tripData).eq("id", editingTrip.id);
      await supabase
        .from("trip_manifests")
        .delete()
        .eq("trip_id", editingTrip.id);
      if (manifestRows.length > 0) {
        const rows = manifestRows.map((r) => ({
          trip_id: editingTrip.id,
          nama_kapal_nelayan: r.nama_kapal_nelayan,
          jumlah_gabus: r.jumlah_gabus,
          nelayan_id: r.nelayan_id || null,
        }));
        await supabase.from("trip_manifests").insert(rows);
      }
    } else {
      const { data: newTrip } = await supabase
        .from("trips")
        .insert([{ ...tripData, pengangkut_id: currentUser.id }])
        .select()
        .single();

      if (newTrip && manifestRows.length > 0) {
        const rows = manifestRows.map((r) => ({
          trip_id: newTrip.id,
          nama_kapal_nelayan: r.nama_kapal_nelayan,
          jumlah_gabus: r.jumlah_gabus,
          nelayan_id: r.nelayan_id || null,
        }));
        await supabase.from("trip_manifests").insert(rows);
      }
    }
    loadData(currentUser);
    setEditingTrip(null);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm("Hapus laporan muatan ini?")) return;
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
      setLogisticTasks((prev) =>
        prev.map((t) =>
          t.id === requestId
            ? { ...t, messages: [...(t.messages || []), newMsg as any] }
            : t,
        ),
      );
      if (selectedChatRequest && selectedChatRequest.id === requestId) {
        setSelectedChatRequest((prev) =>
          prev
            ? { ...prev, messages: [...(prev.messages || []), newMsg as any] }
            : null,
        );
      }
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (
      !confirm(
        "Tandai pesanan logistik ini telah selesai diserahterimakan di laut?",
      )
    )
      return;
    await supabase
      .from("logistic_requests")
      .update({ status: "SELESAI", updated_at: new Date().toISOString() })
      .eq("id", taskId);
    setLogisticTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "SELESAI" } : t)),
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-6">
      {/* Transporter Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase mt-0.5">
              {currentUser.nama_kapal}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Juragan: {currentUser.nama_juragan || "Juragan Kapal"} • WA:{" "}
              {currentUser.no_whatsapp}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Pangkalan: Area {currentUser.lokasi_default || "Puma"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingTrip(null);
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Laporan Muatan Baru</span>
        </button>
      </div>

      {/* Geolocation Active Tracking Banner ATAU Banner Siaga Bersandar */}
      {activeTripToday ? (
        <GeolocationTracker
          activeTrip={activeTripToday}
          onTripUpdated={(updated) => {
            setTrips(trips.map((t) => (t.id === updated.id ? updated : t)));
          }}
        />
      ) : (
        <div className="bg-gradient-to-r from-slate-900 via-[#0A2E4D] to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>Armada Sedang Bersandar di Dermaga TPI Galesong</span>
              </h4>
            </div>
            <p className="text-xs text-slate-300">
              Pelacakan GPS nonaktif (pelayaran selesai). Siapkan armada dan
              klik tombol di samping saat kapal hendak bertolak berlayar kembali
              ke laut.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                setEditingTrip(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Mulai Pelayaran Baru</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("manifest")}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "manifest"
              ? "border-[#0A2E4D] text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Rekap Muatan Ikan Saya ({trips.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("logistik")}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "logistik"
              ? "border-[#0A2E4D] text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Tugas Bawa Logistik ({logisticTasks.length})</span>
        </button>
      </div>

      {/* Tab 1 Content: Manifests CRUD */}
      {activeTab === "manifest" && (
        <div className="space-y-4">
          {trips.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                Belum ada laporan keberangkatan kapal Anda
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Klik tombol "Buat Laporan Muatan Baru" di atas untuk mencatat
                daftar gabus nelayan yang Anda angkut hari ini.
              </p>
            </div>
          ) : (
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
        </div>
      )}

      {/* Tab 2 Content: Logistic Tasks Assigned to this Vessel */}
      {activeTab === "logistik" && (
        <div className="space-y-4">
          {logisticTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
              <Snowflake className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                Belum ada tugas bawa logistik dari Admin TPI
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ketika ada pesanan es balok atau perbekalan dari nelayan di
                laut, Admin TPI akan menugaskannya ke kapal pengangkut Anda di
                sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {logisticTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-sky-600 uppercase">
                        Area Pengantaran: {task.lokasi_tujuan}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                        Pemesan: {task.nelayan?.nama_kapal || "Kapal Nelayan"}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Juragan: {task.nelayan?.nama_juragan || "Nelayan"} • WA:{" "}
                        {task.nelayan?.no_whatsapp}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        task.status === "SELESAI"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-sky-50 text-sky-700 border border-sky-200"
                      }`}
                    >
                      {task.status === "SELESAI"
                        ? "Sudah Diserahkan"
                        : "Dalam Muatan"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">
                      Barang yang Dititipkan:
                    </span>
                    <p className="text-slate-800 font-semibold">
                      {task.rincian_barang}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setSelectedChatRequest(task);
                        setIsChatOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-sky-200"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>
                        Chat Titik Temu ({task.messages?.length || 0})
                      </span>
                    </button>

                    {task.status !== "SELESAI" && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selesai Diserahkan</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manifest Form Modal */}
      <ManifestFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTrip(null);
        }}
        onSave={handleSaveTrip}
        initialTrip={editingTrip}
        registeredNelayan={registeredNelayan}
        currentTransporter={currentUser}
        isTransporterRole={true}
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
