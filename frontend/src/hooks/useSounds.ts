// Block Blast - Sound Hook
// React hook for playing sound effects with settings integration

import { useCallback, useEffect, useRef } from "react";
import { useSettings } from "./useSettings";
import {
  playSound,
  setMuted,
  preloadAllSounds,
  type SoundEffect,
} from "../audio/soundManager";

export type { SoundEffect } from "../audio/soundManager";

/**
 * Hook for playing game sound effects
 * Respects the soundEnabled setting from SettingsContext
 */
export function useSounds() {
  const { settings } = useSettings();
  const hasPreloaded = useRef(false);

  // Sync mute state with settings
  useEffect(() => {
    setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Preload sounds on first use
  useEffect(() => {
    if (!hasPreloaded.current) {
      hasPreloaded.current = true;
      preloadAllSounds();
    }
  }, []);

  // Play sound function that respects settings
  const play = useCallback(
    (effect: SoundEffect) => {
      if (settings.soundEnabled) {
        playSound(effect);
      }
    },
    [settings.soundEnabled],
  );

  return {
    play,
    soundEnabled: settings.soundEnabled,
  };
}
