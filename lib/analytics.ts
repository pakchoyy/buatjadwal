export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

type GtagCommand = "config" | "event" | "js";
type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: GtagCommand, targetId: string | Date, params?: EventParams) => void;
  }
}

function isAnalyticsEnabled() {
  return typeof window !== "undefined" && typeof window.gtag === "function" && !!GA_MEASUREMENT_ID;
}

export function pageView(url: string, pageName?: string) {
  if (!isAnalyticsEnabled()) {
    return;
  }

  window.gtag!("event", "page_view", {
    page_location: window.location.origin + url,
    page_path: url,
    page_title: document.title,
    page_name: pageName,
  });
}

export function trackEvent(eventName: string, params?: EventParams) {
  if (!isAnalyticsEnabled()) {
    return;
  }

  window.gtag!("event", eventName, params);
}

export function trackError(feature: string, error: Error | string, params?: EventParams) {
  const message = error instanceof Error ? error.message : error;

  trackEvent("app_error", {
    feature,
    error_message: message,
    ...params,
  });
}

export const Analytics = {
  appOpen: (params?: EventParams) => trackEvent("app_open", params),
  exportPdf: (params?: EventParams) => trackEvent("export_pdf", params),
  exportExcel: (params?: EventParams) => trackEvent("export_excel", params),
  printSchedule: (params?: EventParams) => trackEvent("print_schedule", params),
  downloadQris: (params?: EventParams) => trackEvent("download_qris", params),
  supportDownloadClick: (params?: EventParams) => trackEvent("support_download_click", params),
  generateSchedule: (params?: EventParams) => trackEvent("generate_schedule", params),
  teacherCreated: (params?: EventParams) => trackEvent("teacher_created", params),
  teacherDeleted: (params?: EventParams) => trackEvent("teacher_deleted", params),
  studentCreated: (params?: EventParams) => trackEvent("student_created", params),
  studentDeleted: (params?: EventParams) => trackEvent("student_deleted", params),
  subjectCreated: (params?: EventParams) => trackEvent("subject_created", params),
  subjectDeleted: (params?: EventParams) => trackEvent("subject_deleted", params),
  timeSlotCreated: (params?: EventParams) => trackEvent("time_slot_created", params),
  timeSlotDeleted: (params?: EventParams) => trackEvent("time_slot_deleted", params),
  teachingAssignmentCreated: (params?: EventParams) =>
    trackEvent("teaching_assignment_created", params),
  teachingAssignmentDeleted: (params?: EventParams) =>
    trackEvent("teaching_assignment_deleted", params),
  backupDatabase: (params?: EventParams) => trackEvent("backup_database", params),
  restoreDatabase: (params?: EventParams) => trackEvent("restore_database", params),
};
