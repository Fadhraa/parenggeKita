import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import WhatsAppSupportFAB from "@/components/WhatsAppSupportFAB";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Parengge Kita | Digitalisasi Rantai Pasok Nelayan Indonesia",
  description:
    "Platform digitalisasi rantai pasok hasil tangkapan nelayan Galesong Utara (Puma & Kalmas), pelacakan kapal pengangkut real-time, dan pemesanan logistik es balok & BBM dari darat ke laut.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-slate-50 text-slate-900 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <BottomNav />
        <WhatsAppSupportFAB />
      </body>
    </html>
  );
}
