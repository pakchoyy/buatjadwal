/**
 * Export Wrapper
 * Adds payment check before allowing export downloads
 */

import { hasUserPaid } from "./payment-storage";
import { ExportType, ExportMetadata } from "./types";

// Store pending export callback
let pendingExportCallback: (() => void) | null = null;
let pendingExportType: ExportType | null = null;
let pendingExportMetadata: ExportMetadata | null = null;

/**
 * Check if export requires payment
 * Returns true if payment modal should be shown
 */
export function shouldShowPaymentModal(): boolean {
  return !hasUserPaid();
}

/**
 * Store pending export information
 */
export function setPendingExport(
  callback: () => void,
  exportType: ExportType,
  metadata?: ExportMetadata
): void {
  pendingExportCallback = callback;
  pendingExportType = exportType;
  pendingExportMetadata = metadata || null;
  console.log("Pending export set:", { exportType, metadata });
}

/**
 * Get pending export information
 */
export function getPendingExportInfo(): {
  exportType: ExportType | null;
  metadata: ExportMetadata | null;
} {
  return {
    exportType: pendingExportType,
    metadata: pendingExportMetadata,
  };
}

/**
 * Execute pending export after successful payment
 */
export function executePendingExport(): void {
  if (pendingExportCallback) {
    console.log("Executing pending export");
    pendingExportCallback();
    clearPendingExport();
  } else {
    console.warn("No pending export callback found");
  }
}

/**
 * Clear pending export
 */
export function clearPendingExport(): void {
  pendingExportCallback = null;
  pendingExportType = null;
  pendingExportMetadata = null;
}

/**
 * Wrap export function with payment check
 */
export function wrapExportFunction<T extends any[]>(
  exportFn: (...args: T) => void,
  exportType: ExportType,
  getMetadata: (...args: T) => ExportMetadata
): (...args: T) => { requiresPayment: boolean; execute: () => void } {
  return (...args: T) => {
    const execute = () => exportFn(...args);

    if (shouldShowPaymentModal()) {
      // Store the export for later execution
      const metadata = getMetadata(...args);
      setPendingExport(execute, exportType, metadata);
      return { requiresPayment: true, execute };
    } else {
      // User has paid, execute immediately
      execute();
      return { requiresPayment: false, execute };
    }
  };
}
