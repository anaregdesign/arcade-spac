import { describe, expect, it } from "vitest";

import {
  midiNoteNumberToFrequency,
  resolvePitchFrequency,
  toMidiNoteNumber,
  transposeMidiNoteNumber,
} from "./note-frequencies";

describe("note-frequencies", () => {
  it("parses chromatic note names into midi note numbers", () => {
    expect(toMidiNoteNumber("C4")).toBe(60);
    expect(toMidiNoteNumber("A4")).toBe(69);
    expect(toMidiNoteNumber("G#3")).toBe(56);
    expect(toMidiNoteNumber("Bb3")).toBe(58);
  });

  it("converts midi note numbers into equal temperament frequencies", () => {
    expect(midiNoteNumberToFrequency(69)).toBeCloseTo(440, 5);
    expect(midiNoteNumberToFrequency(60)).toBeCloseTo(261.625565, 5);
  });

  it("resolves note, midi, and direct frequency pitches", () => {
    expect(resolvePitchFrequency({ note: "C4" })).toBeCloseTo(261.625565, 5);
    expect(resolvePitchFrequency({ midi: transposeMidiNoteNumber(60, 7) })).toBeCloseTo(391.995436, 5);
    expect(resolvePitchFrequency({ frequency: 330 })).toBe(330);
  });
});
