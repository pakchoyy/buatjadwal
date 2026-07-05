/**
 * Export Functions - Export jadwal ke PDF/Excel-friendly formats
 */

import * as XLSX from "xlsx";
import { LocalDB } from "./db";
import { getAllScheduleEntries } from "./scheduler";
import { DAYS, DAY_LABELS, Day } from "./types";

type SheetRow = Array<string | number | undefined | null>;

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, "_").replace(/^_+|_+$/g, "") || "jadwal";
}

function downloadWorkbook(filename: string, rows: SheetRow[], sheetName: string): void {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const totalColumns = rows.reduce((max, row) => Math.max(max, row.length), 0);

  worksheet["!cols"] = Array.from({ length: totalColumns }, (_, columnIndex) => {
    const maxWidth = rows.reduce((width, row) => {
      const cell = row[columnIndex];
      return Math.max(width, String(cell ?? "").length);
    }, 10);

    return { wch: Math.min(Math.max(maxWidth + 2, 12), 36) };
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

export function printSchedule(): void {
  window.print();
}

export function exportScheduleToPdf(): void {
  window.print();
}

export function exportClassScheduleToXlsx(schoolId: string, classId: string): void {
  const school = LocalDB.getSchool();
  const cls = LocalDB.getClass(classId);
  const teachers = LocalDB.listTeachers(schoolId);
  const subjects = LocalDB.listSubjects(schoolId);
  const timeSlots = LocalDB.listTimeSlots(schoolId);
  const scheduleEntries = getAllScheduleEntries(schoolId).filter(
    (entry) => entry.classId === classId
  );

  const slotNumbers = Array.from(
    new Set(timeSlots.filter((slot) => !slot.isBreak).map((slot) => slot.slotNumber))
  ).sort((a, b) => a - b);

  const rows: SheetRow[] = [
    ["Sekolah", school?.name || ""],
    ["Kelas", cls?.name || ""],
    ["Tahun Ajaran", school?.academicYear || ""],
    ["Semester", school?.semester || ""],
    ["Dicetak", new Date().toLocaleString("id-ID")],
    [],
    ["Jam", ...DAYS.map((day) => DAY_LABELS[day])],
  ];

  slotNumbers.forEach((slotNumber) => {
    rows.push([
      `Jam ${slotNumber}`,
      ...DAYS.map((day) => {
        const slot = timeSlots.find(
          (item) => item.day === day && item.slotNumber === slotNumber && !item.isBreak
        );
        if (!slot) return "";

        const entry = scheduleEntries.find((item) => item.timeSlotId === slot.id);
        if (!entry) return "-";

        const subject = subjects.find((item) => item.id === entry.subjectId);
        const teacher = teachers.find((item) => item.id === entry.teacherId);
        return `${subject?.name || "-"} - ${teacher?.name || "-"}`;
      }),
    ]);
  });

  const className = sanitizeFilename(cls?.name || "kelas");
  downloadWorkbook(`Jadwal_Kelas_${className}_${Date.now()}.xlsx`, rows, "Jadwal Kelas");
}

export function exportTeacherScheduleToXlsx(schoolId: string, teacherId: string): void {
  const school = LocalDB.getSchool();
  const teacher = LocalDB.getTeacher(teacherId);
  const classes = LocalDB.listClasses(schoolId);
  const subjects = LocalDB.listSubjects(schoolId);
  const timeSlots = LocalDB.listTimeSlots(schoolId);
  const scheduleEntries = getAllScheduleEntries(schoolId).filter(
    (entry) => entry.teacherId === teacherId
  );

  const slotNumbers = Array.from(
    new Set(timeSlots.filter((slot) => !slot.isBreak).map((slot) => slot.slotNumber))
  ).sort((a, b) => a - b);

  const rows: SheetRow[] = [
    ["Sekolah", school?.name || ""],
    ["Guru", teacher?.name || ""],
    ["Kode", teacher?.code || ""],
    ["Tahun Ajaran", school?.academicYear || ""],
    ["Semester", school?.semester || ""],
    ["Dicetak", new Date().toLocaleString("id-ID")],
    [],
    ["Jam", ...DAYS.map((day) => DAY_LABELS[day])],
  ];

  slotNumbers.forEach((slotNumber) => {
    rows.push([
      `Jam ${slotNumber}`,
      ...DAYS.map((day) => {
        const slot = timeSlots.find(
          (item) => item.day === day && item.slotNumber === slotNumber && !item.isBreak
        );
        if (!slot) return "";

        const entry = scheduleEntries.find((item) => item.timeSlotId === slot.id);
        if (!entry) return "-";

        const subject = subjects.find((item) => item.id === entry.subjectId);
        const cls = classes.find((item) => item.id === entry.classId);
        return `${subject?.name || "-"} - ${cls?.name || "-"}`;
      }),
    ]);
  });

  const teacherName = sanitizeFilename(teacher?.name || "guru");
  downloadWorkbook(`Jadwal_Guru_${teacherName}_${Date.now()}.xlsx`, rows, "Jadwal Guru");
}

export function exportAllSchedulesToXlsx(schoolId: string, day: Day): void {
  const school = LocalDB.getSchool();
  const classes = LocalDB.listClasses(schoolId).sort((a, b) => a.name.localeCompare(b.name));
  const teachers = LocalDB.listTeachers(schoolId);
  const subjects = LocalDB.listSubjects(schoolId);
  const timeSlots = LocalDB.listTimeSlots(schoolId)
    .filter((slot) => slot.day === day)
    .sort((a, b) => a.slotNumber - b.slotNumber);
  const scheduleEntries = getAllScheduleEntries(schoolId);

  const rows: SheetRow[] = [
    ["Sekolah", school?.name || ""],
    ["Hari", DAY_LABELS[day]],
    ["Tahun Ajaran", school?.academicYear || ""],
    ["Semester", school?.semester || ""],
    ["Dicetak", new Date().toLocaleString("id-ID")],
    [],
    ["Jam", "Waktu", ...classes.map((cls) => cls.name)],
  ];

  timeSlots.forEach((slot) => {
    rows.push([
      `Jam ${slot.slotNumber}`,
      `${slot.startTime}-${slot.endTime}`,
      ...classes.map((cls) => {
        if (slot.isBreak) return "Istirahat";

        const entry = scheduleEntries.find(
          (item) => item.timeSlotId === slot.id && item.classId === cls.id
        );
        if (!entry) return "-";

        const subject = subjects.find((item) => item.id === entry.subjectId);
        const teacher = teachers.find((item) => item.id === entry.teacherId);
        return `${subject?.name || "-"} - ${teacher?.name || "-"}`;
      }),
    ]);
  });

  downloadWorkbook(`Jadwal_${sanitizeFilename(DAY_LABELS[day])}_${Date.now()}.xlsx`, rows, "Jadwal Umum");
}
