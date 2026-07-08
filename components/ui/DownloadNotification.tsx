"use client";

import { useEffect } from "react";
import { CircleCheckBig } from "lucide-react";

interface DownloadNotificationProps {
  show: boolean;
  message?: string;
  onClose: () => void;
}

export default function DownloadNotification({
  show,
  onClose,
}: DownloadNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200" />

      {/* Notification Popup */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-300 pointer-events-auto">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
              <CircleCheckBig size={36} className="text-teal-600" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Download Dimulai</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Silakan periksa folder Downloads atau daftar unduhan browser Anda. Jika browser meminta konfirmasi, pilih Simpan.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full animate-[progress_3s_ease-in-out] bg-gradient-to-r from-teal-500 to-green-500" />
          </div>
        </div>
      </div>

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
    </>
  );
}
