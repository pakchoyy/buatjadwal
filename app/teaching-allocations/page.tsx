/**
 * Teaching Allocations Page - CRUD untuk alokasi mengajar
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
import { 
  TeachingAllocation, 
  Teacher, 
  Subject, 
  Class,
  AlertState, 
  TeachingAllocationFormData 
} from "@/lib/types";

export default function TeachingAllocationsPage() {
  const [allocations, setAllocations] = useState<TeachingAllocation[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<TeachingAllocation | null>(null);
  const [formData, setFormData] = useState<TeachingAllocationFormData>({
    schoolId: "",
    teacherId: "",
    subjectId: "",
    classId: "",
    hoursPerWeek: 1,
  });
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    allocationId: string | null;
  }>({ isOpen: false, allocationId: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const school = LocalDB.getSchool();
    if (school) {
      setAllocations(LocalDB.listTeachingAllocations(school.id));
      setTeachers(LocalDB.listTeachers(school.id));
      setSubjects(LocalDB.listSubjects(school.id));
      setClasses(LocalDB.listClasses(school.id));
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? `${teacher.code} - ${teacher.name}` : "Unknown";
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? `${subject.code} - ${subject.name}` : "Unknown";
  };

  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
    return cls ? cls.name : "Unknown";
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

    setEditingAllocation(null);
    setFormData({
      schoolId: school.id,
      teacherId: "",
      subjectId: "",
      classId: "",
      hoursPerWeek: 1,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (allocation: TeachingAllocation) => {
    setEditingAllocation(allocation);
    setFormData({
      schoolId: allocation.schoolId,
      teacherId: allocation.teacherId,
      subjectId: allocation.subjectId,
      classId: allocation.classId,
      hoursPerWeek: allocation.hoursPerWeek,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingAllocation) {
        LocalDB.updateTeachingAllocation(editingAllocation.id, formData);
        setAlert({
          show: true,
          type: "success",
          message: "Alokasi mengajar berhasil diperbarui",
        });
      } else {
        LocalDB.createTeachingAllocation(formData);
        setAlert({
          show: true,
          type: "success",
          message: "Alokasi mengajar berhasil ditambahkan",
        });
      }

      setIsModalOpen(false);
      loadData();
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
    if (!deleteDialog.allocationId) return;

    try {
      LocalDB.deleteTeachingAllocation(deleteDialog.allocationId);
      setAlert({
        show: true,
        type: "success",
        message: "Alokasi mengajar berhasil dihapus",
      });
      setDeleteDialog({ isOpen: false, allocationId: null });
      loadData();
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
            Tambah Alokasi
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
          {allocations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Belum ada data alokasi mengajar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guru
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mata Pelajaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jam/Minggu
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allocations.map((allocation, index) => (
                    <tr
                      key={allocation.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getTeacherName(allocation.teacherId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getSubjectName(allocation.subjectId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getClassName(allocation.classId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {allocation.hoursPerWeek} jam
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(allocation)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                            title="Edit alokasi"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialog({ isOpen: true, allocationId: allocation.id })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                            title="Hapus alokasi"
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
          Total: {allocations.length} alokasi mengajar
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAllocation ? "Edit Alokasi Mengajar" : "Tambah Alokasi Mengajar"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Guru"
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            options={teachers.map((t) => ({
              value: t.id,
              label: `${t.code} - ${t.name}`,
            }))}
            placeholder="Pilih guru"
            required
          />

          <Select
            label="Mata Pelajaran"
            value={formData.subjectId}
            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            options={subjects.map((s) => ({
              value: s.id,
              label: `${s.code} - ${s.name}`,
            }))}
            placeholder="Pilih mata pelajaran"
            required
          />

          <Select
            label="Kelas"
            value={formData.classId}
            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            options={classes.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            placeholder="Pilih kelas"
            required
          />

          <Input
            label="Jumlah Jam per Minggu"
            type="number"
            value={String(formData.hoursPerWeek)}
            onChange={(e) => setFormData({ ...formData, hoursPerWeek: Number(e.target.value) })}
            required
            min="1"
            max="20"
          />

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
        onClose={() => setDeleteDialog({ isOpen: false, allocationId: null })}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus alokasi mengajar ini?"
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </>
  );
}
