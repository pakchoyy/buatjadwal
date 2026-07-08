/**
 * Seed Data untuk Testing & Development
 * Support multiple school levels: SD, SMP, SMA
 */

import { LocalDB } from "./db";
import { Day, SchoolLevel } from "./types";

// ==================== SCHOOL DATA BY LEVEL ====================

const SCHOOL_DATA_BY_LEVEL: Record<SchoolLevel, {
  name: string;
  address: string;
  district: string;
  email: string;
  academicYear: string;
  semester: string;
}> = {
  sd: {
    name: "SDN MBG NUSANTARA",
    address: "Jl. Raya Mulus Sekali",
    district: "KABUPATEN JAYA",
    email: "sdnmbg@gmail.com",
    academicYear: "2026/2027",
    semester: "Ganjil",
  },
  mi: {
    name: "MI MBG NUSANTARA",
    address: "Jl. Raya Mulus Sekali",
    district: "KABUPATEN JAYA",
    email: "mimbg@gmail.com",
    academicYear: "2026/2027",
    semester: "Ganjil",
  },
  sdit: {
    name: "SDIT MBG NUSANTARA",
    address: "Jl. Raya Mulus Sekali",
    district: "KABUPATEN JAYA",
    email: "sditmbg@gmail.com",
    academicYear: "2026/2027",
    semester: "Ganjil",
  },
  smp: {
    name: "SMPN MBG NUSANTARA",
    address: "Jl. Raya Mulus Sekali",
    district: "KABUPATEN JAYA",
    email: "smpnmbg@gmail.com",
    academicYear: "2026/2027",
    semester: "Ganjil",
  },
  mts: {
    name: "MTs MBG NUSANTARA",
    address: "Jl. Raya Mulus Sekali",
    district: "KABUPATEN JAYA",
    email: "mtsmbg@gmail.com",
    academicYear: "2026/2027",
    semester: "Ganjil",
  },
  sma: {
    name: "SMAN MBG NUSANTARA",
    address: "Jl. Raya Mulus Sekali",
    district: "KABUPATEN JAYA",
    email: "smanmbg@gmail.com",
    academicYear: "2026/2027",
    semester: "Ganjil",
  },
  ma: {
    name: "MA MBG NUSANTARA",
    address: "Jl. Raya Mulus Sekali",
    district: "KABUPATEN JAYA",
    email: "mambg@gmail.com",
    academicYear: "2026/2027",
    semester: "Ganjil",
  },
  smk: {
    name: "SMKN MBG NUSANTARA",
    address: "Jl. Raya Mulus Sekali",
    district: "KABUPATEN JAYA",
    email: "smknmbg@gmail.com",
    academicYear: "2026/2027",
    semester: "Ganjil",
  },
  other: {
    name: "SEKOLAH MBG NUSANTARA",
    address: "Jl. Raya Mulus Sekali",
    district: "KABUPATEN JAYA",
    email: "sekolahmbg@gmail.com",
    academicYear: "2026/2027",
    semester: "Ganjil",
  },
};

// ==================== CLASSES DATA BY LEVEL ====================

const SD_CLASSES_DATA = [
  { name: "1A", educationLevel: "sd" as const, grade: 1 },
  { name: "1B", educationLevel: "sd" as const, grade: 1 },
  { name: "2A", educationLevel: "sd" as const, grade: 2 },
  { name: "2B", educationLevel: "sd" as const, grade: 2 },
  { name: "3A", educationLevel: "sd" as const, grade: 3 },
  { name: "3B", educationLevel: "sd" as const, grade: 3 },
  { name: "4A", educationLevel: "sd" as const, grade: 4 },
  { name: "4B", educationLevel: "sd" as const, grade: 4 },
  { name: "5A", educationLevel: "sd" as const, grade: 5 },
  { name: "5B", educationLevel: "sd" as const, grade: 5 },
  { name: "6A", educationLevel: "sd" as const, grade: 6 },
  { name: "6B", educationLevel: "sd" as const, grade: 6 },
];

const SMP_CLASSES_DATA = [
  { name: "7A", educationLevel: "smp" as const, grade: 7 },
  { name: "7B", educationLevel: "smp" as const, grade: 7 },
  { name: "7C", educationLevel: "smp" as const, grade: 7 },
  { name: "7D", educationLevel: "smp" as const, grade: 7 },
  { name: "7E", educationLevel: "smp" as const, grade: 7 },
  { name: "8A", educationLevel: "smp" as const, grade: 8 },
  { name: "8B", educationLevel: "smp" as const, grade: 8 },
  { name: "8C", educationLevel: "smp" as const, grade: 8 },
  { name: "8D", educationLevel: "smp" as const, grade: 8 },
  { name: "8E", educationLevel: "smp" as const, grade: 8 },
  { name: "9A", educationLevel: "smp" as const, grade: 9 },
  { name: "9B", educationLevel: "smp" as const, grade: 9 },
  { name: "9C", educationLevel: "smp" as const, grade: 9 },
  { name: "9D", educationLevel: "smp" as const, grade: 9 },
  { name: "9E", educationLevel: "smp" as const, grade: 9 },
];

const SMA_CLASSES_DATA = [
  { name: "10 IPA 1", educationLevel: "sma" as const, grade: 10 },
  { name: "10 IPA 2", educationLevel: "sma" as const, grade: 10 },
  { name: "10 IPS 1", educationLevel: "sma" as const, grade: 10 },
  { name: "11 IPA 1", educationLevel: "sma" as const, grade: 11 },
  { name: "11 IPA 2", educationLevel: "sma" as const, grade: 11 },
  { name: "11 IPS 1", educationLevel: "sma" as const, grade: 11 },
  { name: "12 IPA 1", educationLevel: "sma" as const, grade: 12 },
  { name: "12 IPA 2", educationLevel: "sma" as const, grade: 12 },
  { name: "12 IPS 1", educationLevel: "sma" as const, grade: 12 },
];

// ==================== TEACHERS DATA (universal) ====================

const TEACHERS_DATA = [
  { code: "01", name: "SITI AMINAH", title: "S.Pd" },
  { code: "02", name: "ABDUL RAHMAN", title: "S.Pd" },
  { code: "03", name: "FATIMAH", title: "S.Pd" },
  { code: "04", name: "MUHAMMAD YUSUF", title: "S.Pd" },
  { code: "05", name: "KHADIJAH", title: "M.Pd" },
  { code: "06", name: "AHMAD FAUZI", title: "S.Pd" },
  { code: "07", name: "HALIMAH", title: "S.Pd" },
  { code: "08", name: "IBRAHIM", title: "Drs." },
  { code: "09", name: "ZAINAB", title: "S.Pd" },
  { code: "10", name: "USMAN", title: "S.Pd" },
  { code: "11", name: "MARYAM", title: "S.Pd" },
  { code: "12", name: "ISMAIL", title: "M.Pd" },
  { code: "13", name: "AISYAH", title: "S.Pd" },
  { code: "14", name: "HAMZAH", title: "S.Pd" },
  { code: "15", name: "RUQAYYAH", title: "S.Pd" },
];

// ==================== SUBJECTS DATA BY LEVEL ====================

const SD_SUBJECTS_DATA = [
  { code: "A1", name: "Pendidikan Agama" },
  { code: "A2", name: "PKn" },
  { code: "A3", name: "Bahasa Indonesia" },
  { code: "A4", name: "Matematika" },
  { code: "A5", name: "IPA" },
  { code: "A6", name: "IPS" },
  { code: "A7", name: "Seni Budaya" },
  { code: "A8", name: "PJOK" },
  { code: "A9", name: "Bahasa Inggris" },
  { code: "B1", name: "Muatan Lokal" },
];

const SMP_SUBJECTS_DATA = [
  { code: "A1", name: "Pendidikan Agama" },
  { code: "A2", name: "PKn" },
  { code: "A3", name: "Bahasa Indonesia" },
  { code: "A4", name: "Matematika" },
  { code: "A5", name: "IPA" },
  { code: "A6", name: "IPS" },
  { code: "A7", name: "Bahasa Inggris" },
  { code: "A8", name: "Seni Budaya" },
  { code: "A9", name: "PJOK" },
  { code: "B1", name: "Prakarya" },
  { code: "B2", name: "Muatan Lokal" },
];

const SMA_SUBJECTS_DATA = [
  { code: "A1", name: "Pendidikan Agama" },
  { code: "A2", name: "PKn" },
  { code: "A3", name: "Bahasa Indonesia" },
  { code: "A4", name: "Matematika Wajib" },
  { code: "A5", name: "Sejarah Indonesia" },
  { code: "A6", name: "Bahasa Inggris" },
  { code: "A7", name: "PJOK" },
  { code: "A8", name: "Seni Budaya" },
  { code: "B1", name: "Matematika Peminatan" },
  { code: "B2", name: "Biologi" },
  { code: "B3", name: "Fisika" },
  { code: "B4", name: "Kimia" },
  { code: "B5", name: "Ekonomi" },
  { code: "B6", name: "Sosiologi" },
  { code: "B7", name: "Geografi" },
  { code: "B8", name: "Sejarah" },
];

// ==================== TIME SLOTS DATA ====================

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

  const regularDaySlots = [
    { slot: 1, start: "07:00", end: "07:45", isBreak: false },
    { slot: 2, start: "07:45", end: "08:30", isBreak: false },
    { slot: 3, start: "08:30", end: "09:15", isBreak: false },
    { slot: 4, start: "09:15", end: "10:00", isBreak: false },
    { slot: 5, start: "10:00", end: "10:15", isBreak: true },
    { slot: 6, start: "10:15", end: "11:00", isBreak: false },
    { slot: 7, start: "11:00", end: "11:45", isBreak: false },
    { slot: 8, start: "11:45", end: "12:30", isBreak: true },
    { slot: 9, start: "12:30", end: "13:15", isBreak: false },
    { slot: 10, start: "13:15", end: "14:00", isBreak: false },
  ];

  const fridaySlots = [
    { slot: 1, start: "07:00", end: "07:45", isBreak: false },
    { slot: 2, start: "07:45", end: "08:30", isBreak: false },
    { slot: 3, start: "08:30", end: "09:15", isBreak: false },
    { slot: 4, start: "09:15", end: "10:00", isBreak: false },
    { slot: 5, start: "10:00", end: "10:15", isBreak: true },
    { slot: 6, start: "10:15", end: "10:45", isBreak: false },
    { slot: 7, start: "10:45", end: "11:15", isBreak: false },
    { slot: 8, start: "11:15", end: "12:30", isBreak: true },
  ];

  const regularDays: Day[] = ["monday", "tuesday", "wednesday", "thursday"];

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

// ==================== HELPER FUNCTIONS ====================

function getClassesDataByLevel(level: SchoolLevel) {
  switch (level) {
    case "sd":
    case "mi":
    case "sdit":
      return SD_CLASSES_DATA;
    case "smp":
    case "mts":
      return SMP_CLASSES_DATA;
    case "sma":
    case "ma":
    case "smk":
      return SMA_CLASSES_DATA;
    default:
      return SMP_CLASSES_DATA;
  }
}

function getSubjectsDataByLevel(level: SchoolLevel) {
  switch (level) {
    case "sd":
    case "mi":
    case "sdit":
      return SD_SUBJECTS_DATA;
    case "smp":
    case "mts":
      return SMP_SUBJECTS_DATA;
    case "sma":
    case "ma":
    case "smk":
      return SMA_SUBJECTS_DATA;
    default:
      return SMP_SUBJECTS_DATA;
  }
}

// ==================== MAIN SEED FUNCTION ====================

export function seedDatabase(schoolLevel: SchoolLevel = "smp") {
  try {
    console.log(`\n🌱 Starting database seed for ${schoolLevel.toUpperCase()}...`);

    // Get data based on level
    const schoolData = SCHOOL_DATA_BY_LEVEL[schoolLevel];
    const classesData = getClassesDataByLevel(schoolLevel);
    const subjectsData = getSubjectsDataByLevel(schoolLevel);

    // Create school
    const school = LocalDB.createSchool({
      ...schoolData,
      level: schoolLevel,
    });
    console.log(`✅ School created: ${school.name}`);

    // Create classes
    const classes = classesData.map((cls) =>
      LocalDB.createClass({
        schoolId: school.id,
        name: cls.name,
        educationLevel: cls.educationLevel,
        grade: cls.grade,
      })
    );
    console.log(`✅ ${classes.length} classes created`);

    // Create teachers
    const teachers = TEACHERS_DATA.map((teacher) =>
      LocalDB.createTeacher({
        schoolId: school.id,
        code: teacher.code,
        name: teacher.name,
        title: teacher.title,
      })
    );
    console.log(`✅ ${teachers.length} teachers created`);

    // Create subjects
    const subjects = subjectsData.map((subject) =>
      LocalDB.createSubject({
        schoolId: school.id,
        code: subject.code,
        name: subject.name,
      })
    );
    console.log(`✅ ${subjects.length} subjects created`);

    // Create time slots
    const timeSlots = TIME_SLOTS_DATA.map((slot) =>
      LocalDB.createTimeSlot({
        schoolId: school.id,
        day: slot.day,
        slotNumber: slot.slotNumber,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBreak: slot.isBreak,
      })
    );
    console.log(`✅ ${timeSlots.length} time slots created`);

    // Create teaching allocations (sample: random assignments)
    const allocations = [];
    for (let i = 0; i < Math.min(classes.length * 3, 40); i++) {
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];

      try {
        const allocation = LocalDB.createTeachingAllocation({
          schoolId: school.id,
          teacherId: randomTeacher.id,
          subjectId: randomSubject.id,
          classId: randomClass.id,
          hoursPerWeek: Math.floor(Math.random() * 4) + 2, // 2-5 hours
        });
        allocations.push(allocation);
      } catch {
        // Skip if duplicate
      }
    }
    console.log(`✅ ${allocations.length} teaching allocations created`);

    console.log("\n🎉 Database seeded successfully!");

    return {
      success: true,
      message: `Database berhasil di-seed dengan data ${schoolLevel.toUpperCase()}`,
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

export function getSeedDataStats(schoolLevel: SchoolLevel = "smp") {
  const classesData = getClassesDataByLevel(schoolLevel);
  const subjectsData = getSubjectsDataByLevel(schoolLevel);

  return {
    school: 1,
    classes: classesData.length,
    teachers: TEACHERS_DATA.length,
    subjects: subjectsData.length,
    timeSlots: TIME_SLOTS_DATA.length,
  };
}
