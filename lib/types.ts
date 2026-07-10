/**
 * TypeScript Types & Interfaces untuk Aplikasi Jadwal Pelajaran
 * Data storage: localStorage (Phase 1A)
 */

// ==================== PAYMENT TYPES ====================

export type ExportType = "pdf-class" | "pdf-teacher" | "pdf-all" | "excel-single" | "excel-multi";

export interface ExportMetadata {
  classId?: string;
  teacherId?: string;
  day?: Day;
}

export type ScheduleGenerateMode = "spread" | "compact";

// ==================== ENTITIES ====================

export interface School {
  id: string;
  name: string;
  level?: SchoolLevel; // Jenjang sekolah
  address: string;
  district: string;
  email: string;
  academicYear: string; // "2025-2026"
  semester: string; // "Ganjil" atau "Genap"
  createdAt: number;
  updatedAt: number;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string; // "7A", "8B", "9C"
  educationLevel: EducationLevel;
  grade: number; // 1-6 (SD), 7-9 (SMP), 10-12 (SMA)
  createdAt: number;
  updatedAt: number;
}

export interface Teacher {
  id: string;
  schoolId: string;
  code: string; // "01", "02", etc
  name: string;
  title?: string; // "S.Pd", "M.Pd", etc (optional)
  createdAt: number;
  updatedAt: number;
}

export interface Subject {
  id: string;
  schoolId: string;
  code: string; // "A1", "B2", "C3"
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface TimeSlot {
  id: string;
  schoolId: string;
  day: Day;
  slotNumber: number;
  startTime: string; // "07:00" (HH:MM format)
  endTime: string; // "07:45"
  isBreak: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TeachingAllocation {
  id: string;
  schoolId: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  hoursPerWeek: number;
  createdAt: number;
  updatedAt: number;
}

export interface ScheduleEntry {
  id: string;
  schoolId: string;
  timeSlotId: string;
  classId: string;
  teacherId?: string; // optional untuk entry khusus
  subjectId?: string; // optional untuk entry khusus
  labelOverride?: string; // "UPACARA BENDERA", "ISTIRAHAT"
  createdAt: number;
  updatedAt: number;
}

// ==================== ENUMS & CONSTANTS ====================

export type Day = 
  | "monday" 
  | "tuesday" 
  | "wednesday" 
  | "thursday" 
  | "friday" 
  | "saturday";

export const DAYS: Day[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const DAY_LABELS: Record<Day, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
};

export type EducationLevel = "sd" | "smp" | "sma";

export const EDUCATION_LEVELS: EducationLevel[] = ["sd", "smp", "sma"];

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  sd: "SD",
  smp: "SMP",
  sma: "SMA",
};

// School Level (jenjang lengkap untuk UI)
export type SchoolLevel = "sd" | "mi" | "sdit" | "smp" | "mts" | "sma" | "ma" | "smk" | "other";

export const SCHOOL_LEVELS: SchoolLevel[] = ["sd", "mi", "sdit", "smp", "mts", "sma", "ma", "smk", "other"];

export const SCHOOL_LEVEL_LABELS: Record<SchoolLevel, string> = {
  sd: "SD",
  mi: "MI",
  sdit: "SDIT",
  smp: "SMP",
  mts: "MTs",
  sma: "SMA",
  ma: "MA",
  smk: "SMK",
  other: "Lainnya",
};

export const GRADE_OPTIONS: Record<EducationLevel, readonly number[]> = {
  sd: [1, 2, 3, 4, 5, 6],
  smp: [7, 8, 9],
  sma: [10, 11, 12],
};

// ==================== FORM DATA TYPES ====================

export type SchoolFormData = Omit<School, "id" | "createdAt" | "updatedAt">;

export type ClassFormData = Omit<Class, "id" | "createdAt" | "updatedAt">;

export type TeacherFormData = Omit<Teacher, "id" | "createdAt" | "updatedAt">;

export type SubjectFormData = Omit<Subject, "id" | "createdAt" | "updatedAt">;

export type TimeSlotFormData = Omit<TimeSlot, "id" | "createdAt" | "updatedAt">;

export type TeachingAllocationFormData = Omit<
  TeachingAllocation,
  "id" | "createdAt" | "updatedAt"
>;

// ==================== VALIDATION TYPES ====================

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface DependencyCheck {
  canDelete: boolean;
  message?: string;
  dependencies?: {
    allocations?: number;
    schedules?: number;
  };
}

// ==================== VIEW MODELS ====================

/**
 * Extended models with joined data for display
 */
export interface TeachingAllocationView extends TeachingAllocation {
  teacherName: string;
  teacherCode: string;
  subjectName: string;
  subjectCode: string;
  className: string;
  classEducationLevel: EducationLevel;
  classGrade: number;
}

export interface ScheduleEntryView extends ScheduleEntry {
  timeSlot: TimeSlot;
  class: Class;
  teacher?: Teacher;
  subject?: Subject;
}

// ==================== UI STATE TYPES ====================

export type FormMode = "create" | "edit";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertState {
  show: boolean;
  type: AlertType;
  message: string;
}

// ==================== PROJECT MANAGEMENT ====================

export type ProjectStatus = "draft" | "in_progress" | "completed";

export interface Project {
  id: string;
  schoolName: string;
  schoolLevel?: SchoolLevel;
  academicYear: string;
  semester: string;
  status: ProjectStatus;
  createdAt: number;
  lastEditedAt: number;
  
  // Snapshot metadata (untuk tampilan card)
  dataSnapshot: {
    schoolId: string;
    classCount: number;
    teacherCount: number;
    subjectCount: number;
    hasSchedule: boolean;
  };
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  in_progress: "Sedang Dikerjakan",
  completed: "Selesai",
};

export interface ModalState {
  isOpen: boolean;
  mode: FormMode;
  data?: any;
}
