# Palet Warna Resmi (Default Color Palette)
## Platform Parengge Kita – Web Platform MVP (BPC COOPFEST 2026)

Dokumen ini mendefinisikan palet warna default yang aktif digunakan pada seluruh antarmuka web platform **Parengge Kita**. Palet ini dirancang khusus untuk memenuhi standar ergonomi maritim dan aturan performa tinggi: kontras optimal di bawah terik matahari laut, ramah mata, dan elegan.

---

### 1. Palet Warna Utama (Core Maritime Default)

| Token Warna | Nama Warna | Kode Hex | Kelas Tailwind | Peran & Penggunaan Komponen |
| :--- | :--- | :--- | :--- | :--- |
| **`maritime-navy`** | Deep Maritime Navy | `#0A2E4D` | `bg-[#0A2E4D]` / `text-[#0A2E4D]` | Top Navbar, Hero Banner background, Top bar kartu manifest, modal header, dan tombol aksi Admin. |
| **`maritime-dark`** | Dark Harbor Navy | `#061A2B` | `bg-[#061A2B]` / `bg-slate-900` | Footer bar mobile (`BottomNav`), kontras tinggi navigasi malam hari. |
| **`maritime-ocean`** | Galesong Ocean Blue | `#0284C7` | `bg-sky-600` / `border-sky-600` | Tombol CTA utama (Tambah Laporan, Pesan Logistik), border marker kapal Leaflet. |
| **`maritime-sky`** | Bright Sky Blue | `#38BDF8` | `text-sky-400` / `bg-sky-500` | Aksen aktif navigasi, ikon navigasi live tracking, badge "Area Puma", angka total gabus. |
| **`maritime-ice`** | Ice Block Cyan | `#E0F2FE` | `bg-sky-50` / `bg-cyan-50` | Latar kartu rincian muatan gabus, badge es balok logistik, tag tiket koordinasi. |
| **`maritime-seafoam`** | Seafoam White | `#F8FAFC` | `bg-slate-50` / `bg-[#f8fafc]` | **Latar belakang canvas utama aplikasi**, menggantikan abu-abu pekat agar nyaman di bawah terik matahari. |

---

### 2. Warna Semantik & Aksen Fungsional (Status & Utility)

| Kategori | Nama Warna | Kode Hex | Kelas Tailwind | Penerapan |
| :--- | :--- | :--- | :--- | :--- |
| **Harbor / Success** | Harbor Safe Green | `#059669` / `#10B981` | `bg-emerald-600` / `bg-emerald-50` | Tombol mengambang WhatsApp Bantuan (`WhatsAppSupportFAB`), status "Sedang Berlayar", tombol konfirmasi serah terima logistik. |
| **Kalmas / Warning** | Traditional Hull Amber | `#F59E0B` / `#D97706` | `bg-amber-500` / `bg-amber-50` | Badge lokasi "Area Kalmas", status tiket "Menunggu Admin", total muatan masuk. |
| **Danger / Alert** | Signal Flare Red | `#DC2626` | `bg-red-600` / `bg-red-50` | Tombol hapus laporan manifest, peringatan izin GPS tidak aktif. |
| **Text Primary** | Deep Slate 900 | `#0F172A` | `text-slate-900` | Judul heading, nama kapal, rincian nelayan kontras tinggi. |
| **Text Muted** | Slate 500 / 600 | `#64748B` | `text-slate-500` / `text-slate-600` | Tanggal keberangkatan, nama juragan, keterangan rute. |

---

### 3. Konfigurasi CSS Variables & Tailwind Tokens

```css
:root {
  --maritime-navy: #0A2E4D;
  --maritime-dark: #061A2B;
  --maritime-ocean: #0284C7;
  --maritime-sky: #38BDF8;
  --maritime-ice: #E0F2FE;
  --maritime-seafoam: #F8FAFC;
  --foreground-rgb: 15, 23, 42;
  --background-rgb: 248, 250, 252;
}
```

Terdaftar dalam [tailwind.config.ts](file:///d:/Lomba/BMC%20Ainull/tailwind.config.ts):
```ts
colors: {
  maritime: {
    navy: "#0A2E4D",
    dark: "#061A2B",
    ocean: "#0284C7",
    sky: "#38BDF8",
    ice: "#E0F2FE",
    seafoam: "#F8FAFC",
  },
}
```

---

### 4. Lampiran Skala Turunan (Extended Palette Scale Reference)

Berikut skala 50–950 sebagai referensi turunan shading UI:

```css
/* Azure Mist Scale */
--color-azure-mist-50: #ebf7fa;
--color-azure-mist-100: #d6eef5;
--color-azure-mist-200: #aeddea;
--color-azure-mist-300: #85cce0;
--color-azure-mist-400: #5dbbd5;
--color-azure-mist-500: #34aacb;
--color-azure-mist-600: #2a88a2;
--color-azure-mist-700: #1f667a;
--color-azure-mist-800: #154451;
--color-azure-mist-900: #0a2229;
--color-azure-mist-950: #07181c;

/* Pale Sky Scale */
--color-pale-sky-50: #edf4f7;
--color-pale-sky-100: #dceaef;
--color-pale-sky-200: #b9d4df;
--color-pale-sky-300: #95bfd0;
--color-pale-sky-400: #72aac0;
--color-pale-sky-500: #4f94b0;
--color-pale-sky-600: #3f778d;
--color-pale-sky-700: #2f596a;
--color-pale-sky-800: #203b46;
--color-pale-sky-900: #101e23;
--color-pale-sky-950: #0b1519;

/* Baltic Blue Scale */
--color-baltic-blue-50: #e7f5fe;
--color-baltic-blue-100: #cfebfc;
--color-baltic-blue-200: #9ed7fa;
--color-baltic-blue-300: #6ec3f7;
--color-baltic-blue-400: #3daef5;
--color-baltic-blue-500: #0d9af2;
--color-baltic-blue-600: #0a7bc2;
--color-baltic-blue-700: #085d91;
--color-baltic-blue-800: #053e61;
--color-baltic-blue-900: #031f30;
--color-baltic-blue-950: #021622;

/* Platinum Scale */
--color-platinum-50: #eff5f3;
--color-platinum-100: #dfece7;
--color-platinum-200: #c0d8ce;
--color-platinum-300: #a0c5b6;
--color-platinum-400: #81b19e;
--color-platinum-500: #619e86;
--color-platinum-600: #4e7e6b;
--color-platinum-700: #3a5f50;
--color-platinum-800: #273f35;
--color-platinum-900: #13201b;
--color-platinum-950: #0e1613;

/* Light Blue Scale */
--color-light-blue-50: #e8f7fd;
--color-light-blue-100: #d0effb;
--color-light-blue-200: #a2def6;
--color-light-blue-300: #73cef2;
--color-light-blue-400: #44beee;
--color-light-blue-500: #16ade9;
--color-light-blue-600: #118bbb;
--color-light-blue-700: #0d688c;
--color-light-blue-800: #09455d;
--color-light-blue-900: #04232f;
--color-light-blue-950: #031821;
```
