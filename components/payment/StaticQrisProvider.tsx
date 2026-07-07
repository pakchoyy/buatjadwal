"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Download, Info, LoaderCircle, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { savePaymentStatus } from "@/lib/payment-storage";

interface StaticQrisProviderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exportType: string;
  exportMetadata?: any;
}

type ToastType = "preparing" | "success" | "qris-downloaded";

interface ToastState {
  type: ToastType;
  title: string;
  subtitle?: string;
}

export default function StaticQrisProvider({
  isOpen,
  onClose,
  onSuccess,
}: StaticQrisProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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
      const duration = toast.type === "success" ? 4000 : 2500;
      const timer = setTimeout(() => setToast(null), duration);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDownloadQris = () => {
    // Download QRIS image
    const link = document.createElement("a");
    link.href = "/payment/qris.png";
    link.download = "QRIS-Donasi.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({
      type: "qris-downloaded",
      title: "QRIS berhasil diunduh.",
    });
  };

  const handleDonateClick = () => {
    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmDownload = () => {
    setShowConfirmDialog(false);
    setIsLoading(true);

    // Show preparing toast
    setToast({
      type: "preparing",
      title: "Menyiapkan file...",
    });

    setTimeout(() => {
      savePaymentStatus("qris-static", 0);

      // Show success toast
      setToast({
        type: "success",
        title: "Download Dimulai",
        subtitle: "Silakan periksa folder Downloads atau daftar unduhan browser Anda.",
      });

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
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

        <div className="relative w-full max-w-[430px] animate-in fade-in zoom-in-95 duration-200">
          <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl border border-white/20 dark:border-gray-700/30">
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex-1 text-center">
                Bantu Aplikasi Ini Terus Berkembang
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
                Berikan dukungan mulai Rp10.000 untuk melanjutkan download.
              </p>

              <div className="flex flex-col items-center gap-2 pt-1">
                {/* Download QRIS Button */}
                <button
                  onClick={handleDownloadQris}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-950/50 rounded-lg transition-colors mb-1"
                >
                  <Download size={14} />
                  Download QRIS
                </button>

                {/* QRIS Image */}
                <div className="w-40 h-40 rounded-xl border border-gray-200 dark:border-gray-600 shadow-md bg-white p-1 transition-transform hover:scale-105">
                  <img
                    src="/payment/qris.png"
                    alt="QRIS Pembayaran"
                    className="w-full h-full rounded-lg object-contain"
                  />
                </div>

                {/* Info 1 */}
                <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>Satu kali dukungan • Download berkali-kali pada perangkat & browser yang sama.</span>
                </div>

                {/* Info 2 */}
                <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>Dapat dipindai menggunakan semua aplikasi yang mendukung QRIS.</span>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 pt-1 space-y-2">
              <Button
                className="w-full h-[42px]"
                onClick={handleDonateClick}
                isLoading={isLoading}
              >
                <Download size={16} />
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

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirmDialog(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto">
                <Info size={24} className="text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Konfirmasi Download
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Apakah Anda sudah melakukan donasi melalui QRIS?
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowConfirmDialog(false)}
              >
                Belum
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmDownload}
              >
                Sudah Donasi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] animate-in slide-in-from-right-5 fade-in duration-300">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 min-w-[280px] max-w-sm">
            <div className="flex items-start gap-3">
              {toast.type === "preparing" && (
                <LoaderCircle size={20} className="shrink-0 text-teal-600 dark:text-teal-400 animate-spin" />
              )}
              {toast.type === "success" && (
                <CircleCheck size={20} className="shrink-0 text-green-600 dark:text-green-400" />
              )}
              {toast.type === "qris-downloaded" && (
                <CircleCheck size={20} className="shrink-0 text-teal-600 dark:text-teal-400" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {toast.title}
                </p>
                {toast.subtitle && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {toast.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
