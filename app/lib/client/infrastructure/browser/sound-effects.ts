import { readSoundMuted, writeSoundMuted } from "./sound-mute-storage";
import type { MusicalPitch } from "./note-frequencies";
import { resolvePitchFrequency } from "./note-frequencies";

let mutedState: boolean = readSoundMuted();

export function isSoundMuted(): boolean {
  return mutedState;
}

export function setSoundMuted(value: boolean): void {
  mutedState = value;
  writeSoundMuted(value);
}

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!sharedContext) {
    try {
      sharedContext = new AudioContext();
    } catch {
      return null;
    }
  }

  return sharedContext;
}

function ensureResumed(ctx: AudioContext): void {
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
}

function playTone(
  frequency: number,
  type: OscillatorType,
  duration: number,
  gainPeak: number = 0.3,
  endFrequency?: number,
): void {
  if (mutedState) {
    return;
  }

  const ctx = getAudioContext();

  if (!ctx) {
    return;
  }

  ensureResumed(ctx);

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  if (endFrequency !== undefined) {
    oscillator.frequency.linearRampToValueAtTime(endFrequency, ctx.currentTime + duration);
  }

  gainNode.gain.setValueAtTime(gainPeak, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

type NoteSpec = {
  duration: number;
  frequency: number;
  gain?: number;
  startAt: number;
  type: OscillatorType;
};

function playSequence(notes: NoteSpec[]): void {
  if (mutedState) {
    return;
  }

  const ctx = getAudioContext();

  if (!ctx) {
    return;
  }

  ensureResumed(ctx);

  for (const note of notes) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = note.type;
    oscillator.frequency.setValueAtTime(note.frequency, ctx.currentTime + note.startAt);

    const gain = note.gain ?? 0.3;

    gainNode.gain.setValueAtTime(gain, ctx.currentTime + note.startAt);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.startAt + note.duration);

    oscillator.start(ctx.currentTime + note.startAt);
    oscillator.stop(ctx.currentTime + note.startAt + note.duration);
  }
}

export function playRunStart(): void {
  playSequence([
    { duration: 0.08, frequency: 392, gain: 0.25, startAt: 0, type: "sine" },
    { duration: 0.1, frequency: 523, gain: 0.2, startAt: 0.07, type: "sine" },
  ]);
}

export function playRunClear(): void {
  playSequence([
    { duration: 0.15, frequency: 523, gain: 0.3, startAt: 0, type: "sine" },
    { duration: 0.15, frequency: 659, gain: 0.3, startAt: 0.13, type: "sine" },
    { duration: 0.28, frequency: 784, gain: 0.3, startAt: 0.26, type: "sine" },
  ]);
}

export function playRunFail(): void {
  playTone(280, "sawtooth", 0.28, 0.2, 160);
}

export function playTapCorrect(): void {
  playTone(660, "sine", 0.09, 0.2);
}

export function playTapWrong(): void {
  playTone(220, "square", 0.09, 0.15);
}

export function playCardFlip(): void {
  playTone(440, "triangle", 0.06, 0.15);
}

export function playCardMatch(): void {
  playSequence([
    { duration: 0.1, frequency: 523, gain: 0.25, startAt: 0, type: "sine" },
    { duration: 0.15, frequency: 784, gain: 0.25, startAt: 0.09, type: "sine" },
  ]);
}

export function playCardMismatch(): void {
  playTone(260, "square", 0.14, 0.14, 220);
}

export function playCellReveal(): void {
  playTone(600, "triangle", 0.06, 0.12);
}

export function playMineExplode(): void {
  playTone(90, "sawtooth", 0.35, 0.35, 55);
}

export function playFlagOn(): void {
  playTone(480, "triangle", 0.07, 0.15);
}

export function playFlagOff(): void {
  playTone(330, "triangle", 0.07, 0.12);
}

export function playHintUse(): void {
  playTone(880, "sine", 0.18, 0.2);
}

const PAD_NOTES: Record<string, number> = {
  amber: 523,
  coral: 587,
  indigo: 1175,
  mint: 659,
  plum: 784,
  rose: 1047,
  sky: 698,
  slate: 880,
  teal: 988,
};

export function playPadFlash(padColor: string): void {
  const frequency = PAD_NOTES[padColor] ?? 523;

  playTone(frequency, "sine", 0.2, 0.3);
}

export function playBallDrop(): void {
  playTone(380, "triangle", 0.1, 0.2, 280);
}

type SineToneSpec = {
  duration: number;
  gain?: number;
  pitch: MusicalPitch;
  startAt?: number;
};

export function playSineNote(spec: SineToneSpec): void {
  playTone(resolvePitchFrequency(spec.pitch), "sine", spec.duration, spec.gain ?? 0.24);
}

export function playSineSequence(notes: SineToneSpec[]): void {
  playSequence(
    notes.map((note) => ({
      duration: note.duration,
      frequency: resolvePitchFrequency(note.pitch),
      gain: note.gain ?? 0.24,
      startAt: note.startAt ?? 0,
      type: "sine" as const,
    })),
  );
}
