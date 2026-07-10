/**
 * Generate Schedule Page - Generate jadwal otomatis
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, Info, Lightbulb, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Select from "@/components/ui/Select";
import { LocalDB } from "@/lib/db";
import { Scheduler, clearSchedule } from "@/lib/scheduler";
import { AlertState, ScheduleGenerateMode } from "@/lib/types";
import { Analytics, trackError } from "@/lib/analytics";

export default function GeneratePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [generateMode, setGenerateMode] = useState<ScheduleGenerateMode>("spread");
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });
  const [result, setResult] = useState<any>(null);

  const doGenerate = async () => {
    const school = LocalDB.getSchool();
    if (!school) return;

    setIsGenerating(true);
    setAlert({ show: false, type: "info", message: "" });
    const startTime = Date.now();

    try {
      const scheduler = new Scheduler(school.id, generateMode);
      const scheduleResult = scheduler.generateSchedule();
      setResult(scheduleResult);

      const elapsed = Date.now() - startTime;
      if (elapsed < 1500) {
        await new Promise(resolve => setTimeout(resolve, 1500 - elapsed));
      }

      // Track generate event
      Analytics.generateSchedule({
        page_name: "Generate Jadwal",
        feature: "generator",
        success: scheduleResult.success,
        duration: Date.now() - startTime,
        total_items: scheduleResult.stats.totalTickets,
        failed_items: scheduleResult.stats.failed,
      });

      if (scheduleResult.success) {
        setAlert({
          show: true,
          type: "success",
          message: scheduleResult.message,
        });
      } else {
        setAlert({
          show: true,
          type: "warning",
          message: scheduleResult.message,
        });
      }
    } catch (error) {
      // Track error
      trackError("generate_schedule", error instanceof Error ? error : new Error("Unknown error"), {
        page_name: "Generate Jadwal",
        feature: "generator",
        duration: Date.now() - startTime,
      });

      setAlert({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    const school = LocalDB.getSchool();
    if (!school) {
      setAlert({
        show: true,
        type: "error",
        message: "Silakan buat data sekolah terlebih dahulu",
      });
      return;
    }
    if (result) {
      setShowRegenConfirm(true);
      return;
    }
    await doGenerate();
  };

  const handleClear = () => {
    setShowClearConfirm(true);
  };

  const handleViewSchedule = () => {
    router.push("/schedules");
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {alert.show && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ ...alert, show: false })}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {isGenerating && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/25 backdrop-blur-[1px]"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center rounded-3xl border border-white/70 bg-white/65 px-8 py-7 text-center shadow-2xl">
              <img
                src="/guru-cibisd2.png"
                alt="Bantu Guru Yuk"
                className="mb-4 h-20 w-20 rounded-2xl animate-pulse"
              />
              <p className="text-base font-bold text-gray-900">
                Menyusun jadwal otomatis...
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Mohon tunggu sebentar, sistem sedang mencari slot terbaik.
              </p>
              <div className="mt-5 h-6 w-6 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-600"></div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Generate Jadwal Otomatis
          </h2>
          <p className="text-gray-600 mb-4">
            Sistem akan membuat jadwal otomatis berdasarkan alokasi mengajar yang sudah
            diinput. Proses ini akan:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Mendistribusikan jam mengajar ke slot waktu yang tersedia</li>
            <li>Memastikan tidak ada bentrok guru (1 guru tidak ngajar 2 kelas di jam sama)</li>
            <li>Memastikan tidak ada bentrok kelas (1 kelas tidak ada 2 mapel di jam sama)</li>
            <li>Mengutamakan guru dengan beban mengajar paling banyak</li>
            <li>Mencoba 3x dengan urutan berbeda untuk hasil optimal</li>
          </ul>

          {/* Tips Box */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <Lightbulb size={18} className="text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-teal-900 mb-2">Tips untuk Hasil Terbaik:</p>
                <ul className="text-sm text-teal-800 space-y-1">
                  <li>• Pastikan total jam alokasi ≤ total slot (minimal buffer 20%)</li>
                  <li>• Atur slot waktu merata di setiap hari</li>
                  <li>• Hindari guru part-time dengan beban mengajar terlalu banyak</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>Catatan:</strong> Jika ada alokasi yang tidak bisa dijadwalkan
                (tidak cukup slot), sistem akan mencoba 3x dengan urutan berbeda, lalu
                memberi laporan untuk ditangani manual.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Select
              label="Aturan Generate"
              value={generateMode}
              onChange={(e) => setGenerateMode(e.target.value as ScheduleGenerateMode)}
              options={[
                {
                  value: "spread",
                  label: "Sebar merata - jam dipisah supaya fleksibel",
                },
                {
                  value: "compact",
                  label: "Rapatkan jam - jam mapel sama diusahakan berurutan",
                },
              ]}
              helperText="Pilih Sebar merata untuk jadwal yang lebih longgar, atau Rapatkan jam kalau ingin mapel yang sama tampil lebih berdekatan."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap justify-center gap-4">
          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            size="lg"
          >
            {!isGenerating && (result ? <RotateCcw size={18} /> : <Sparkles size={18} />)}
            {result ? "Re-generate Jadwal" : "Generate Jadwal"}
          </Button>

          {result && (
            <>
              <Button
                variant="secondary"
                onClick={handleClear}
                size="lg"
              >
                <Trash2 size={18} />
                Hapus Jadwal
              </Button>
              <Button
                variant="success"
                onClick={handleViewSchedule}
                size="lg"
              >
                <Eye size={18} />
                Lihat Jadwal
              </Button>
            </>
          )}
        </div>

        {/* Result Display */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hasil Generate Jadwal
            </h3>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Jam</p>
                <p className="text-2xl font-bold text-gray-900">
                  {result.stats.totalTickets}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600">Berhasil</p>
                <p className="text-2xl font-bold text-green-900">
                  {result.stats.successfullyScheduled}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600">Gagal</p>
                <p className="text-2xl font-bold text-red-900">
                  {result.stats.failed}
                </p>
              </div>
            </div>

            {/* Failed Tickets */}
            {result.failedTickets.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Alokasi yang Gagal Dijadwalkan
                </h4>
                <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-red-200">
                    <thead className="bg-red-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">
                          Guru
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">
                          Mata Pelajaran
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">
                          Kelas
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">
                          Sisa Jam
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-200">
                      {result.failedTickets.map((ticket: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-red-900">
                            {ticket.teacherName}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-900">
                            {ticket.subjectName}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-900">
                            {ticket.className}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-900">
                            {ticket.remainingHours} jam
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900 mb-2">
                        Kenapa Gagal?
                      </p>
                      <p className="text-sm text-yellow-800 mb-2">
                        Kemungkinan slot waktu tidak cukup atau bentrok dengan alokasi lain.
                        Sistem sudah mencoba 3x dengan urutan berbeda.
                      </p>
                      <p className="text-sm font-semibold text-yellow-900 mb-1">
                        Solusi:
                      </p>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>• Tambah slot waktu di menu Slot Waktu (terutama di hari yang kurang slot)</li>
                        <li>• Kurangi jumlah jam per minggu di Alokasi Mengajar</li>
                        <li>• Coba generate ulang (sistem akan coba urutan berbeda lagi)</li>
                        <li>• Edit jadwal secara manual setelah melihat hasilnya</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {result.failedTickets.length === 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  ✅ Semua alokasi berhasil dijadwalkan tanpa bentrok!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Confirm Dialogs */}
        <ConfirmDialog
          isOpen={showRegenConfirm}
          onClose={() => setShowRegenConfirm(false)}
          onConfirm={() => { setShowRegenConfirm(false); doGenerate(); }}
          title="Generate Ulang Jadwal"
          message="Jadwal yang sudah ada akan dihapus dan di-generate ulang. Apakah Anda yakin?"
          confirmText="Ya, Generate Ulang"
          confirmVariant="primary"
        />
        <ConfirmDialog
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={() => { setShowClearConfirm(false); const school = LocalDB.getSchool(); if (school) { clearSchedule(school.id); setResult(null); setAlert({ show: true, type: "success", message: "Jadwal berhasil dihapus" }); } }}
          title="Hapus Jadwal"
          message="Apakah Anda yakin ingin menghapus semua jadwal?"
          confirmText="Ya, Hapus"
          confirmVariant="danger"
        />
      </div>
  );
}
