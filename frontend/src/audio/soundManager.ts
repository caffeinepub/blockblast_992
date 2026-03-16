// Block Blast - Sound Manager
// Handles game sound effects and background music using files from public/

export type SoundEffect =
  | "blockPlace"
  | "lineClear"
  | "comboClear"
  | "gameOver"
  | "newHighScore"
  | "buttonClick"
  | "menuOpen";

// Sound file paths (served from public/assets/)
const SOUND_FILES: Record<SoundEffect, string> = {
  blockPlace: "/assets/block-place.opus",
  lineClear: "/assets/line-clear.opus",
  comboClear: "/assets/combo-clear.opus",
  gameOver: "/assets/game-over.opus",
  newHighScore: "/assets/new-high-score.opus",
  buttonClick: "/assets/button-click.opus",
  menuOpen: "/assets/menu-open.opus",
};

// Audio cache to avoid reloading
const audioCache = new Map<SoundEffect, HTMLAudioElement>();
const loadedSounds = new Set<SoundEffect>();
const failedSounds = new Set<SoundEffect>();

// Global state
let globalVolume = 1.0;
let isMuted = false;

// Background music
const MUSIC_FILE = "/assets/background-music.opus";
const MUSIC_VOLUME = 0.3; // Music plays quieter than sound effects
let musicAudio: HTMLAudioElement | null = null;
let musicEnabled = true;
let musicLoaded = false;

// Track user interaction for autoplay policy
let hasUserInteracted = false;
let pendingMusicPlay = false;

/**
 * Preload a sound effect (fail-silent)
 */
export function preloadSound(effect: SoundEffect): Promise<void> {
  // Skip if already loaded or known to fail
  if (loadedSounds.has(effect) || failedSounds.has(effect)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const audio = new Audio();

    audio.addEventListener(
      "canplaythrough",
      () => {
        audioCache.set(effect, audio);
        loadedSounds.add(effect);
        resolve();
      },
      { once: true },
    );

    audio.addEventListener(
      "error",
      () => {
        failedSounds.add(effect);
        resolve();
      },
      { once: true },
    );

    // Set source and start loading
    audio.preload = "auto";
    audio.src = SOUND_FILES[effect];
  });
}

/**
 * Preload all sound effects (fail-silent)
 */
export async function preloadAllSounds(): Promise<void> {
  const effects = Object.keys(SOUND_FILES) as SoundEffect[];
  await Promise.all(effects.map(preloadSound));
}

/**
 * Play a sound effect (fail-silent if not loaded)
 */
export function playSound(effect: SoundEffect): void {
  // Don't play if muted
  if (isMuted) {
    return;
  }

  // Don't play if sound failed to load
  if (failedSounds.has(effect)) {
    return;
  }

  const cached = audioCache.get(effect);

  if (cached) {
    // Create new audio with same src for overlapping playback
    // Note: cloneNode() doesn't preserve loaded audio data, but new Audio with
    // the same src uses browser's cached audio data
    const audio = new Audio(cached.src);
    audio.volume = globalVolume;
    audio.play().catch(() => {});
  } else {
    // Sound not loaded yet, try to load and play
    const audio = new Audio(SOUND_FILES[effect]);
    audio.volume = globalVolume;

    audio.addEventListener(
      "canplaythrough",
      () => {
        audioCache.set(effect, audio);
        loadedSounds.add(effect);
        audio.play().catch(() => {});
      },
      { once: true },
    );

    audio.addEventListener(
      "error",
      () => {
        failedSounds.add(effect);
      },
      { once: true },
    );
  }
}

/**
 * Stop all playing sounds
 */
export function stopAllSounds(): void {
  audioCache.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

/**
 * Set global volume (0.0 to 1.0)
 */
export function setVolume(volume: number): void {
  globalVolume = Math.max(0, Math.min(1, volume));
  audioCache.forEach((audio) => {
    audio.volume = globalVolume;
  });
}

/**
 * Get current volume
 */
export function getVolume(): number {
  return globalVolume;
}

/**
 * Set muted state
 */
export function setMuted(muted: boolean): void {
  isMuted = muted;
  if (muted) {
    stopAllSounds();
  }
}

/**
 * Get muted state
 */
export function getMuted(): boolean {
  return isMuted;
}

/**
 * Toggle mute
 */
export function toggleMute(): boolean {
  isMuted = !isMuted;
  if (isMuted) {
    stopAllSounds();
  }
  return isMuted;
}

/**
 * Create a sound player function for React components
 */
export function createSoundPlayer(soundEnabled: boolean) {
  return (effect: SoundEffect) => {
    if (soundEnabled) {
      playSound(effect);
    }
  };
}

// ==================== Background Music ====================

/**
 * Handle user interaction - enables audio playback
 * Call this once when user first interacts with the page
 */
export function handleUserInteraction(): void {
  if (hasUserInteracted) return;
  hasUserInteracted = true;

  // If music was waiting to play, start it now
  if (pendingMusicPlay && musicEnabled) {
    playMusic();
  }
}

/**
 * Check if user has interacted with the page
 */
export function getHasUserInteracted(): boolean {
  return hasUserInteracted;
}

/**
 * Initialize background music (call once on app start)
 */
export function initMusic(): void {
  if (musicAudio) return;

  musicAudio = new Audio(MUSIC_FILE);
  musicAudio.loop = true;
  musicAudio.volume = MUSIC_VOLUME * globalVolume;

  musicAudio.addEventListener(
    "canplaythrough",
    () => {
      musicLoaded = true;
      // If we were waiting for music to load and user has interacted, play now
      if (pendingMusicPlay && hasUserInteracted && musicEnabled) {
        playMusic();
      }
    },
    { once: true },
  );

  musicAudio.addEventListener(
    "error",
    () => {
      musicLoaded = false;
      musicAudio = null;
    },
    { once: true },
  );
}

/**
 * Start playing background music
 */
export function playMusic(): void {
  if (!musicEnabled) {
    pendingMusicPlay = false;
    return;
  }

  // If user hasn't interacted yet, mark as pending
  if (!hasUserInteracted) {
    pendingMusicPlay = true;
    return;
  }

  if (!musicAudio) {
    pendingMusicPlay = true;
    return;
  }

  pendingMusicPlay = false;
  musicAudio.play().catch(() => {
    // If autoplay still fails, mark as pending for next interaction
    pendingMusicPlay = true;
  });
}

/**
 * Pause background music
 */
export function pauseMusic(): void {
  if (!musicAudio) return;
  musicAudio.pause();
}

/**
 * Stop background music and reset to beginning
 */
export function stopMusic(): void {
  if (!musicAudio) return;
  musicAudio.pause();
  musicAudio.currentTime = 0;
}

/**
 * Set music enabled state
 */
export function setMusicEnabled(enabled: boolean): void {
  musicEnabled = enabled;
  if (enabled) {
    playMusic();
  } else {
    pauseMusic();
  }
}

/**
 * Get music enabled state
 */
export function getMusicEnabled(): boolean {
  return musicEnabled;
}

/**
 * Check if music is currently playing
 */
export function isMusicPlaying(): boolean {
  return musicAudio ? !musicAudio.paused : false;
}
