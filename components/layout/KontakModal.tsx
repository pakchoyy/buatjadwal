/**
 * KontakModal Component - Info kontak
 */

"use client";

import Modal from "@/components/ui/Modal";

interface KontakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KontakModal({ isOpen, onClose }: KontakModalProps) {
  const handleWhatsApp = () => {
    window.open('https://wa.me/6289530713597', '_blank', 'noopener,noreferrer');
  };

  const handleTikTok = () => {
    window.open('https://tiktok.com/@pak.choyy', '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kontak" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          Untuk bantuan, kritik, saran, atau pertanyaan seputar aplikasi:
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
          >
            <span className="text-lg">💬</span>
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleTikTok}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
          >
            <span className="text-lg">🎵</span>
            <span>TikTok @pak.choyy</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center pt-2">
          Kami siap membantu Anda! 😊
        </p>
      </div>
    </Modal>
  );
}
