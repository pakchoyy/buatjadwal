"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import PaymentAmountSelector from "./PaymentAmountSelector";
import QRISDisplay from "./QRISDisplay";
import PaymentSuccess from "./PaymentSuccess";
import PaymentError from "./PaymentError";
import { savePaymentStatus } from "@/lib/payment-storage";

type PaymentStep = "amount" | "qris" | "success" | "error" | "expired";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exportType: string;
  exportMetadata?: any;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  exportType,
  exportMetadata,
}: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>("amount");
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [qrisUrl, setQrisUrl] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [expiresIn, setExpiresIn] = useState<number>(1800);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAmountSelect = async (amount: number) => {
    setSelectedAmount(amount);
    setLoading(true);
    setError("");

    try {
      console.log("Creating payment with amount:", amount);

      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          exportType,
          exportMetadata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat pembayaran");
      }

      if (!data.success) {
        throw new Error(data.error || "Gagal membuat pembayaran");
      }

      console.log("Payment created successfully:", data);

      setQrisUrl(data.qrisUrl);
      setTransactionId(data.transactionId);
      setExpiresIn(data.expiresIn);
      setStep("qris");
    } catch (err) {
      console.error("Payment creation error:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    console.log("Payment successful, saving to localStorage");

    // Save payment status to localStorage
    savePaymentStatus(transactionId, selectedAmount);

    // Show success animation
    setStep("success");

    // After 3 seconds, trigger download and close
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 3000);
  };

  const handleExpired = () => {
    setError("QR code telah expired setelah 30 menit.");
    setStep("expired");
  };

  const handleRetry = () => {
    setStep("amount");
    setError("");
    setQrisUrl("");
    setTransactionId("");
  };

  const handleClose = () => {
    // Reset state
    setStep("amount");
    setSelectedAmount(0);
    setQrisUrl("");
    setTransactionId("");
    setError("");
    setLoading(false);

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      showClose={step === "amount" || step === "error" || step === "expired"}
      size="md"
    >
      {step === "amount" && (
        <PaymentAmountSelector
          onSelect={handleAmountSelect}
          onCancel={handleClose}
          minAmount={10000}
        />
      )}

      {step === "qris" && (
        <QRISDisplay
          qrisUrl={qrisUrl}
          amount={selectedAmount}
          transactionId={transactionId}
          expiresIn={expiresIn}
          onSuccess={handlePaymentSuccess}
          onCancel={handleClose}
          onExpired={handleExpired}
        />
      )}

      {step === "success" && <PaymentSuccess onComplete={() => {}} />}

      {(step === "error" || step === "expired") && (
        <PaymentError
          error={error || "Pembayaran gagal atau expired"}
          onRetry={handleRetry}
          onClose={handleClose}
        />
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-600 border-t-transparent" />
            <p className="mt-4 text-gray-600">Memproses pembayaran...</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
