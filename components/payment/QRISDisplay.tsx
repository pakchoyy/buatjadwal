"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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
  const [isChecking, setIsChecking] = useState(false);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpired]);

  // Poll payment status every 5 seconds
  useEffect(() => {
    const checkStatus = async () => {
      if (isChecking) return;

      setIsChecking(true);
      try {
        const response = await fetch(`/api/payments/status/${transactionId}`);
        const data = await response.json();

        if (data.status === "paid") {
          onSuccess();
        } else if (data.status === "expired") {
          onExpired();
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check after 3 seconds
    const initialTimer = setTimeout(checkStatus, 3000);

    // Then check every 5 seconds
    const interval = setInterval(checkStatus, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [transactionId, onSuccess, onExpired]);

  // Format time left
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Scan QRIS untuk Donasi
        </h2>
        <p className="mt-2 text-lg font-semibold text-teal-600">
          Rp{amount.toLocaleString("id-ID")}
        </p>
      </div>

      {/* QRIS Image */}
      <div className="flex justify-center">
        <div className="rounded-2xl bg-white p-4 shadow-lg">
          <img
            src={qrisUrl}
            alt="QRIS Code"
            className="h-64 w-64 object-contain"
          />
        </div>
      </div>

      {/* Timer */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-amber-800">
          <span className="text-lg">⏱️</span>
          <span className="font-mono text-lg font-semibold">
            Berlaku: {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3">
          <LoadingSpinner size="sm" />
          <span className="text-gray-600">Menunggu pembayaran...</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full animate-pulse bg-gradient-to-r from-teal-500 to-cyan-500 transition-all"
            style={{ width: "60%" }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-center text-sm text-blue-800">
          ℹ️ Scan dengan aplikasi e-wallet Anda (Gopay, OVO, Dana, LinkAja,
          ShopeePay, dll)
        </p>
      </div>

      {/* Cancel Button */}
      <div className="flex justify-center">
        <Button onClick={onCancel} variant="secondary" size="sm">
          Batalkan
        </Button>
      </div>
    </div>
  );
}
