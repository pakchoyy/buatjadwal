/**
 * Sidebar Component - Navigation sidebar
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  BookOpen,
  Building2,
  CalendarDays,
  Clock,
  ClipboardList,
  GraduationCap,
  Home,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/schools", label: "Sekolah", icon: Building2 },
  { href: "/classes", label: "Kelas", icon: GraduationCap },
  { href: "/teachers", label: "Guru", icon: Users },
  { href: "/subjects", label: "Mata Pelajaran", icon: BookOpen },
  { href: "/time-slots", label: "Slot Waktu", icon: Clock },
  { href: "/teaching-allocations", label: "Alokasi Mengajar", icon: ClipboardList },
  { href: "/generate", label: "Generate Jadwal", icon: Zap },
  { href: "/schedules", label: "Lihat Jadwal", icon: CalendarDays },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop (Mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky left-0 top-[48px] h-[calc(100vh-48px)] w-64 
          bg-[var(--card-bg)] border-r border-[var(--border)] flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 pt-6 lg:pt-3">
        <div className="text-[0.6rem] font-bold uppercase tracking-[0.8px] text-[var(--text-light)] mb-2 px-1">
          Menu
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-semibold
                    ${isActive
                      ? "bg-[rgba(14,165,160,0.1)] text-[#0ea5a0]"
                      : "text-[var(--text)] hover:bg-[var(--input-bg)]"
                    }
                  `}
                  onClick={() => {
                    if (onClose && window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)] space-y-2">
        <p className="text-xs text-[var(--text-light)] text-center">
          © 2026 Bantu Guru Yuk
        </p>
        <div className="flex justify-center">
          <a
            href="https://www.tiktok.com/@pak.choyy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-light)] hover:text-[#0ea5a0] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
            @pak.choyy
          </a>
        </div>
      </div>
    </aside>
    </>
  );
}
