/**
 * HamburgerMenu Component - Dropdown menu with info links
 */

"use client";

import { Menu, Home, Info, Mail, Globe } from "lucide-react";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
  onNavigate: {
    home: () => void;
    tentang: () => void;
    kontak: () => void;
  };
}

export default function HamburgerMenu({
  isOpen,
  onClick,
  onNavigate,
}: HamburgerMenuProps) {
  const handleItemClick = (action: () => void) => {
    action();
    onClick(); // Close menu after action
  };

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="h-[30px] w-[30px] rounded-[6px] border-[1.5px] border-white/30 bg-white/10 text-white flex items-center justify-center flex-shrink-0 active:bg-white/25 cursor-pointer"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        title="Menu"
      >
        <Menu size={14} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg min-w-[200px] overflow-hidden z-[400]">
          <button
            onClick={() => handleItemClick(onNavigate.home)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <Home size={16} className="text-gray-500" />
            <span>Home</span>
          </button>

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

          <button
            onClick={() => handleItemClick(onNavigate.tentang)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <Info size={16} className="text-gray-500" />
            <span>Tentang</span>
          </button>

          <button
            onClick={() => handleItemClick(onNavigate.kontak)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <Mail size={16} className="text-gray-500" />
            <span>Kontak</span>
          </button>

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

          <a
            href="https://bantuguruyuk.web.id"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={onClick}
          >
            <Globe size={16} className="text-gray-500" />
            <span>BantuGuruYuk.web.id</span>
            <span className="ml-auto text-xs">↗</span>
          </a>
        </div>
      )}
    </div>
  );
}
