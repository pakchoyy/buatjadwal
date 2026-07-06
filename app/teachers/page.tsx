/**
 * Teachers Page - CRUD untuk guru
 */

"use client";

import { useState, useEffect } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { LocalDB } from "@/lib/db";
import { Teacher, AlertState, TeacherFormData } from "@/lib/types";
import { filterBySearch } from "@/lib/utils";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<TeacherFormData>({
    schoolId: "",
    code: "",
    name: "",
    title: "",
  });
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    teacherId: string | null;
  }>({ isOpen: false, teacherId: null });

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    const filtered = filterBySearch(teachers, searchTerm, ["name", "code"]);
    setFilteredTeachers(filtered);
  }, [teachers, searchTerm]);

  const loadTeachers = () => {
    const school = LocalDB.getSchool();
    if (school) {
      const data = LocalDB.listTeachers(school.id);
      setTeachers(data);
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

    setEditingTeacher(null);
    setFormData({
      schoolId: school.id,
      code: "",
      name: "",
      title: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      schoolId: teacher.schoolId,
      code: teacher.code,
      name: teacher.name,
      title: teacher.title || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTeacher) {
        LocalDB.updateTeacher(editingTeacher.id, formData);
        setAlert({
          show: true,
          type: "success",
          message: "Guru berhasil diperbarui",
        });
      } else {
        LocalDB.createTeacher(formData);
        setAlert({
          show: true,
          type: "success",
          message: "Guru berhasil ditambahkan",
        });
      }

      setIsModalOpen(false);
      loadTeachers();
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
    if (!deleteDialog.teacherId) return;

    try {
      LocalDB.deleteTeacher(deleteDialog.teacherId);
      setAlert({
        show: true,
        type: "success",
        message: "Guru berhasil dihapus",
      });
      setDeleteDialog({ isOpen: false, teacherId: null });
      loadTeachers();
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
            Tambah Guru
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

        {/* Search Bar */}
        <div className="mb-4">
          <Input
            label=""
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari guru (nama/kode)..."
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredTeachers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">
                {searchTerm ? "Tidak ada guru yang ditemukan" : "Belum ada data guru"}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gelar
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeachers.map((teacher, index) => (
                  <tr
                    key={teacher.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {teacher.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.title || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Edit guru"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, teacherId: teacher.id })}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Hapus guru"
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
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Total: {filteredTeachers.length} guru
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? "Edit Guru" : "Tambah Guru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Kode Guru"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            placeholder="Contoh: 01, 02"
          />

          <Input
            label="Nama Guru"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Nama lengkap"
          />

          <Input
            label="Gelar"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: S.Pd, M.Pd (opsional)"
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
        onClose={() => setDeleteDialog({ isOpen: false, teacherId: null })}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus guru ini?"
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </>
  );
}
