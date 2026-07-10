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
  ScheduleGenerateMode,
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
  private mode: ScheduleGenerateMode;
  private allocations: TeachingAllocation[];
  private timeSlots: TimeSlot[];
  private classes: Class[];
  private scheduleEntries: Map<string, ScheduleEntry>; // key: timeSlotId-classId
  private teacherSchedule: Map<string, Set<string>>; // teacherId -> Set<timeSlotId>

  constructor(schoolId: string, mode: ScheduleGenerateMode = "spread") {
    this.schoolId = schoolId;
    this.mode = mode;
    this.allocations = LocalDB.listTeachingAllocations(schoolId);
    this.timeSlots = LocalDB.listTimeSlots(schoolId).filter(
      (slot) => !slot.isBreak
    );
    this.classes = LocalDB.listClasses(schoolId);
    this.scheduleEntries = new Map();
    this.teacherSchedule = new Map();
  }

  /**
   * Main method - Generate complete schedule with retry mechanism
   */
  public generateSchedule(): ScheduleResult {
    const MAX_ATTEMPTS = 3;
    let bestResult: ScheduleResult | null = null;
    let bestSuccessCount = 0;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      // Clear and reset for this attempt
      this.clearExistingSchedule();

      // Build tickets
      const tickets = this.buildTickets();

      // Sort tickets with different shuffle per attempt
      const sortedTickets = this.sortTickets(tickets, attempt);

      // Assign tickets to slots
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

      // Build result for this attempt
      const result = this.buildResult(tickets.length, successCount, failedTickets, attempt);

      // Track best result
      if (successCount > bestSuccessCount) {
        bestSuccessCount = successCount;
        bestResult = result;

        // If perfect solution found, use it immediately
        if (failedTickets.length === 0) {
          this.saveSchedule();
          return result;
        }
      }

      // If not last attempt, don't save yet
      if (attempt < MAX_ATTEMPTS) {
        console.log(`Attempt ${attempt} - Success: ${successCount}/${tickets.length}`);
      }
    }

    // Save the best result
    this.saveSchedule();
    return bestResult!;
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
   * 
   * @param attempt - Current attempt number (for seeded randomness)
   */
  private sortTickets(tickets: ScheduleTicket[], attempt: number = 1): ScheduleTicket[] {
    // Count total hours per teacher
    const teacherHours = new Map<string, number>();
    for (const ticket of tickets) {
      teacherHours.set(
        ticket.teacherId,
        (teacherHours.get(ticket.teacherId) || 0) + 1
      );
    }

    // Create a copy to avoid mutating original
    const ticketsCopy = [...tickets];

    // Shuffle more aggressively on retry attempts
    if (attempt > 1) {
      // Fisher-Yates shuffle
      for (let i = ticketsCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ticketsCopy[i], ticketsCopy[j]] = [ticketsCopy[j], ticketsCopy[i]];
      }
    }

    if (this.mode === "compact") {
      return ticketsCopy.sort((a, b) => {
        const aKey = `${a.teacherId}-${a.classId}-${a.subjectId}`;
        const bKey = `${b.teacherId}-${b.classId}-${b.subjectId}`;

        const aHours = teacherHours.get(a.teacherId) || 0;
        const bHours = teacherHours.get(b.teacherId) || 0;

        if (bHours !== aHours) {
          return bHours - aHours;
        }

        if (aKey !== bKey) {
          return aKey.localeCompare(bKey);
        }

        return 0;
      });
    }

    // Sort: teachers with most hours first, then random within same count
    return ticketsCopy.sort((a, b) => {
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
    const slot = this.mode === "compact"
      ? availableSlots[0]
      : availableSlots[0];

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

      if (this.mode === "compact") {
        if (hasSameSubjectToday) {
          score += 12; // Prefer same subject to stay together
        }
      } else if (hasSameSubjectToday) {
        score -= 10; // Penalize same subject on same day
      }

      // Prefer earlier slots (morning)
      score += (12 - slot.slotNumber) * 0.5;

      if (this.mode === "compact") {
        const sameDayEntries = this.timeSlots
          .filter((s) => s.day === slot.day)
          .map((s) => this.scheduleEntries.get(`${s.id}-${ticket.classId}`))
          .filter((entry): entry is ScheduleEntry => !!entry && entry.subjectId === ticket.subjectId);

        if (sameDayEntries.length > 0) {
          const nearest = sameDayEntries.reduce((best, entry) => {
            const entrySlot = this.timeSlots.find((s) => s.id === entry.timeSlotId);
            if (!entrySlot) return best;
            const distance = Math.abs(entrySlot.slotNumber - slot.slotNumber);
            if (best === null || distance < best.distance) {
              return { distance, slotNumber: entrySlot.slotNumber };
            }
            return best;
          }, null as null | { distance: number; slotNumber: number });

          if (nearest) {
            score += Math.max(0, 8 - nearest.distance * 2);
          }
        }
      }

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
    failedTickets: ScheduleTicket[],
    attempt: number = 1
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

    const successMessage = failedTickets.length === 0
      ? `✅ Jadwal berhasil dibuat! ${successCount} jam pelajaran terjadwal.`
      : attempt > 1
      ? `⚠️ Jadwal terbaik dari ${attempt} percobaan: ${successCount} dari ${totalTickets} jam terjadwal. ${failedTickets.length} jam gagal.`
      : `⚠️ Jadwal sebagian berhasil: ${successCount} dari ${totalTickets} jam terjadwal. ${failedTickets.length} jam gagal.`;

    return {
      success: failedTickets.length === 0,
      message: successMessage,
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
