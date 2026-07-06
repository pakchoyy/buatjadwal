/**
 * Dashboard Page - Homepage dengan stats dan seed button
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { LocalDB } from "@/lib/db";
import { seedDatabase } from "@/lib/seed-data";
import { AlertState } from "@/lib/types";
import { 
  BookCopy,
  School, 
  Users, 
  Clock, 
  ClipboardList, 
  Zap, 
  Calendar,
  BookOpen,
  Building2,
  GraduationCap,
  Trash2
} from "lucide-react";

const GUIDES = [
  {
    num: "1",
    icon: Zap,
    title: "Mulai dengan Data Contoh",
    desc: "Bingung memulai? Klik tombol 'Isi Data Contoh' di atas untuk mengisi database dengan data sekolah sample. Data ini bisa dihapus kapan saja dengan tombol 'Hapus Semua Data'."
  },
  {
    num: "2",
    icon: School,
    title: "Isi Data Sekolah",
    desc: "Buka menu Sekolah dan isi nama sekolah, alamat, dan tahun ajaran. Data ini akan muncul di semua jadwal yang di-generate."
  },
  {
    num: "3", 
    icon: Users,
    title: "Tambah Data Master",
    desc: "Buka menu Guru untuk menambah daftar guru. Lalu buka Kelas untuk menambah kelas (misal: 7A, 8B, 9C). Terakhir, buka Mata Pelajaran untuk menambah mapel yang diajarkan."
  },
  {
    num: "4",
    icon: Clock,
    title: "Buat Slot Waktu",
    desc: "Buka menu Slot Waktu. Buat jadwal per hari (Senin-Jumat). Tambah hari Sabtu jika sekolah Anda ada kegiatan sampai Sabtu. Contoh: Jam 1 (07:00-07:45), Jam 2 (07:45-08:30), dst. Tandai slot istirahat jika ada."
  },
  {
    num: "5",
    icon: ClipboardList,
    title: "Buat Alokasi Mengajar",
    desc: "Buka menu Alokasi Mengajar. Tetapkan Guru mengajar Mapel tertentu di Kelas tertentu. Contoh: Pak Budi mengajar Matematika di kelas 7A (jam/minggu: 4)."
  },
  {
    num: "6",
    icon: Zap,
    title: "Generate Jadwal Otomatis",
    desc: "Buka menu Generate Jadwal. Sistem akan otomatis menyusun jadwal berdasarkan alokasi mengajar tanpa bentrok guru atau kelas. Jadwal langsung tersimpan."
  },
  {
    num: "7",
    icon: Calendar,
    title: "Lihat & Export Jadwal",
    desc: "Buka menu Lihat Jadwal untuk melihat jadwal lengkap. Filter per Kelas atau per Guru, lalu export PDF atau export Excel."
  }
];

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    school: string | null;
    classes: number;
    teachers: number;
    subjects: number;
    timeSlots: number;
    teachingAllocations: number;
  } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });

  // Load stats on mount; show branded loading once per browser session
  useEffect(() => {
    const hasShownLoading = window.sessionStorage.getItem("bgy-initial-loading-done");

    if (hasShownLoading) {
      loadStats();
      setIsInitialLoading(false);
      return;
    }

    setIsInitialLoading(true);
    const timer = window.setTimeout(() => {
      loadStats();
      setIsInitialLoading(false);
      window.sessionStorage.setItem("bgy-initial-loading-done", "1");
    }, 1000);

    return () => window.clearTimeout(timer);
  }, []);

  const loadStats = () => {
    const school = LocalDB.getSchool();
    if (school) {
      const dbStats = LocalDB.getStats(school.id);
      setStats({
        school: school.name,
        ...dbStats,
      });
    } else {
      setStats({
        school: null,
        classes: 0,
        teachers: 0,
        subjects: 0,
        timeSlots: 0,
        teachingAllocations: 0,
      });
    }
  };

  const doSeed = () => {
    setIsSeeding(true);
    setAlert({ show: false, type: "info", message: "" });

    try {
      const existingSchool = LocalDB.getSchool();
      if (existingSchool) {
        LocalDB.clearAll();
      }
      
      const result = seedDatabase();
      if (result.success) {
        setAlert({
          show: true,
          type: "success",
          message: `Data berhasil dimuat: ${result.stats?.teachers} guru, ${result.stats?.classes} kelas, ${result.stats?.subjects} mapel.`,
        });
        loadStats();
      } else {
        setAlert({
          show: true,
          type: "error",
          message: `Gagal seed database: ${result.message}`,
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: `Error: ${error instanceof Error ? error.message : "Terjadi kesalahan"}`,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeed = () => {
    const existingSchool = LocalDB.getSchool();
    if (existingSchool) {
      setShowSeedConfirm(true);
    } else {
      doSeed();
    }
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };



  return (
    <>
      <LoadingScreen show={isInitialLoading} message="Memuat dashboard..." />

      <div className="p-4 md:p-6">
        {/* Quick Actions Section */}
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Zap size={20} className="text-[#0ea5a0]" />
            <h2 className="text-xl font-bold text-[var(--text)]">Aksi Cepat</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card-bg)] p-5 text-center shadow-[var(--shadow)]">
              <Button
                onClick={handleSeed}
                isLoading={isSeeding}
                size="md"
                className="w-full md:w-auto"
              >
                <BookCopy size={16} />
                Isi Data Contoh
              </Button>
              <p className="mt-2 text-xs text-gray-500">
                Isi database dengan data contoh Senin-Jumat.
              </p>
            </div>

            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card-bg)] p-5 text-center shadow-[var(--shadow)]">
              <Button
                variant="danger"
                onClick={handleClearAll}
                disabled={!stats?.school}
                size="md"
                className="w-full md:w-auto"
              >
                <Trash2 size={16} />
                Hapus Semua Data
              </Button>
              <p className="mt-2 text-xs text-gray-500">
                Hapus seluruh data dari sistem.
              </p>
            </div>
          </div>
        </section>
        {/* Alert */}
        {alert.show && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ ...alert, show: false })}
            />
          </div>
        )}

        {/* Confirm Dialogs */}
        <ConfirmDialog
          isOpen={showSeedConfirm}
          onClose={() => setShowSeedConfirm(false)}
          onConfirm={() => { setShowSeedConfirm(false); doSeed(); }}
          title="Isi Data Contoh"
          message="Data yang sudah ada akan dihapus dan diganti dengan data contoh. Lanjutkan?"
          confirmText="Ya, Isi Data"
          confirmVariant="primary"
        />
        <ConfirmDialog
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={() => { setShowClearConfirm(false); LocalDB.clearAll(); loadStats(); setAlert({ show: true, type: "success", message: "Semua data berhasil dihapus" }); }}
          title="Hapus Semua Data"
          message="Apakah Anda yakin ingin menghapus semua data?"
          confirmText="Ya, Hapus"
          confirmVariant="danger"
        />

        {/* Petunjuk Penggunaan Section */}
        <section className="bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6 mb-6 border border-[var(--border)]">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} className="text-[#0ea5a0]" />
            <h2 className="text-xl font-bold text-[var(--text)]">
              Cara Menggunakan Aplikasi
            </h2>
          </div>

          {/* Intro Box */}
          <div 
            className="text-sm leading-relaxed mb-4 p-3 rounded-lg"
            style={{
              background: "rgba(14,165,160,.08)",
              borderLeft: "4px solid #0ea5a0",
            }}
          >
            <strong>Bantu Guru Yuk | Jadwal Pelajaran</strong> membantu Anda membuat 
            jadwal pelajaran otomatis tanpa bentrok. Ikuti langkah berikut untuk memulai.
          </div>

          {/* Guide Steps */}
          <div className="flex flex-col gap-3">
            {GUIDES.map((guide) => {
              const IconComponent = guide.icon;
              return (
                <div 
                  key={guide.num}
                  className="flex gap-3 items-start p-3 border border-[var(--border)] rounded-lg bg-[var(--input-bg)]"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(14,165,160,0.12)] text-sm font-bold text-[#0ea5a0]">
                    {guide.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent size={16} className="text-[#0ea5a0]" />
                      <strong className="text-sm text-[#0ea5a0]">{guide.title}</strong>
                    </div>
                    <p className="text-xs text-[var(--text)] leading-relaxed">
                      {guide.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Cards */}
        {stats && (
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardList size={20} className="text-[#0ea5a0]" />
              <h2 className="text-xl font-bold text-[var(--text)]">Ringkasan Data</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* School Card */}
              <div className="bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6 border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Sekolah</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.school || "Belum ada"}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              </div>

              {/* Classes Card */}
              <div className="bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6 border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Kelas</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.classes}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-green-600" />
                </div>
              </div>
              </div>

              {/* Teachers Card */}
              <div className="bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6 border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Guru</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.teachers}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              </div>

              {/* Subjects Card */}
              <div className="bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6 border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Mata Pelajaran
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.subjects}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              </div>

              {/* Time Slots Card */}
              <div className="bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6 border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Slot Waktu
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.timeSlots}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
              </div>
              </div>

              {/* Teaching Allocations Card */}
              <div className="bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6 border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Alokasi Mengajar
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.teachingAllocations}
                  </p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              </div>
            </div>
          </section>
        )}

        {/* Quick Links */}
        {stats?.school && (
          <section className="bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6 border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text)] mb-4">
              Kelola Data
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/classes"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <GraduationCap className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Kelola Kelas
                </span>
              </Link>

              <Link
                href="/teachers"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Kelola Guru
                </span>
              </Link>

              <Link
                href="/subjects"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Kelola Mapel
                </span>
              </Link>

              <Link
                href="/teaching-allocations"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ClipboardList className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Alokasi Mengajar
                </span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
