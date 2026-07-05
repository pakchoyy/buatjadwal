/**
 * Dashboard Page - Homepage dengan stats dan seed button
 */

"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { LocalDB } from "@/lib/db";
import { seedDatabase } from "@/lib/seed-data";
import { AlertState } from "@/lib/types";
import { 
  School, 
  Users, 
  Clock, 
  ClipboardList, 
  Zap, 
  Calendar,
  BookOpen 
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
    desc: "Buka menu Slot Waktu. Buat jadwal per hari (Senin-Jumat). Contoh: Jam 1 (07:00-07:45), Jam 2 (07:45-08:30), dst. Tandai slot istirahat jika ada."
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
    desc: "Buka menu Lihat Jadwal untuk melihat jadwal lengkap. Filter per Kelas atau per Guru, lalu print, export PDF, atau export Excel."
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
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });

  // Load stats on mount with 1s loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      loadStats();
      setIsInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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

  const handleSeed = () => {
    const existingSchool = LocalDB.getSchool();
    
    // If data exists, ask user to confirm clear + reseed
    if (existingSchool && !confirm("Hapus data lama dan isi ulang?")) {
      return; // User cancelled
    }
    
    setIsSeeding(true);
    setAlert({ show: false, type: "info", message: "" });

    try {
      // Clear existing data if any
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

  const handleClearAll = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua data?")) {
      LocalDB.clearAll();
      loadStats();
      setAlert({
        show: true,
        type: "success",
        message: "Semua data berhasil dihapus",
      });
    }
  };



  return (
    <>
      <LoadingScreen show={isInitialLoading} message="Memuat dashboard..." />

      <div className="p-4 md:p-6">
        {/* Action Buttons with Helper Text */}
        <div className="mb-6 flex flex-col items-center gap-4">
          {/* Isi Data Contoh */}
          <div className="text-center w-full max-w-md">
            <Button 
              onClick={handleSeed} 
              isLoading={isSeeding}
              size="md"
              className="w-full md:w-auto"
            >
              <Zap size={16} className="mr-2" />
              Isi Data Contoh
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Isi database dengan data sample
            </p>
          </div>
          
          {/* Hapus Semua Data */}
          <div className="text-center w-full max-w-md">
            <Button 
              variant="danger"
              onClick={handleClearAll}
              disabled={!stats?.school}
              size="md"
              className="w-full md:w-auto"
            >
              <Zap size={16} className="mr-2" />
              Hapus Semua Data
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Hapus seluruh data dari sistem
            </p>
          </div>
        </div>
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

        {/* Petunjuk Penggunaan Section */}
        <div className="bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6 mb-6 border border-[var(--border)]">
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
                  <div className="text-xl font-bold text-[#0ea5a0] flex-shrink-0">
                    {guide.num}️⃣
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
        </div>

        {/* Stats Cards */}
        {stats && (
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
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
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
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
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
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
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
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
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
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
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
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        {stats?.school && (
          <div className="mt-6 bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6 border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/classes"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-8 h-8 text-gray-600 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Kelola Kelas
                </span>
              </a>

              <a
                href="/teachers"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-8 h-8 text-gray-600 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Kelola Guru
                </span>
              </a>

              <a
                href="/subjects"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-8 h-8 text-gray-600 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Kelola Mapel
                </span>
              </a>

              <a
                href="/teaching-allocations"
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-8 h-8 text-gray-600 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Alokasi Mengajar
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
