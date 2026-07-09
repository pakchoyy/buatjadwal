"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ShieldCheck, X } from "lucide-react";
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
  const [testMode, setTestMode] = useState(false);
  const [testTapCount, setTestTapCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const testTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bayarRef = useRef<() => void>(() => {});

  useEffect(() => {
    bayarRef.current = handleBayar;
  });

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

  // Test mode auto-detect
  useEffect(() => {
    if (isOpen && testMode) {
      testTimerRef.current = setTimeout(() => {
        bayarRef.current();
      }, 5000);
    }
    return () => {
      if (testTimerRef.current) {
        clearTimeout(testTimerRef.current);
        testTimerRef.current = null;
      }
    };
  }, [isOpen, testMode]);

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

  const handleBayar = async () => {
    if (isDownloading || isVerifying) return;
    setIsVerifying(true);

    Analytics.supportDownloadClick({
      page_name: "Schedule",
      feature: "qris",
    });

    if (testTimerRef.current) {
      clearTimeout(testTimerRef.current);
      testTimerRef.current = null;
    }

    savePaymentStatus("qris-static", testMode ? 100 : 0);
    setIsDownloading(true);
    setIsVerifying(false);

    setTimeout(() => {
      onSuccess();
    }, 600);
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
                Testing Mode &bull; Auto-download 5 detik
              </p>
            )}

            <div className="px-4 py-2 space-y-2.5 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {testMode
                  ? "Scan QRIS atau tunggu 5 detik untuk simulasi."
                  : "Scan QRIS untuk donasi, lalu klik Saya Sudah Bayar."}
              </p>

              <div className="flex flex-col items-center gap-2 pt-1">
                <button
                  onClick={handleDownloadQris}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-950/50 rounded-lg transition-colors mb-1"
                >
                  <Download size={14} />
                  Simpan Gambar QRIS
                </button>

                <div className="w-40 h-40 rounded-xl border border-gray-200 dark:border-gray-600 shadow-md bg-white p-1">
                  <img
                    src="/payment/qris.png"
                    alt="QRIS Pembayaran"
                    className="w-full h-full rounded-lg object-contain"
                  />
                </div>

                {/* Waiting animation */}
                {!isDownloading && (
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-2 animate-ping rounded-full bg-teal-500" />
                      <span className="text-[11px] text-gray-500">Menunggu pembayaran...</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                        style={{ width: "60%" }}
                      />
                    </div>
                  </div>
                )}

                {/* Downloading state */}
                {isDownloading && (
                  <div className="flex items-center gap-2 text-teal-600">
                    <div className="h-2 w-2 rounded-full bg-teal-500" />
                    <span className="text-xs font-medium">Menyiapkan file...</span>
                  </div>
                )}

                {testMode && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 w-full">
                    <p className="text-xs font-medium text-amber-800">
                      Rp100 (Testing) &mdash; Auto-download 5 detik
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-400 max-w-xs">
                  Satu kali dukungan. Download berkali-kali di perangkat yang sama.
                </p>
              </div>
            </div>

            <div className="px-4 pb-4 pt-1 space-y-2">
              <Button
                className="w-full h-[42px]"
                onClick={handleBayar}
                isLoading={isVerifying}
                disabled={isDownloading}
              >
                <ShieldCheck size={16} />
                {testMode ? "Konfirmasi Testing" : "Saya Sudah Bayar"}
              </Button>

              <Button
                variant="secondary"
                className="w-full h-[42px]"
                onClick={onClose}
                disabled={isDownloading}
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
