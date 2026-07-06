"use client";

import { useEffect } from "react";

interface PaymentSuccessProps {
  onComplete?: () => void;
}

export default function PaymentSuccess({ onComplete }: PaymentSuccessProps) {
  useEffect(() => {
    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="space-y-6 py-8 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="animate-bounce">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          ❤️ Terima Kasih Atas Dukungannya!
        </h2>
        <p className="mt-4 text-gray-600">
          Dukungan Anda membantu pengembangan aplikasi ini agar tetap gratis dan
          bermanfaat untuk guru-guru Indonesia.
        </p>
      </div>

      {/* Loading Animation */}
      <div className="flex justify-center">
        <div className="h-2 w-64 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full animate-[progress_3s_ease-in-out] bg-gradient-to-r from-teal-500 to-green-500" />
        </div>
      </div>

      {/* Countdown */}
      <p className="text-sm text-gray-500">
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
