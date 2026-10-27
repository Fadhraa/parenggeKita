# Parengge Kita: Digitalisasi Rantai Pasok Hasil Tangkapan Nelayan Indonesia

Platform Web MVP untuk **Business Plan Competition (BPC) COOPFEST 2026** – Subtema *Digital Innovation & Technology*.
Dikembangkan oleh Tim **bismillahjadipengusaha** – Politeknik Elektronika Negeri Surabaya (PENS).

---

## 1. Latar Belakang & Nilai Tambah (Value Proposition BMC)
1. **Pencatatan Digital yang Familiar:** Mengubah sistem rekapitulasi muatan gabus yang sebelumnya manual via grup WhatsApp komunitas nelayan (Puma & Kalmas) ke dalam sistem digital tanpa mengubah kebiasaan nelayan.
2. **Pemantauan Kedatangan Real-Time (Live Tracking):** Pelacakan posisi kapal pengangkut yang berangkat hari ini menuju Tempat Pendaratan Ikan (TPI) Galesong Utara menggunakan titik koordinat GPS terverifikasi.
3. **Integrasi Dua Aliran Pendapatan (*Two-Way Revenue Stream*):** Mengakomodasi jasa pengangkutan ikan ke darat sekaligus jasa pengiriman logistik kebutuhan pokok (es balok, beras, BBM solar) dari darat ke laut.
4. **Koordinasi Tiga Arah:** Menghubungkan Kapal Nelayan, Admin TPI / Pengelola Koperasi, dan Kapal Pengangkut dalam satu ruang komunikasi terpadu.

---

## 2. Kredensial Akun Demo Pengujian (Demo Accounts)

Untuk mempermudah pengujian seluruh peran sistem saat penjurian:

| Peran (Role) | Nama Kapal / Entitas | Username | Password | Deskripsi Akses |
| :--- | :--- | :--- | :--- | :--- |
| **Admin TPI** | Kantor TPI Galesong Utara | `admin_galesong` | `password123` | Akses penuh CRUD seluruh manifest, dispatcher penugasan logistik. |
| **Kapal Pengangkut (Puma)** | KMN ⭐ NADITA | `kmn_nadita` | `password123` | Kirim koordinat GPS kapal hari ini, kelola muatan gabus sendiri, bawa tugas logistik. |
| **Kapal Pengangkut (Kalmas)**| KMN YASING JAYA | `kmn_yasing` | `password123` | Transporter rute Kalmas, pelacakan GPS, dan tugas logistik. |
| **Kapal Nelayan (Puma)** | Tinggi Moncong Mb | `tinggi_moncong` | `password123` | Notifikasi otomatis ikan dibawa, pesan kebutuhan pokok es/beras, chat koordinasi. |
| **Kapal Nelayan (Kalmas)** | Tabbing DTB | `tabbing_dtb` | `password123` | Nelayan area Kalmas, pemesanan logistik laut. |

---

## 3. Fitur Utama

- **Peta Interaktif Live Tracking:** Menampilkan posisi kapal pengangkut yang berlayar hari ini beserta estimasi jam OTW dan status pendaratan di TPI Galesong Utara.
- **Rekapitulasi Muatan Gabus Komunitas:** Desain kartu sesuai format teks WA nelayan, fitur *expand/collapse*, dan tombol **"Salin Format WhatsApp"** (1-klik copy teks untuk disebarkan ke grup nelayan).
- **Preset Pesanan Logistik Cepat:** Pilihan 1-klik untuk Es Balok, Beras, Solar/BBM, dan Air Bersih.
- **Dispatcher & Ruang Koordinasi:** Admin menugaskan kapal pengangkut yang searah untuk membawa pesanan logistik nelayan, membuka ruang chat 3 arah.
- **Bantuan WhatsApp Terintegrasi:** Tombol melayang di setiap halaman untuk bantuan instan pengelola koperasi/TPI.

---

## 4. Cara Menjalankan Proyek Secara Lokal

1. **Pastikan Dependensi Terpasang:**
   ```bash
   npm install
   ```

2. **Jalankan Server Pengembangan (Dev Server):**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

3. **Membangun Bundle Produksi:**
   ```bash
   npm run build
   ```
