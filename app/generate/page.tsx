/**
 * Generate Schedule Page - Generate jadwal otomatis
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { LocalDB } from "@/lib/db";
import { Scheduler, clearSchedule } from "@/lib/scheduler";
import { AlertState } from "@/lib/types";

export default function GeneratePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });
  const [result, setResult] = useState<any>(null);

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

    // Confirm if re-generating (existing schedule will be lost)
    if (result) {
      const confirmed = confirm(
        "Jadwal yang sudah ada akan dihapus dan di-generate ulang. Apakah Anda yakin?"
      );
      if (!confirmed) return;
    }

    setIsGenerating(true);
    setAlert({ show: false, type: "info", message: "" });

    try {
      // Create scheduler instance
      const scheduler = new Scheduler(school.id);

      // Generate schedule
      const scheduleResult = scheduler.generateSchedule();

      setResult(scheduleResult);

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
      setAlert({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    const school = LocalDB.getSchool();
    if (!school) return;

    if (confirm("Apakah Anda yakin ingin menghapus semua jadwal?")) {
      clearSchedule(school.id);
      setResult(null);
      setAlert({
        show: true,
        type: "success",
        message: "Jadwal berhasil dihapus",
      });
    }
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
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong> Jika ada alokasi yang tidak bisa dijadwalkan
              (tidak cukup slot), sistem akan memberi laporan untuk ditangani manual.
            </p>
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
                  <p className="text-sm text-yellow-800">
                    <strong>Saran:</strong> Untuk menyelesaikan alokasi yang gagal,
                    Anda bisa:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-800 mt-2 space-y-1">
                    <li>Tambah slot waktu di menu Slot Waktu</li>
                    <li>Kurangi jumlah jam per minggu di Alokasi Mengajar</li>
                    <li>Edit jadwal secara manual setelah melihat hasilnya</li>
                  </ul>
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
      </div>
  );
}
