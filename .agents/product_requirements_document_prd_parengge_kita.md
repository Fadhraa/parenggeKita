# Product Requirements Document (PRD)
## Parengge Kita: Digitalisasi Rantai Pasok Hasil Tangkapan Nelayan Indonesia

| Informasi Dokumen | Detail |
| :--- | :--- |
| **Nama Produk** | Parengge Kita (Web Platform MVP) |
| **Tim Pengembang** | bismillahjadipengusaha – Politeknik Elektronika Negeri Surabaya (PENS) |
| **Kompetisi / Konteks** | Business Plan Competition (BPC) COOPFEST 2026 |
| **Subtema** | Digital Innovation & Technology |
| **Target Lokasi Awal** | TPI Galesong Utara, Area Tangkap Puma & Kalmas |
| **Status Dokumen** | Final MVP Specification (v1.0) |

---

## 1. Latar Belakang & Tujuan Produk (Product Overview)
**Parengge Kita** adalah platform web digitalisasi rantai pasok perikanan yang menghubungkan kapal nelayan penangkap ikan, kapal pengangkut (kapal ongkir), pengelola Tempat Pendaratan Ikan (TPI)/Admin Koperasi, serta pembeli ikan di daratan. 

Pada tahap awal (MVP), aplikasi ini mengadopsi sistem pencatatan muatan gabus yang sudah dikenal oleh komunitas nelayan (sebelumnya manual via teks grup WhatsApp) ke dalam sistem terpusat yang transparan, dilengkapi dengan **pelacakan lokasi kapal pengangkut secara real-time** dan **sistem pemesanan logistik kebutuhan pokok (es balok, beras, BBM) dari darat ke laut**.

### 1.1 Value Propositions (Sesuai BMC)
1. **Pencatatan Digital yang Familiar:** Mengubah format laporan daftar muatan gabus (Puma & Kalmas) menjadi rekapitulasi digital otomatis tanpa mengubah kebiasaan nelayan.
2. **Pemantauan Kedatangan Real-Time:** Pelacakan posisi kapal pengangkut yang berangkat pada hari tersebut langsung dari halaman utama menggunakan GPS perangkat.
3. **Integrasi Dua Arah (Ikan & Logistik):** Mengakomodasi dua aliran pendapatan (*Revenue Streams*), yaitu jasa pengangkutan ikan ke darat dan jasa pengiriman logistik/kebutuhan pokok ke laut.
4. **Komunikasi Terkoordinasi:** Menghubungkan Kapal Nelayan, Admin Pengelola, dan Kapal Pengangkut dalam satu alur penugasan yang jelas.

---

## 2. Daftar Peran Pengguna (User Roles & Access Matrix)

Sistem memiliki **4 Role Pengguna** dengan pembagian hak akses sebagai berikut:

| Fitur / Modul | User (Publik / Tanpa Login) | Kapal Nelayan (Login) | Kapal Pengangkut (Login) | Admin Pengelola (Login) |
| :--- | :---: | :---: | :---: | :---: |
| Melihat Peta Tracking Kapal Hari Ini | ✅ (Read-Only) | ✅ (Read-Only) | ✅ (Read-Only) | ✅ (Full Access) |
| Melihat Daftar Rekap Muatan Gabus | ✅ (Read-Only) | ✅ (Read-Only) | ✅ (Read-Only) | ✅ (Full Access) |
| CRUD Laporan Muatan Gabus | ❌ | ❌ | ✅ (Hanya Kapal Sendiri) | ✅ (Semua Kapal) |
| Mengirim Lokasi GPS Real-Time | ❌ | ❌ | ✅ (Khusus Jadwal Hari Ini) | ✅ (Bisa Simulasi) |
| Membuat Request Logistik (Es, Beras, dll) | ❌ | ✅ (Milik Sendiri) | ❌ | ✅ (Semua Request) |
| Menugaskan Pengangkut untuk Logistik | ❌ | ❌ | ❌ | ✅ (Dispatcher) |
| Ruang Komunikasi Request Logistik | ❌ | ✅ (Dengan Admin & Pengangkut Terpilih) | ✅ (Dengan Admin & Nelayan yang Ditugaskan) | ✅ (Dengan Semua Pihak) |

---

## 3. Spesifikasi Fitur Fungsional (Functional Requirements)

### 3.1 Modul Autentikasi & Registrasi (`FR-AUTH`)
* **FR-AUTH-01 (Registrasi Mandiri):** Pengguna dapat mendaftar dengan memilih role sebagai **Kapal Nelayan** atau **Kapal Pengangkut** (Role Admin dibuat melalui *seeder* database).
* **FR-AUTH-02 (Identitas Kapal):**
  * Saat registrasi **Kapal Nelayan**, pengguna wajib mengisi `Nama Kapal Nelayan` (contoh: *Tinggi Moncong Mb*, *Pak Ridho DPR*, *Tabbing DTB*), `Nama Juragan/Kapten`, `Lokasi Operasi Utama` (*Puma* / *Kalmas*), dan `Nomor WhatsApp`.
  * Saat registrasi **Kapal Pengangkut**, pengguna wajib mengisi `Nama Kapal Pengangkut` (contoh: *KMN ⭐ NADITA*, *KMN YASING JAYA*), `Nama Juragan` (contoh: *Jrg Pak Kambong*, *Jrg Dg Sutte*), dan `Nomor WhatsApp`.
* **FR-AUTH-03 (Izin Geolocation saat Login):** Ketika pengguna dengan role **Kapal Pengangkut** berhasil login, sistem otomatis meminta izin akses lokasi browser (`navigator.geolocation`) dan memeriksa apakah kapal tersebut memiliki jadwal keberangkatan aktif pada hari ini.

---

### 3.2 Modul Rekapitulasi Muatan Ikan / Gabus (`FR-MANIFEST`)
Mengakomodasi pencatatan muatan gabus sesuai standar laporan komunitas nelayan Puma & Kalmas:
* **FR-MANIFEST-01 (Header Laporan Keberangkatan):**
  * **Lokasi Muat:** Pilihan *Dropdown* tetap: `Puma` atau `Kalmas`.
  * **Nama Kapal Pengangkut & Juragan:** Terisi otomatis dari profil akun Kapal Pengangkut yang sedang login (atau dipilih dari dropdown jika diinput oleh Admin).
  * **Tanggal Keberangkatan:** Input tanggal (contoh: *Jumat, 16-10-2026*).
  * **Jam OTW & Zona Waktu:** Input jam berangkat (contoh: *14:00*) dengan label otomatis mengikuti lokasi (`Waktu Puma` atau `Waktu Kalmas`).
* **FR-MANIFEST-02 (Daftar Rincian Muatan Nelayan):**
  * Kapal Pengangkut dapat menekan tombol **"+ Tambah Muatan Nelayan"**.
  * Nama kapal nelayan dipilih melalui *Dropdown Searchable* yang mengambil data dari akun **Kapal Nelayan** yang sudah terdaftar di sistem (sehingga tidak perlu ketik manual dan mencegah salah ketik).
  * Memasukkan jumlah **Gabus (G)** dalam angka bulat positif (contoh: `14` G).
* **FR-MANIFEST-03 (Kalkulasi Otomatis):** Sistem menjumlahkan total seluruh gabus (`Jumlah Muatan = XX Gabus`) secara otomatis setiap kali ada penambahan/perubahan baris muatan.
* **FR-MANIFEST-04 (Pembatasan Hak Akses CRUD):**
  * **Kapal Pengangkut** hanya dapat melihat, menambah, mengedit, dan menghapus (CRUD) data keberangkatan dan muatan milik kapalnya sendiri.
  * **Admin** dapat melakukan CRUD terhadap seluruh laporan dari semua kapal pengangkut.
  * **User (Publik)** dapat melihat seluruh daftar laporan di halaman utama tanpa perlu login, dilengkapi filter berdasarkan lokasi (`Semua`, `Puma`, `Kalmas`), tanggal, dan pencarian nama kapal nelayan.

---

### 3.3 Modul Pelacakan Kapal Pengangkut Hari Ini (`FR-TRACKING`)
* **FR-TRACKING-01 (Kriteria Kapal yang Dilacak):** Sistem hanya melacak dan menampilkan titik lokasi kapal pengangkut di peta halaman utama apabila:
  1. Pengguna memiliki role `kapal_pengangkut`.
  2. Memiliki laporan keberangkatan dengan `tanggal_berangkat == HARI_INI`.
  3. Status perjalanan masih aktif (`is_tracking_active == true` / belum menekan tombol "Sudah Sandar").
* **FR-TRACKING-02 (Pengiriman Koordinat Real-Time):**
  * Selama Kapal Pengangkut membuka dashboard pada hari keberangkatan, browser mengirimkan koordinat `latitude` dan `longitude` secara berkala (setiap 10–15 detik atau saat posisi berubah) ke server.
  * Sistem menyimpan koordinat terakhir beserta waktu pembaruan (`last_tracked_at`) agar posisi terakhir tetap terlihat di peta meskipun sinyal kapal di laut sempat terputus.
* **FR-TRACKING-03 (Tombol "Sudah Sandar / Selesai"):**
  * Kapal Pengangkut (dan Admin) memiliki tombol **"Sudah Sandar di TPI"**. Ketika ditekan, pengiriman lokasi GPS dihentikan dan status kapal berubah menjadi `Sudah Sandar`.
* **FR-TRACKING-04 (Mode Simulasi Laut untuk Demo):**
  * Tersedia fitur penggeser koordinat / tombol simulasi rute laut (Puma/Kalmas menuju TPI Galesong Utara) pada dashboard agar tim dapat mendemokan pergerakan kapal di atas perairan secara realistis saat presentasi lomba.
* **FR-TRACKING-05 (Peta Interaktif Halaman Utama):**
  * Halaman utama menampilkan peta interaktif dengan marker kapal (🚢). Ketika marker diklik, muncul *pop-up* berisi: Nama Kapal Pengangkut, Juragan, Lokasi Muat (Puma/Kalmas), Jam OTW, Total Gabus, dan waktu terakhir lokasi diperbarui.

---

### 3.4 Modul Permintaan Logistik & Komunikasi (`FR-LOGISTIC`)
Mengakomodasi pemesanan kebutuhan pokok dari lokasi penangkapan ikan ke daratan:
* **FR-LOGISTIC-01 (Input Request oleh Kapal Nelayan):**
  * Kapal Nelayan yang login dapat membuat pesanan kebutuhan pokok (contoh: *Es Balok 20 Batang, Beras 2 Karung, Solar 3 Jerigen*).
  * Form berisi: Lokasi Tujuan (`Puma` / `Kalmas`), Daftar Barang & Jumlah, serta Catatan Tambahan.
  * Status awal pesanan adalah `MENUNGGU_ADMIN`.
* **FR-LOGISTIC-02 (Komunikasi Tahap 1 – Nelayan & Admin):**
  * Saat status masih `MENUNGGU_ADMIN`, permintaan dan ruang *chat*/komunikasi di dalamnya **hanya dapat dilihat dan diakses oleh Kapal Nelayan pemesan dan Admin**.
* **FR-LOGISTIC-03 (Penugasan Kapal Pengangkut oleh Admin):**
  * Admin memeriksa pesanan dari Kapal Nelayan A, lalu memilih **Kapal Pengangkut B** dari dropdown (misal: *KMN YASING JAYA* yang akan berangkat ke Kalmas) untuk membawa logistik tersebut.
  * Setelah disimpan oleh Admin, status pesanan berubah menjadi `DITUGASKAN_KE_PENGANGKUT`.
* **FR-LOGISTIC-04 (Komunikasi Tahap 2 – Terbukanya Akses Kapal Pengangkut B & Nelayan A):**
  * Begitu Admin menugaskan Kapal Pengangkut B pada pesanan Kapal Nelayan A, pesanan tersebut otomatis muncul di dashboard **Kapal Pengangkut B**.
  * Ruang komunikasi/pesan pada pesanan tersebut kini terbuka untuk **Kapal Nelayan A, Kapal Pengangkut B, dan Admin**, sehingga Kapal Pengangkut B dan Kapal Nelayan A dapat saling berkoordinasi titik temu di laut.
  * Setelah barang diserahkan di laut, Kapal Pengangkut B atau Admin dapat mengubah status menjadi `SELESAI`.

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)
1. **Desain Mobile-First & Kontras Tinggi:** Mengingat nelayan dan kapten kapal pengangkut mengakses website melalui layar smartphone di bawah terik matahari laut, antarmuka wajib menggunakan tombol berukuran besar, teks yang jelas, dan kontras warna yang tegas.
2. **Toleransi Koneksi Rendah:** Menyimpan *timestamp* lokasi terakhir (`last_tracked_at`) sehingga halaman publik tetap informatif walaupun kapal sedang melewati area minim sinyal.
3. **Keamanan Data (Row-Level Security):** Memastikan API memvalidasi `user_id` dan `role` pada setiap aksi tulis/ubah/hapus agar Kapal Pengangkut A mutlak tidak bisa mengubah muatan Kapal Pengangkut B.