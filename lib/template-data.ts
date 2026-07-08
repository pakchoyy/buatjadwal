/**
 * Template Data untuk Import Excel
 * Menyesuaikan dengan jenjang sekolah
 */

import { SchoolLevel, EducationLevel } from "./types";

// ==================== SUBJECTS TEMPLATES ====================

const SD_SUBJECTS_TEMPLATE = [
  ["A1", "Pendidikan Agama"],
  ["A2", "PKn"],
  ["A3", "Bahasa Indonesia"],
  ["A4", "Matematika"],
  ["A5", "IPA"],
  ["A6", "IPS"],
  ["A7", "Seni Budaya"],
  ["A8", "PJOK"],
  ["A9", "Bahasa Inggris"],
  ["B1", "Muatan Lokal"],
];

const SMP_SUBJECTS_TEMPLATE = [
  ["A1", "Pendidikan Agama"],
  ["A2", "PKn"],
  ["A3", "Bahasa Indonesia"],
  ["A4", "Matematika"],
  ["A5", "IPA"],
  ["A6", "IPS"],
  ["A7", "Bahasa Inggris"],
  ["A8", "Seni Budaya"],
  ["A9", "PJOK"],
  ["B1", "Prakarya"],
  ["B2", "Muatan Lokal"],
];

const SMA_SUBJECTS_TEMPLATE = [
  ["A1", "Pendidikan Agama"],
  ["A2", "PKn"],
  ["A3", "Bahasa Indonesia"],
  ["A4", "Matematika Wajib"],
  ["A5", "Sejarah Indonesia"],
  ["A6", "Bahasa Inggris"],
  ["A7", "PJOK"],
  ["A8", "Seni Budaya"],
  ["B1", "Matematika Peminatan"],
  ["B2", "Biologi"],
  ["B3", "Fisika"],
  ["B4", "Kimia"],
  ["B5", "Ekonomi"],
  ["B6", "Sosiologi"],
  ["B7", "Geografi"],
  ["B8", "Sejarah"],
];

/**
 * Get subject template by school level
 */
export function getSubjectTemplateByLevel(level?: SchoolLevel): string[][] {
  if (!level) return SMP_SUBJECTS_TEMPLATE;

  switch (level) {
    case "sd":
    case "mi":
    case "sdit":
      return SD_SUBJECTS_TEMPLATE;
    case "smp":
    case "mts":
      return SMP_SUBJECTS_TEMPLATE;
    case "sma":
    case "ma":
    case "smk":
      return SMA_SUBJECTS_TEMPLATE;
    default:
      return SMP_SUBJECTS_TEMPLATE;
  }
}

// ==================== DEFAULT CLASS NAMES ====================

/**
 * Get default class name by school level
 */
export function getDefaultClassName(level?: SchoolLevel): string {
  if (!level) return "7A";

  switch (level) {
    case "sd":
    case "mi":
    case "sdit":
      return "1A";
    case "smp":
    case "mts":
      return "7A";
    case "sma":
    case "ma":
      return "10 IPA 1";
    case "smk":
      return "10 TKJ 1";
    default:
      return "7A";
  }
}

/**
 * Get education level from school level
 */
export function getEducationLevelFromSchoolLevel(level?: SchoolLevel): EducationLevel {
  if (!level) return "smp";

  switch (level) {
    case "sd":
    case "mi":
    case "sdit":
      return "sd";
    case "smp":
    case "mts":
      return "smp";
    case "sma":
    case "ma":
    case "smk":
      return "sma";
    default:
      return "smp";
  }
}

/**
 * Get default grade by school level
 */
export function getDefaultGrade(level?: SchoolLevel): number {
  if (!level) return 7;

  switch (level) {
    case "sd":
    case "mi":
    case "sdit":
      return 1;
    case "smp":
    case "mts":
      return 7;
    case "sma":
    case "ma":
    case "smk":
      return 10;
    default:
      return 7;
  }
}
