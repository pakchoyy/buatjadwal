/**
 * Seed Data untuk Testing & Development
 * Data sample dari SMP Negeri 1 Batumarmar
 */

import { LocalDB } from "./db";
import { Day } from "./types";

// ==================== SCHOOL DATA ====================

const SCHOOL_DATA = {
  name: "SMP NEGERI 1 BATUMARMAR",
  address: "Jl. Raya Tamberu Desa Blaban Batumarmar",
  district: "KABUPATEN PAMEKASAN",
  email: "smpn1batumarmar@gmail.com",
  academicYear: "2025-2026",
  semester: "Ganjil",
};

// ==================== CLASSES DATA (30 kelas) ====================

const CLASSES_DATA = [
  // Tingkat 7 (10 kelas)
  { name: "7A", grade: 7 },
  { name: "7B", grade: 7 },
  { name: "7C", grade: 7 },
  { name: "7D", grade: 7 },
  { name: "7E", grade: 7 },
  { name: "7F", grade: 7 },
  { name: "7G", grade: 7 },
  { name: "7H", grade: 7 },
  { name: "7I", grade: 7 },
  { name: "7J", grade: 7 },

  // Tingkat 8 (10 kelas)
  { name: "8A", grade: 8 },
  { name: "8B", grade: 8 },
  { name: "8C", grade: 8 },
  { name: "8D", grade: 8 },
  { name: "8E", grade: 8 },
  { name: "8F", grade: 8 },
  { name: "8G", grade: 8 },
  { name: "8H", grade: 8 },
  { name: "8I", grade: 8 },
  { name: "8J", grade: 8 },

  // Tingkat 9 (10 kelas)
  { name: "9A", grade: 9 },
  { name: "9B", grade: 9 },
  { name: "9C", grade: 9 },
  { name: "9D", grade: 9 },
  { name: "9E", grade: 9 },
  { name: "9F", grade: 9 },
  { name: "9G", grade: 9 },
  { name: "9H", grade: 9 },
  { name: "9I", grade: 9 },
  { name: "9J", grade: 9 },
];

// ==================== TEACHERS DATA (52 guru) ====================

const TEACHERS_DATA = [
  // 15 guru real dari dokumen
  { code: "01", name: "ACHMAD KUZAIRI", title: "S.Pd, M.M.Pd" },
  { code: "02", name: "MOH. HARIS ANWARIANTO", title: "Drs." },
  { code: "03", name: "HADI WIDIARTO", title: "S.Pd." },
  { code: "04", name: "ANISAH", title: "S.Pd." },
  { code: "05", name: "TAUFIK HIDAYAT", title: "S.Pd." },
  { code: "06", name: "SYAIFURRAHMAN", title: "Drs." },
  { code: "07", name: "NURUL HAYATI", title: "M.Pd." },
  { code: "08", name: "KHAIRIYAH", title: "S.Pd." },
  { code: "09", name: "HAKIM NURUL AMIN", title: "S.Pd." },
  { code: "10", name: "BURHAN", title: "S.Si" },
  { code: "11", name: "TUTFATUT THALIBAH", title: "S.Pd." },
  { code: "12", name: "MOH. RUSDI", title: "S.Pd" },
  { code: "13", name: "MUSLIK", title: "M.Pd" },
  { code: "14", name: "AINI HASBIYAH", title: "S.Pd" },
  { code: "15", name: "DEVI WULANDARI", title: "S.Pd" },

  // 37 guru dummy (16-52)
  { code: "16", name: "SITI AMINAH", title: "S.Pd" },
  { code: "17", name: "ABDUL RAHMAN", title: "S.Pd" },
  { code: "18", name: "FATIMAH", title: "S.Pd" },
  { code: "19", name: "MUHAMMAD YUSUF", title: "S.Pd" },
  { code: "20", name: "KHADIJAH", title: "M.Pd" },
  { code: "21", name: "AHMAD FAUZI", title: "S.Pd" },
  { code: "22", name: "HALIMAH", title: "S.Pd" },
  { code: "23", name: "IBRAHIM", title: "Drs." },
  { code: "24", name: "ZAINAB", title: "S.Pd" },
  { code: "25", name: "USMAN", title: "S.Pd" },
  { code: "26", name: "MARYAM", title: "S.Pd" },
  { code: "27", name: "ISMAIL", title: "M.Pd" },
  { code: "28", name: "AISYAH", title: "S.Pd" },
  { code: "29", name: "HAMZAH", title: "S.Pd" },
  { code: "30", name: "RUQAYYAH", title: "S.Pd" },
  { code: "31", name: "ZAKARIYA", title: "S.Pd" },
  { code: "32", name: "HAFSHAH", title: "S.Pd" },
  { code: "33", name: "SALMAN", title: "Drs." },
  { code: "34", name: "SAFIYYAH", title: "S.Pd" },
  { code: "35", name: "BILAL", title: "S.Pd" },
  { code: "36", name: "SUMAYYAH", title: "M.Pd" },
  { code: "37", name: "KHALID", title: "S.Pd" },
  { code: "38", name: "ASMA", title: "S.Pd" },
  { code: "39", name: "ZAID", title: "S.Pd" },
  { code: "40", name: "LAILA", title: "S.Pd" },
  { code: "41", name: "TALHA", title: "S.Pd" },
  { code: "42", name: "UMMU KULTSUM", title: "S.Pd" },
  { code: "43", name: "UBAIDAH", title: "Drs." },
  { code: "44", name: "SAWDAH", title: "S.Pd" },
  { code: "45", name: "MU'ADH", title: "S.Pd" },
  { code: "46", name: "RAMLAH", title: "S.Pd" },
  { code: "47", name: "SA'AD", title: "M.Pd" },
  { code: "48", name: "JUWAIRIYAH", title: "S.Pd" },
  { code: "49", name: "ANAS", title: "S.Pd" },
  { code: "50", name: "MAIMUNAH", title: "S.Pd" },
  { code: "51", name: "ZUBAIR", title: "S.Pd" },
  { code: "52", name: "SHAFIYYAH", title: "S.Pd" },
];

// ==================== SUBJECTS DATA (24 mapel) ====================

const SUBJECTS_DATA = [
  { code: "A1", name: "PPKn" },
  { code: "A2", name: "Pend. Agama" },
  { code: "A3", name: "Bahasa Indonesia" },
  { code: "A4", name: "Matematika Umum" },
  { code: "A5", name: "Sejarah Indonesia" },
  { code: "A6", name: "Bahasa Inggris" },
  { code: "A7", name: "PJOK" },
  { code: "A8", name: "Prakarya & Kewirausahaan" },
  { code: "A9", name: "Seni Budaya" },
  { code: "B1", name: "Muatan Lokal" },
  { code: "B2", name: "TIK" },
  { code: "B3", name: "Matematika" },
  { code: "B4", name: "Biologi" },
  { code: "B5", name: "Fisika" },
  { code: "B6", name: "Kimia" },
  { code: "B7", name: "Sejarah" },
  { code: "B8", name: "Geografi" },
  { code: "B9", name: "Sosiologi" },
  { code: "C1", name: "Ekonomi" },
  { code: "C2", name: "Bahasa Jepang" },
  { code: "C3", name: "Bahasa Arab" },
  { code: "C4", name: "Bahasa Mandarin" },
  { code: "C5", name: "Bahasa Korea" },
];

// ==================== TIME SLOTS DATA (70 slots total) ====================

/**
 * Helper untuk generate time slots
 */
function generateTimeSlots(): Array<{
  day: Day;
  slotNumber: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
}> {
  const slots: Array<{
    day: Day;
    slotNumber: number;
    startTime: string;
    endTime: string;
    isBreak: boolean;
  }> = [];

  // Pattern untuk Senin-Kamis & Sabtu (12 slots)
  const regularDaySlots = [
    { slot: 1, start: "07:00", end: "07:45", isBreak: false },
    { slot: 2, start: "07:45", end: "08:30", isBreak: false },
    { slot: 3, start: "08:30", end: "09:15", isBreak: false },
    { slot: 4, start: "09:15", end: "10:00", isBreak: false },
    { slot: 5, start: "10:00", end: "10:15", isBreak: true }, // Istirahat 1
    { slot: 6, start: "10:15", end: "11:00", isBreak: false },
    { slot: 7, start: "11:00", end: "11:45", isBreak: false },
    { slot: 8, start: "11:45", end: "12:30", isBreak: true }, // Istirahat 2
    { slot: 9, start: "12:30", end: "13:15", isBreak: false },
    { slot: 10, start: "13:15", end: "14:00", isBreak: false },
    { slot: 11, start: "14:00", end: "14:45", isBreak: false },
    { slot: 12, start: "14:45", end: "15:30", isBreak: false },
  ];

  // Pattern untuk Jumat (10 slots, jam lebih pendek)
  const fridaySlots = [
    { slot: 1, start: "07:00", end: "07:45", isBreak: false },
    { slot: 2, start: "07:45", end: "08:30", isBreak: false },
    { slot: 3, start: "08:30", end: "09:15", isBreak: false },
    { slot: 4, start: "09:15", end: "10:00", isBreak: false },
    { slot: 5, start: "10:00", end: "10:15", isBreak: true }, // Istirahat 1
    { slot: 6, start: "10:15", end: "10:45", isBreak: false }, // Lebih pendek
    { slot: 7, start: "10:45", end: "11:15", isBreak: false }, // Lebih pendek
    { slot: 8, start: "11:15", end: "12:30", isBreak: true }, // Istirahat panjang (Sholat Jumat)
    { slot: 9, start: "12:30", end: "13:15", isBreak: false },
    { slot: 10, start: "13:15", end: "14:00", isBreak: false },
  ];

  const regularDays: Day[] = ["monday", "tuesday", "wednesday", "thursday", "saturday"];

  // Generate untuk hari regular
  regularDays.forEach((day) => {
    regularDaySlots.forEach((slot) => {
      slots.push({
        day,
        slotNumber: slot.slot,
        startTime: slot.start,
        endTime: slot.end,
        isBreak: slot.isBreak,
      });
    });
  });

  // Generate untuk Jumat
  fridaySlots.forEach((slot) => {
    slots.push({
      day: "friday",
      slotNumber: slot.slot,
      startTime: slot.start,
      endTime: slot.end,
      isBreak: slot.isBreak,
    });
  });

  return slots;
}

const TIME_SLOTS_DATA = generateTimeSlots();

// ==================== TEACHING ALLOCATIONS DATA (35 alokasi) ====================

/**
 * Sample teaching allocations
 * Format: { teacherCode, subjectCode, className, hoursPerWeek }
 */
const TEACHING_ALLOCATIONS_DATA = [
  // Kelas 7A (5 alokasi)
  { teacherCode: "01", subjectCode: "A1", className: "7A", hoursPerWeek: 2 }, // PPKn
  { teacherCode: "02", subjectCode: "A2", className: "7A", hoursPerWeek: 2 }, // Agama
  { teacherCode: "03", subjectCode: "A3", className: "7A", hoursPerWeek: 4 }, // B.Indo
  { teacherCode: "04", subjectCode: "A4", className: "7A", hoursPerWeek: 4 }, // Mat Umum
  { teacherCode: "05", subjectCode: "A6", className: "7A", hoursPerWeek: 3 }, // B.Inggris

  // Kelas 7B (5 alokasi)
  { teacherCode: "01", subjectCode: "A1", className: "7B", hoursPerWeek: 2 }, // PPKn
  { teacherCode: "06", subjectCode: "A2", className: "7B", hoursPerWeek: 2 }, // Agama (guru berbeda)
  { teacherCode: "07", subjectCode: "A3", className: "7B", hoursPerWeek: 4 }, // B.Indo
  { teacherCode: "08", subjectCode: "A4", className: "7B", hoursPerWeek: 4 }, // Mat Umum
  { teacherCode: "09", subjectCode: "A7", className: "7B", hoursPerWeek: 3 }, // PJOK

  // Kelas 7C (5 alokasi)
  { teacherCode: "02", subjectCode: "A1", className: "7C", hoursPerWeek: 2 }, // PPKn (guru berbeda)
  { teacherCode: "10", subjectCode: "A2", className: "7C", hoursPerWeek: 2 }, // Agama
  { teacherCode: "11", subjectCode: "A3", className: "7C", hoursPerWeek: 4 }, // B.Indo
  { teacherCode: "12", subjectCode: "A4", className: "7C", hoursPerWeek: 4 }, // Mat Umum
  { teacherCode: "13", subjectCode: "A5", className: "7C", hoursPerWeek: 2 }, // Sejarah Indo

  // Kelas 8A (5 alokasi)
  { teacherCode: "14", subjectCode: "B3", className: "8A", hoursPerWeek: 4 }, // Matematika
  { teacherCode: "15", subjectCode: "B4", className: "8A", hoursPerWeek: 3 }, // Biologi
  { teacherCode: "16", subjectCode: "A3", className: "8A", hoursPerWeek: 4 }, // B.Indo
  { teacherCode: "17", subjectCode: "A6", className: "8A", hoursPerWeek: 3 }, // B.Inggris
  { teacherCode: "18", subjectCode: "A1", className: "8A", hoursPerWeek: 2 }, // PPKn

  // Kelas 8B (5 alokasi)
  { teacherCode: "19", subjectCode: "B3", className: "8B", hoursPerWeek: 4 }, // Matematika
  { teacherCode: "20", subjectCode: "B5", className: "8B", hoursPerWeek: 3 }, // Fisika
  { teacherCode: "21", subjectCode: "A3", className: "8B", hoursPerWeek: 4 }, // B.Indo
  { teacherCode: "22", subjectCode: "B2", className: "8B", hoursPerWeek: 2 }, // TIK
  { teacherCode: "23", subjectCode: "A7", className: "8B", hoursPerWeek: 3 }, // PJOK

  // Kelas 9A (5 alokasi)
  { teacherCode: "24", subjectCode: "B3", className: "9A", hoursPerWeek: 4 }, // Matematika
  { teacherCode: "25", subjectCode: "B6", className: "9A", hoursPerWeek: 3 }, // Kimia
  { teacherCode: "26", subjectCode: "A3", className: "9A", hoursPerWeek: 4 }, // B.Indo
  { teacherCode: "27", subjectCode: "C1", className: "9A", hoursPerWeek: 3 }, // Ekonomi
  { teacherCode: "28", subjectCode: "B8", className: "9A", hoursPerWeek: 2 }, // Geografi

  // Kelas 9B (5 alokasi)
  { teacherCode: "29", subjectCode: "B3", className: "9B", hoursPerWeek: 4 }, // Matematika
  { teacherCode: "30", subjectCode: "B4", className: "9B", hoursPerWeek: 3 }, // Biologi
  { teacherCode: "31", subjectCode: "A3", className: "9B", hoursPerWeek: 4 }, // B.Indo
  { teacherCode: "32", subjectCode: "B9", className: "9B", hoursPerWeek: 2 }, // Sosiologi
  { teacherCode: "33", subjectCode: "C3", className: "9B", hoursPerWeek: 2 }, // B.Arab
];

// ==================== SEED FUNCTION ====================

/**
 * Seed database dengan data sample
 */
export function seedDatabase(): {
  success: boolean;
  message: string;
  stats?: {
    school: number;
    classes: number;
    teachers: number;
    subjects: number;
    timeSlots: number;
    teachingAllocations: number;
  };
} {
  try {
    // Clear existing data
    LocalDB.clearAll();

    // 1. Create school
    const school = LocalDB.createSchool(SCHOOL_DATA);
    console.log("✅ School created:", school.name);

    // 2. Create classes
    const classes = CLASSES_DATA.map((classData) =>
      LocalDB.createClass({
        ...classData,
        schoolId: school.id,
      })
    );
    console.log(`✅ ${classes.length} classes created`);

    // 3. Create teachers
    const teachers = TEACHERS_DATA.map((teacherData) =>
      LocalDB.createTeacher({
        ...teacherData,
        schoolId: school.id,
      })
    );
    console.log(`✅ ${teachers.length} teachers created`);

    // 4. Create subjects
    const subjects = SUBJECTS_DATA.map((subjectData) =>
      LocalDB.createSubject({
        ...subjectData,
        schoolId: school.id,
      })
    );
    console.log(`✅ ${subjects.length} subjects created`);

    // 5. Create time slots
    const timeSlots = TIME_SLOTS_DATA.map((slotData) =>
      LocalDB.createTimeSlot({
        ...slotData,
        schoolId: school.id,
      })
    );
    console.log(`✅ ${timeSlots.length} time slots created`);

    // 6. Create teaching allocations
    // Resolve codes to IDs first
    const teacherMap = new Map(
      teachers.map((t) => [t.code, t.id])
    );
    const subjectMap = new Map(
      subjects.map((s) => [s.code, s.id])
    );
    const classMap = new Map(
      classes.map((c) => [c.name, c.id])
    );

    const allocations = TEACHING_ALLOCATIONS_DATA.map((allocData) => {
      const teacherId = teacherMap.get(allocData.teacherCode);
      const subjectId = subjectMap.get(allocData.subjectCode);
      const classId = classMap.get(allocData.className);

      if (!teacherId || !subjectId || !classId) {
        console.warn(
          `⚠️ Skipping allocation: ${allocData.teacherCode} - ${allocData.subjectCode} - ${allocData.className} (invalid reference)`
        );
        return null;
      }

      return LocalDB.createTeachingAllocation({
        schoolId: school.id,
        teacherId,
        subjectId,
        classId,
        hoursPerWeek: allocData.hoursPerWeek,
      });
    }).filter(Boolean); // Remove nulls

    console.log(`✅ ${allocations.length} teaching allocations created`);

    console.log("\n🎉 Database seeded successfully!");

    return {
      success: true,
      message: "Database berhasil di-seed dengan data sample",
      stats: {
        school: 1,
        classes: classes.length,
        teachers: teachers.length,
        subjects: subjects.length,
        timeSlots: timeSlots.length,
        teachingAllocations: allocations.length,
      },
    };
  } catch (error) {
    console.error("❌ Seed failed:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error during seeding",
    };
  }
}

/**
 * Get seed data statistics (tanpa execute seed)
 */
export function getSeedDataStats() {
  return {
    school: 1,
    classes: CLASSES_DATA.length,
    teachers: TEACHERS_DATA.length,
    subjects: SUBJECTS_DATA.length,
    timeSlots: TIME_SLOTS_DATA.length,
    teachingAllocations: TEACHING_ALLOCATIONS_DATA.length,
  };
}
