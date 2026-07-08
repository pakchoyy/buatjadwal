"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RunningText from "@/components/layout/RunningText";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync state across multiple tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Reload page when data changes in another tab
      if (e.key && e.key.startsWith("jadwal_")) {
        window.location.reload();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <>
      {/* Header - Sticky di atas */}
      <Header
        isMenuOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-10">{children}</main>
      </div>

      {/* Running Text - Bottom Ticker */}
      <RunningText
        messages={[
          "Generate jadwal otomatis",
          "Tanpa bentrok guru dan kelas",
          "Export PDF dan Excel",
          "Lihat per guru atau per kelas",
        ]}
      />
    </>
  );
}
