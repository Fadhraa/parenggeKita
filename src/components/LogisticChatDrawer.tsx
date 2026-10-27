"use client";

import React, { useState } from "react";
import { LogisticRequest, User } from "@/types";
import { X, Send, Snowflake } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface LogisticChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: LogisticRequest | null;
  currentUser: User;
  onSendMessage: (requestId: string, message: string) => Promise<void>;
}

export default function LogisticChatDrawer({
  isOpen,
  onClose,
  request,
  currentUser,
  onSendMessage,
}: LogisticChatDrawerProps) {
  const [pesan, setPesan] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !request) return null;

  const messages = request.messages || [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesan.trim()) return;

    setIsSending(true);
    try {
      await onSendMessage(request.id, pesan.trim());
      setPesan("");
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim pesan.");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = () => {
    switch (request.status) {
      case "MENUNGGU_ADMIN":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            ⏳ Menunggu Admin
          </span>
        );
      case "DITUGASKAN_KE_PENGANGKUT":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
            🚢 Ditugaskan ke Pengangkut
          </span>
        );
      case "SELESAI":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            ✅ Selesai Diterima
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[85vh] max-h-[640px]">
        {/* Header */}
        <div className="bg-[#0A2E4D] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <Snowflake className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Koordinasi Logistik Laut
                </h3>
                {getStatusBadge()}
              </div>
              <p className="text-[11px] text-slate-300">
                Tujuan: Area {request.lokasi_tujuan} | Pemesan: {request.nelayan?.nama_kapal || "Nelayan"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Summary Box */}
        <div className="bg-slate-50 border-b border-slate-200 p-3.5 text-xs text-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
            <span className="font-bold text-slate-900">📦 Rincian Barang:</span>
            <span className="font-semibold text-slate-700">
              {request.rincian_barang}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
            <span className="text-slate-500">🚢 Dibawa oleh:</span>
            <strong className="text-slate-900">
              {request.pengangkut
                ? `${request.pengangkut.nama_kapal} (${request.pengangkut.nama_juragan || "Juragan"})`
                : "Belum ditugaskan (Menunggu Admin)"}
            </strong>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/60">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs italic">
              Belum ada pesan koordinasi. Kirim pesan pertama untuk menyepakati titik koordinat dan waktu serah terima di laut.
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUser.id;
              const senderRole = msg.sender?.role || "user";
              const senderName =
                msg.sender?.nama_kapal || msg.sender?.username || "Pengguna";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-500">
                      {isMe ? "Anda" : senderName}
                    </span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                        senderRole === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : senderRole === "kapal_pengangkut"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {senderRole === "admin"
                        ? "Admin TPI"
                        : senderRole === "kapal_pengangkut"
                        ? "Pengangkut"
                        : "Nelayan"}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {formatTimeAgo(msg.created_at)}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-medium shadow-sm ${
                      isMe
                        ? "bg-sky-500 text-white rounded-tr-none"
                        : "bg-white text-slate-900 border border-slate-200 rounded-tl-none"
                    }`}
                  >
                    {msg.pesan}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Message Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            placeholder="Ketik koordinasi titik temu laut / konfirmasi barang..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
          />
          <button
            type="submit"
            disabled={isSending || !pesan.trim()}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
}
