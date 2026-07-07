/**
 * Teachers Page - CRUD untuk guru
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Pencil, Plus, Trash2, Upload, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { LocalDB } from "@/lib/db";
import { Teacher, AlertState, TeacherFormData } from "@/lib/types";
import { filterBySearch } from "@/lib/utils";
import { downloadTemplate, parseExcelFile } from "@/lib/spreadsheet-import";
import { Analytics } from "@/lib/analytics";

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
  const [importResult, setImportResult] = useState<{
    isOpen: boolean;
    imported: number;
    errors: { row: number; message: string }[];
  }>({ isOpen: false, imported: 0, errors: [] });
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDownloadTemplate = () => {
    downloadTemplate(
      "Template_Import_Guru.xlsx",
      ["Kode", "Nama", "Gelar"],
      [
        ["01", "SITI AMINAH", "S.Pd"],
        ["02", "ABDUL RAHMAN", "M.Pd"],
      ]
    );
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);

    try {
      const { rows } = await parseExcelFile(file);
      const school = LocalDB.getSchool();
      if (!school) throw new Error("Silakan buat data sekolah terlebih dahulu");

      const errors: { row: number; message: string }[] = [];
      let imported = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const code = row["kode"] || "";
        const name = row["nama"] || "";
        const title = row["gelar"] || "";

        if (!code) {
          errors.push({ row: i + 2, message: "Kode kosong" });
          continue;
        }
        if (!name) {
          errors.push({ row: i + 2, message: "Nama kosong" });
          continue;
        }

        try {
          LocalDB.createTeacher({ schoolId: school.id, code, name, title });
          imported++;
        } catch (err) {
          errors.push({ row: i + 2, message: err instanceof Error ? err.message : "Error" });
        }
      }

      setImportResult({ isOpen: true, imported, errors });
      loadTeachers();
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err instanceof Error ? err.message : "Gagal import",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        Analytics.teacherCreated({
          page_name: "Teachers",
          feature: "master_data",
        });
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
      Analytics.teacherDeleted({
        page_name: "Teachers",
        feature: "master_data",
      });
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
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={handleCreate}>
              <Plus size={16} />
              Tambah Guru
            </Button>
            <Button variant="secondary" onClick={handleDownloadTemplate}>
              <Download size={16} />
              <span className="hidden sm:inline">Download Template</span>
            </Button>
            <Button variant="secondary" onClick={handleImportClick} isLoading={isImporting}>
              <Upload size={16} />
              <span className="hidden sm:inline">Import Excel</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
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
            label="Cari Guru"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ketik nama atau kode guru..."
          />
        </div>

        {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            {filteredTeachers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <Users size={48} className="text-gray-300" />
                <p className="text-gray-500">
                  {searchTerm ? "Tidak ada guru yang ditemukan" : "Belum ada data guru"}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-gray-400">
                    Klik tombol &quot;Tambah Guru&quot; di atas untuk memulai
                  </p>
                )}
              </div>
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
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, teacherId: teacher.id })}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Hapus guru"
                        >
                          <Trash2 size={14} />
                          <span className="hidden sm:inline">Hapus</span>
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

      <Modal
        isOpen={importResult.isOpen}
        onClose={() => setImportResult({ ...importResult, isOpen: false })}
        title="Hasil Import"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Berhasil: <strong className="text-green-700">{importResult.imported}</strong> guru
            {importResult.errors.length > 0 && (
              <span>
                {" "}| Gagal: <strong className="text-red-700">{importResult.errors.length}</strong> baris
              </span>
            )}
          </p>

          {importResult.errors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-800 mb-2">Detail Error:</h4>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-700">
                    Baris {err.row}: {err.message}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={() => setImportResult({ ...importResult, isOpen: false })}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
