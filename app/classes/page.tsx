/**
 * Classes Page - CRUD untuk kelas
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
import { Class, AlertState, ClassFormData, GRADES } from "@/lib/types";
import { filterBySearch } from "@/lib/utils";

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<ClassFormData>({
    schoolId: "",
    name: "",
    grade: 7,
  });
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    classId: string | null;
  }>({ isOpen: false, classId: null });

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    const filtered = filterBySearch(classes, searchTerm, ["name"]);
    setFilteredClasses(filtered);
  }, [classes, searchTerm]);

  const loadClasses = () => {
    const school = LocalDB.getSchool();
    if (school) {
      const data = LocalDB.listClasses(school.id);
      setClasses(data);
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

    setEditingClass(null);
    setFormData({
      schoolId: school.id,
      name: "",
      grade: 7,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      schoolId: cls.schoolId,
      name: cls.name,
      grade: cls.grade,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingClass) {
        LocalDB.updateClass(editingClass.id, formData);
        setAlert({
          show: true,
          type: "success",
          message: "Kelas berhasil diperbarui",
        });
      } else {
        LocalDB.createClass(formData);
        setAlert({
          show: true,
          type: "success",
          message: "Kelas berhasil ditambahkan",
        });
      }

      setIsModalOpen(false);
      loadClasses();
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
    if (!deleteDialog.classId) return;

    try {
      LocalDB.deleteClass(deleteDialog.classId);
      setAlert({
        show: true,
        type: "success",
        message: "Kelas berhasil dihapus",
      });
      setDeleteDialog({ isOpen: false, classId: null });
      loadClasses();
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
            Tambah Kelas
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
            placeholder="Cari kelas..."
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredClasses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">
                {searchTerm ? "Tidak ada kelas yang ditemukan" : "Belum ada data kelas"}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tingkat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((cls, index) => (
                  <tr
                    key={cls.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cls.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Kelas {cls.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cls)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Edit kelas"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, classId: cls.id })}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Hapus kelas"
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
          Total: {filteredClasses.length} kelas
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? "Edit Kelas" : "Tambah Kelas"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Kelas"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Contoh: 7A, 8B, 9C"
          />

          <Select
            label="Tingkat"
            value={String(formData.grade)}
            onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
            options={GRADES.map((g) => ({ value: String(g), label: `Kelas ${g}` }))}
            required
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
        onClose={() => setDeleteDialog({ isOpen: false, classId: null })}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus kelas ini?"
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </>
  );
}
