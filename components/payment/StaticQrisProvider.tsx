"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Heart, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { savePaymentStatus } from "@/lib/payment-storage";

interface StaticQrisProviderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exportType: string;
  exportMetadata?: any;
}

export default function StaticQrisProvider({
  isOpen,
  onClose,
  onSuccess,
}: StaticQrisProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDonate = () => {
    setIsLoading(true);

    setTimeout(() => {
      savePaymentStatus("qris-static", 0);
      setToast({ message: "Terima kasih atas dukungan Anda." });

      setTimeout(() => {
        setIsLoading(false);
        onSuccess();
      }, 800);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        />

        <div
          className="relative w-full max-w-[430px] animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl border border-white/20 dark:border-gray-700/30">
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex-1 text-center">
                Dukung Pengembangan Aplikasi
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 absolute right-3 top-3"
                aria-label="Tutup modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-4 py-2 space-y-2.5 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Jika aplikasi ini bermanfaat, berikan dukungan mulai Rp10.000
                untuk melanjutkan download.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Terima kasih telah mendukung pengembangan aplikasi ini.
              </p>

              <div className="flex flex-col items-center gap-2 pt-1">
                <div className="w-40 h-40 rounded-xl border border-gray-200 dark:border-gray-600 shadow-md bg-white p-1">
                  <img
                    src="/payment/qris.png"
                    alt="QRIS Pembayaran"
                    className="w-full h-full rounded-lg object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                  Mendukung pembayaran melalui seluruh aplikasi yang mendukung QRIS.
                </p>
              </div>
            </div>

            <div className="px-4 pb-4 pt-1 space-y-2">
              <Button
                className="w-full h-[42px]"
                onClick={handleDonate}
                isLoading={isLoading}
              >
                <Heart size={16} />
                Saya Sudah Donasi & Download
              </Button>

              <Button
                variant="secondary"
                className="w-full h-[42px]"
                onClick={onClose}
                disabled={isLoading}
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] animate-in slide-in-from-right-5 fade-in duration-300">
            <div className="flex items-center gap-2.5 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg">
              <CheckCircle2 size={20} className="shrink-0" />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
