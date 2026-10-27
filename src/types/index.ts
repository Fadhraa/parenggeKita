export type UserRole = "admin" | "kapal_pengangkut" | "kapal_nelayan";

export type LokasiMuat = "Puma" | "Kalmas";

export type LogisticStatus =
  | "MENUNGGU_ADMIN"
  | "DITUGASKAN_KE_PENGANGKUT"
  | "SELESAI";

export interface User {
  id: string;
  username: string;
  password_hash?: string;
  role: UserRole;
  nama_kapal: string;
  nama_juragan?: string;
  lokasi_default?: LokasiMuat;
  no_whatsapp?: string;
  created_at?: string;
}

export interface TripManifest {
  id: string;
  trip_id: string;
  nelayan_id?: string | null;
  nama_kapal_nelayan: string;
  jumlah_gabus: number;
  created_at?: string;
}

export interface Trip {
  id: string;
  pengangkut_id: string;
  lokasi: LokasiMuat;
  tanggal_berangkat: string;
  jam_otw: string;
  zona_waktu: string;
  total_gabus: number;
  latitude?: number | null;
  longitude?: number | null;
  last_tracked_at?: string | null;
  is_tracking_active: boolean;
  created_at?: string;
  updated_at?: string;
  pengangkut?: User;
  manifests?: TripManifest[];
}

export interface LogisticMessage {
  id: string;
  request_id: string;
  sender_id: string;
  pesan: string;
  created_at: string;
  sender?: User;
}

export interface LogisticRequest {
  id: string;
  nelayan_id: string;
  pengangkut_id?: string | null;
  lokasi_tujuan: LokasiMuat;
  rincian_barang: string;
  status: LogisticStatus;
  created_at?: string;
  updated_at?: string;
  nelayan?: User;
  pengangkut?: User;
  messages?: LogisticMessage[];
}
