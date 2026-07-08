import { Suspense } from "react";
import { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AnalyticsRouteTracker from "@/components/AnalyticsRouteTracker";

export const metadata: Metadata = {
  title: "Bantu Guru Yuk | Jadwal Pelajaran",
  description: "Aplikasi Manajemen Jadwal Pelajaran SMP/MTs - Generate jadwal otomatis tanpa bentrok",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "any" },
      { url: "/icon.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  themeColor: "#0ea5a0",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <AnalyticsRouteTracker />
        </Suspense>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
