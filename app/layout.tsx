"use client";

import { useState } from "react";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import RunningText from "@/components/layout/RunningText";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="id">
      <head>
        <title>Bantu Guru Yuk | Jadwal Pelajaran</title>
        <meta name="description" content="Aplikasi Manajemen Jadwal Pelajaran SMP/MTs" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#0ea5a0" />
      </head>
      <body className="antialiased">
        {/* Header - Sticky di atas */}
        <Header onMenuToggle={setSidebarOpen} />
        
        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto pb-16 lg:pb-10">
            {children}
          </main>
        </div>

        {/* Bottom Navigation (Mobile) */}
        <BottomNav />

        {/* Running Text - Bottom Ticker (Desktop) */}
        <div className="hidden lg:block">
          <RunningText
            messages={[
              "Generate jadwal otomatis",
              "Tanpa bentrok guru dan kelas",
              "Export ke JSON",
              "Lihat per guru atau per kelas",
            ]}
          />
        </div>
      </body>
    </html>
  );
}
