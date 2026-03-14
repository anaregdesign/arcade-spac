const MUTE_STORAGE_KEY = "arcade:sound-muted";

export function readSoundMuted(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeSoundMuted(value: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, String(value));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
  }
}
