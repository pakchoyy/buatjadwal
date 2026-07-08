/**
 * Auto Save
 * Debounce wrapper untuk auto-save functionality
 */

import { ProjectManager } from "./project-manager";

type SaveCallback = () => void;
type SaveStatus = "idle" | "saving" | "saved" | "error";

let saveTimer: NodeJS.Timeout | null = null;
let statusListeners: Array<(status: SaveStatus) => void> = [];
let currentStatus: SaveStatus = "idle";

const DEBOUNCE_DELAY = 1000; // 1 detik
const SAVED_INDICATOR_DURATION = 2000; // 2 detik

/**
 * Set status dan notify listeners
 */
function setStatus(status: SaveStatus) {
  currentStatus = status;
  statusListeners.forEach((listener) => listener(status));
}

/**
 * Subscribe to status changes
 */
export function onSaveStatusChange(callback: (status: SaveStatus) => void): () => void {
  statusListeners.push(callback);
  // Return unsubscribe function
  return () => {
    statusListeners = statusListeners.filter((cb) => cb !== callback);
  };
}

/**
 * Get current save status
 */
export function getSaveStatus(): SaveStatus {
  return currentStatus;
}

/**
 * Debounced auto save
 */
export function autoSave(saveCallback: SaveCallback): void {
  // Clear previous timer
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  // Set status to saving
  setStatus("saving");

  // Schedule save
  saveTimer = setTimeout(() => {
    try {
      saveCallback();
      
      // Update project snapshot
      ProjectManager.updateActiveProjectSnapshot();
      
      setStatus("saved");
      
      // Hide "saved" indicator after delay
      setTimeout(() => {
        if (currentStatus === "saved") {
          setStatus("idle");
        }
      }, SAVED_INDICATOR_DURATION);
    } catch (error) {
      console.error("Auto-save error:", error);
      setStatus("error");
      
      // Reset to idle after showing error
      setTimeout(() => {
        if (currentStatus === "error") {
          setStatus("idle");
        }
      }, SAVED_INDICATOR_DURATION);
    }
  }, DEBOUNCE_DELAY);
}

/**
 * Force immediate save (bypass debounce)
 */
export function forceSave(saveCallback: SaveCallback): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  try {
    saveCallback();
    ProjectManager.updateActiveProjectSnapshot();
    setStatus("saved");
    
    setTimeout(() => {
      if (currentStatus === "saved") {
        setStatus("idle");
      }
    }, SAVED_INDICATOR_DURATION);
  } catch (error) {
    console.error("Force save error:", error);
    setStatus("error");
  }
}
