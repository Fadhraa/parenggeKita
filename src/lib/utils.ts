import { Trip } from "@/types";

export function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return "Belum ada sinyal GPS";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Baru saja (Aktif)";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    return formatDateIndo(dateStr);
  } catch {
    return "Waktu tidak valid";
  }
}

export function generateWhatsAppManifestText(trip: Trip): string {
  const kapal = trip.pengangkut?.nama_kapal || "KMN Pengangkut";
  const juragan = trip.pengangkut?.nama_juragan || "Juragan";
  const tanggal = formatDateIndo(trip.tanggal_berangkat);

  let text = `*LAPORAN KEBERANGKATAN ${trip.lokasi.toUpperCase()}*\n`;
  text += `🚢 *${kapal}* (${juragan})\n`;
  text += `📅 ${tanggal} | Jam ${trip.jam_otw} ${trip.zona_waktu}\n\n`;
  text += `*DAFTAR RINCIAN MUATAN NELAYAN:*\n`;

  if (trip.manifests && trip.manifests.length > 0) {
    trip.manifests.forEach((m, idx) => {
      text += `${idx + 1}. ${m.nama_kapal_nelayan} : ${m.jumlah_gabus} G\n`;
    });
  } else {
    text += `(Belum ada rincian muatan)\n`;
  }

  text += `----------------------------------------\n`;
  text += `📦 *TOTAL MUATAN: ${trip.total_gabus} GABUS*\n\n`;
  text += `_Diterbitkan via Parengge Kita Platform - Digitalisasi Rantai Pasok Maritim_`;

  return text;
}
