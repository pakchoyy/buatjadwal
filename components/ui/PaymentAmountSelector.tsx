"use client";

import { useState } from "react";

const PRESET_AMOUNTS = [10000, 25000, 50000];

interface PaymentAmountSelectorProps {
  selectedAmount: number | null;
  onSelect: (amount: number) => void;
}

export default function PaymentAmountSelector({
  selectedAmount,
  onSelect,
}: PaymentAmountSelectorProps) {
  const [customAmount, setCustomAmount] = useState("");

  const formatRupiah = (amount: number) =>
    `Rp${amount.toLocaleString("id-ID")}`;

  const handlePresetClick = (amount: number) => {
    setCustomAmount("");
    onSelect(amount);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCustomAmount(raw);
    if (raw) {
      onSelect(parseInt(raw, 10));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-gray-600">
        Pilih nominal donasi untuk mendukung pengembangan aplikasi ini
      </p>

      <div className="grid grid-cols-3 gap-3">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handlePresetClick(amount)}
            className={`rounded-xl border-2 p-4 text-center transition-all ${
              selectedAmount === amount && !customAmount
                ? "border-teal-500 bg-teal-50 shadow-md"
                : "border-gray-200 bg-white hover:border-teal-300 hover:shadow-sm"
            }`}
          >
            <span
              className={`text-lg font-bold ${
                selectedAmount === amount && !customAmount
                  ? "text-teal-700"
                  : "text-gray-800"
              }`}
            >
              {formatRupiah(amount)}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400">atau</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nominal Lainnya
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={customAmount}
            onChange={handleCustomChange}
            placeholder="Masukkan nominal"
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pl-12 text-lg font-semibold text-gray-800 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Minimal Rp10.000 &bull; Kelipatan Rp1.000 &bull; Maks Rp1.000.000
        </p>
      </div>
    </div>
  );
}
