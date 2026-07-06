/**
 * Time Slots Page - CRUD untuk slot waktu (70 rows, single table)
 */

"use client";

import { useState, useEffect } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { LocalDB } from "@/lib/db";
import { TimeSlot, AlertState, TimeSlotFormData, DAYS, DAY_LABELS } from "@/lib/types";
import { getDayLabel, formatTimeRange } from "@/lib/utils";

export default function TimeSlotsPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState<TimeSlotFormData>({
    schoolId: "",
    day: "monday",
    slotNumber: 1,
    startTime: "",
    endTime: "",
    isBreak: false,
  });
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    slotId: string | null;
  }>({ isOpen: false, slotId: null });

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = () => {
    const school = LocalDB.getSchool();
    if (school) {
      const data = LocalDB.listTimeSlots(school.id);
      // Sort by day (order) then by slotNumber
      const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      data.sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.slotNumber - b.slotNumber;
      });
      setTimeSlots(data);
    }
  };

  const handleCreate = () => {
    const school = LocalDB.getSchool();
    if (!school) {
      setAlert({
        show: true,
        type: "error",
        message: "Silakan buat data sekolah terlebih dahulu",
      });
      return;
    }

    setEditingSlot(null);
    setFormData({
      schoolId: school.id,
      day: "monday",
      slotNumber: 1,
      startTime: "",
      endTime: "",
      isBreak: false,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      schoolId: slot.schoolId,
      day: slot.day,
      slotNumber: slot.slotNumber,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBreak: slot.isBreak,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingSlot) {
        LocalDB.updateTimeSlot(editingSlot.id, formData);
        setAlert({
          show: true,
          type: "success",
          message: "Slot waktu berhasil diperbarui",
        });
      } else {
        LocalDB.createTimeSlot(formData);
        setAlert({
          show: true,
          type: "success",
          message: "Slot waktu berhasil ditambahkan",
        });
      }

      setIsModalOpen(false);
      loadTimeSlots();
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.slotId) return;

    try {
      LocalDB.deleteTimeSlot(deleteDialog.slotId);
      setAlert({
        show: true,
        type: "success",
        message: "Slot waktu berhasil dihapus",
      });
      setDeleteDialog({ isOpen: false, slotId: null });
      loadTimeSlots();
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    }
  };

  return (
    <>
      {/* Action button */}
      <div className="p-4 md:p-6 pb-0">
        <div className="flex justify-end">
          <Button onClick={handleCreate}>
            <Plus size={16} />
            Tambah Slot
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {alert.show && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ ...alert, show: false })}
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {timeSlots.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Belum ada data slot waktu</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hari
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Istirahat?
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeSlots.map((slot, index) => (
                    <tr
                      key={slot.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getDayLabel(slot.day)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slot.slotNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimeRange(slot.startTime, slot.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {slot.isBreak ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Ya
                          </span>
                        ) : (
                          <span className="text-gray-500">Tidak</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(slot)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                            title="Edit slot waktu"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, slotId: slot.id })}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                            title="Hapus slot waktu"
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Total: {timeSlots.length} slot waktu
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlot ? "Edit Slot Waktu" : "Tambah Slot Waktu"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Hari"
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value as any })}
            options={DAYS.map((day) => ({
              value: day,
              label: DAY_LABELS[day],
            }))}
            required
          />

          <Input
            label="Nomor Slot"
            type="number"
            value={String(formData.slotNumber)}
            onChange={(e) => setFormData({ ...formData, slotNumber: Number(e.target.value) })}
            required
            min="1"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Waktu Mulai"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />

            <Input
              label="Waktu Selesai"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isBreak"
              checked={formData.isBreak}
              onChange={(e) => setFormData({ ...formData, isBreak: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isBreak" className="ml-2 text-sm text-gray-700">
              Slot istirahat (tidak digunakan untuk pelajaran)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, slotId: null })}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus slot waktu ini?"
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </>
  );
}
