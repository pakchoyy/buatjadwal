"use client";

import { useEffect } from "react";
import { CheckCircle2, Heart } from "lucide-react";

interface PaymentSuccessProps {
  onComplete?: () => void;
}

export default function PaymentSuccess({ onComplete }: PaymentSuccessProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="space-y-3 py-4 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1">
          <Heart size={16} className="text-red-500" />
          Terima Kasih Atas Dukungannya!
        </h2>
        <p className="mt-2 text-xs text-gray-600">
          Dukungan Anda membantu pengembangan aplikasi ini agar tetap gratis dan
          bermanfaat untuk guru-guru Indonesia.
        </p>
      </div>

      {/* Loading Animation */}
      <div className="flex justify-center">
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full animate-[progress_3s_ease-in-out] bg-gradient-to-r from-teal-500 to-green-500" />
        </div>
      </div>

      {/* Countdown */}
      <p className="text-xs text-gray-500">
        Download dimulai dalam beberapa detik...
      </p>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
