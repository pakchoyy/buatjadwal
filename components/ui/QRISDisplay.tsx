"use client";

import { useEffect, useState, useRef } from "react";
import { Clock, RefreshCw } from "lucide-react";
import Button from "./Button";

interface QRISDisplayProps {
  qrisUrl: string;
  transactionId: string;
  amount: number;
  expiresAt: number;
  onPaid: () => void;
  onRetry?: () => void;
}

export default function QRISDisplay({
  qrisUrl,
  transactionId,
  amount,
  expiresAt,
  onPaid,
  onRetry,
}: QRISDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState<"pending" | "paid" | "expired">("pending");
  const [polling, setPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    setTimeLeft(remaining);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (pollingRef.current) clearInterval(pollingRef.current);
          setStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [expiresAt]);

  useEffect(() => {
    if (status !== "pending") return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${transactionId}`);
        const data = await res.json();
        if (data.success && data.data.status === "paid") {
          setStatus("paid");
          if (pollingRef.current) clearInterval(pollingRef.current);
          onPaid();
        }
      } catch {
        // silent fail
      }
    }, 10000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [status, transactionId, onPaid]);

  const checkStatus = async () => {
    setPolling(true);
    try {
      const res = await fetch(`/api/payments/status/${transactionId}`);
      const data = await res.json();
      if (data.success && data.data.status === "paid") {
        setStatus("paid");
        if (pollingRef.current) clearInterval(pollingRef.current);
        onPaid();
      }
    } catch {
      console.error("Status check error");
    } finally {
      setPolling(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (status === "paid") return null;

  if (status === "expired") {
    return (
      <div className="py-8 text-center animate-slide-up">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Clock className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Waktu Habis</h3>
        <p className="mt-1 text-sm text-gray-500">
          QRIS telah kedaluwarsa. Silakan buat pembayaran baru.
        </p>
        {onRetry && (
          <Button className="mt-4" onClick={onRetry}>
            Buat Pembayaran Baru
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900">
          Scan QRIS untuk Membayar
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Scan kode QR di bawah menggunakan aplikasi e-wallet atau mobile banking
        </p>
      </div>

      <div className="flex justify-center">
        <div className="rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrisUrl}
            alt="QRIS Payment Code"
            className="h-56 w-56 object-contain"
          />
        </div>
      </div>

      <div className="text-center">
        <p className="text-2xl font-bold text-teal-700">
          Rp{amount.toLocaleString("id-ID")}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Clock size={16} />
        <span className={timeLeft < 120 ? "font-semibold text-red-500" : ""}>
          Sisa waktu: {formatTime(timeLeft)}
        </span>
      </div>

      <div className="text-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={checkStatus}
          isLoading={polling}
        >
          <RefreshCw size={14} />
          Cek Status Pembayaran
        </Button>
      </div>

      <p className="text-center text-xs text-gray-400">
        ID Transaksi: {transactionId.slice(0, 16)}...
      </p>
    </div>
  );
}
