/**
 * Dependency Injection for Widget updates.
 * This file breaks the circular dependency between the Audio Hooks 
 * and the Widget UI components.
 */
let updater: (() => void) | null = null;

export function setWidgetUpdater(fn: () => void) {
  updater = fn;
}

export function triggerWidgetUpdate() {
  try {
    if (updater) {
      updater();
    }
  } catch (e) {
    // Ignore updates if app is not fully initialized
  }
}
