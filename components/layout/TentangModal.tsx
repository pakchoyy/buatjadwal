/**
 * TentangModal Component - Info tentang aplikasi
 */

"use client";

import Modal from "@/components/ui/Modal";

interface TentangModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TentangModal({ isOpen, onClose }: TentangModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tentang Aplikasi" size="md">
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Bantu Guru Yuk | Jadwal Pelajaran
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Aplikasi untuk membantu guru manajemen jadwal pelajaran SD, SMP tanpa bentrok.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>✨</span> Fitur Utama
          </h4>
          <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
            <li>Generate jadwal otomatis tanpa bentrok guru dan kelas</li>
            <li>Export jadwal ke PDF dan Excel</li>
            <li>Lihat jadwal per Guru, per Kelas, atau Umum</li>
            <li>Data contoh untuk memulai dengan cepat</li>
            <li>Slot waktu fleksibel (Senin-Sabtu)</li>
            <li>Interface sederhana dan mudah digunakan</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © 2024 Bantu Guru Yuk. All rights reserved.
          </p>
        </div>
      </div>
    </Modal>
  );
}
