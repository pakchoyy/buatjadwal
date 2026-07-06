"use client";

import { useState } from "react";
import { Heart, X } from "lucide-react";
import Button from "./Button";
import PaymentAmountSelector from "./PaymentAmountSelector";
import QRISDisplay from "./QRISDisplay";
import PaymentSuccess from "./PaymentSuccess";
import { savePaymentStatus } from "@/lib/payment-storage";

type PaymentStep = "amount" | "qris" | "success";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: string;
  exportMetadata?: Record<string, string>;
}

export default function PaymentModal({
  isOpen,
  onClose,
  exportType,
  exportMetadata,
}: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>("amount");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrisUrl, setQrisUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  if (!isOpen) return null;

  const reset = () => {
    setStep("amount");
    setSelectedAmount(null);
    setLoading(false);
    setError("");
    setQrisUrl("");
    setTransactionId("");
    setExpiresAt(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreatePayment = async () => {
    if (!selectedAmount) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          exportType,
          exportMetadata,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat pembayaran");
        return;
      }

      setQrisUrl(data.qrisUrl);
      setTransactionId(data.transactionId);
      setExpiresAt(Date.now() + data.expiresIn * 1000);
      setAnimKey((k) => k + 1);
      setStep("qris");
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaid = () => {
    savePaymentStatus(transactionId, selectedAmount || 0);
    setAnimKey((k) => k + 1);
    setStep("success");
  };

  const handleRetry = () => {
    setQrisUrl("");
    setTransactionId("");
    setExpiresAt(0);
    setError("");
    setAnimKey((k) => k + 1);
    setStep("amount");
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 mx-4 w-full max-w-md animate-slide-up">
        <div className="rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          <div className="mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">
              {step === "success" ? "Terima Kasih!" : "Dukung Aplikasi Ini"}
            </h2>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div key={animKey} className="transition-all duration-300">
            {step === "amount" && (
              <div className="space-y-5 animate-slide-up">
                <PaymentAmountSelector
                  selectedAmount={selectedAmount}
                  onSelect={setSelectedAmount}
                />

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCreatePayment}
                  isLoading={loading}
                  disabled={!selectedAmount}
                >
                  {loading ? "Memproses..." : "Lanjutkan ke Pembayaran"}
                </Button>

                <p className="text-center text-xs text-gray-400">
                  Donasi digunakan untuk biaya server dan pengembangan fitur
                </p>
              </div>
            )}

            {step === "qris" && qrisUrl && (
              <QRISDisplay
                qrisUrl={qrisUrl}
                transactionId={transactionId}
                amount={selectedAmount || 0}
                expiresAt={expiresAt}
                onPaid={handlePaid}
                onRetry={handleRetry}
              />
            )}

            {step === "success" && (
              <div className="space-y-5 animate-slide-up">
                <PaymentSuccess
                  amount={selectedAmount || 0}
                  transactionId={transactionId}
                />
                <Button className="w-full" onClick={handleClose}>
                  Selesai
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
