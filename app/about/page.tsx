"use client";

export default function AboutPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <img
            src="/guru-cibisd2.png"
            alt="BGY"
            className="h-16 w-16 rounded-xl mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-900">Bantu Guru Yuk | Jadwal Pelajaran</h1>
          <p className="text-gray-600 mt-2">
            Aplikasi untuk membantu guru manajemen jadwal pelajaran SD, SMP tanpa bentrok.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            ✨ Fitur Utama
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-0.5">✓</span>
              Generate jadwal otomatis tanpa bentrok guru dan kelas
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-0.5">✓</span>
              Export jadwal ke PDF dan Excel
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-0.5">✓</span>
              Lihat jadwal per Guru, per Kelas, atau Umum
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-0.5">✓</span>
              Data contoh untuk memulai dengan cepat
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-0.5">✓</span>
              Slot waktu fleksibel (Senin-Sabtu)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-0.5">✓</span>
              Interface sederhana dan mudah digunakan
            </li>
          </ul>
        </div>

        <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
          © 2026 Bantu Guru Yuk. All rights reserved.
        </div>
      </div>
    </div>
  );
}