/**
 * Utility Functions
 */

import {
  Day,
  DAY_LABELS,
  EducationLevel,
  EDUCATION_LEVEL_LABELS,
} from "./types";

/**
 * Generate UUID v4
 */
export function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format timestamp to readable datetime
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get day label in Indonesian
 */
export function getDayLabel(day: Day): string {
  return DAY_LABELS[day];
}

/**
 * Format time range
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime}-${endTime}`;
}

/**
 * Validate time format (HH:MM)
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Compare two times (HH:MM format)
 * Returns: -1 if time1 < time2, 0 if equal, 1 if time1 > time2
 */
export function compareTimes(time1: string, time2: string): number {
  const [h1, m1] = time1.split(":").map(Number);
  const [h2, m2] = time2.split(":").map(Number);

  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;

  if (minutes1 < minutes2) return -1;
  if (minutes1 > minutes2) return 1;
  return 0;
}

/**
 * Check if startTime is before endTime
 */
export function isTimeRangeValid(
  startTime: string,
  endTime: string
): boolean {
  return compareTimes(startTime, endTime) < 0;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    // Log corruption for debugging
    console.error('Data corruption detected:', error);
    console.warn('Using fallback value. Corrupted data:', json.substring(0, 100));
    return fallback;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get grade label
 */
export function getGradeLabel(grade: number): string {
  return `Kelas ${grade}`;
}

/**
 * Get education level label
 */
export function getEducationLevelLabel(level: EducationLevel): string {
  return EDUCATION_LEVEL_LABELS[level];
}

/**
 * Build class summary label
 */
export function formatClassLevel(level: EducationLevel, grade: number): string {
  return `${getEducationLevelLabel(level)} ${grade}`;
}

/**
 * Sort array by field
 */
export function sortBy<T>(
  array: T[],
  field: keyof T,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Filter array by search term (case insensitive)
 */
export function filterBySearch<T>(
  array: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return array;

  const term = searchTerm.toLowerCase();
  return array.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      return String(value).toLowerCase().includes(term);
    })
  );
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Format number with thousand separator
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("id-ID");
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Sanitize HTML input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Group array by key
 */
export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}
