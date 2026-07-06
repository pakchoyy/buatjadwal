/**
 * Subjects Page - CRUD untuk mata pelajaran
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
import { Subject, AlertState, SubjectFormData } from "@/lib/types";
import { filterBySearch } from "@/lib/utils";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>({
    schoolId: "",
    code: "",
    name: "",
  });
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    subjectId: string | null;
  }>({ isOpen: false, subjectId: null });

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    const filtered = filterBySearch(subjects, searchTerm, ["name", "code"]);
    setFilteredSubjects(filtered);
  }, [subjects, searchTerm]);

  const loadSubjects = () => {
    const school = LocalDB.getSchool();
    if (school) {
      const data = LocalDB.listSubjects(school.id);
      setSubjects(data);
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

    setEditingSubject(null);
    setFormData({
      schoolId: school.id,
      code: "",
      name: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      schoolId: subject.schoolId,
      code: subject.code,
      name: subject.name,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingSubject) {
        LocalDB.updateSubject(editingSubject.id, formData);
        setAlert({
          show: true,
          type: "success",
          message: "Mata pelajaran berhasil diperbarui",
        });
      } else {
        LocalDB.createSubject(formData);
        setAlert({
          show: true,
          type: "success",
          message: "Mata pelajaran berhasil ditambahkan",
        });
      }

      setIsModalOpen(false);
      loadSubjects();
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
    if (!deleteDialog.subjectId) return;

    try {
      LocalDB.deleteSubject(deleteDialog.subjectId);
      setAlert({
        show: true,
        type: "success",
        message: "Mata pelajaran berhasil dihapus",
      });
      setDeleteDialog({ isOpen: false, subjectId: null });
      loadSubjects();
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
            Tambah Mapel
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
            placeholder="Cari mata pelajaran (nama/kode)..."
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredSubjects.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">
                {searchTerm ? "Tidak ada mata pelajaran yang ditemukan" : "Belum ada data mata pelajaran"}
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
                    Nama Mata Pelajaran
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubjects.map((subject, index) => (
                  <tr
                    key={subject.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Edit mata pelajaran"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, subjectId: subject.id })}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Hapus mata pelajaran"
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
          Total: {filteredSubjects.length} mata pelajaran
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Kode Mata Pelajaran"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            placeholder="Contoh: A1, B2"
          />

          <Input
            label="Nama Mata Pelajaran"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Contoh: Matematika, Bahasa Indonesia"
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
        onClose={() => setDeleteDialog({ isOpen: false, subjectId: null })}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus mata pelajaran ini?"
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </>
  );
}
