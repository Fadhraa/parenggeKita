# Dokumentasi Desain UI/UX & Design System (DESIGN.md)
## Parengge Kita: Digitalisasi Rantai Pasok Hasil Tangkapan Nelayan Indonesia

| Informasi Dokumen | Detail |
| :--- | :--- |
| **Nama Produk** | Parengge Kita (Web Platform MVP) |
| **Tim Pengembang** | bismillahjadipengusaha – Politeknik Elektronika Negeri Surabaya (PENS) |
| **Referensi Visual Utama** | Poster Business Model Canvas (BMC) Parengge Kita & Prinsip Ergonomi Lapangan Nelayan |
| **Target Perangkat Utama** | *Mobile-First* (Smartphone Android Nelayan & Kapten Kapal) & Desktop (Admin TPI) |

---

## 1. Filosofi Desain Berbasis BMC (BMC-Driven Design Principles)

Seluruh keputusan antarmuka pengguna (*User Interface*) dan pengalaman pengguna (*User Experience*) diturunkan langsung dari elemen **Business Model Canvas (BMC) Parengge Kita**:

1. **Familiaritas Format Komunitas (*Value Proposition: "Kemudahan penerapan dengan mengikuti sistem yang sudah dikenal nelayan"*):**
   * Desain kartu laporan muatan tidak menggunakan tabel akuntansi yang rumit, melainkan mengadopsi tata letak pesan berantai grup WhatsApp komunitas nelayan (Header Lokasi Puma/Kalmas $\rightarrow$ Nama Kapal & Juragan $\rightarrow$ Daftar Nomor Urut Gabus $\rightarrow$ Total Gabus & Jam OTW).
2. **Keterbacaan di Bawah Sinar Matahari Laut (*Customer Segments: "Kapten kapal nelayan & pengangkut di Galesong Utara"*):**
   * Nelayan mengoperasikan layar HP di atas kapal dengan pantulan cahaya matahari yang terik dan tangan yang basah/sibuk. Desain wajib menggunakan **kontras tinggi (High Contrast)**, ukuran teks besar, dan tinggi tombol sentuh minimal `48px`.
3. **Transparansi Dua Aliran Pendapatan (*Revenue Streams: "Jasa pengangkutan ikan & pengiriman logistik es balok"*):**
   * Antarmuka memisahkan secara jelas warna dan ikon antara aktivitas **Hilir (Angkut Ikan/Gabus ke TPI)** dan aktivitas **Hulu (Kirim Logistik Es Balok/Beras ke Laut)**.
4. **Pendampingan & Bantuan Cepat (*Customer Relationships: "Layanan bantuan melalui WhatsApp"*):**
   * Menyediakan tombol mengambang (*Floating Action Button*) bantuan WhatsApp Pengelola/Koperasi di setiap halaman bagi nelayan yang membutuhkan panduan langsung.

---

## 2. Identitas Visual & Palet Warna (Color Palette)

Palet warna diekstraksi langsung dari tema visual maritim pada poster BMC **Parengge Kita**:

| Kategori Warna | Nama Warna | Kode Hex | Kelas Tailwind | Penggunaan pada Komponen UI |
| :--- | :--- | :--- | :--- | :--- |
| **Primary (Brand)** | Deep Maritime Navy | `#0A2E4D` | `bg-[#0A2E4D]` / `bg-slate-900` | Header utama, Navigasi, Judul Kartu BMC, Tombol Utama Admin. |
| **Secondary (Ocean)** | Galesong Ocean Blue | `#0284C7` | `bg-sky-600` | Tombol aksi utama (Tambah Muatan, Kirim Request), Header Kartu Kapal. |
| **Accent (Ice / Logistik)** | Ice Block Cyan | `#E0F2FE` | `bg-sky-100` | Latar kartu Request Logistik (Es Balok), *Badge* lokasi **Puma** & **Kalmas**. |
| **Accent (Vessel / Gold)** | Traditional Hull Amber | `#D97706` | `bg-amber-600` | *Badge* status "Sedang OTW", Ikon Bintang Kapal (`KMN ⭐ NADITA`), Peringatan. |
| **Semantic Success** | Harbor Safe Green | `#16A34A` | `bg-emerald-600` | Status "Sudah Sandar", Indikator GPS Aktif (Live Tracking), Tombol Selesai. |
| **Semantic Danger** | Signal Flare Red | `#DC2626` | `bg-red-600` | Tombol Hapus Data, Indikator GPS Mati / Sinyal Terputus. |
| **Background Neutral** | Seafoam White | `#F8FAFC` | `bg-slate-50` | Latar belakang utama halaman agar mata tidak cepat lelah di bawah terik matahari. |

---

## 3. Tipografi & Ikonografi (Typography & Iconography)

### 3.1 Tipografi
Menggunakan font *sans-serif* yang tegas dan mudah dibaca di layar resolusi rendah maupun tinggi:
* **Font Utama (Heading & Body):** `Plus Jakarta Sans` atau `Inter` (Google Fonts).
* **Font Angka & Muatan Gabus:** `JetBrains Mono` atau `tabular-nums` agar deretan angka jumlah gabus (`14 G`, `206 Gabus`) sejajar lurus secara vertikal dan mudah dijumlahkan secara visual.
* **Skala Ukuran Teks:**
  * Judul Halaman: `24px` (`text-2xl font-extrabold`)
  * Nama Kapal Pengangkut: `18px` (`text-lg font-bold uppercase`)
  * Daftar Rincian Muatan Nelayan: `16px` (`text-base font-medium`) — *tidak boleh lebih kecil dari 14px agar mudah dibaca juragan kapal*.

### 3.2 Ikonografi (Lucide Icons)
Setiap fitur wajib didampingi ikon visual untuk membantu nelayan mengenali menu dengan cepat:
* 🚢 `Ship` / `Anchor`: Identitas Kapal Pengangkut & Status Sandar.
* 📦 `Package` / `Box`: Satuan Muatan Gabus (`G`).
* 🧊 `Snowflake` / `ShoppingBag`: Permintaan Logistik (Es Balok, Beras, BBM).
* 📍 `MapPin` / `Navigation`: Lokasi Tangkap (**Puma** / **Kalmas**) & Pelacakan GPS.
* 💬 `MessageCircle`: Ruang Komunikasi (Nelayan $\leftrightarrow$ Admin $\leftrightarrow$ Pengangkut).

---

## 4. Desain Komponen Utama (Core UI Components)

### 4.1 Kartu Rekap Muatan Gabus (`ManifestCard`)
Mengadaptasi persis struktur laporan teks nelayan ke dalam komponen kartu digital:

```text
+-------------------------------------------------------------------+
| [📍 LOKASI: PUMA]                        [🟢 OTW Jam 14:00 Puma]  |
|                                                                   |
| 🚢 KMN ⭐ NADITA                                                  |
| 👨‍✈️ Juragan: Jrg Pak Kambong                                       |
| 📅 Jumat, 16-10-2026                                              |
|-------------------------------------------------------------------|
| DAFTAR MUATAN NELAYAN:                                            |
|  1. Tinggi Moncong Mb ................................. [ 14 G ]  |
|  2. Pak Ridho DPR ..................................... [ 11 G ]  |
|  3. Dua Putra DNB ..................................... [ 21 G ]  |
|-------------------------------------------------------------------|
| 📦 JUMLAH MUATAN TOTAL:                                46 GABUS   |
|-------------------------------------------------------------------|
| [ ✏️ Edit Muatan ]  [ 🗑️ Hapus ]   *(Hanya muncul bagi Pemilik/Admin)* |
+-------------------------------------------------------------------+
```

### 4.2 Komponen Peta Tracking Hari Ini (`LiveTrackingMap`)
* Ditampilkan paling atas pada **Halaman Utama (Publik/User)**.
* Memiliki *Header Bar* bertuliskan: **"🔴 LIVE TRACKING KAPAL PENGANGKUT HARI INI"**.
* Menampilkan wilayah perairan **Puma**, **Kalmas**, hingga **TPI Galesong Utara**.
* **Marker Kapal Interaktif:**
  * Jika diklik oleh pengunjung atau pembeli ikan di darat, akan menampilkan balon informasi:
    * Nama Kapal: `KMN YASING JAYA`
    * Asal Muat: `Kalmas` | Total Bawaan: `206 Gabus`
    * Status: `OTW jam 12:00 waktu Kalmas`
    * Update GPS Terakhir: `Baru saja (Aktif)`

### 4.3 Tiket Logistik & Ruang Komunikasi Terkunci (`LogisticTicketCard`)
Visualisasi alur penugasan logistik 3 pihak (Kapal Nelayan A $\rightarrow$ Admin $\rightarrow$ Kapal Pengangkut B):

```text
+-------------------------------------------------------------------+
| 🧊 REQUEST LOGISTIK #LOG-012          [Status: DITUGASKAN PENGANGKUT] |
| Pemesan : Kapal Nelayan "Tinggi Moncong Mb" (Lokasi: Puma)        |
| Barang  : • Es Balok = 25 Batang                                  |
|           • Beras = 2 Karung (50kg)                               |
|-------------------------------------------------------------------|
| 🚢 DIBAWA OLEH KAPAL PENGANGKUT:                                  |
|    👉 KMN ⭐ NADITA (Jrg Pak Kambong)                             |
|-------------------------------------------------------------------|
| 💬 RUANG KOMUNIKASI TERBUKA (Nelayan A <-> Admin <-> Pengangkut B):|
|  [Nelayan - Tinggi Moncong]: "Admin, es balok butuh besok siang." |
|  [Admin TPI]: "Siap, sudah dititipkan ke KMN NADITA ya."          |
|  [Pengangkut - KMN NADITA]: "Siap, posisi kami OTW Puma jam 14."  |
|                                                                   |
|  [ Ketik pesan koordinasi titik temu...            ] [ Kirim ➤ ]  |
+-------------------------------------------------------------------+
```

---

## 5. Wireframe & Tata Letak per Halaman (Screen Wireframes)

### 5.1 Halaman Utama Publik (`/` - Role: User Tanpa Login)
Dirancang untuk pembeli ikan, pemilik kapal di darat, dan masyarakat TPI:
1. **Top Navbar:** Logo *Parengge Kita*, Slogan *"Bersama Parengge Kita Memajukan Maritim Kita"*, dan Tombol **[Masuk / Daftar Kapal]**.
2. **Hero Section (Peta Live Tracking):** Peta interaktif yang memantau posisi kapal pengangkut yang berangkat **hari ini** beserta filter cepat (`Semua Lokasi`, `Puma`, `Kalmas`).
3. **Filter & Pencarian Cepat:** Kolom pencarian *"Cari nama kapal nelayan (misal: Tinggi Moncong, Tabbing DTB)..."* agar nelayan/bos darat bisa langsung tahu ikannya dibawa oleh kapal pengangkut yang mana.
4. **Grid Daftar Muatan Kapal Pengangkut:** Deretan kartu `ManifestCard` untuk keberangkatan dari **Puma** dan **Kalmas**.

### 5.2 Dashboard Kapal Pengangkut (`/dashboard/pengangkut`)
Dirancang sangat simpel dengan 2 Tab besar di bagian atas:
* **Banner Status GPS (Paling Atas):**
  * Indikator aktif: *"📡 Lokasi GPS Kapal Anda Sedang Dibagikan ke Halaman Utama"* + Tombol besar warna hijau **[⚓ Klik Jika Sudah Sandar di TPI]**.
* **Tab 1: Rekap Muatan Ikan Saya (CRUD Milik Sendiri):**
  * Tombol besar **[+ Buat Laporan Muatan Baru]**.
  * Form Input: Dropdown Lokasi (`Puma` / `Kalmas`), Jam OTW, dan daftar dinamis pilih Nama Kapal Nelayan + Jumlah Gabus (`G`).
* **Tab 2: Tugas Bawa Logistik (Dari Admin):**
  * Menampilkan daftar kebutuhan pokok milik Kapal Nelayan yang ditugaskan oleh Admin kepada kapal pengangkut ini, lengkap dengan tombol **[Buka Chat dengan Kapal Nelayan]**.

### 5.3 Dashboard Kapal Nelayan (`/dashboard/nelayan`)
* **Kartu Info Muatan Saya:** Menampilkan pemberitahuan otomatis jika nama kapal nelayan tersebut tercantum di dalam muatan salah satu kapal pengangkut hari ini (contoh: *"Ikan Anda sebanyak 14 Gabus sedang dibawa oleh KMN ⭐ NADITA"*).
* **Form Request Kebutuhan Pokok:** Input pilih lokasi penjemputan (`Puma` / `Kalmas`), daftar barang (Es Balok, Beras, Solar, dll), dan tombol kirim ke Admin.
* **Daftar Pesanan & Ruang Komunikasi:** Melihat status pesanan apakah masih `Menunggu Admin` atau sudah `Dibawa oleh Kapal Pengangkut B` (di mana tombol chat dengan Kapal Pengangkut B langsung aktif).

### 5.4 Dashboard Admin Pengelola (`/dashboard/admin`)
* **Panel Kontrol Statistik:** Total Gabus Hari Ini (Puma vs Kalmas), Jumlah Kapal Pengangkut OTW Hari Ini, dan Jumlah Request Logistik Baru.
* **Tab Manajemen Semua Muatan (Full CRUD):** Tabel dan kartu seluruh kapal pengangkut dengan akses penuh untuk mengedit atau menghapus data jika ada kesalahan input dari kapten kapal.
* **Tab Dispatcher Logistik:** Daftar request dari Kapal Nelayan dengan *Dropdown Assignment* **"Pilih Kapal Pengangkut Pembawa Barang"** untuk menghubungkan Kapal Nelayan A dengan Kapal Pengangkut B.

---

## 6. Panduan Lampiran Proposal COOPFEST 2026 (BAB II)
Saat menyusun **BAB II Pembahasan (Prototype/Mockup/Wireframe)** pada dokumen proposal lomba:
1. Cantumkan **Palet Warna & Filosofi Ergonomi Nelayan** dari Bagian 1 dan 2 dokumen ini sebagai alasan ilmiah pemilihan desain.
2. Tampilkan *screenshot* dari:
   * **Halaman Utama (Peta Tracking + Rekap Gabus Puma & Kalmas)** sebagai bukti transparansi rantai pasok.
   * **Form Input Muatan Kapal Pengangkut** sebagai bukti digitalisasi pencatatan gabus.
   * **Tiket Penugasan Logistik & Chat 3 Pihak** sebagai bukti integrasi *Revenue Stream* pengiriman kebutuhan pokok (es balok).