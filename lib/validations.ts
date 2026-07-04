/**
 * Validation Functions untuk Constraint Enforcement
 */

import {
  ValidationResult,
  DependencyCheck,
  Day,
  DAYS,
  GRADES,
} from "./types";
import { isValidTimeFormat, isTimeRangeValid, isEmpty } from "./utils";

// Import akan digunakan oleh LocalDB, jadi kita perlu dynamic import untuk avoid circular dependency
// Untuk sekarang, kita pass data langsung sebagai parameter

// ==================== SCHOOL VALIDATIONS ====================

/**
 * Validate school limit (max 1 school)
 */
export function validateSchoolLimit(
  existingSchools: any[]
): ValidationResult {
  if (existingSchools.length > 0) {
    return {
      valid: false,
      message:
        "Sudah ada sekolah yang terdaftar. Sistem hanya mendukung 1 sekolah per instance.",
    };
  }
  return { valid: true };
}

/**
 * Validate school form data
 */
export function validateSchoolForm(data: any): ValidationResult {
  if (isEmpty(data.name)) {
    return { valid: false, message: "Nama sekolah wajib diisi" };
  }
  if (isEmpty(data.address)) {
    return { valid: false, message: "Alamat sekolah wajib diisi" };
  }
  if (isEmpty(data.district)) {
    return { valid: false, message: "Kabupaten/Kota wajib diisi" };
  }
  if (isEmpty(data.email)) {
    return { valid: false, message: "Email sekolah wajib diisi" };
  }
  if (isEmpty(data.academicYear)) {
    return { valid: false, message: "Tahun ajaran wajib diisi" };
  }
  if (isEmpty(data.semester)) {
    return { valid: false, message: "Semester wajib diisi" };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { valid: false, message: "Format email tidak valid" };
  }

  return { valid: true };
}

// ==================== CLASS VALIDATIONS ====================

/**
 * Validate class uniqueness (schoolId + name)
 */
export function validateClassUnique(
  schoolId: string,
  name: string,
  allClasses: any[],
  excludeId?: string
): ValidationResult {
  const duplicate = allClasses.find(
    (c) =>
      c.schoolId === schoolId && c.name === name && c.id !== excludeId
  );

  if (duplicate) {
    return {
      valid: false,
      message: `Kelas ${name} sudah ada di sekolah ini`,
    };
  }

  return { valid: true };
}

/**
 * Validate class form data
 */
export function validateClassForm(data: any): ValidationResult {
  if (isEmpty(data.schoolId)) {
    return { valid: false, message: "School ID wajib diisi" };
  }
  if (isEmpty(data.name)) {
    return { valid: false, message: "Nama kelas wajib diisi" };
  }
  if (!data.grade) {
    return { valid: false, message: "Tingkat kelas wajib diisi" };
  }
  if (!GRADES.includes(data.grade)) {
    return { valid: false, message: "Tingkat kelas harus 7, 8, atau 9" };
  }

  return { valid: true };
}

/**
 * Check class dependencies before delete
 */
export function checkClassDependencies(
  classId: string,
  allocations: any[],
  schedules: any[]
): DependencyCheck {
  const allocationCount = allocations.filter(
    (a) => a.classId === classId
  ).length;
  const scheduleCount = schedules.filter((s) => s.classId === classId).length;

  if (allocationCount > 0 || scheduleCount > 0) {
    return {
      canDelete: false,
      message: `Tidak dapat menghapus kelas. Masih ada ${allocationCount} alokasi mengajar dan ${scheduleCount} entry jadwal yang menggunakan kelas ini. Hapus data terkait terlebih dahulu.`,
      dependencies: {
        allocations: allocationCount,
        schedules: scheduleCount,
      },
    };
  }

  return { canDelete: true };
}

// ==================== TEACHER VALIDATIONS ====================

/**
 * Validate teacher uniqueness (schoolId + code)
 */
export function validateTeacherUnique(
  schoolId: string,
  code: string,
  allTeachers: any[],
  excludeId?: string
): ValidationResult {
  const duplicate = allTeachers.find(
    (t) =>
      t.schoolId === schoolId && t.code === code && t.id !== excludeId
  );

  if (duplicate) {
    return {
      valid: false,
      message: `Kode guru ${code} sudah digunakan`,
    };
  }

  return { valid: true };
}

/**
 * Validate teacher form data
 */
export function validateTeacherForm(data: any): ValidationResult {
  if (isEmpty(data.schoolId)) {
    return { valid: false, message: "School ID wajib diisi" };
  }
  if (isEmpty(data.code)) {
    return { valid: false, message: "Kode guru wajib diisi" };
  }
  if (isEmpty(data.name)) {
    return { valid: false, message: "Nama guru wajib diisi" };
  }

  return { valid: true };
}

/**
 * Check teacher dependencies before delete
 */
export function checkTeacherDependencies(
  teacherId: string,
  allocations: any[],
  schedules: any[]
): DependencyCheck {
  const allocationCount = allocations.filter(
    (a) => a.teacherId === teacherId
  ).length;
  const scheduleCount = schedules.filter(
    (s) => s.teacherId === teacherId
  ).length;

  if (allocationCount > 0 || scheduleCount > 0) {
    return {
      canDelete: false,
      message: `Tidak dapat menghapus guru. Masih ada ${allocationCount} alokasi mengajar dan ${scheduleCount} entry jadwal yang menggunakan guru ini. Hapus data terkait terlebih dahulu.`,
      dependencies: {
        allocations: allocationCount,
        schedules: scheduleCount,
      },
    };
  }

  return { canDelete: true };
}

// ==================== SUBJECT VALIDATIONS ====================

/**
 * Validate subject uniqueness (schoolId + code)
 */
export function validateSubjectUnique(
  schoolId: string,
  code: string,
  allSubjects: any[],
  excludeId?: string
): ValidationResult {
  const duplicate = allSubjects.find(
    (s) =>
      s.schoolId === schoolId && s.code === code && s.id !== excludeId
  );

  if (duplicate) {
    return {
      valid: false,
      message: `Kode mata pelajaran ${code} sudah digunakan`,
    };
  }

  return { valid: true };
}

/**
 * Validate subject form data
 */
export function validateSubjectForm(data: any): ValidationResult {
  if (isEmpty(data.schoolId)) {
    return { valid: false, message: "School ID wajib diisi" };
  }
  if (isEmpty(data.code)) {
    return { valid: false, message: "Kode mata pelajaran wajib diisi" };
  }
  if (isEmpty(data.name)) {
    return { valid: false, message: "Nama mata pelajaran wajib diisi" };
  }

  return { valid: true };
}

/**
 * Check subject dependencies before delete
 */
export function checkSubjectDependencies(
  subjectId: string,
  allocations: any[],
  schedules: any[]
): DependencyCheck {
  const allocationCount = allocations.filter(
    (a) => a.subjectId === subjectId
  ).length;
  const scheduleCount = schedules.filter(
    (s) => s.subjectId === subjectId
  ).length;

  if (allocationCount > 0 || scheduleCount > 0) {
    return {
      canDelete: false,
      message: `Tidak dapat menghapus mata pelajaran. Masih ada ${allocationCount} alokasi mengajar dan ${scheduleCount} entry jadwal yang menggunakan mata pelajaran ini. Hapus data terkait terlebih dahulu.`,
      dependencies: {
        allocations: allocationCount,
        schedules: scheduleCount,
      },
    };
  }

  return { canDelete: true };
}

// ==================== TIMESLOT VALIDATIONS ====================

/**
 * Validate timeslot uniqueness (schoolId + day + slotNumber)
 */
export function validateTimeSlotUnique(
  schoolId: string,
  day: Day,
  slotNumber: number,
  allTimeSlots: any[],
  excludeId?: string
): ValidationResult {
  const duplicate = allTimeSlots.find(
    (ts) =>
      ts.schoolId === schoolId &&
      ts.day === day &&
      ts.slotNumber === slotNumber &&
      ts.id !== excludeId
  );

  if (duplicate) {
    return {
      valid: false,
      message: `Slot ${slotNumber} di hari ${day} sudah ada`,
    };
  }

  return { valid: true };
}

/**
 * Validate timeslot form data
 */
export function validateTimeSlotForm(data: any): ValidationResult {
  if (isEmpty(data.schoolId)) {
    return { valid: false, message: "School ID wajib diisi" };
  }
  if (isEmpty(data.day)) {
    return { valid: false, message: "Hari wajib diisi" };
  }
  if (!DAYS.includes(data.day)) {
    return { valid: false, message: "Hari tidak valid" };
  }
  if (!data.slotNumber || data.slotNumber < 1) {
    return { valid: false, message: "Nomor slot wajib diisi dan harus > 0" };
  }
  if (isEmpty(data.startTime)) {
    return { valid: false, message: "Waktu mulai wajib diisi" };
  }
  if (isEmpty(data.endTime)) {
    return { valid: false, message: "Waktu selesai wajib diisi" };
  }

  // Validate time format
  if (!isValidTimeFormat(data.startTime)) {
    return {
      valid: false,
      message: "Format waktu mulai tidak valid (gunakan HH:MM)",
    };
  }
  if (!isValidTimeFormat(data.endTime)) {
    return {
      valid: false,
      message: "Format waktu selesai tidak valid (gunakan HH:MM)",
    };
  }

  // Validate time range
  if (!isTimeRangeValid(data.startTime, data.endTime)) {
    return {
      valid: false,
      message: "Waktu mulai harus lebih awal dari waktu selesai",
    };
  }

  return { valid: true };
}

/**
 * Check timeslot dependencies before delete
 */
export function checkTimeSlotDependencies(
  timeSlotId: string,
  schedules: any[]
): DependencyCheck {
  const scheduleCount = schedules.filter(
    (s) => s.timeSlotId === timeSlotId
  ).length;

  if (scheduleCount > 0) {
    return {
      canDelete: false,
      message: `Tidak dapat menghapus slot waktu. Masih ada ${scheduleCount} entry jadwal yang menggunakan slot waktu ini. Hapus jadwal terkait terlebih dahulu.`,
      dependencies: {
        schedules: scheduleCount,
      },
    };
  }

  return { canDelete: true };
}

// ==================== TEACHING ALLOCATION VALIDATIONS ====================

/**
 * Validate teaching allocation uniqueness (schoolId + teacherId + subjectId + classId)
 */
export function validateTeachingAllocationUnique(
  schoolId: string,
  teacherId: string,
  subjectId: string,
  classId: string,
  allAllocations: any[],
  excludeId?: string
): ValidationResult {
  const duplicate = allAllocations.find(
    (a) =>
      a.schoolId === schoolId &&
      a.teacherId === teacherId &&
      a.subjectId === subjectId &&
      a.classId === classId &&
      a.id !== excludeId
  );

  if (duplicate) {
    return {
      valid: false,
      message:
        "Guru ini sudah mengajar mata pelajaran yang sama di kelas ini",
    };
  }

  return { valid: true };
}

/**
 * Validate teaching allocation form data
 */
export function validateTeachingAllocationForm(data: any): ValidationResult {
  if (isEmpty(data.schoolId)) {
    return { valid: false, message: "School ID wajib diisi" };
  }
  if (isEmpty(data.teacherId)) {
    return { valid: false, message: "Guru wajib dipilih" };
  }
  if (isEmpty(data.subjectId)) {
    return { valid: false, message: "Mata pelajaran wajib dipilih" };
  }
  if (isEmpty(data.classId)) {
    return { valid: false, message: "Kelas wajib dipilih" };
  }
  if (!data.hoursPerWeek || data.hoursPerWeek < 1) {
    return {
      valid: false,
      message: "Jumlah jam per minggu wajib diisi dan harus > 0",
    };
  }

  return { valid: true };
}
