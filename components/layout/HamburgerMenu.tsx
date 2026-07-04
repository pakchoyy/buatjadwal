/**
 * HamburgerMenu Component - Mobile menu toggle (right side)
 */

"use client";

import { Menu } from "lucide-react";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function HamburgerMenu({
  isOpen,
  onClick,
}: HamburgerMenuProps) {
  return (
    <button
      onClick={onClick}
      className="h-[30px] w-[30px] rounded-[6px] border-[1.5px] border-white/30 bg-white/10 text-white flex items-center justify-center flex-shrink-0 active:bg-white/25 cursor-pointer"
      aria-label="Toggle menu"
      aria-expanded={isOpen}
      title="Menu"
    >
      <Menu size={14} />
    </button>
  );
}
