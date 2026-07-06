"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface PaymentSuccessProps {
  amount: number;
  transactionId: string;
}

export default function PaymentSuccess({
  amount,
  transactionId,
}: PaymentSuccessProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`py-6 text-center transition-all duration-500 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
        <div className="animate-bounce">
          <CheckCircle2 className="h-20 w-20 text-green-500" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900">Pembayaran Berhasil!</h3>
      <p className="mt-2 text-sm text-gray-500">
        Terima kasih atas donasi sebesar
      </p>
      <p className="mt-1 text-2xl font-bold text-teal-700">
        Rp{amount.toLocaleString("id-ID")}
      </p>
      <p className="mt-4 text-xs text-gray-400">
        ID Transaksi: {transactionId}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        Donasi Anda sangat berarti untuk pengembangan aplikasi ini 🙏
      </p>
    </div>
  );
}
