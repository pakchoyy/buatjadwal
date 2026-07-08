"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { onSaveStatusChange, getSaveStatus } from "@/lib/auto-save";

export default function SaveIndicator() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(getSaveStatus());

  useEffect(() => {
    const unsubscribe = onSaveStatusChange(setStatus);
    return unsubscribe;
  }, []);

  if (status === "idle") return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
        {status === "saving" && (
          <>
            <Loader2 size={14} className="text-gray-500 animate-spin" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Menyimpan...</span>
          </>
        )}
        {status === "saved" && (
          <>
            <Check size={14} className="text-teal-600" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Semua perubahan tersimpan</span>
          </>
        )}
        {status === "error" && (
          <>
            <span className="text-xs text-red-600">Gagal menyimpan</span>
          </>
        )}
      </div>
    </div>
  );
}
