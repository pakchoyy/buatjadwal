/**
 * LoadingScreen Component - Full screen loading dengan branding BGY
 */

"use client";

import { useEffect } from "react";

interface LoadingScreenProps {
  show: boolean;
  message?: string;
}

export default function LoadingScreen({
  show,
  message = "Memuat...",
}: LoadingScreenProps) {
  // Prevent body scroll when loading
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-bgy"
      role="status"
      aria-live="polite"
    >
      {/* Logo dengan pulse animation */}
      <img
        src="/guru-cibisd2.png"
        alt="Bantu Guru Yuk"
        className="w-24 h-24 rounded-[18px] mb-6 animate-pulse-scale"
      />

      {/* Brand Title */}
      <div className="text-white text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide mb-2">
          Bantu Guru Yuk
        </h1>
        <p className="text-sm md:text-base opacity-80 mb-4">
          Jadwal Pelajaran
        </p>

        {/* Custom Message */}
        {message && (
          <p className="text-sm opacity-70 animate-pulse">{message}</p>
        )}
      </div>

      {/* Loading spinner (optional) */}
      <div className="mt-8">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
