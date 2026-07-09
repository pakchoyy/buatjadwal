"use client";

import { useEffect, useState } from "react";
import { Download, Info, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { savePaymentStatus } from "@/lib/payment-storage";
import { Analytics } from "@/lib/analytics";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testTapCount, setTestTapCount] = useState(0);

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

  const handleTitleTap = () => {
    const newCount = testTapCount + 1;
    setTestTapCount(newCount);
    if (newCount >= 5) {
      setTestMode(true);
      setTestTapCount(0);
    }
  };

  const handleDownloadQris = () => {
    const link = document.createElement("a");
    link.href = "/payment/qris.png";
    link.download = "QRIS-Donasi.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Analytics.downloadQris({
      page_name: "Schedule",
      feature: "qris",
    });
  };

  const handleDonateClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDownload = () => {
    setShowConfirmDialog(false);

    Analytics.supportDownloadClick({
      page_name: "Schedule",
      feature: "qris",
    });

    savePaymentStatus("qris-static", testMode ? 100 : 0);
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

        <div className="relative w-full max-w-[430px] animate-in fade-in zoom-in-95 duration-200">
          <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl border border-white/20 dark:border-gray-700/30">
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <h2
                className="text-xl font-bold text-gray-900 dark:text-gray-100 flex-1 text-center cursor-default"
                onClick={handleTitleTap}
              >
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

            {testMode && (
              <p className="text-center text-[10px] font-semibold text-amber-600 -mt-1 mb-1">
                Testing Mode
              </p>
            )}

            <div className="px-4 py-2 space-y-2.5 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {testMode
                  ? "Mode testing: scan QRIS atau cukup klik konfirmasi."
                  : "Berikan dukungan mulai Rp10.000 untuk melanjutkan download."}
              </p>

              <div className="flex flex-col items-center gap-2 pt-1">
                <button
                  onClick={handleDownloadQris}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-950/50 rounded-lg transition-colors mb-1"
                >
                  <Download size={14} />
                  Download QRIS
                </button>

                <div className="w-40 h-40 rounded-xl border border-gray-200 dark:border-gray-600 shadow-md bg-white p-1 transition-transform hover:scale-105">
                  <img
                    src="/payment/qris.png"
                    alt="QRIS Pembayaran"
                    className="w-full h-full rounded-lg object-contain"
                  />
                </div>

                {testMode && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 w-full">
                    <p className="text-xs font-medium text-amber-800">
                      Rp100 (Testing) &mdash; Klik &ldquo;Saya Sudah Donasi&rdquo; untuk simulasi
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>Satu kali dukungan &bull; Download berkali-kali pada perangkat & browser yang sama.</span>
                </div>

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
              >
                <Download size={16} />
                {testMode ? "Saya Sudah Donasi (Testing)" : "Saya Sudah Donasi & Download"}
              </Button>

              <Button
                variant="secondary"
                className="w-full h-[42px]"
                onClick={onClose}
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      </div>

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
                {testMode
                  ? "Mode testing: klik konfirmasi untuk simulasi download."
                  : "Apakah Anda sudah melakukan donasi melalui QRIS?"}
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowConfirmDialog(false)}
              >
                {testMode ? "Batal" : "Belum"}
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmDownload}
              >
                {testMode ? "Konfirmasi Testing" : "Sudah Donasi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
