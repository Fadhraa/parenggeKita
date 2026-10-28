"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { MOCK_LOGISTICS, MOCK_TRIPS } from "@/lib/mockData";
import { User, Trip, LogisticRequest, LokasiMuat } from "@/types";
import LogisticRequestModal from "@/components/LogisticRequestModal";
import LogisticChatDrawer from "@/components/LogisticChatDrawer";
import { Anchor, Snowflake, Plus, MessageCircle, Package } from "lucide-react";

export default function NelayanDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myRequests, setMyRequests] = useState<LogisticRequest[]>([]);
  const [carriedFishTrips, setCarriedFishTrips] = useState<
    { trip: Trip; jumlahGabus: number }[]
  >([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedChatRequest, setSelectedChatRequest] =
    useState<LogisticRequest | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (user: User) => {
    setIsLoading(true);
    try {
      const { data: tripsData } = await supabase
        .from("trips")
        .select(
          `
          *,
          pengangkut:users!trips_pengangkut_id_fkey(*),
          manifests:trip_manifests(*)
        `,
        )
        .order("tanggal_berangkat", { ascending: false });

      const allTrips: Trip[] =
        tripsData && tripsData.length > 0 ? (tripsData as Trip[]) : MOCK_TRIPS;

      const carried: { trip: Trip; jumlahGabus: number }[] = [];
      allTrips.forEach((t) => {
        const found = t.manifests?.find(
          (m) =>
            m.nelayan_id === user.id ||
            m.nama_kapal_nelayan
              .toLowerCase()
              .includes(user.nama_kapal.toLowerCase()),
        );
        if (found) {
          carried.push({ trip: t, jumlahGabus: found.jumlah_gabus });
        }
      });
      setCarriedFishTrips(carried);

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
        .eq("nelayan_id", user.id)
        .order("created_at", { ascending: false });

      if (!logErr && logData && logData.length > 0) {
        setMyRequests(logData as LogisticRequest[]);
      } else {
        setMyRequests(
          MOCK_LOGISTICS.filter(
            (r) =>
              r.nelayan_id === user.id || r.nelayan_id === "usr-nelayan-01",
          ),
        );
      }
    } catch (e) {
      console.warn("Using fallback mock data for nelayan", e);
      setMyRequests(MOCK_LOGISTICS);
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
    setCurrentUser(user);
    loadData(user);
  }, []);

  if (!currentUser) return null;

  const handleCreateRequest = async (requestData: {
    lokasi_tujuan: LokasiMuat;
    rincian_barang: string;
  }) => {
    const { data: newReq, error } = await supabase
      .from("logistic_requests")
      .insert([
        {
          nelayan_id: currentUser.id,
          lokasi_tujuan: requestData.lokasi_tujuan,
          rincian_barang: requestData.rincian_barang,
          status: "MENUNGGU_ADMIN",
        },
      ])
      .select()
      .single();

    if (!error && newReq) {
      setMyRequests([newReq as LogisticRequest, ...myRequests]);
    } else {
      const fallbackReq: LogisticRequest = {
        id: `req-local-${Date.now()}`,
        nelayan_id: currentUser.id,
        lokasi_tujuan: requestData.lokasi_tujuan,
        rincian_barang: requestData.rincian_barang,
        status: "MENUNGGU_ADMIN",
        created_at: new Date().toISOString(),
      };
      setMyRequests([fallbackReq, ...myRequests]);
    }
    alert("Permintaan logistik Anda berhasil terkirim ke Admin TPI!");
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
      setMyRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, messages: [...(r.messages || []), newMsg as any] }
            : r,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg">
            <Anchor className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Pangkalan: Area {currentUser.lokasi_default || "Puma"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase mt-0.5">
              {currentUser.nama_kapal}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Kapten: {currentUser.nama_juragan || "Kapten Nelayan"} • WA:{" "}
              {currentUser.no_whatsapp}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="w-full md:w-auto px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Pesan Kebutuhan Pokok</span>
        </button>
      </div>

      {/* Info: Ikan Anda sedang Dibawa oleh Kapal Pengangkut Hari Ini */}
      {carriedFishTrips.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
            Status Hasil Tangkapan Hari Ini
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {carriedFishTrips.map(({ trip, jumlahGabus }, idx) => (
              <div
                key={idx}
                className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase">
                    Ikan Anda Sedang OTW ke TPI
                  </span>
                  <h4 className="text-base font-extrabold text-emerald-950">
                    Muatan: {jumlahGabus} Gabus di Kapal{" "}
                    {trip.pengangkut?.nama_kapal}
                  </h4>
                  <p className="text-xs text-emerald-800">
                    👨‍✈️ Juragan: {trip.pengangkut?.nama_juragan} • Jam OTW:{" "}
                    {trip.jam_otw} {trip.zona_waktu}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders & Logistic Tracking Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-sky-500" />
            <h3 className="font-extrabold text-lg text-slate-900">
              Riwayat Pesanan Logistik Saya ({myRequests.length})
            </h3>
          </div>
        </div>

        {myRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
            <Snowflake className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">
              Belum ada pesanan logistik aktif
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Klik tombol "Pesan Es Balok / Kebutuhan Pokok" untuk menitipkan
              perbekalan ke kapal pengangkut yang menuju perairan Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-sky-600 uppercase">
                      📍 Tujuan: Area {req.lokasi_tujuan}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-500 mt-0.5">
                      Dibuat pada{" "}
                      {new Date(
                        req.created_at || Date.now(),
                      ).toLocaleDateString("id-ID")}
                    </h4>
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
                      ? "⏳ Menunggu Admin"
                      : req.status === "DITUGASKAN_KE_PENGANGKUT"
                        ? "🚢 Dibawa Pengangkut"
                        : "✅ Selesai Diterima"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">
                    📦 Rincian Barang:
                  </span>
                  <p className="text-slate-800 font-semibold">
                    {req.rincian_barang}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Kapal Pembawa:{" "}
                    <strong className="text-slate-900">
                      {req.pengangkut?.nama_kapal || "Menunggu Penugasan Admin"}
                    </strong>
                  </span>

                  <button
                    onClick={() => {
                      setSelectedChatRequest(req);
                      setIsChatOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold flex items-center gap-1.5 transition-colors border border-sky-200"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat ({req.messages?.length || 0})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      <LogisticRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleCreateRequest}
        currentUser={currentUser}
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
