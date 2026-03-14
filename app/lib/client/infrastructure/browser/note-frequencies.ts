const semitoneOffsetByNoteName: Record<string, number> = {
  A: 9,
  "A#": 10,
  Ab: 8,
  B: 11,
  Bb: 10,
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  Db: 1,
  E: 4,
  Eb: 3,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  Gb: 6,
};

const notePattern = /^([A-Ga-g])([#b]?)(-?\d+)$/;

export type MusicalPitch = { frequency: number } | { midi: number } | { note: string };

export function toMidiNoteNumber(note: string) {
  const match = note.trim().match(notePattern);

  if (!match) {
    throw new Error(`Unsupported note format: ${note}`);
  }

  const [, letter, accidental, octavePart] = match;
  const normalizedName = `${letter.toUpperCase()}${accidental}`;
  const semitoneOffset = semitoneOffsetByNoteName[normalizedName];

  if (semitoneOffset === undefined) {
    throw new Error(`Unsupported note name: ${normalizedName}`);
  }

  const octave = Number(octavePart);

  if (!Number.isInteger(octave)) {
    throw new Error(`Unsupported octave: ${octavePart}`);
  }

  return (octave + 1) * 12 + semitoneOffset;
}

export function midiNoteNumberToFrequency(midi: number, tuningA4: number = 440) {
  return tuningA4 * 2 ** ((midi - 69) / 12);
}

export function transposeMidiNoteNumber(midi: number, semitoneOffset: number) {
  return midi + semitoneOffset;
}

export function resolvePitchFrequency(pitch: MusicalPitch) {
  if ("frequency" in pitch) {
    return pitch.frequency;
  }

  if ("midi" in pitch) {
    return midiNoteNumberToFrequency(pitch.midi);
  }

  return midiNoteNumberToFrequency(toMidiNoteNumber(pitch.note));
}
