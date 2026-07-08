/**
 * Schools Page - School info display and edit
 */

"use client";

import { useState, useEffect } from "react";
import { Building2, Pencil, Plus, School as SchoolIcon, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
// import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SaveIndicator from "@/components/ui/SaveIndicator";
import { LocalDB } from "@/lib/db";
import { School, AlertState, SchoolFormData } from "@/lib/types";
// import { SCHOOL_LEVELS, SCHOOL_LEVEL_LABELS } from "@/lib/types";
import { autoSave } from "@/lib/auto-save";

export default function SchoolsPage() {
  const [school, setSchool] = useState<School | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<SchoolFormData>({
    name: "",
    level: undefined,
    address: "",
    district: "",
    email: "",
    academicYear: "",
    semester: "",
  });
  const [errors, setErrors] = useState<Partial<SchoolFormData>>({});
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadSchool();
  }, []);

  const loadSchool = () => {
    const data = LocalDB.getSchool();
    setSchool(data);
  };

  const handleEdit = () => {
    if (school) {
      setFormData({
        name: school.name,
        level: school.level,
        address: school.address,
        district: school.district,
        email: school.email,
        academicYear: school.academicYear,
        semester: school.semester,
      });
      setIsModalOpen(true);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "SDN MBG Nusantara",
      level: "sd",
      address: "",
      district: "Kabupaten Jaya",
      email: "",
      academicYear: "2026/2027",
      semester: "Ganjil",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      if (school) {
        // Update existing school
        LocalDB.updateSchool(school.id, formData);
        autoSave(() => {});
        setAlert({
          show: true,
          type: "success",
          message: "Data sekolah berhasil diperbarui",
        });
      } else {
        // Create new school
        LocalDB.createSchool(formData);
        autoSave(() => {});
        setAlert({
          show: true,
          type: "success",
          message: "Data sekolah berhasil dibuat",
        });
      }

      setIsModalOpen(false);
      loadSchool();
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

  const handleDelete = () => {
    if (!school) return;

    try {
      LocalDB.deleteSchool(school.id);
      setDeleteDialogOpen(false);
      loadSchool();
      setAlert({
        show: true,
        type: "success",
        message: "Data sekolah berhasil dihapus",
      });
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
      <SaveIndicator />
      {/* Action button */}
      <div className="p-4 md:p-6 pb-0">
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={school ? handleEdit : handleCreate} size="sm">
            {school ? <Pencil size={16} /> : <Plus size={16} />}
            {school ? "Edit Sekolah" : "Tambah Sekolah"}
          </Button>
          {school && (
            <Button variant="danger" onClick={() => setDeleteDialogOpen(true)} size="sm">
              <Trash2 size={16} />
              Hapus Sekolah
            </Button>
          )}
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

        {school ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Sekolah</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{school.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Alamat</label>
                <p className="text-gray-900 mt-1">{school.address}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Kabupaten/Kota</label>
                <p className="text-gray-900 mt-1">{school.district}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 mt-1">{school.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tahun Ajaran</label>
                  <p className="text-gray-900 mt-1">{school.academicYear}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Semester</label>
                  <p className="text-gray-900 mt-1">{school.semester}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <Building2 size={28} />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada data sekolah</h3>
            <p className="mt-2 text-sm text-gray-500">
              Tambahkan data sekolah untuk memulai
            </p>
            <div className="mt-6">
              <Button onClick={handleCreate}>
                <SchoolIcon size={16} />
                Tambah Sekolah
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={school ? "Edit Sekolah" : "Tambah Sekolah"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Sekolah"
             value={formData.name}
             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
             error={errors.name}
             required
             placeholder="Contoh: SDN MBG Nusantara, SMP Negeri 1 Batumarmar"
           />

           <Input
             label="Alamat"
             value={formData.address}
             onChange={(e) => setFormData({ ...formData, address: e.target.value })}
             error={errors.address}
             required
             placeholder="Jl. Raya Mulus Sekali No. 1"
           />

           <Input
             label="Kabupaten/Kota"
             value={formData.district}
             onChange={(e) => setFormData({ ...formData, district: e.target.value })}
             error={errors.district}
             required
             placeholder="Contoh: Kabupaten Jaya"
           />

           <Input
             label="Email"
             type="email"
             value={formData.email}
             onChange={(e) => setFormData({ ...formData, email: e.target.value })}
             error={errors.email}
             required
             placeholder="email@sekolah.com"
           />

           <div className="grid grid-cols-2 gap-4">
             <Input
               label="Tahun Ajaran"
               value={formData.academicYear}
               onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
               error={errors.academicYear}
               required
               placeholder="2026/2027"
             />

             <Input
               label="Semester"
               value={formData.semester}
               onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
               error={errors.semester}
               required
               placeholder="Ganjil"
             />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              <Plus size={16} className="rotate-45" />
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {!isSubmitting && <SchoolIcon size={16} />}
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus data sekolah ini?"
        warning="Sekolah hanya bisa dihapus jika tidak ada kelas, guru, mapel, slot waktu, alokasi, atau jadwal yang masih terhubung."
        confirmText="Hapus Sekolah"
        confirmVariant="danger"
      />
    </>
  );
}
