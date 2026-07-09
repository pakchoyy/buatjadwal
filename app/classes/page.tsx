"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Pencil, Plus, School, Trash2, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { LocalDB } from "@/lib/db";
import {
  Class,
  AlertState,
  ClassFormData,
  EducationLevel,
  EDUCATION_LEVELS,
  EDUCATION_LEVEL_LABELS,
  GRADE_OPTIONS,
} from "@/lib/types";
import { filterBySearch } from "@/lib/utils";
import { downloadTemplate, parseExcelFile } from "@/lib/spreadsheet-import";
import { Analytics } from "@/lib/analytics";
import { getDefaultClassName, getEducationLevelFromSchoolLevel, getDefaultGrade } from "@/lib/template-data";

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<ClassFormData>({
    schoolId: "",
    name: "",
    educationLevel: "smp",
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
  const [importResult, setImportResult] = useState<{
    isOpen: boolean;
    imported: number;
    errors: { row: number; message: string }[];
  }>({ isOpen: false, imported: 0, errors: [] });
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedLevel = formData.educationLevel as EducationLevel;
  const gradeOptions = GRADE_OPTIONS[selectedLevel] || GRADE_OPTIONS.smp;

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

  const handleDownloadTemplate = () => {
    downloadTemplate(
      "Template_Import_Kelas.xlsx",
      ["Nama Kelas", "Jenjang", "Tingkat"],
      [
        ["1A", "SMP", "7"],
        ["1B", "SMP", "7"],
        ["7A", "SMA", "10"],
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
        const name = row["nama kelas"] || "";
        const jenjang = (row["jenjang"] || "").toLowerCase();
        const tingkatStr = row["tingkat"] || "";

        if (!name) {
          errors.push({ row: i + 2, message: "Nama Kelas kosong" });
          continue;
        }

        const levelMap: Record<string, EducationLevel> = {
          sd: "sd", smp: "smp", sma: "sma",
        };
        const educationLevel = levelMap[jenjang];
        if (!educationLevel) {
          errors.push({ row: i + 2, message: `Jenjang tidak valid: ${jenjang}. Gunakan SD/SMP/SMA` });
          continue;
        }

        const grade = parseInt(tingkatStr);
        if (isNaN(grade)) {
          errors.push({ row: i + 2, message: "Tingkat harus berupa angka" });
          continue;
        }

        try {
          LocalDB.createClass({ schoolId: school.id, name, educationLevel, grade });
          imported++;
        } catch (err) {
          errors.push({ row: i + 2, message: err instanceof Error ? err.message : "Error" });
        }
      }

      setImportResult({ isOpen: true, imported, errors });
      loadClasses();
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

    const defaultEducationLevel = getEducationLevelFromSchoolLevel(school.level);
    const defaultGrade = getDefaultGrade(school.level);
    const defaultName = getDefaultClassName(school.level);

    setEditingClass(null);
    setFormData({
      schoolId: school.id,
      name: defaultName,
      educationLevel: defaultEducationLevel,
      grade: defaultGrade,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      schoolId: cls.schoolId,
      name: cls.name,
      educationLevel: cls.educationLevel,
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
        Analytics.studentCreated({
          page_name: "Classes",
          feature: "master_data",
        });
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
      Analytics.studentDeleted({
        page_name: "Classes",
        feature: "master_data",
      });
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
      <div className="p-4 md:p-6 pb-0">
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={handleCreate}>
            <Plus size={16} />
            Tambah Kelas
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

        <div className="mb-4">
          <Input
            label="Cari Kelas"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ketik nama kelas..."
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          {filteredClasses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <School size={48} className="text-gray-300" />
                <p className="text-gray-500">
                  {searchTerm ? "Tidak ada kelas yang ditemukan" : "Belum ada data kelas"}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-gray-400">
                    Klik tombol &quot;Tambah Kelas&quot; di atas untuk memulai
                  </p>
                )}
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenjang
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
                      {EDUCATION_LEVEL_LABELS[cls.educationLevel]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cls.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cls)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Edit kelas"
                        >
                          <Pencil size={14} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, classId: cls.id })}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Hapus kelas"
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
          Total: {filteredClasses.length} kelas
        </div>
      </div>

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
            placeholder="Contoh: 1A, 7B, 10C"
          />

          <Select
            label="Jenjang"
            value={formData.educationLevel}
            onChange={(e) => {
              const level = e.target.value as EducationLevel;
              const grades = GRADE_OPTIONS[level];
              setFormData({
                ...formData,
                educationLevel: level,
                grade: grades ? grades[0] : 7,
              });
            }}
            options={EDUCATION_LEVELS.map((l) => ({
              value: l,
              label: EDUCATION_LEVEL_LABELS[l],
            }))}
            required
          />

          <Select
            label="Tingkat"
            value={String(formData.grade)}
            onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
            options={gradeOptions.map((g) => ({ value: String(g), label: `Kelas ${g}` }))}
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

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, classId: null })}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus kelas ini?"
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
            Berhasil: <strong className="text-green-700">{importResult.imported}</strong> kelas
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
