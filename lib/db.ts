/**
 * LocalDB - localStorage wrapper untuk data persistence
 * Implements CRUD operations dengan constraint validations
 */

import {
  School,
  Class,
  EducationLevel,
  Teacher,
  Subject,
  TimeSlot,
  TeachingAllocation,
  ScheduleEntry,
  SchoolFormData,
  ClassFormData,
  TeacherFormData,
  SubjectFormData,
  TimeSlotFormData,
  TeachingAllocationFormData,
} from "./types";
import { generateId, safeJsonParse, sanitizeInput } from "./utils";
import {
  validateSchoolLimit,
  validateSchoolForm,
  validateClassUnique,
  validateClassForm,
  checkClassDependencies,
  validateTeacherUnique,
  validateTeacherForm,
  checkTeacherDependencies,
  validateSubjectUnique,
  validateSubjectForm,
  checkSubjectDependencies,
  validateTimeSlotUnique,
  validateTimeSlotForm,
  checkTimeSlotDependencies,
  validateTeachingAllocationUnique,
  validateTeachingAllocationForm,
} from "./validations";

/**
 * LocalDB class - Main database interface
 */
export class LocalDB {
  private static readonly KEYS = {
    SCHOOLS: "jadwal_schools",
    CLASSES: "jadwal_classes",
    TEACHERS: "jadwal_teachers",
    SUBJECTS: "jadwal_subjects",
    TIME_SLOTS: "jadwal_timeSlots",
    TEACHING_ALLOCATIONS: "jadwal_teachingAllocations",
    SCHEDULE_ENTRIES: "jadwal_scheduleEntries",
  };

  // ==================== GENERIC HELPERS ====================

  public static get<T>(key: string): T[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(key);
      const parsed = safeJsonParse<T[]>(data || "[]", []);
      
      // Validate parsed data is an array
      if (!Array.isArray(parsed)) {
        console.error(`Data corruption: ${key} is not an array. Resetting to empty array.`);
        this.set(key, []);
        return [];
      }
      
      return parsed;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return [];
    }
  }

  public static set<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Penyimpanan penuh. Silakan hapus data lama atau export data Anda terlebih dahulu.');
      }
      throw error;
    }
  }

  private static findById<T extends { id: string }>(
    items: T[],
    id: string
  ): T | undefined {
    return items.find((item) => item.id === id);
  }

  private static inferEducationLevel(grade: number): EducationLevel {
    if (grade >= 1 && grade <= 6) return "sd";
    if (grade >= 10 && grade <= 12) return "sma";
    return "smp";
  }

  private static normalizeClassData(cls: Partial<Class>): Class {
    return {
      ...cls,
      educationLevel: cls.educationLevel || this.inferEducationLevel(cls.grade || 7),
    } as Class;
  }

  // ==================== SCHOOLS ====================

  static getSchool(): School | null {
    const schools = this.get<School>(this.KEYS.SCHOOLS);
    return schools[0] || null;
  }

  static createSchool(data: SchoolFormData): School {
    // Sanitize input to prevent XSS
    const sanitizedData = {
      ...data,
      name: sanitizeInput(data.name),
      address: sanitizeInput(data.address),
      district: sanitizeInput(data.district),
      email: sanitizeInput(data.email),
      academicYear: sanitizeInput(data.academicYear),
      semester: sanitizeInput(data.semester),
    };

    // Validasi: max 1 school
    const existing = this.get<School>(this.KEYS.SCHOOLS);
    const validation = validateSchoolLimit(existing);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Validasi form
    const formValidation = validateSchoolForm(sanitizedData);
    if (!formValidation.valid) {
      throw new Error(formValidation.message);
    }

    const now = Date.now();
    const school: School = {
      id: generateId(),
      ...sanitizedData,
      createdAt: now,
      updatedAt: now,
    };

    this.set(this.KEYS.SCHOOLS, [school]);
    return school;
  }

  static updateSchool(id: string, updates: Partial<SchoolFormData>): School {
    const schools = this.get<School>(this.KEYS.SCHOOLS);
    const school = this.findById(schools, id);

    if (!school) {
      throw new Error("Sekolah tidak ditemukan");
    }

    const updatedSchool: School = {
      ...school,
      ...updates,
      updatedAt: Date.now(),
    };

    // Validasi form jika ada perubahan
    const formValidation = validateSchoolForm(updatedSchool);
    if (!formValidation.valid) {
      throw new Error(formValidation.message);
    }

    this.set(this.KEYS.SCHOOLS, [updatedSchool]);
    return updatedSchool;
  }

  static deleteSchool(id: string): void {
    const school = this.getSchool();
    if (!school || school.id !== id) {
      throw new Error("Sekolah tidak ditemukan");
    }

    // Check dependencies
    const classes = this.listClasses(id);
    const teachers = this.listTeachers(id);
    const subjects = this.listSubjects(id);
    const timeSlots = this.listTimeSlots(id);
    const allocations = this.listTeachingAllocations(id);
    const schedules = this.get<ScheduleEntry>(this.KEYS.SCHEDULE_ENTRIES).filter(
      (entry) => entry.schoolId === id
    );

    if (
      classes.length > 0 ||
      teachers.length > 0 ||
      subjects.length > 0 ||
      timeSlots.length > 0 ||
      allocations.length > 0 ||
      schedules.length > 0
    ) {
      throw new Error(
        `Tidak dapat menghapus sekolah. Masih ada ${classes.length} kelas, ${teachers.length} guru, ${subjects.length} mata pelajaran, ${timeSlots.length} slot waktu, ${allocations.length} alokasi, dan ${schedules.length} jadwal. Hapus data terkait terlebih dahulu.`
      );
    }

    this.set(this.KEYS.SCHOOLS, []);
  }

  // ==================== CLASSES ====================

  static listClasses(schoolId: string): Class[] {
    const classes = this.get<Class>(this.KEYS.CLASSES);
    return classes
      .filter((c) => c.schoolId === schoolId)
      .map((c) => this.normalizeClassData(c));
  }

  static getClass(id: string): Class | null {
    const classes = this.get<Class>(this.KEYS.CLASSES);
    const cls = this.findById(classes, id);
    return cls ? this.normalizeClassData(cls) : null;
  }

  static createClass(data: ClassFormData): Class {
    // Sanitize input to prevent XSS
    const sanitizedData = {
      ...data,
      name: sanitizeInput(data.name),
    };

    // Validasi form
    const formValidation = validateClassForm(sanitizedData);
    if (!formValidation.valid) {
      throw new Error(formValidation.message);
    }

    // Validasi uniqueness
    const allClasses = this.get<Class>(this.KEYS.CLASSES);
    const uniqueValidation = validateClassUnique(
      sanitizedData.schoolId,
      sanitizedData.name,
      allClasses
    );
    if (!uniqueValidation.valid) {
      throw new Error(uniqueValidation.message);
    }

    const now = Date.now();
    const newClass: Class = {
      id: generateId(),
      ...sanitizedData,
      createdAt: now,
      updatedAt: now,
    };

    allClasses.push(newClass);
    this.set(this.KEYS.CLASSES, allClasses);
    return newClass;
  }

  static updateClass(id: string, updates: Partial<ClassFormData>): Class {
    const classes = this.get<Class>(this.KEYS.CLASSES);
    const classIndex = classes.findIndex((c) => c.id === id);

    if (classIndex === -1) {
      throw new Error("Kelas tidak ditemukan");
    }

    const existingClass = this.normalizeClassData(classes[classIndex]);
    const updatedClass: Class = {
      ...existingClass,
      ...updates,
      updatedAt: Date.now(),
    };

    // Validasi form
    const formValidation = validateClassForm(updatedClass);
    if (!formValidation.valid) {
      throw new Error(formValidation.message);
    }

    // Validasi uniqueness jika nama berubah
    if (updates.name && updates.name !== existingClass.name) {
      const uniqueValidation = validateClassUnique(
        updatedClass.schoolId,
        updatedClass.name,
        classes,
        id
      );
      if (!uniqueValidation.valid) {
        throw new Error(uniqueValidation.message);
      }
    }

    classes[classIndex] = updatedClass;
    this.set(this.KEYS.CLASSES, classes);
    return updatedClass;
  }

  static deleteClass(id: string): void {
    const classes = this.get<Class>(this.KEYS.CLASSES);
    const classToDelete = this.findById(classes, id);

    if (!classToDelete) {
      throw new Error("Kelas tidak ditemukan");
    }

    // Check dependencies
    const allocations = this.listTeachingAllocations(classToDelete.schoolId);
    const schedules = this.get<ScheduleEntry>(this.KEYS.SCHEDULE_ENTRIES);
    const depCheck = checkClassDependencies(id, allocations, schedules);

    if (!depCheck.canDelete) {
      throw new Error(depCheck.message);
    }

    const filtered = classes.filter((c) => c.id !== id);
    this.set(this.KEYS.CLASSES, filtered);
  }

  // ==================== TEACHERS ====================

  static listTeachers(schoolId: string): Teacher[] {
    const teachers = this.get<Teacher>(this.KEYS.TEACHERS);
    return teachers.filter((t) => t.schoolId === schoolId);
  }

  static getTeacher(id: string): Teacher | null {
    const teachers = this.get<Teacher>(this.KEYS.TEACHERS);
    return this.findById(teachers, id) || null;
  }

  static createTeacher(data: TeacherFormData): Teacher {
    // Sanitize input to prevent XSS
    const sanitizedData = {
      ...data,
      code: sanitizeInput(data.code),
      name: sanitizeInput(data.name),
      title: data.title ? sanitizeInput(data.title) : undefined,
    };

    // Validasi form
    const formValidation = validateTeacherForm(sanitizedData);
    if (!formValidation.valid) {
      throw new Error(formValidation.message);
    }

    // Validasi uniqueness
    const allTeachers = this.get<Teacher>(this.KEYS.TEACHERS);
    const uniqueValidation = validateTeacherUnique(
      sanitizedData.schoolId,
      sanitizedData.code,
      allTeachers
    );
    if (!uniqueValidation.valid) {
      throw new Error(uniqueValidation.message);
    }

    const now = Date.now();
    const teacher: Teacher = {
      id: generateId(),
      ...sanitizedData,
      createdAt: now,
      updatedAt: now,
    };

    allTeachers.push(teacher);
    this.set(this.KEYS.TEACHERS, allTeachers);
    return teacher;
  }

  static updateTeacher(id: string, updates: Partial<TeacherFormData>): Teacher {
    const teachers = this.get<Teacher>(this.KEYS.TEACHERS);
    const teacherIndex = teachers.findIndex((t) => t.id === id);

    if (teacherIndex === -1) {
      throw new Error("Guru tidak ditemukan");
    }

    const existingTeacher = teachers[teacherIndex];
    const updatedTeacher: Teacher = {
      ...existingTeacher,
      ...updates,
      updatedAt: Date.now(),
    };

    // Validasi form
    const formValidation = validateTeacherForm(updatedTeacher);
    if (!formValidation.valid) {
      throw new Error(formValidation.message);
    }

    // Validasi uniqueness jika code berubah
    if (updates.code && updates.code !== existingTeacher.code) {
      const uniqueValidation = validateTeacherUnique(
        updatedTeacher.schoolId,
        updatedTeacher.code,
        teachers,
        id
      );
      if (!uniqueValidation.valid) {
        throw new Error(uniqueValidation.message);
      }
    }

    teachers[teacherIndex] = updatedTeacher;
    this.set(this.KEYS.TEACHERS, teachers);
    return updatedTeacher;
  }

  static deleteTeacher(id: string): void {
    const teachers = this.get<Teacher>(this.KEYS.TEACHERS);
    const teacher = this.findById(teachers, id);

    if (!teacher) {
      throw new Error("Guru tidak ditemukan");
    }

    // Check dependencies
    const allocations = this.listTeachingAllocations(teacher.schoolId);
    const schedules = this.get<ScheduleEntry>(this.KEYS.SCHEDULE_ENTRIES);
    const depCheck = checkTeacherDependencies(id, allocations, schedules);

    if (!depCheck.canDelete) {
      throw new Error(depCheck.message);
    }

    const filtered = teachers.filter((t) => t.id !== id);
    this.set(this.KEYS.TEACHERS, filtered);
  }

  // ==================== SUBJECTS ====================

  static listSubjects(schoolId: string): Subject[] {
    const subjects = this.get<Subject>(this.KEYS.SUBJECTS);
    return subjects.filter((s) => s.schoolId === schoolId);
  }

  static getSubject(id: string): Subject | null {
    const subjects = this.get<Subject>(this.KEYS.SUBJECTS);
    return this.findById(subjects, id) || null;
  }

  static createSubject(data: SubjectFormData): Subject {
    // Sanitize input to prevent XSS
    const sanitizedData = {
      ...data,
      code: sanitizeInput(data.code),
      name: sanitizeInput(data.name),
    };

    // Validasi form
    const formValidation = validateSubjectForm(sanitizedData);
    if (!formValidation.valid) {
      throw new Error(formValidation.message);
    }

    // Validasi uniqueness
    const allSubjects = this.get<Subject>(this.KEYS.SUBJECTS);
    const uniqueValidation = validateSubjectUnique(
      sanitizedData.schoolId,
      sanitizedData.code,
      allSubjects
    );
    if (!uniqueValidation.valid) {
      throw new Error(uniqueValidation.message);
    }

    const now = Date.now();
    const subject: Subject = {
      id: generateId(),
      ...sanitizedData,
      createdAt: now,
      updatedAt: now,
    };

    allSubjects.push(subject);
    this.set(this.KEYS.SUBJECTS, allSubjects);
    return subject;
  }

  static updateSubject(id: string, updates: Partial<SubjectFormData>): Subject {
    const subjects = this.get<Subject>(this.KEYS.SUBJECTS);
    const subjectIndex = subjects.findIndex((s) => s.id === id);

    if (subjectIndex === -1) {
      throw new Error("Mata pelajaran tidak ditemukan");
    }

    const existingSubject = subjects[subjectIndex];
    const updatedSubject: Subject = {
      ...existingSubject,
      ...updates,
      updatedAt: Date.now(),
    };

    // Validasi form
    const formValidation = validateSubjectForm(updatedSubject);
    if (!formValidation.valid) {
      throw new Error(formValidation.message);
    }

    // Validasi uniqueness jika code berubah
    if (updates.code && updates.code !== existingSubject.code) {
      const uniqueValidation = validateSubjectUnique(
        updatedSubject.schoolId,
        updatedSubject.code,
        subjects,
        id
      );
      if (!uniqueValidation.valid) {
        throw new Error(uniqueValidation.message);
      }
    }

    subjects[subjectIndex] = updatedSubject;
    this.set(this.KEYS.SUBJECTS, subjects);
    return updatedSubject;
  }

  static deleteSubject(id: string): void {
    const subjects = this.get<Subject>(this.KEYS.SUBJECTS);
    const subject = this.findById(subjects, id);

    if (!subject) {
      throw new Error("Mata pelajaran tidak ditemukan");
    }

    // Check dependencies
    const allocations = this.listTeachingAllocations(subject.schoolId);
    const schedules = this.get<ScheduleEntry>(this.KEYS.SCHEDULE_ENTRIES);
    const depCheck = checkSubjectDependencies(id, allocations, schedules);

    if (!depCheck.canDelete) {
      throw new Error(depCheck.message);
    }

    const filtered = subjects.filter((s) => s.id !== id);
    this.set(this.KEYS.SUBJECTS, filtered);
  }

  // ==================== TIME SLOTS ====================

  static listTimeSlots(schoolId: string, day?: string): TimeSlot[] {
    const timeSlots = this.get<TimeSlot>(this.KEYS.TIME_SLOTS);
    let filtered = timeSlots.filter((ts) => ts.schoolId === schoolId);

    if (day) {
      filtered = filtered.filter((ts) => ts.day === day);
    }

    return filtered;
  }

  static getTimeSlot(id: string): TimeSlot | null {
    const timeSlots = this.get<TimeSlot>(this.KEYS.TIME_SLOTS);
    return this.findById(timeSlots, id) || null;
  }

  static createTimeSlot(data: TimeSlotFormData): TimeSlot {
    // Validasi form
    const formValidation = validateTimeSlotForm(data);
    if (!formValidation.valid) {
      throw new Error(formValidation.message);
    }

    // Validasi uniqueness
    const allTimeSlots = this.get<TimeSlot>(this.KEYS.TIME_SLOTS);
    const uniqueValidation = validateTimeSlotUnique(
      data.schoolId,
      data.day,
      data.slotNumber,
      allTimeSlots
    );
    if (!uniqueValidation.valid) {
      throw new Error(uniqueValidation.message);
    }

    const now = Date.now();
    const timeSlot: TimeSlot = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    allTimeSlots.push(timeSlot);
    this.set(this.KEYS.TIME_SLOTS, allTimeSlots);
    return timeSlot;
  }

  static updateTimeSlot(
    id: string,
    updates: Partial<TimeSlotFormData>
  ): TimeSlot {
    const timeSlots = this.get<TimeSlot>(this.KEYS.TIME_SLOTS);
    const timeSlotIndex = timeSlots.findIndex((ts) => ts.id === id);

    if (timeSlotIndex === -1) {
      throw new Error("Slot waktu tidak ditemukan");
    }

    const existingTimeSlot = timeSlots[timeSlotIndex];
    const updatedTimeSlot: TimeSlot = {
      ...existingTimeSlot,
      ...updates,
      updatedAt: Date.now(),
    };

    // Validasi form
    const formValidation = validateTimeSlotForm(updatedTimeSlot);
    if (!formValidation.valid) {
      throw new Error(formValidation.message);
    }

    // Validasi uniqueness jika day atau slotNumber berubah
    if (
      (updates.day && updates.day !== existingTimeSlot.day) ||
      (updates.slotNumber && updates.slotNumber !== existingTimeSlot.slotNumber)
    ) {
      const uniqueValidation = validateTimeSlotUnique(
        updatedTimeSlot.schoolId,
        updatedTimeSlot.day,
        updatedTimeSlot.slotNumber,
        timeSlots,
        id
      );
      if (!uniqueValidation.valid) {
        throw new Error(uniqueValidation.message);
      }
    }

    timeSlots[timeSlotIndex] = updatedTimeSlot;
    this.set(this.KEYS.TIME_SLOTS, timeSlots);
    return updatedTimeSlot;
  }

  static deleteTimeSlot(id: string): void {
    const timeSlots = this.get<TimeSlot>(this.KEYS.TIME_SLOTS);
    const timeSlot = this.findById(timeSlots, id);

    if (!timeSlot) {
      throw new Error("Slot waktu tidak ditemukan");
    }

    // Check dependencies
    const schedules = this.get<ScheduleEntry>(this.KEYS.SCHEDULE_ENTRIES);
    const depCheck = checkTimeSlotDependencies(id, schedules);

    if (!depCheck.canDelete) {
      throw new Error(depCheck.message);
    }

    const filtered = timeSlots.filter((ts) => ts.id !== id);
    this.set(this.KEYS.TIME_SLOTS, filtered);
  }

  // ==================== TEACHING ALLOCATIONS ====================

  static listTeachingAllocations(schoolId: string): TeachingAllocation[] {
    const allocations = this.get<TeachingAllocation>(
      this.KEYS.TEACHING_ALLOCATIONS
    );
    return allocations.filter((a) => a.schoolId === schoolId);
  }

  static getTeachingAllocation(id: string): TeachingAllocation | null {
    const allocations = this.get<TeachingAllocation>(
      this.KEYS.TEACHING_ALLOCATIONS
    );
    return this.findById(allocations, id) || null;
  }

  static createTeachingAllocation(
    data: TeachingAllocationFormData
  ): TeachingAllocation {
    // Validasi form
    const formValidation = validateTeachingAllocationForm(data);
    if (!formValidation.valid) {
      throw new Error(formValidation.message);
    }

    // Validasi uniqueness
    const allAllocations = this.get<TeachingAllocation>(
      this.KEYS.TEACHING_ALLOCATIONS
    );
    const uniqueValidation = validateTeachingAllocationUnique(
      data.schoolId,
      data.teacherId,
      data.subjectId,
      data.classId,
      allAllocations
    );
    if (!uniqueValidation.valid) {
      throw new Error(uniqueValidation.message);
    }

    const now = Date.now();
    const allocation: TeachingAllocation = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    allAllocations.push(allocation);
    this.set(this.KEYS.TEACHING_ALLOCATIONS, allAllocations);
    return allocation;
  }

  static updateTeachingAllocation(
    id: string,
    updates: Partial<TeachingAllocationFormData>
  ): TeachingAllocation {
    const allocations = this.get<TeachingAllocation>(
      this.KEYS.TEACHING_ALLOCATIONS
    );
    const allocationIndex = allocations.findIndex((a) => a.id === id);

    if (allocationIndex === -1) {
      throw new Error("Alokasi mengajar tidak ditemukan");
    }

    const existingAllocation = allocations[allocationIndex];
    const updatedAllocation: TeachingAllocation = {
      ...existingAllocation,
      ...updates,
      updatedAt: Date.now(),
    };

    // Validasi form
    const formValidation = validateTeachingAllocationForm(updatedAllocation);
    if (!formValidation.valid) {
      throw new Error(formValidation.message);
    }

    // Validasi uniqueness jika ada perubahan pada kombinasi key
    const keysChanged =
      (updates.teacherId && updates.teacherId !== existingAllocation.teacherId) ||
      (updates.subjectId && updates.subjectId !== existingAllocation.subjectId) ||
      (updates.classId && updates.classId !== existingAllocation.classId);

    if (keysChanged) {
      const uniqueValidation = validateTeachingAllocationUnique(
        updatedAllocation.schoolId,
        updatedAllocation.teacherId,
        updatedAllocation.subjectId,
        updatedAllocation.classId,
        allocations,
        id
      );
      if (!uniqueValidation.valid) {
        throw new Error(uniqueValidation.message);
      }
    }

    allocations[allocationIndex] = updatedAllocation;
    this.set(this.KEYS.TEACHING_ALLOCATIONS, allocations);
    return updatedAllocation;
  }

  static deleteTeachingAllocation(id: string): void {
    const allocations = this.get<TeachingAllocation>(
      this.KEYS.TEACHING_ALLOCATIONS
    );
    const allocation = this.findById(allocations, id);

    if (!allocation) {
      throw new Error("Alokasi mengajar tidak ditemukan");
    }

    // TeachingAllocation tidak punya dependencies (scheduleEntries generated dari allocations)
    // Jadi safe untuk delete

    const filtered = allocations.filter((a) => a.id !== id);
    this.set(this.KEYS.TEACHING_ALLOCATIONS, filtered);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clear all data (untuk testing/reset)
   */
  static clearAll(): void {
    if (typeof window === "undefined") return;

    Object.values(this.KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    // Reset payment status agar testing tidak terkunci
    localStorage.removeItem("jadwal_payment_status");
  }

  /**
   * Export all data to JSON
   */
  static exportData(): string {
    const data = {
      schools: this.get<School>(this.KEYS.SCHOOLS),
      classes: this.get<Class>(this.KEYS.CLASSES),
      teachers: this.get<Teacher>(this.KEYS.TEACHERS),
      subjects: this.get<Subject>(this.KEYS.SUBJECTS),
      timeSlots: this.get<TimeSlot>(this.KEYS.TIME_SLOTS),
      teachingAllocations: this.get<TeachingAllocation>(
        this.KEYS.TEACHING_ALLOCATIONS
      ),
      scheduleEntries: this.get<ScheduleEntry>(this.KEYS.SCHEDULE_ENTRIES),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON
   */
  static importData(json: string): void {
    try {
      const data = JSON.parse(json);

      if (data.schools) this.set(this.KEYS.SCHOOLS, data.schools);
      if (data.classes) this.set(this.KEYS.CLASSES, data.classes);
      if (data.teachers) this.set(this.KEYS.TEACHERS, data.teachers);
      if (data.subjects) this.set(this.KEYS.SUBJECTS, data.subjects);
      if (data.timeSlots) this.set(this.KEYS.TIME_SLOTS, data.timeSlots);
      if (data.teachingAllocations)
        this.set(this.KEYS.TEACHING_ALLOCATIONS, data.teachingAllocations);
      if (data.scheduleEntries)
        this.set(this.KEYS.SCHEDULE_ENTRIES, data.scheduleEntries);
    } catch {
      throw new Error("Format JSON tidak valid");
    }
  }

  /**
   * Get statistics
   */
  static getStats(schoolId: string) {
    return {
      classes: this.listClasses(schoolId).length,
      teachers: this.listTeachers(schoolId).length,
      subjects: this.listSubjects(schoolId).length,
      timeSlots: this.listTimeSlots(schoolId).length,
      teachingAllocations: this.listTeachingAllocations(schoolId).length,
    };
  }
}
