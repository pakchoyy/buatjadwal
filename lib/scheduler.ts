/**
 * Scheduler Algorithm - Generate jadwal otomatis
 * Berdasarkan: 03-Algoritma-Generate-Jadwal.md
 */

import { LocalDB } from "./db";
import {
  TeachingAllocation,
  TimeSlot,
  ScheduleEntry,
  Class,
} from "./types";
import { generateId } from "./utils";

interface ScheduleTicket {
  allocationId: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  className: string;
  remainingHours: number;
}

interface ScheduleResult {
  success: boolean;
  message: string;
  stats: {
    totalTickets: number;
    successfullyScheduled: number;
    failed: number;
  };
  failedTickets: {
    teacherName: string;
    subjectName: string;
    className: string;
    remainingHours: number;
  }[];
}

export class Scheduler {
  private schoolId: string;
  private allocations: TeachingAllocation[];
  private timeSlots: TimeSlot[];
  private classes: Class[];
  private scheduleEntries: Map<string, ScheduleEntry>; // key: timeSlotId-classId
  private teacherSchedule: Map<string, Set<string>>; // teacherId -> Set<timeSlotId>

  constructor(schoolId: string) {
    this.schoolId = schoolId;
    this.allocations = LocalDB.listTeachingAllocations(schoolId);
    this.timeSlots = LocalDB.listTimeSlots(schoolId).filter(
      (slot) => !slot.isBreak
    );
    this.classes = LocalDB.listClasses(schoolId);
    this.scheduleEntries = new Map();
    this.teacherSchedule = new Map();
  }

  /**
   * Main method - Generate complete schedule
   */
  public generateSchedule(): ScheduleResult {
    // Step 1: Clear existing schedule
    this.clearExistingSchedule();

    // Step 2: Build tickets from allocations
    const tickets = this.buildTickets();

    // Step 3: Sort tickets by priority (hardest first)
    const sortedTickets = this.sortTickets(tickets);

    // Step 4: Assign tickets to slots
    const failedTickets: ScheduleTicket[] = [];
    let successCount = 0;

    for (const ticket of sortedTickets) {
      const assigned = this.assignTicket(ticket);
      if (assigned) {
        successCount++;
        ticket.remainingHours--;

        // If ticket still has remaining hours, add back to queue
        if (ticket.remainingHours > 0) {
          sortedTickets.push(ticket);
        }
      } else {
        failedTickets.push(ticket);
      }
    }

    // Step 5: Save schedule to database
    this.saveSchedule();

    // Step 6: Build result
    const result = this.buildResult(tickets.length, successCount, failedTickets);

    return result;
  }

  /**
   * Clear existing schedule entries
   */
  private clearExistingSchedule(): void {
    // This will be handled by LocalDB clear method
    // For now, we just reset internal state
    this.scheduleEntries.clear();
    this.teacherSchedule.clear();
  }

  /**
   * Build tickets from teaching allocations
   * Each allocation generates N tickets based on hoursPerWeek
   */
  private buildTickets(): ScheduleTicket[] {
    const tickets: ScheduleTicket[] = [];

    for (const allocation of this.allocations) {
      const cls = this.classes.find((c) => c.id === allocation.classId);
      if (!cls) continue;

      // Create N tickets for N hours
      for (let i = 0; i < allocation.hoursPerWeek; i++) {
        tickets.push({
          allocationId: allocation.id,
          teacherId: allocation.teacherId,
          subjectId: allocation.subjectId,
          classId: allocation.classId,
          className: cls.name,
          remainingHours: 1, // Each ticket represents 1 hour
        });
      }
    }

    return tickets;
  }

  /**
   * Sort tickets by priority (heuristic)
   * Prioritize:
   * 1. Teachers with most total hours (less flexible)
   * 2. Classes with fewer available slots
   * 3. Random shuffle within same priority to vary distribution
   */
  private sortTickets(tickets: ScheduleTicket[]): ScheduleTicket[] {
    // Count total hours per teacher
    const teacherHours = new Map<string, number>();
    for (const ticket of tickets) {
      teacherHours.set(
        ticket.teacherId,
        (teacherHours.get(ticket.teacherId) || 0) + 1
      );
    }

    // Sort: teachers with most hours first, then random within same count
    return tickets.sort((a, b) => {
      const aHours = teacherHours.get(a.teacherId) || 0;
      const bHours = teacherHours.get(b.teacherId) || 0;
      
      if (bHours !== aHours) {
        return bHours - aHours;
      }
      
      // Same priority - random order for better distribution
      return Math.random() - 0.5;
    });
  }

  /**
   * Try to assign a ticket to a valid time slot
   */
  private assignTicket(ticket: ScheduleTicket): boolean {
    // Get available slots for this class
    const availableSlots = this.getAvailableSlots(ticket);

    if (availableSlots.length === 0) {
      return false; // No available slots
    }

    // Pick first available slot (can be improved with better heuristic)
    const slot = availableSlots[0];

    // Create schedule entry
    const entry: ScheduleEntry = {
      id: generateId(),
      schoolId: this.schoolId,
      timeSlotId: slot.id,
      classId: ticket.classId,
      teacherId: ticket.teacherId,
      subjectId: ticket.subjectId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save to internal map
    const key = `${slot.id}-${ticket.classId}`;
    this.scheduleEntries.set(key, entry);

    // Mark teacher as busy at this time slot
    if (!this.teacherSchedule.has(ticket.teacherId)) {
      this.teacherSchedule.set(ticket.teacherId, new Set());
    }
    this.teacherSchedule.get(ticket.teacherId)!.add(slot.id);

    return true;
  }

  /**
   * Get available time slots for a ticket
   * Check constraints:
   * 1. Slot not already used by this class
   * 2. Teacher not already teaching at this time
   * 3. Soft constraint: Prefer different day if same subject already scheduled today
   */
  private getAvailableSlots(ticket: ScheduleTicket): TimeSlot[] {
    const available = this.timeSlots.filter((slot) => {
      // Constraint 1: Class slot not occupied
      const classKey = `${slot.id}-${ticket.classId}`;
      if (this.scheduleEntries.has(classKey)) {
        return false;
      }

      // Constraint 2: Teacher not busy at this time
      const teacherSlots = this.teacherSchedule.get(ticket.teacherId);
      if (teacherSlots && teacherSlots.has(slot.id)) {
        return false;
      }

      return true;
    });

    // Soft constraint: Check if same subject already taught today in this class
    const slotsWithScore = available.map((slot) => {
      let score = 0;

      // Check if same subject already scheduled today for this class
      const todaySlots = this.timeSlots.filter((s) => s.day === slot.day);
      const hasSameSubjectToday = todaySlots.some((s) => {
        const key = `${s.id}-${ticket.classId}`;
        const entry = this.scheduleEntries.get(key);
        return entry && entry.subjectId === ticket.subjectId;
      });

      if (hasSameSubjectToday) {
        score -= 10; // Penalize same subject on same day
      }

      // Prefer earlier slots (morning)
      score += (12 - slot.slotNumber) * 0.5;

      return { slot, score };
    });

    // Sort by score (higher is better)
    slotsWithScore.sort((a, b) => b.score - a.score);

    return slotsWithScore.map((s) => s.slot);
  }

  /**
   * Save schedule entries to database
   */
  private saveSchedule(): void {
    // First, clear existing schedule in DB
    const existingEntries = LocalDB.get<ScheduleEntry>("jadwal_scheduleEntries");
    const filtered = existingEntries.filter((e) => e.schoolId !== this.schoolId);

    // Add new entries
    const newEntries = Array.from(this.scheduleEntries.values());
    LocalDB.set("jadwal_scheduleEntries", [...filtered, ...newEntries]);
  }

  /**
   * Build result summary
   */
  private buildResult(
    totalTickets: number,
    successCount: number,
    failedTickets: ScheduleTicket[]
  ): ScheduleResult {
    const teachers = LocalDB.listTeachers(this.schoolId);
    const subjects = LocalDB.listSubjects(this.schoolId);

    const failedDetails = failedTickets.map((ticket) => {
      const teacher = teachers.find((t) => t.id === ticket.teacherId);
      const subject = subjects.find((s) => s.id === ticket.subjectId);

      return {
        teacherName: teacher ? teacher.name : "Unknown",
        subjectName: subject ? subject.name : "Unknown",
        className: ticket.className,
        remainingHours: ticket.remainingHours,
      };
    });

    return {
      success: failedTickets.length === 0,
      message:
        failedTickets.length === 0
          ? `Jadwal berhasil dibuat! ${successCount} jam pelajaran terjadwal.`
          : `Jadwal sebagian berhasil. ${successCount} dari ${totalTickets} jam terjadwal. ${failedTickets.length} jam gagal dijadwalkan.`,
      stats: {
        totalTickets,
        successfullyScheduled: successCount,
        failed: failedTickets.length,
      },
      failedTickets: failedDetails,
    };
  }
}

/**
 * Helper: Get schedule entries by class
 */
export function getScheduleByClass(schoolId: string, classId: string): ScheduleEntry[] {
  const entries = LocalDB.get<ScheduleEntry>("jadwal_scheduleEntries");
  return entries.filter((e) => e.schoolId === schoolId && e.classId === classId);
}

/**
 * Helper: Get schedule entries by teacher
 */
export function getScheduleByTeacher(schoolId: string, teacherId: string): ScheduleEntry[] {
  const entries = LocalDB.get<ScheduleEntry>("jadwal_scheduleEntries");
  return entries.filter((e) => e.schoolId === schoolId && e.teacherId === teacherId);
}

/**
 * Helper: Get all schedule entries for school
 */
export function getAllScheduleEntries(schoolId: string): ScheduleEntry[] {
  const entries = LocalDB.get<ScheduleEntry>("jadwal_scheduleEntries");
  return entries.filter((e) => e.schoolId === schoolId);
}

/**
 * Helper: Clear schedule for school
 */
export function clearSchedule(schoolId: string): void {
  const entries = LocalDB.get<ScheduleEntry>("jadwal_scheduleEntries");
  const filtered = entries.filter((e) => e.schoolId !== schoolId);
  LocalDB.set("jadwal_scheduleEntries", filtered);
}
