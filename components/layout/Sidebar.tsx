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
          fixed lg:sticky left-0 top-0 lg:top-[48px] h-full lg:h-[calc(100vh-48px)] w-64 
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
      <div className="p-4 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text-light)] text-center">
          © 2026 Bantu Guru Yuk
        </p>
      </div>
    </aside>
    </>
  );
}
