/**
 * Export Functions - Export jadwal ke PDF/Excel-friendly formats
 */

import { jsPDF } from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";
import * as XLSX from "xlsx";
import { LocalDB } from "./db";
import { getAllScheduleEntries } from "./scheduler";
import { DAYS, DAY_LABELS, Day, EducationLevel, EDUCATION_LEVEL_LABELS } from "./types";

type SheetRow = Array<string | number | undefined | null>;
type PdfOrientation = "portrait" | "landscape";

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

function getPrintedAtLabel(): string {
  return new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSlotTimeLabel(
  timeSlots: Array<{ slotNumber: number; startTime: string; endTime: string; isBreak: boolean }>,
  slotNumber: number
): string {
  const slot = timeSlots
    .filter((item) => item.slotNumber === slotNumber && !item.isBreak)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

  return slot ? `${slot.startTime}-${slot.endTime}` : "-";
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
  const headerRowIndex = mergeRowCount;

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

  // Apply styling to all cells
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;

      const cell = worksheet[cellAddress];
      
      // Initialize style object if not exists
      if (!cell.s) cell.s = {};
      
      // Apply borders to all cells
      cell.s.border = {
        top: { style: 'thin', color: { rgb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
        left: { style: 'thin', color: { rgb: 'CBD5E1' } },
        right: { style: 'thin', color: { rgb: 'CBD5E1' } },
      };

      // Header row styling (bold + teal background + white text)
      if (R === headerRowIndex) {
        cell.s.font = { bold: true, color: { rgb: 'FFFFFF' } };
        cell.s.fill = { fgColor: { rgb: '0F766E' } };
        cell.s.alignment = { horizontal: 'center', vertical: 'center' };
      }
      // Alternate row styling (light gray background for data rows)
      else if (R > headerRowIndex && (R - headerRowIndex) % 2 === 0) {
        cell.s.fill = { fgColor: { rgb: 'F8FAFC' } };
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

function downloadPdf({
  title,
  detailLines,
  headers,
  body,
  orientation,
  filename,
}: {
  title: string;
  detailLines: string[];
  headers: string[];
  body: RowInput[];
  orientation: PdfOrientation;
  filename: string;
}): void {
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const topMargin = 32 + detailLines.length * 5;

  autoTable(doc, {
    head: [headers],
    body,
    startY: topMargin,
    margin: { top: topMargin, left: 10, right: 10, bottom: 16 },
    theme: "grid",
    tableWidth: "auto",
    styles: {
      fontSize: orientation === "landscape" ? 9 : 10,
      cellPadding: 2,
      lineColor: [203, 213, 225],
      lineWidth: 0.1,
      textColor: [17, 24, 39],
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 18 },
      1: { halign: "center", cellWidth: 24 },
    },
    didDrawPage: (data) => {
      doc.setFillColor(14, 165, 160);
      doc.roundedRect(10, 10, pageWidth - 20, 14, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text(title, 14, 19);

      doc.setTextColor(55, 65, 81);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      detailLines.forEach((line, index) => {
        doc.text(line, 10, 30 + index * 5);
      });

      doc.setDrawColor(226, 232, 240);
      doc.line(10, pageHeight - 11, pageWidth - 10, pageHeight - 11);
      doc.setFontSize(8);
      doc.text(`Bantu Guru Yuk - Halaman ${data.pageNumber}`, 10, pageHeight - 6);
      doc.text(getPrintedAtLabel(), pageWidth - 10, pageHeight - 6, { align: "right" });
    },
  });

  doc.save(filename);
}

export function exportClassScheduleToPdf(schoolId: string, classId: string): void {
  const school = LocalDB.getSchool();
  const cls = LocalDB.getClass(classId);
  const teachers = LocalDB.listTeachers(schoolId);
  const subjects = LocalDB.listSubjects(schoolId);
  const timeSlots = LocalDB.listTimeSlots(schoolId);
  const scheduleEntries = getAllScheduleEntries(schoolId).filter(
    (entry) => entry.classId === classId
  );

  // Get active days (days that actually have slots)
  const activeDays = Array.from(
    new Set(timeSlots.filter((slot) => !slot.isBreak).map((slot) => slot.day))
  ).sort((a, b) => DAYS.indexOf(a as Day) - DAYS.indexOf(b as Day)) as Day[];

  const slotNumbers = Array.from(
    new Set(timeSlots.filter((slot) => !slot.isBreak).map((slot) => slot.slotNumber))
  ).sort((a, b) => a - b);

  const body: RowInput[] = slotNumbers.map((slotNumber) => [
    `Jam ${slotNumber}`,
    getSlotTimeLabel(timeSlots, slotNumber),
    ...activeDays.map((day) => {
      const slot = timeSlots.find(
        (item) => item.day === day && item.slotNumber === slotNumber && !item.isBreak
      );
      if (!slot) return "-";

      const entry = scheduleEntries.find((item) => item.timeSlotId === slot.id);
      if (!entry) return "-";

      const subject = subjects.find((item) => item.id === entry.subjectId);
      const teacher = teachers.find((item) => item.id === entry.teacherId);
      return `${subject?.name || "-"}\n${teacher?.name || "-"}`;
    }),
  ]);

  downloadPdf({
    title: "Jadwal per Kelas",
    detailLines: [
      school?.name || "-",
      `Kelas ${cls?.name || "-"} | ${EDUCATION_LEVEL_LABELS[cls?.educationLevel as EducationLevel] || "-"} ${cls?.grade || ""}`,
      `Tahun Ajaran ${school?.academicYear || "-"} | Semester ${school?.semester || "-"}`,
    ],
    headers: ["Jam", "Waktu", ...activeDays.map((day) => DAY_LABELS[day])],
    body,
    orientation: "portrait",
    filename: `Jadwal_Kelas_${sanitizeFilename(cls?.name || "kelas")}_${Date.now()}.pdf`,
  });
}

export function exportTeacherScheduleToPdf(schoolId: string, teacherId: string): void {
  const school = LocalDB.getSchool();
  const teacher = LocalDB.getTeacher(teacherId);
  const classes = LocalDB.listClasses(schoolId);
  const subjects = LocalDB.listSubjects(schoolId);
  const timeSlots = LocalDB.listTimeSlots(schoolId);
  const scheduleEntries = getAllScheduleEntries(schoolId).filter(
    (entry) => entry.teacherId === teacherId
  );

  // Get active days (days that actually have slots)
  const activeDays = Array.from(
    new Set(timeSlots.filter((slot) => !slot.isBreak).map((slot) => slot.day))
  ).sort((a, b) => DAYS.indexOf(a as Day) - DAYS.indexOf(b as Day)) as Day[];

  const slotNumbers = Array.from(
    new Set(timeSlots.filter((slot) => !slot.isBreak).map((slot) => slot.slotNumber))
  ).sort((a, b) => a - b);

  const body: RowInput[] = slotNumbers.map((slotNumber) => [
    `Jam ${slotNumber}`,
    getSlotTimeLabel(timeSlots, slotNumber),
    ...activeDays.map((day) => {
      const slot = timeSlots.find(
        (item) => item.day === day && item.slotNumber === slotNumber && !item.isBreak
      );
      if (!slot) return "-";

      const entry = scheduleEntries.find((item) => item.timeSlotId === slot.id);
      if (!entry) return "-";

      const subject = subjects.find((item) => item.id === entry.subjectId);
      const cls = classes.find((item) => item.id === entry.classId);
      return `${subject?.name || "-"}\n${cls?.name || "-"}`;
    }),
  ]);

  downloadPdf({
    title: "Jadwal per Guru",
    detailLines: [
      school?.name || "-",
      `${teacher?.name || "-"} (${teacher?.code || "-"})`,
      `Tahun Ajaran ${school?.academicYear || "-"} | Semester ${school?.semester || "-"}`,
    ],
    headers: ["Jam", "Waktu", ...activeDays.map((day) => DAY_LABELS[day])],
    body,
    orientation: "portrait",
    filename: `Jadwal_Guru_${sanitizeFilename(teacher?.name || "guru")}_${Date.now()}.pdf`,
  });
}

export function exportAllSchedulesToPdf(schoolId: string, day: Day): void {
  const school = LocalDB.getSchool();
  const classes = LocalDB.listClasses(schoolId).sort((a, b) => a.name.localeCompare(b.name));
  const teachers = LocalDB.listTeachers(schoolId);
  const subjects = LocalDB.listSubjects(schoolId);
  const timeSlots = LocalDB.listTimeSlots(schoolId)
    .filter((slot) => slot.day === day)
    .sort((a, b) => a.slotNumber - b.slotNumber);
  const scheduleEntries = getAllScheduleEntries(schoolId);

  const body: RowInput[] = timeSlots.map((slot) => [
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
      return `${subject?.name || "-"}\n${teacher?.name || "-"}`;
    }),
  ]);

  downloadPdf({
    title: "Jadwal Umum",
    detailLines: [
      school?.name || "-",
      `Hari ${DAY_LABELS[day]}`,
      `Tahun Ajaran ${school?.academicYear || "-"} | Semester ${school?.semester || "-"}`,
    ],
    headers: ["Jam", "Waktu", ...classes.map((cls) => cls.name)],
    body,
    orientation: "landscape",
    filename: `Jadwal_${sanitizeFilename(DAY_LABELS[day])}_${Date.now()}.pdf`,
  });
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

  // Get active days (days that actually have slots)
  const activeDays = Array.from(
    new Set(timeSlots.filter((slot) => !slot.isBreak).map((slot) => slot.day))
  ).sort((a, b) => DAYS.indexOf(a as Day) - DAYS.indexOf(b as Day)) as Day[];

  const slotNumbers = Array.from(
    new Set(timeSlots.filter((slot) => !slot.isBreak).map((slot) => slot.slotNumber))
  ).sort((a, b) => a - b);

  const headerRow: SheetRow = ["Jam", ...activeDays.map((day) => DAY_LABELS[day])];
  const rows: SheetRow[] = buildMetaRows(
    "Jadwal per Kelas",
    [
      school?.name || "",
      `Kelas ${cls?.name || "-"} | ${EDUCATION_LEVEL_LABELS[cls?.educationLevel as EducationLevel] || "-"} ${cls?.grade || ""} | Tahun Ajaran ${school?.academicYear || "-"} | Semester ${school?.semester || "-"}`,
      `Dicetak: ${new Date().toLocaleString("id-ID")}`,
    ],
    headerRow
  );

  slotNumbers.forEach((slotNumber) => {
    rows.push([
      `Jam ${slotNumber}`,
      ...activeDays.map((day) => {
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

  // Get active days (days that actually have slots)
  const activeDays = Array.from(
    new Set(timeSlots.filter((slot) => !slot.isBreak).map((slot) => slot.day))
  ).sort((a, b) => DAYS.indexOf(a as Day) - DAYS.indexOf(b as Day)) as Day[];

  const slotNumbers = Array.from(
    new Set(timeSlots.filter((slot) => !slot.isBreak).map((slot) => slot.slotNumber))
  ).sort((a, b) => a - b);

  const headerRow: SheetRow = ["Jam", ...activeDays.map((day) => DAY_LABELS[day])];
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
      ...activeDays.map((day) => {
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

export function exportAllSchedulesToXlsxMultiSheet(schoolId: string): void {
  const school = LocalDB.getSchool();
  const classes = LocalDB.listClasses(schoolId).sort((a, b) => a.name.localeCompare(b.name));
  const teachers = LocalDB.listTeachers(schoolId);
  const subjects = LocalDB.listSubjects(schoolId);
  const allTimeSlots = LocalDB.listTimeSlots(schoolId);
  const scheduleEntries = getAllScheduleEntries(schoolId);

  // Get active days (days that actually have slots)
  const activeDays = Array.from(
    new Set(allTimeSlots.filter((slot) => !slot.isBreak).map((slot) => slot.day))
  ).sort((a, b) => DAYS.indexOf(a as Day) - DAYS.indexOf(b as Day)) as Day[];

  const workbook = XLSX.utils.book_new();

  // Create a sheet for each active day
  activeDays.forEach((day) => {
    const timeSlots = allTimeSlots
      .filter((slot) => slot.day === day)
      .sort((a, b) => a.slotNumber - b.slotNumber);

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

    // Create worksheet for this day
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const totalColumns = rows.reduce((max, row) => Math.max(max, row.length), 0);
    const headerRowIndex = 4;

    // Column widths
    worksheet["!cols"] = Array.from({ length: totalColumns }, (_, columnIndex) => {
      const maxWidth = rows.reduce((width, row) => {
        const cell = row[columnIndex];
        return Math.max(width, String(cell ?? "").length);
      }, 10);
      return { wch: Math.min(Math.max(maxWidth + 2, 12), 36) };
    });

    // Merge meta rows
    if (totalColumns > 1) {
      worksheet["!merges"] = Array.from({ length: 4 }, (_, rowIndex) => ({
        s: { r: rowIndex, c: 0 },
        e: { r: rowIndex, c: totalColumns - 1 },
      }));
    }

    // Freeze panes
    worksheet["!freeze"] = { xSplit: 0, ySplit: 0, topLeftCell: "A6", activePane: "bottomLeft", state: "frozen" };

    // Autofilter
    worksheet["!autofilter"] = { ref: `A5:${XLSX.utils.encode_col(headerRow.length - 1)}5` };

    // Row heights
    worksheet["!rows"] = rows.map((_, index) => {
      if (index === 0) return { hpt: 24 };
      if (index <= 4) return { hpt: 18 };
      return { hpt: 16 };
    });

    // Apply styling to all cells
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;

        const cell = worksheet[cellAddress];
        if (!cell.s) cell.s = {};
        
        // Borders for all cells
        cell.s.border = {
          top: { style: 'thin', color: { rgb: 'CBD5E1' } },
          bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
          left: { style: 'thin', color: { rgb: 'CBD5E1' } },
          right: { style: 'thin', color: { rgb: 'CBD5E1' } },
        };

        // Header row styling
        if (R === headerRowIndex) {
          cell.s.font = { bold: true, color: { rgb: 'FFFFFF' } };
          cell.s.fill = { fgColor: { rgb: '0F766E' } };
          cell.s.alignment = { horizontal: 'center', vertical: 'center' };
        }
        // Alternate row styling
        else if (R > headerRowIndex && (R - headerRowIndex) % 2 === 0) {
          cell.s.fill = { fgColor: { rgb: 'F8FAFC' } };
        }
      }
    }

    // Append sheet with day name
    XLSX.utils.book_append_sheet(workbook, worksheet, DAY_LABELS[day]);
  });

  // Download the workbook
  const schoolName = sanitizeFilename(school?.name || "sekolah");
  XLSX.writeFile(workbook, `Jadwal_Umum_${schoolName}_AllDays_${Date.now()}.xlsx`);
}
