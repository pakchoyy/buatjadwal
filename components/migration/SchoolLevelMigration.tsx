/**
 * School Level Migration Modal
 * Muncul sekali untuk user lama yang belum memiliki school level
 */

"use client";

import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { LocalDB } from "@/lib/db";
import { SchoolLevel, SCHOOL_LEVELS, SCHOOL_LEVEL_LABELS } from "@/lib/types";

const MIGRATION_KEY = "jadwal_school_level_migrated";

export default function SchoolLevelMigration() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel>("smp");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkMigrationNeeded();
  }, []);

  const checkMigrationNeeded = () => {
    // Cek apakah sudah pernah migrasi
    if (typeof window === "undefined") return;
    const migrated = localStorage.getItem(MIGRATION_KEY);
    if (migrated === "true") return;

    // Cek apakah ada sekolah yang belum punya level
    const school = LocalDB.getSchool();
    if (school && !school.level) {
      setIsOpen(true);
    } else if (school && school.level) {
      // Sudah punya level, mark as migrated
      localStorage.setItem(MIGRATION_KEY, "true");
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      const school = LocalDB.getSchool();
      if (school) {
        LocalDB.updateSchool(school.id, {
          level: selectedLevel,
        });
        localStorage.setItem(MIGRATION_KEY, "true");
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Migration error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-teal-100 dark:bg-teal-900/30">
              <Building2 size={32} className="text-teal-600 dark:text-teal-400" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
              Pilih Jenjang Sekolah Anda
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
              Kami telah menambahkan fitur jenjang sekolah. Silakan pilih jenjang sekolah Anda untuk pengalaman yang lebih baik.
            </p>

            {/* Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jenjang Sekolah
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as SchoolLevel)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {SCHOOL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {SCHOOL_LEVEL_LABELS[level]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Jenjang ini akan mempengaruhi template import dan data contoh.
              </p>
            </div>

            {/* Action */}
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              disabled={isSaving}
              className="w-full"
            >
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
