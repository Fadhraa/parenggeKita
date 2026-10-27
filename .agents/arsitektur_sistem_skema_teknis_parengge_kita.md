# Dokumentasi Arsitektur Sistem (System Architecture)
## Parengge Kita – Platform Rantai Pasok & Logistik Nelayan

Dokumen ini menjelaskan rancangan arsitektur teknis, pemilihan teknologi (*tech stack*), skema basis data (*database schema*), alur kerja sistem, dan struktur proyek untuk membangun MVP **Parengge Kita** secara cepat dan terukur.

---

## 1. Tech Stack yang Direkomendasikan (Rapid MVP Stack)

Untuk mengejar kecepatan pengembangan dalam satu repositori (*monorepo fullstack*) tanpa perlu mengelola dua server terpisah:

* **Framework Utama:** **Next.js 14/15 (App Router)** menggunakan bahasa **TypeScript**.
* **Styling & UI:** **Tailwind CSS** + **Lucide Icons** (ringan, responsif untuk layar HP nelayan).
* **Peta & Geolocation:**
  * **Leaflet.js (`react-leaflet`)** + **OpenStreetMap Tiles** (100% gratis, tanpa perlu API Key berbayar atau kartu kredit).
  * **HTML5 Geolocation API** (`navigator.geolocation.watchPosition`) untuk mengambil titik koordinat langsung dari perangkat Kapal Pengangkut.
* **Database & Realtime Backend:** **Supabase (PostgreSQL)**
  * Menyediakan Database SQL relasional, Autentikasi, dan fitur **Supabase Realtime** (sehingga pergerakan koordinat kapal dan chat logistik langsung ter-update di layar tanpa perlu *refresh* halaman).
* **Deployment:** **Vercel** (terintegrasi langsung dengan GitHub & Supabase).

---

## 2. Diagram Arsitektur Tingkat Tinggi (High-Level Architecture)

```
+-------------------------------------------------------------------------+
|                        CLIENT LAYER (BROWSER / HP)                      |
|                                                                         |
|  +-----------------+  +------------------+  +------------------------+  |
|  |  Halaman Publik |  | Dashboard Kapal  |  | Dashboard Kapal        |  |
|  |  (User / TPI)   |  | Pengangkut       |  | Nelayan & Admin        |  |
|  |  - Peta Leaflet |  | - Form Gabus     |  | - Request Logistik     |  |
|  |  - List Muatan  |  | - GPS Sender     |  | - Assign & Ruang Chat  |  |
|  +--------+--------+  +--------+---------+  +-----------+------------+  |
+-----------|--------------------|------------------------|---------------+
            |                    | (Geolocation API)      |
            v                    v                        v
+-------------------------------------------------------------------------+
|                   APPLICATION LAYER (NEXT.JS APP ROUTER)                |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | Next.js Server Actions / API Routes & Role-Based Middleware       |  |
|  | - Validasi Role: [admin, kapal_pengangkut, kapal_nelayan, public] |  |
|  | - Validasi Kepemilikan Data (Ownership Check)                     |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                  DATA & REALTIME LAYER (SUPABASE POSTGRESQL)            |
|                                                                         |
|  +--------------+  +--------------+  +----------------+  +-----------+  |
|  | Tabel: users |  | Tabel: trips |  | Tabel:         |  | Tabel:    |  |
|  | (Profil &    |  | (Jadwal &    |  | trip_manifests |  | logistic_ |  |
|  |  Role Kapal) |  |  Koordinat)  |  | (Rincian Gabus)|  | requests  |  |
|  +--------------+  +--------------+  +----------------+  +-----------+  |
+-------------------------------------------------------------------------+
```

---

## 3. Skema Database Relasional (PostgreSQL / Supabase SQL)

Berikut adalah skema SQL lengkap yang siap dijalankan di SQL Editor Supabase:

```sql
-- 1. ENUM TYPES UNTUK KONSISTENSI DATA
CREATE TYPE user_role AS ENUM ('admin', 'kapal_pengangkut', 'kapal_nelayan');
CREATE TYPE lokasi_muat AS ENUM ('Puma', 'Kalmas');
CREATE TYPE logistic_status AS ENUM ('MENUNGGU_ADMIN', 'DITUGASKAN_KE_PENGANGKUT', 'SELESAI');

-- 2. TABEL USERS (Menyimpan Akun Admin, Kapal Pengangkut, dan Kapal Nelayan)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    nama_kapal VARCHAR(100) NOT NULL,   -- Contoh: 'KMN ⭐ NADITA' atau 'Tinggi Moncong Mb'
    nama_juragan VARCHAR(100),          -- Contoh: 'Jrg Pak Kambong' atau 'Jrg Dg Sutte'
    lokasi_default lokasi_muat,         -- Lokasi operasi kapal ('Puma' atau 'Kalmas')
    no_whatsapp VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL TRIPS (Laporan Keberangkatan Kapal Pengangkut & Tracking Lokasi)
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pengangkut_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lokasi lokasi_muat NOT NULL,        -- Dropdown: 'Puma' atau 'Kalmas'
    tanggal_berangkat DATE NOT NULL DEFAULT CURRENT_DATE,
    jam_otw VARCHAR(10) NOT NULL,       -- Contoh: '14:00' atau '12:00'
    zona_waktu VARCHAR(30) NOT NULL,    -- Otomatis: 'Waktu Puma' atau 'Waktu Kalmas'
    total_gabus INTEGER NOT NULL DEFAULT 0,
    
    -- Kolom Khusus Tracking Geolocation Hari Itu
    latitude DOUBLE PRECISION,          -- Titik lintang terakhir kapal pengangkut
    longitude DOUBLE PRECISION,         -- Titik bujur terakhir kapal pengangkut
    last_tracked_at TIMESTAMPTZ,        -- Waktu terakhir koordinat diterima
    is_tracking_active BOOLEAN DEFAULT TRUE, -- False jika kapal sudah sandar di TPI
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL TRIP_MANIFESTS (Daftar Rincian Muatan Gabus per Kapal Nelayan)
CREATE TABLE trip_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    nelayan_id UUID REFERENCES users(id) ON DELETE SET NULL,
    nama_kapal_nelayan VARCHAR(100) NOT NULL, -- Disimpan juga sebagai snapshot teks (misal: 'Tinggi Moncong Mb')
    jumlah_gabus INTEGER NOT NULL CHECK (jumlah_gabus > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL LOGISTIC_REQUESTS (Permintaan Kebutuhan Pokok dari Kapal Nelayan)
CREATE TABLE logistic_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nelayan_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pengangkut_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Diisi oleh Admin saat menunjuk Kapal Pengangkut B
    lokasi_tujuan lokasi_muat NOT NULL,                         -- 'Puma' atau 'Kalmas'
    rincian_barang TEXT NOT NULL,                               -- Contoh: 'Es Balok 20 Batang, Beras 2 Karung'
    status logistic_status NOT NULL DEFAULT 'MENUNGGU_ADMIN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL LOGISTIC_MESSAGES (Ruang Komunikasi antara Nelayan, Admin, dan Pengangkut)
CREATE TABLE logistic_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES logistic_requests(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pesan TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEX UNTUK PERFORMA QUERY HALAMAN UTAMA & TRACKING HARI INI
CREATE INDEX idx_trips_tanggal_lokasi ON trips(tanggal_berangkat, lokasi);
CREATE INDEX idx_trips_tracking_today ON trips(tanggal_berangkat, is_tracking_active);
CREATE INDEX idx_logistic_nelayan ON logistic_requests(nelayan_id);
CREATE INDEX idx_logistic_pengangkut ON logistic_requests(pengangkut_id);
```

---

## 4. Alur Kerja Teknis Fitur Utama (Core Technical Flows)

### 4.1 Alur Pelacakan Lokasi Kapal Pengangkut (Real-Time Tracking)
1. **Trigger saat Login:** Pengguna login dan sistem membaca `user.role === 'kapal_pengangkut'`.
2. **Pengecekan Jadwal Hari Ini:** Sistem mengecek apakah ada data pada tabel `trips` dengan `pengangkut_id == user.id`, `tanggal_berangkat == HARI_INI`, dan `is_tracking_active == true`.
3. **Permintaan Izin GPS Browser:**
   * Komponen React menjalankan `navigator.geolocation.watchPosition(successCallback, errorCallback, { enableHighAccuracy: true })`.
   * Setiap kali posisi diperbarui (di-throttle maksimal 1 kali per 10 detik untuk menghemat baterai dan kuota), aplikasi memanggil endpoint `PATCH /api/trips/[id]/location` dengan payload `{ latitude, longitude }`.
4. **Penampilan di Halaman Utama (User/Publik):**
   * Halaman utama mengambil daftar `trips` yang memiliki `tanggal_berangkat == HARI_INI` dan `latitude IS NOT NULL`.
   * Peta menampilkan marker posisi kapal beserta status apakah kapal masih **OTW Darat** (`is_tracking_active == true`) atau **Sudah Sandar** (`is_tracking_active == false`).

### 4.2 Alur Penugasan Logistik & Pembukaan Akses Komunikasi
1. **Tahap 1 (Request Baru):**
   * **Kapal Nelayan A** membuat request (`pengangkut_id = NULL`, `status = 'MENUNGGU_ADMIN'`).
   * Middleware pesan hanya mengizinkan `sender_id == nelayan_id` atau `role == 'admin'` untuk membaca/mengirim pesan di `logistic_messages`.
2. **Tahap 2 (Assignment oleh Admin):**
   * **Admin** membuka detail request, memilih **Kapal Pengangkut B** dari dropdown (misal: *KMN YASING JAYA*), dan menekan tombol **"Tugaskan Pengangkut"**.
   * Database mengupdate `pengangkut_id = ID_KAPAL_PENGANGKUT_B` dan `status = 'DITUGASKAN_KE_PENGANGKUT'`.
3. **Tahap 3 (Komunikasi Terbuka):**
   * Karena `pengangkut_id` kini bernilai ID **Kapal Pengangkut B**, maka **Kapal Pengangkut B** otomatis melihat pesanan tersebut di menu *"Tugas Bawa Logistik"* miliknya dan dapat langsung mengirim pesan di ruang diskusi yang sama dengan **Kapal Nelayan A** serta **Admin**.

---

## 5. Rancangan Endpoint API / Server Actions

| Method | Endpoint / Action | Hak Akses (Role) | Deskripsi Fungsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trips` | Publik (Semua) | Mengambil semua daftar muatan gabus (bisa difilter per lokasi `Puma`/`Kalmas` & tanggal). |
| `GET` | `/api/trips/tracking-today` | Publik (Semua) | Mengambil daftar kapal pengangkut yang berangkat **hari ini** beserta titik koordinat GPS terakhirnya. |
| `POST` | `/api/trips` | `kapal_pengangkut`, `admin` | Membuat laporan keberangkatan baru beserta array daftar muatan gabus nelayan. |
| `PUT` | `/api/trips/[id]` | `kapal_pengangkut` (Milik sendiri), `admin` (Semua) | Mengubah data keberangkatan dan rincian gabus. |
| `DELETE` | `/api/trips/[id]` | `kapal_pengangkut` (Milik sendiri), `admin` (Semua) | Menghapus laporan keberangkatan. |
| `PATCH` | `/api/trips/[id]/location` | `kapal_pengangkut` (Milik sendiri), `admin` | Memperbarui `latitude`, `longitude`, `last_tracked_at`, atau mengubah status `is_tracking_active`. |
| `GET` | `/api/logistics` | `kapal_nelayan` (Milik sendiri), `kapal_pengangkut` (Yang ditugaskan), `admin` (Semua) | Mengambil daftar permintaan kebutuhan pokok sesuai hak akses masing-masing role. |
| `POST` | `/api/logistics` | `kapal_nelayan` | Membuat permintaan kebutuhan pokok baru ke Admin. |
| `PATCH` | `/api/logistics/[id]/assign` | `admin` | Menunjuk `pengangkut_id` untuk membawa logistik milik Kapal Nelayan A. |
| `POST` | `/api/logistics/[id]/messages` | `kapal_nelayan` (Pemilik), `kapal_pengangkut` (Ditugaskan), `admin` | Mengirim pesan koordinasi di dalam tiket permintaan logistik. |

---

## 6. Struktur Folder Proyek Next.js (App Router)

```text
parengge-kita/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Halaman Utama Publik (Peta Tracking Hari Ini + Rekap Gabus Puma & Kalmas)
│   │   ├── login/
│   │   │   └── page.tsx              # Halaman Login & Registrasi Kapal Nelayan / Pengangkut
│   │   ├── dashboard/
│   │   │   ├── pengangkut/
│   │   │   │   └── page.tsx          # Dashboard Kapal Pengangkut (CRUD Muatan Sendiri, GPS Sender, Tugas Logistik)
│   │   │   ├── nelayan/
│   │   │   │   └── page.tsx          # Dashboard Kapal Nelayan (Input Request Kebutuhan Pokok & Chat)
│   │   │   └── admin/
│   │   │       └── page.tsx          # Dashboard Admin (CRUD Semua Muatan, Assign Logistik ke Pengangkut)
│   │   └── api/                      # Route Handlers (Trips, Tracking, Logistics, Auth)
│   ├── components/
│   │   ├── LiveTrackingMap.tsx       # Komponen Peta Interaktif Kapal Hari Ini
│   │   ├── ManifestCard.tsx          # Kartu Tampilan Daftar Muatan Gabus (Format Puma & Kalmas)
│   │   ├── GeolocationWatcher.tsx    # Komponen Background Pengirim Lokasi GPS Kapal Pengangkut
│   │   └── LogisticChatModal.tsx     # Ruang Komunikasi Nelayan <-> Admin <-> Pengangkut
│   ├── lib/
│   │   ├── supabase.ts               # Koneksi Database
│   │   └── auth.ts                   # Helper Session & Pengecekan Role
│   └── types/
│       └── index.ts                  # Definisi Tipe Data TypeScript
├── package.json
└── tailwind.config.ts
```