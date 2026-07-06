/**
 * Header Component - Top header dengan branding BGY dan hamburger menu
 */

"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import HamburgerMenu from "./HamburgerMenu";
import TentangModal from "./TentangModal";
import KontakModal from "./KontakModal";
import { Moon, Sun } from "lucide-react";

interface HeaderProps {
  title?: string;
  actions?: React.ReactNode;
  onMenuToggle?: (isOpen: boolean) => void;
}

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/schools": "Sekolah",
  "/classes": "Kelas",
  "/teachers": "Guru",
  "/subjects": "Mata Pelajaran",
  "/time-slots": "Slot Waktu",
  "/teaching-allocations": "Alokasi Mengajar",
  "/generate": "Generate Jadwal",
  "/schedules": "Jadwal Umum",
  "/schedules/teacher": "Jadwal per Guru",
  "/schedules/class": "Jadwal per Kelas",
};

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = title || routeTitles[pathname] || "Page";
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showTentang, setShowTentang] = useState(false);
  const [showKontak, setShowKontak] = useState(false);

  const handleMenuToggle = () => {
    const newState = !menuOpen;
    setMenuOpen(newState);
    if (onMenuToggle) {
      onMenuToggle(newState);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleNavigate = {
    home: () => router.push("/"),
    tentang: () => setShowTentang(true),
    kontak: () => setShowKontak(true),
  };

  let subtitle = "| Jadwal Pelajaran";
  if (pathname !== "/") {
    const cleanTitle = pageTitle.replace("per ", "");
    subtitle = `| ${cleanTitle}`;
  }

  return (
    <>
      <header
        className="sticky top-0 z-[300] px-3 bg-gradient-bgy"
        style={{
          boxShadow: "0 2px 10px rgba(0,0,0,.18)",
        }}
      >
        <div className="flex items-center justify-between h-[48px]">
          {/* LEFT: Logo + Brand */}
          <div className="flex items-center gap-[8px] flex-1 min-w-0">
            <img
              src="/guru-cibisd2.png"
              alt="BGY"
              className="h-[36px] w-[36px] rounded-[8px] flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[0.95rem] font-extrabold text-white whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                Bantu Guru Yuk {subtitle}
              </div>
            </div>
          </div>

          {/* RIGHT: Dark Mode + Hamburger */}
          <div className="flex items-center gap-[4px] flex-shrink-0">
            <button
              onClick={toggleDarkMode}
              className="h-[30px] w-[30px] rounded-[6px] border-[1.5px] border-white/30 bg-white/10 text-white flex items-center justify-center flex-shrink-0 active:bg-white/25 cursor-pointer"
              title="Mode gelap/terang"
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <HamburgerMenu 
              isOpen={menuOpen} 
              onClick={handleMenuToggle}
              onNavigate={handleNavigate}
            />
          </div>
        </div>
      </header>

      {/* Menu Overlay Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[250] bg-black/20"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Modals */}
      <TentangModal isOpen={showTentang} onClose={() => setShowTentang(false)} />
      <KontakModal isOpen={showKontak} onClose={() => setShowKontak(false)} />
    </>
  );
}
