/**
 * Schools Page - School info display and edit
 */

"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import { LocalDB } from "@/lib/db";
import { School, AlertState, SchoolFormData } from "@/lib/types";

export default function SchoolsPage() {
  const [school, setSchool] = useState<School | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<SchoolFormData>({
    name: "",
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
      name: "",
      address: "",
      district: "",
      email: "",
      academicYear: "",
      semester: "",
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
        setAlert({
          show: true,
          type: "success",
          message: "Data sekolah berhasil diperbarui",
        });
      } else {
        // Create new school
        LocalDB.createSchool(formData);
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

  return (
    <>
      {/* Action button */}
      <div className="p-4 md:p-6 pb-0">
        <div className="flex justify-end">
          <Button onClick={school ? handleEdit : handleCreate} size="sm">
            {school ? "Edit Sekolah" : "Tambah Sekolah"}
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
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada data sekolah</h3>
            <p className="mt-2 text-sm text-gray-500">
              Tambahkan data sekolah untuk memulai
            </p>
            <div className="mt-6">
              <Button onClick={handleCreate}>Tambah Sekolah</Button>
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
            placeholder="Contoh: SMP NEGERI 1 BATUMARMAR"
          />

          <Input
            label="Alamat"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={errors.address}
            required
            placeholder="Alamat lengkap sekolah"
          />

          <Input
            label="Kabupaten/Kota"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            error={errors.district}
            required
            placeholder="Contoh: KABUPATEN PAMEKASAN"
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
              placeholder="2025-2026"
            />

            <Input
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              error={errors.semester}
              required
              placeholder="Ganjil/Genap"
            />
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
    </>
  );
}
