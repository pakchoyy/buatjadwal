"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, X, ShieldCheck, Download } from "lucide-react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Analytics } from "@/lib/analytics";

interface QRISDisplayProps {
  qrisUrl: string;
  amount: number;
  transactionId: string;
  expiresIn: number; // seconds
  onSuccess: () => void;
  onCancel: () => void;
  onExpired: () => void;
}

export default function QRISDisplay({
  qrisUrl,
  amount,
  transactionId,
  expiresIn,
  onSuccess,
  onCancel,
  onExpired,
}: QRISDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(expiresIn);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Use refs for callbacks so polling/countdown never restart on re-render
  const onSuccessRef = useRef(onSuccess);
  const onExpiredRef = useRef(onExpired);
  useEffect(() => { onSuccessRef.current = onSuccess; });
  useEffect(() => { onExpiredRef.current = onExpired; });

  // Countdown timer — never restarts
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpiredRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll payment status every 2 seconds — never restarts
  useEffect(() => {
    let cancelled = false;
    let polling = false;

    const checkStatus = async () => {
      if (polling || cancelled) return;
      polling = true;
      try {
        const response = await fetch(`/api/payments/status/${transactionId}`);
        const data = await response.json();
        console.log(`[poll] Status response:`, data);

        if (data.status === "paid") {
          cancelled = true;
          onSuccessRef.current();
        } else if (data.status === "expired") {
          cancelled = true;
          onExpiredRef.current();
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      } finally {
        if (!cancelled) polling = false;
      }
    };

    const initialTimer = setTimeout(checkStatus, 1000);
    const interval = setInterval(checkStatus, 2000);

    return () => {
      cancelled = true;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [transactionId]);

  const handleManualVerify = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        alert(data.message || "Pembayaran belum terdeteksi. Coba lagi.");
      }
    } catch {
      alert("Gagal memverifikasi. Coba lagi.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Format time left
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDownloadQRIS = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    Analytics.downloadQris({
      page_name: "Schedule",
      feature: "qris",
    });

    try {
      const a = document.createElement("a");
      a.href = `/api/payments/qris?url=${encodeURIComponent(qrisUrl)}`;
      a.download = `qris-donasi-${amount}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.location.href = `/api/payments/qris?url=${encodeURIComponent(qrisUrl)}`;
    } finally {
      setTimeout(() => setIsDownloading(false), 500);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-sm font-bold text-gray-900">
          Scan QRIS untuk Donasi
        </h2>
        <p className="mt-0.5 text-xs font-semibold text-teal-600">
          Rp{amount.toLocaleString("id-ID")}
        </p>
      </div>

      {/* QRIS Image */}
      <div className="flex justify-center">
        <div className="rounded-lg bg-white p-1.5 shadow-lg">
          <img
            src={qrisUrl}
            alt="QRIS Code"
            className="h-36 w-36 object-contain"
          />
        </div>
      </div>
      <div className="text-center -mt-1">
        <button
          onClick={handleDownloadQRIS}
          disabled={isDownloading}
          className="inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-teal-600 transition-colors disabled:opacity-50"
        >
          <Download size={12} />
          {isDownloading ? "Menyiapkan unduhan..." : "Simpan gambar QRIS"}
        </button>
      </div>

      {/* Timer */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
          <Clock size={13} />
          <span className="font-mono text-xs font-semibold">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-[11px] text-gray-600">Menunggu pembayaran...</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full animate-pulse bg-gradient-to-r from-teal-500 to-cyan-500 transition-all"
            style={{ width: "60%" }}
          />
        </div>
        <button
          onClick={handleManualVerify}
          disabled={isVerifying}
          className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-teal-600 hover:text-teal-700 transition-colors disabled:opacity-50"
        >
          <ShieldCheck size={13} />
          {isVerifying ? "Memverifikasi..." : "Saya Sudah Bayar"}
        </button>
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-blue-50 px-3 py-2">
        <p className="text-center text-[11px] leading-snug text-blue-800">
          Scan dengan aplikasi e-wallet (Gopay, OVO, Dana, ShopeePay, dll)
        </p>
      </div>

      {/* Cancel Button */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={onCancel} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" aria-label="Tutup">
          <X size={14} />
        </button>
        <Button onClick={onCancel} variant="secondary" size="sm" className="h-8 px-3 text-xs">
          Batalkan
        </Button>
      </div>
    </div>
  );
}
