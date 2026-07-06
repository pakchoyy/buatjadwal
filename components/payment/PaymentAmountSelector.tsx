"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface PaymentAmountSelectorProps {
  onSelect: (amount: number) => void;
  onCancel: () => void;
  minAmount?: number;
}

export default function PaymentAmountSelector({
  onSelect,
  onCancel,
  minAmount = 10000,
}: PaymentAmountSelectorProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(10000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [error, setError] = useState<string>("");

  const presetAmounts = [
    { value: 10000, label: "Rp10.000" },
    { value: 20000, label: "Rp20.000" },
    { value: 30000, label: "Rp30.000" },
  ];

  const handlePresetSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    setIsCustomSelected(false);
    setError("");
  };

  const handleCustomAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setCustomAmount(numericValue);
    setIsCustomSelected(true);
    setError("");

    if (numericValue) {
      const amount = parseInt(numericValue);
      setSelectedAmount(amount);
    }
  };

  const handleContinue = () => {
    if (customAmount) {
      const amount = parseInt(customAmount);

      if (isNaN(amount)) {
        setError("Nominal tidak valid");
        return;
      }

      if (amount < minAmount) {
        setError(`Minimal donasi Rp${minAmount.toLocaleString("id-ID")}`);
        return;
      }

      if (amount > 1000000) {
        setError("Maksimal donasi Rp1.000.000");
        return;
      }

      if (amount % 1000 !== 0) {
        setError("Nominal harus kelipatan Rp1.000");
        return;
      }
    }

    onSelect(selectedAmount);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">🎉 Jadwal Berhasil Dibuat</h2>
        <p className="mt-3 text-gray-600">
          Terima kasih telah menggunakan aplikasi ini.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Aplikasi ini dikembangkan secara mandiri untuk membantu guru menyusun
          jadwal dengan lebih mudah dan cepat.
        </p>
      </div>

      {/* Amount Selection */}
      <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 p-6">
        <h3 className="mb-4 text-center text-lg font-semibold text-teal-900">
          ☕ Pilih Nominal Dukungan
        </h3>

        {/* Preset Amounts */}
        <div className="mb-4 space-y-3">
          {presetAmounts.map((preset) => (
            <label
              key={preset.value}
              className="flex cursor-pointer items-center rounded-lg border-2 border-teal-200 bg-white p-4 transition-all hover:border-teal-400 hover:shadow-md"
            >
              <input
                type="radio"
                name="amount"
                value={preset.value}
                checked={selectedAmount === preset.value && !customAmount}
                onChange={() => handlePresetSelect(preset.value)}
                className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500"
              />
              <span className="ml-3 flex-1 text-base font-medium text-gray-900">
                {preset.label}
              </span>
            </label>
          ))}

          {/* Custom Amount */}
          <label className="flex cursor-pointer items-center rounded-lg border-2 border-teal-200 bg-white p-4 transition-all hover:border-teal-400 hover:shadow-md">
            <input
              type="radio"
              name="amount"
              checked={isCustomSelected}
              onChange={() => {
                setIsCustomSelected(true);
                setCustomAmount("");
                setSelectedAmount(minAmount);
              }}
              className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500"
            />
            <div className="ml-3 flex-1">
              <div className="mb-2 text-base font-medium text-gray-900">
                Custom Amount
              </div>
              <input
                type="text"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder={`Min. Rp${minAmount.toLocaleString("id-ID")}`}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </label>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-2 text-center text-xs text-teal-700">
          <p>✨ Download otomatis setelah pembayaran</p>
          <p>✨ Unlimited download selamanya</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onCancel} variant="secondary" className="flex-1">
          Kembali
        </Button>
        <Button onClick={handleContinue} variant="primary" className="flex-1">
          Lanjutkan →
        </Button>
      </div>
    </div>
  );
}
