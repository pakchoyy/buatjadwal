"use client";

import { useState } from "react";
import { CheckCircle2, Heart } from "lucide-react";
import Button from "@/components/ui/Button";

interface PaymentAmountSelectorProps {
  onSelect: (amount: number, isTestMode: boolean) => void;
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
  const [testMode, setTestMode] = useState(false);
  const [testTapCount, setTestTapCount] = useState(0);

  const handleTitleTap = () => {
    const newCount = testTapCount + 1;
    setTestTapCount(newCount);
    if (newCount >= 5) {
      setTestMode(true);
      setTestTapCount(0);
    }
  };

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
      const isAllowedTestAmount = testMode && amount === 100;

      if (isNaN(amount)) {
        setError("Nominal tidak valid");
        return;
      }

      if (amount < minAmount && !isAllowedTestAmount) {
        setError(`Minimal donasi Rp${minAmount.toLocaleString("id-ID")}`);
        return;
      }

      if (amount > 1000000) {
        setError("Maksimal donasi Rp1.000.000");
        return;
      }

      if (!isAllowedTestAmount && amount % 1000 !== 0) {
        setError("Nominal harus kelipatan Rp1.000");
        return;
      }
    }

    onSelect(selectedAmount, testMode);
  };

  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5">
          <CheckCircle2 size={16} className="text-teal-600" />
          <h2 className="text-sm font-bold text-gray-900" onClick={handleTitleTap}>Jadwal Berhasil Dibuat</h2>
        </div>
        {testMode && (
          <p className="mt-0.5 text-[10px] font-semibold text-amber-600">Testing Mode</p>
        )}
        <p className="mt-0.5 text-[11px] text-gray-500">
          Aplikasi ini untuk membantu guru menyusun jadwal dengan lebih mudah.
        </p>
      </div>

      {/* Amount Selection */}
      <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 p-3">
        <h3 className="mb-2 text-center text-xs font-semibold text-teal-900 flex items-center justify-center gap-1">
          <Heart size={13} className="text-teal-600" />
          Pilih Nominal Dukungan
        </h3>

        {/* Preset Amounts */}
        <div className="mb-3 space-y-2">
          {presetAmounts.map((preset) => (
            <label
              key={preset.value}
              className="flex cursor-pointer items-center rounded-lg border-2 border-teal-200 bg-white p-3 transition-all hover:border-teal-400 hover:shadow-md"
            >
              <input
                type="radio"
                name="amount"
                value={preset.value}
                checked={selectedAmount === preset.value && !isCustomSelected}
                onChange={() => handlePresetSelect(preset.value)}
                className="h-3.5 w-3.5 border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500"
              />
              <span className="ml-2 flex-1 text-sm font-medium text-gray-900">
                {preset.label}
              </span>
            </label>
          ))}

          {/* Testing Amount (hidden, tap title 5x to unlock) */}
          {testMode && (
            <label className="flex cursor-pointer items-center rounded-lg border-2 border-amber-300 bg-amber-50 p-3 transition-all hover:border-amber-400 hover:shadow-md">
              <input
                type="radio"
                name="amount"
                value={100}
                checked={selectedAmount === 100 && !isCustomSelected}
                onChange={() => handlePresetSelect(100)}
                className="h-3.5 w-3.5 border-gray-300 text-amber-600 focus:ring-2 focus:ring-amber-500"
              />
              <span className="ml-2 flex-1 text-sm font-medium text-amber-900">
                Rp100 (Testing)
              </span>
            </label>
          )}

          {/* Custom Amount */}
          <label className="flex cursor-pointer items-center rounded-lg border-2 border-teal-200 bg-white p-3 transition-all hover:border-teal-400 hover:shadow-md">
            <input
              type="radio"
              name="amount"
                checked={isCustomSelected}
                onChange={() => {
                  setIsCustomSelected(true);
                  setCustomAmount("");
                  setSelectedAmount(minAmount);
                }}
                className="h-3.5 w-3.5 border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500"
              />
            <div className="ml-2 flex-1">
              <div className="mb-1 text-sm font-medium text-gray-900">
                Custom Amount
              </div>
              <input
                type="text"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder={`Min. Rp${minAmount.toLocaleString("id-ID")}`}
                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </label>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-2 text-center text-xs text-red-600">
            {error}
          </div>
        )}

        <div className="mt-2 text-center text-[10px] text-teal-700">
          Donasi sekali, Download otomatis setelah pembayaran
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onCancel} variant="secondary" size="sm" className="flex-1">
          Kembali
        </Button>
        <Button onClick={handleContinue} variant="primary" size="sm" className="flex-1">
          Lanjutkan →
        </Button>
      </div>
    </div>
  );
}
