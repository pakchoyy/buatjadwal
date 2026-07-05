/**
 * Export Functions - Export jadwal ke PDF/Excel-friendly formats
 */

import * as XLSX from "xlsx";
import { LocalDB } from "./db";
import { getAllScheduleEntries } from "./scheduler";
import { DAYS, DAY_LABELS, Day } from "./types";

type SheetRow = Array<string | number | undefined | null>;
type PrintOrientation = "portrait" | "landscape";

interface WorkbookOptions {
  filename: string;
  rows: SheetRow[];
  sheetName: string;
  mergeRowCount?: number;
  freezeCell?: string;
  autofilterRange?: string;
}

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, "_").replace(/^_+|_+$/g, "") || "jadwal";
}

function buildMetaRows(title: string, detailLines: string[], headerRow: SheetRow): SheetRow[] {
  return [
    [title],
    ...detailLines.map((line) => [line]),
    [],
    headerRow,
  ];
}

function openPrintDialog(orientation: PrintOrientation = "landscape"): void {
  const style = document.createElement("style");
  style.media = "print";
  style.textContent = `@page { size: ${orientation}; margin: 10mm; }`;
  document.head.appendChild(style);

  const cleanup = () => {
    style.remove();
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
}

function downloadWorkbook({
  filename,
  rows,
  sheetName,
  mergeRowCount = 0,
  freezeCell,
  autofilterRange,
}: WorkbookOptions): void {
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

  if (mergeRowCount > 0 && totalColumns > 1) {
    worksheet["!merges"] = Array.from({ length: mergeRowCount }, (_, rowIndex) => ({
      s: { r: rowIndex, c: 0 },
      e: { r: rowIndex, c: totalColumns - 1 },
    }));
  }

  if (freezeCell) {
    worksheet["!freeze"] = { xSplit: 0, ySplit: 0, topLeftCell: freezeCell, activePane: "bottomLeft", state: "frozen" };
  }

  if (autofilterRange) {
    worksheet["!autofilter"] = { ref: autofilterRange };
  }

  worksheet["!rows"] = rows.map((_, index) => {
    if (index === 0) return { hpt: 24 };
    if (index <= mergeRowCount) return { hpt: 18 };
    return { hpt: 16 };
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

export function printSchedule(orientation: PrintOrientation = "landscape"): void {
  openPrintDialog(orientation);
}

export function exportScheduleToPdf(orientation: PrintOrientation = "landscape"): void {
  openPrintDialog(orientation);
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

  const headerRow: SheetRow = ["Jam", ...DAYS.map((day) => DAY_LABELS[day])];
  const rows: SheetRow[] = buildMetaRows(
    "Jadwal per Kelas",
    [
      school?.name || "",
      `Kelas ${cls?.name || "-"} | Tahun Ajaran ${school?.academicYear || "-"} | Semester ${school?.semester || "-"}`,
      `Dicetak: ${new Date().toLocaleString("id-ID")}`,
    ],
    headerRow
  );

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
  downloadWorkbook({
    filename: `Jadwal_Kelas_${className}_${Date.now()}.xlsx`,
    rows,
    sheetName: "Jadwal Kelas",
    mergeRowCount: 4,
    freezeCell: "A6",
    autofilterRange: `A5:${XLSX.utils.encode_col(headerRow.length - 1)}5`,
  });
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

  const headerRow: SheetRow = ["Jam", ...DAYS.map((day) => DAY_LABELS[day])];
  const rows: SheetRow[] = buildMetaRows(
    "Jadwal per Guru",
    [
      school?.name || "",
      `${teacher?.name || "-"} (${teacher?.code || "-"}) | Tahun Ajaran ${school?.academicYear || "-"} | Semester ${school?.semester || "-"}`,
      `Dicetak: ${new Date().toLocaleString("id-ID")}`,
    ],
    headerRow
  );

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
  downloadWorkbook({
    filename: `Jadwal_Guru_${teacherName}_${Date.now()}.xlsx`,
    rows,
    sheetName: "Jadwal Guru",
    mergeRowCount: 4,
    freezeCell: "A6",
    autofilterRange: `A5:${XLSX.utils.encode_col(headerRow.length - 1)}5`,
  });
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

  const headerRow: SheetRow = ["Jam", "Waktu", ...classes.map((cls) => cls.name)];
  const rows: SheetRow[] = buildMetaRows(
    "Jadwal Umum",
    [
      school?.name || "",
      `Hari ${DAY_LABELS[day]} | Tahun Ajaran ${school?.academicYear || "-"} | Semester ${school?.semester || "-"}`,
      `Dicetak: ${new Date().toLocaleString("id-ID")}`,
    ],
    headerRow
  );

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

  downloadWorkbook({
    filename: `Jadwal_${sanitizeFilename(DAY_LABELS[day])}_${Date.now()}.xlsx`,
    rows,
    sheetName: "Jadwal Umum",
    mergeRowCount: 4,
    freezeCell: "A6",
    autofilterRange: `A5:${XLSX.utils.encode_col(headerRow.length - 1)}5`,
  });
}
