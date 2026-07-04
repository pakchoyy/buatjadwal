/**
 * Export Functions - Export jadwal ke berbagai format
 */

import { LocalDB } from "./db";
import { getAllScheduleEntries } from "./scheduler";
import {
  DAYS,
  DAY_LABELS,
  Day,
} from "./types";

/**
 * Export all data to JSON
 */
export function exportAllDataToJson(schoolId: string): string {
  const school = LocalDB.getSchool();
  const classes = LocalDB.listClasses(schoolId);
  const teachers = LocalDB.listTeachers(schoolId);
  const subjects = LocalDB.listSubjects(schoolId);
  const timeSlots = LocalDB.listTimeSlots(schoolId);
  const allocations = LocalDB.listTeachingAllocations(schoolId);
  const scheduleEntries = getAllScheduleEntries(schoolId);

  const exportData = {
    school,
    classes,
    teachers,
    subjects,
    timeSlots,
    teachingAllocations: allocations,
    scheduleEntries,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download JSON file
 */
export function downloadJson(filename: string, data: string): void {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export jadwal per kelas ke JSON
 */
export function exportClassScheduleToJson(
  schoolId: string,
  classId: string
): string {
  const school = LocalDB.getSchool();
  const cls = LocalDB.getClass(classId);
  const teachers = LocalDB.listTeachers(schoolId);
  const subjects = LocalDB.listSubjects(schoolId);
  const timeSlots = LocalDB.listTimeSlots(schoolId);
  const scheduleEntries = getAllScheduleEntries(schoolId).filter(
    (e) => e.classId === classId
  );

  // Build readable schedule
  const schedule: any = {};
  DAYS.forEach((day) => {
    schedule[DAY_LABELS[day]] = [];
  });

  scheduleEntries.forEach((entry) => {
    const slot = timeSlots.find((s) => s.id === entry.timeSlotId);
    const teacher = teachers.find((t) => t.id === entry.teacherId);
    const subject = subjects.find((s) => s.id === entry.subjectId);

    if (slot) {
      schedule[DAY_LABELS[slot.day]].push({
        slot: slot.slotNumber,
        time: `${slot.startTime}-${slot.endTime}`,
        subject: subject?.name || "-",
        teacher: teacher?.name || "-",
      });
    }
  });

  // Sort by slot number
  Object.keys(schedule).forEach((day) => {
    schedule[day].sort((a: any, b: any) => a.slot - b.slot);
  });

  const exportData = {
    school: school?.name,
    class: cls?.name,
    academicYear: school?.academicYear,
    semester: school?.semester,
    schedule,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export jadwal per guru ke JSON
 */
export function exportTeacherScheduleToJson(
  schoolId: string,
  teacherId: string
): string {
  const school = LocalDB.getSchool();
  const teacher = LocalDB.getTeacher(teacherId);
  const classes = LocalDB.listClasses(schoolId);
  const subjects = LocalDB.listSubjects(schoolId);
  const timeSlots = LocalDB.listTimeSlots(schoolId);
  const scheduleEntries = getAllScheduleEntries(schoolId).filter(
    (e) => e.teacherId === teacherId
  );

  // Build readable schedule
  const schedule: any = {};
  DAYS.forEach((day) => {
    schedule[DAY_LABELS[day]] = [];
  });

  scheduleEntries.forEach((entry) => {
    const slot = timeSlots.find((s) => s.id === entry.timeSlotId);
    const cls = classes.find((c) => c.id === entry.classId);
    const subject = subjects.find((s) => s.id === entry.subjectId);

    if (slot) {
      schedule[DAY_LABELS[slot.day]].push({
        slot: slot.slotNumber,
        time: `${slot.startTime}-${slot.endTime}`,
        subject: subject?.name || "-",
        class: cls?.name || "-",
      });
    }
  });

  // Sort by slot number
  Object.keys(schedule).forEach((day) => {
    schedule[day].sort((a: any, b: any) => a.slot - b.slot);
  });

  const exportData = {
    school: school?.name,
    teacher: {
      code: teacher?.code,
      name: teacher?.name,
    },
    academicYear: school?.academicYear,
    semester: school?.semester,
    totalHours: scheduleEntries.length,
    schedule,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export jadwal umum (semua kelas) ke JSON
 */
export function exportAllSchedulesToJson(schoolId: string, day: Day): string {
  const school = LocalDB.getSchool();
  const classes = LocalDB.listClasses(schoolId);
  const teachers = LocalDB.listTeachers(schoolId);
  const subjects = LocalDB.listSubjects(schoolId);
  const timeSlots = LocalDB.listTimeSlots(schoolId).filter(
    (s) => s.day === day && !s.isBreak
  );
  const scheduleEntries = getAllScheduleEntries(schoolId);

  // Build matrix
  const matrix: any[] = [];

  timeSlots
    .sort((a, b) => a.slotNumber - b.slotNumber)
    .forEach((slot) => {
      const row: any = {
        slot: slot.slotNumber,
        time: `${slot.startTime}-${slot.endTime}`,
      };

      classes
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((cls) => {
          const entry = scheduleEntries.find(
            (e) => e.timeSlotId === slot.id && e.classId === cls.id
          );

          if (entry) {
            const teacher = teachers.find((t) => t.id === entry.teacherId);
            const subject = subjects.find((s) => s.id === entry.subjectId);
            row[cls.name] = {
              subject: subject?.name || "-",
              teacher: teacher?.name || "-",
            };
          } else {
            row[cls.name] = "-";
          }
        });

      matrix.push(row);
    });

  const exportData = {
    school: school?.name,
    day: DAY_LABELS[day],
    academicYear: school?.academicYear,
    semester: school?.semester,
    schedule: matrix,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}
