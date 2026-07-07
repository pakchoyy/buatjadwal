/**
 * Subjects Page - CRUD untuk mata pelajaran
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, Download, Pencil, Plus, Trash2, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { LocalDB } from "@/lib/db";
import { Subject, AlertState, SubjectFormData } from "@/lib/types";
import { filterBySearch } from "@/lib/utils";
import { downloadTemplate, parseExcelFile } from "@/lib/spreadsheet-import";

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
  const [importResult, setImportResult] = useState<{
    isOpen: boolean;
    imported: number;
    errors: { row: number; message: string }[];
  }>({ isOpen: false, imported: 0, errors: [] });
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDownloadTemplate = () => {
    downloadTemplate(
      "Template_Import_Mata_Pelajaran.xlsx",
      ["Kode", "Nama"],
      [
        ["A1", "Matematika"],
        ["A2", "Bahasa Indonesia"],
        ["A3", "IPA"],
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

        if (!code) {
          errors.push({ row: i + 2, message: "Kode kosong" });
          continue;
        }
        if (!name) {
          errors.push({ row: i + 2, message: "Nama kosong" });
          continue;
        }

        try {
          LocalDB.createSubject({ schoolId: school.id, code, name });
          imported++;
        } catch (err) {
          errors.push({ row: i + 2, message: err instanceof Error ? err.message : "Error" });
        }
      }

      setImportResult({ isOpen: true, imported, errors });
      loadSubjects();
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
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={handleCreate}>
              <Plus size={16} />
              Tambah Mata Pelajaran
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
            label="Cari Mata Pelajaran"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ketik nama atau kode mata pelajaran..."
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            {filteredSubjects.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <BookOpen size={48} className="text-gray-300" />
                <p className="text-gray-500">
                  {searchTerm ? "Tidak ada mata pelajaran yang ditemukan" : "Belum ada data mata pelajaran"}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-gray-400">
                    Klik tombol &quot;Tambah Mata Pelajaran&quot; di atas untuk memulai
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
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, subjectId: subject.id })}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Hapus mata pelajaran"
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

      <Modal
        isOpen={importResult.isOpen}
        onClose={() => setImportResult({ ...importResult, isOpen: false })}
        title="Hasil Import"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Berhasil: <strong className="text-green-700">{importResult.imported}</strong> mata pelajaran
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
