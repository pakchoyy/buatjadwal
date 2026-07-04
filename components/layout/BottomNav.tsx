/**
 * BottomNav Component - Mobile bottom navigation
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  School,
  Users,
  BookOpen,
  Calendar,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/schools", label: "Sekolah", icon: School },
  { href: "/teachers", label: "Guru", icon: Users },
  { href: "/subjects", label: "Mapel", icon: BookOpen },
  { href: "/schedules", label: "Jadwal", icon: Calendar },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed left-1/2 bottom-0 -translate-x-1/2 w-full max-w-[420px] bg-[var(--card-bg)] border-t border-[var(--border)] flex z-[300] py-[6px] px-1"
      style={{ boxShadow: "0 -2px 12px rgba(0,0,0,.08)" }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-[2px] py-[6px] px-[2px] rounded-[10px] cursor-pointer ${
              isActive ? "text-[#0ea5a0]" : "text-[var(--text-light)]"
            }`}
          >
            <item.icon size={19} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
