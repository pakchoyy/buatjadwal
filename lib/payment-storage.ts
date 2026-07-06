/**
 * Payment Storage Utility
 * Manages localStorage for payment status persistence
 */

const PAYMENT_STATUS_KEY = "jadwal_payment_status";

export interface PaymentStatus {
  hasPaid: boolean;
  paidAt: number;
  transactionId: string;
  amount: number;
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if user has already paid
 */
export function hasUserPaid(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const status = localStorage.getItem(PAYMENT_STATUS_KEY);
    if (!status) {
      return false;
    }

    const parsed: PaymentStatus = JSON.parse(status);
    return parsed.hasPaid === true;
  } catch (error) {
    console.error("Error checking payment status:", error);
    return false;
  }
}

/**
 * Get payment status
 */
export function getPaymentStatus(): PaymentStatus | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const status = localStorage.getItem(PAYMENT_STATUS_KEY);
    if (!status) {
      return null;
    }

    return JSON.parse(status);
  } catch (error) {
    console.error("Error getting payment status:", error);
    return null;
  }
}

/**
 * Save payment status after successful payment
 */
export function savePaymentStatus(
  transactionId: string,
  amount: number
): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage not available, payment status not saved");
    return false;
  }

  try {
    const status: PaymentStatus = {
      hasPaid: true,
      paidAt: Date.now(),
      transactionId,
      amount,
    };

    localStorage.setItem(PAYMENT_STATUS_KEY, JSON.stringify(status));
    console.log("Payment status saved to localStorage");
    return true;
  } catch (error) {
    console.error("Error saving payment status:", error);
    return false;
  }
}

/**
 * Clear payment status (for testing or logout)
 */
export function clearPaymentStatus(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(PAYMENT_STATUS_KEY);
    console.log("Payment status cleared");
    return true;
  } catch (error) {
    console.error("Error clearing payment status:", error);
    return false;
  }
}
