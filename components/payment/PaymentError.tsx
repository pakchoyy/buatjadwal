"use client";

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
    <div className="space-y-6 py-4 text-center">
      {/* Error Icon */}
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-10 w-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pembayaran Gagal</h2>
        <p className="mt-3 text-gray-600">{error}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onClose} variant="secondary" className="flex-1">
          Tutup
        </Button>
        <Button onClick={onRetry} variant="primary" className="flex-1">
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
