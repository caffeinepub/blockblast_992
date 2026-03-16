// Block Blast - Haptic Feedback Hook
// Uses the Vibration API with settings integration

import { useCallback } from "react";
import { useSettings } from "./useSettings";

export type HapticPattern =
  | "medium" // Medium vibration (25ms) - block place
  | "heavy" // Longer vibration (50ms) - line clear
  | "success" // Double pulse - combo
  | "error" // Long vibration (100ms) - game over
  | "celebration"; // Triple pulse - new high score

// Vibration patterns in milliseconds
// For patterns: [vibrate, pause, vibrate, pause, ...]
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  medium: 25,
  heavy: 50,
  success: [25, 50, 25], // vibrate 25ms, pause 50ms, vibrate 25ms
  error: 100,
  celebration: [30, 30, 30, 30, 50], // triple pulse
};

/**
 * Check if the Vibration API is supported
 */
function isVibrationSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/**
 * Trigger a vibration (fail-silent if not supported)
 */
function vibrate(pattern: number | number[]): void {
  try {
    if (isVibrationSupported()) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Fail silently - vibration not available or blocked
  }
}

/**
 * Hook for haptic feedback with settings integration
 */
export function useHaptics() {
  const { settings } = useSettings();

  const trigger = useCallback(
    (pattern: HapticPattern) => {
      if (settings.hapticsEnabled) {
        vibrate(HAPTIC_PATTERNS[pattern]);
      }
    },
    [settings.hapticsEnabled],
  );

  // Convenience methods for common haptic events
  const blockPlace = useCallback(() => trigger("medium"), [trigger]);
  const lineClear = useCallback(() => trigger("heavy"), [trigger]);
  const combo = useCallback(() => trigger("success"), [trigger]);
  const gameOver = useCallback(() => trigger("error"), [trigger]);
  const newHighScore = useCallback(() => trigger("celebration"), [trigger]);

  return {
    trigger,
    blockPlace,
    lineClear,
    combo,
    gameOver,
    newHighScore,
    hapticsEnabled: settings.hapticsEnabled,
    isSupported: isVibrationSupported(),
  };
}
