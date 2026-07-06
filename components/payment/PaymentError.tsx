"use client";

import { XCircle } from "lucide-react";
import Button from "@/components/ui/Button";

interface PaymentErrorProps {
  error: string;
  onRetry: () => void;
  onClose: () => void;
}

export default function PaymentError({
  error,
  onRetry,
  onClose,
}: PaymentErrorProps) {
  return (
    <div className="space-y-3 py-2 text-center">
      {/* Error Icon */}
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <XCircle size={28} className="text-red-600" />
        </div>
      </div>

      {/* Error Message */}
      <div>
        <h2 className="text-sm font-bold text-gray-900">Pembayaran Gagal</h2>
        <p className="mt-2 text-xs text-gray-600">{error}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onClose} variant="secondary" size="sm" className="flex-1">
          Tutup
        </Button>
        <Button onClick={onRetry} variant="primary" size="sm" className="flex-1">
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
