import { useEffect, useMemo, useRef, useState } from "react";

import { toMidiNoteNumber, transposeMidiNoteNumber } from "../../infrastructure/browser/note-frequencies";
import { playSineNote, playSineSequence } from "../../infrastructure/browser/sound-effects";
import { clearBrowserInterval, clearBrowserTimeout, startBrowserInterval, startBrowserTimeout, type BrowserTimeoutHandle } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type AudioPhase = "intro" | "choice";

type Candidate = {
  id: string;
  semitoneOffset: number;
};

type Round = {
  anchorNote: string;
  baseNote: string;
  candidates: Candidate[];
  id: string;
  intervalSemitoneOffset: number;
};

type DifficultyConfig = {
  rounds: Round[];
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    rounds: [
      {
        anchorNote: "C4",
        baseNote: "A3",
        candidates: [
          { id: "A", semitoneOffset: 4 },
          { id: "B", semitoneOffset: 7 },
          { id: "C", semitoneOffset: 9 },
        ],
        id: "perfect-fifth",
        intervalSemitoneOffset: 7,
      },
      {
        anchorNote: "D4",
        baseNote: "B3",
        candidates: [
          { id: "A", semitoneOffset: 3 },
          { id: "B", semitoneOffset: 4 },
          { id: "C", semitoneOffset: 6 },
        ],
        id: "major-third",
        intervalSemitoneOffset: 4,
      },
      {
        anchorNote: "E4",
        baseNote: "C#4",
        candidates: [
          { id: "A", semitoneOffset: 5 },
          { id: "B", semitoneOffset: 7 },
          { id: "C", semitoneOffset: 8 },
        ],
        id: "minor-sixth",
        intervalSemitoneOffset: 8,
      },
    ],
    timeLimitSeconds: 54,
  },
  NORMAL: {
    rounds: [
      {
        anchorNote: "C4",
        baseNote: "G#3",
        candidates: [
          { id: "A", semitoneOffset: 4 },
          { id: "B", semitoneOffset: 7 },
          { id: "C", semitoneOffset: 8 },
          { id: "D", semitoneOffset: 9 },
        ],
        id: "minor-sixth",
        intervalSemitoneOffset: 8,
      },
      {
        anchorNote: "D4",
        baseNote: "B3",
        candidates: [
          { id: "A", semitoneOffset: 2 },
          { id: "B", semitoneOffset: 4 },
          { id: "C", semitoneOffset: 5 },
          { id: "D", semitoneOffset: 7 },
        ],
        id: "perfect-fourth",
        intervalSemitoneOffset: 5,
      },
      {
        anchorNote: "F4",
        baseNote: "C4",
        candidates: [
          { id: "A", semitoneOffset: 1 },
          { id: "B", semitoneOffset: 3 },
          { id: "C", semitoneOffset: 4 },
          { id: "D", semitoneOffset: 6 },
        ],
        id: "minor-third",
        intervalSemitoneOffset: 3,
      },
      {
        anchorNote: "G4",
        baseNote: "D4",
        candidates: [
          { id: "A", semitoneOffset: 5 },
          { id: "B", semitoneOffset: 7 },
          { id: "C", semitoneOffset: 9 },
          { id: "D", semitoneOffset: 10 },
        ],
        id: "major-sixth",
        intervalSemitoneOffset: 9,
      },
    ],
    timeLimitSeconds: 68,
  },
  HARD: {
    rounds: [
      {
        anchorNote: "C4",
        baseNote: "F3",
        candidates: [
          { id: "A", semitoneOffset: 1 },
          { id: "B", semitoneOffset: 2 },
          { id: "C", semitoneOffset: 3 },
          { id: "D", semitoneOffset: 5 },
        ],
        id: "whole-step",
        intervalSemitoneOffset: 2,
      },
      {
        anchorNote: "E4",
        baseNote: "A3",
        candidates: [
          { id: "A", semitoneOffset: 5 },
          { id: "B", semitoneOffset: 6 },
          { id: "C", semitoneOffset: 7 },
          { id: "D", semitoneOffset: 8 },
        ],
        id: "tritone",
        intervalSemitoneOffset: 6,
      },
      {
        anchorNote: "F4",
        baseNote: "Bb3",
        candidates: [
          { id: "A", semitoneOffset: 7 },
          { id: "B", semitoneOffset: 8 },
          { id: "C", semitoneOffset: 9 },
          { id: "D", semitoneOffset: 10 },
        ],
        id: "major-sixth",
        intervalSemitoneOffset: 9,
      },
      {
        anchorNote: "G4",
        baseNote: "C4",
        candidates: [
          { id: "A", semitoneOffset: 3 },
          { id: "B", semitoneOffset: 4 },
          { id: "C", semitoneOffset: 5 },
          { id: "D", semitoneOffset: 6 },
        ],
        id: "perfect-fourth",
        intervalSemitoneOffset: 5,
      },
      {
        anchorNote: "A4",
        baseNote: "D4",
        candidates: [
          { id: "A", semitoneOffset: 4 },
          { id: "B", semitoneOffset: 6 },
          { id: "C", semitoneOffset: 7 },
          { id: "D", semitoneOffset: 8 },
        ],
        id: "perfect-fifth",
        intervalSemitoneOffset: 7,
      },
    ],
    timeLimitSeconds: 82,
  },
  EXPERT: {
    rounds: [
      {
        anchorNote: "C4",
        baseNote: "F3",
        candidates: [
          { id: "A", semitoneOffset: 1 },
          { id: "B", semitoneOffset: 2 },
          { id: "C", semitoneOffset: 3 },
          { id: "D", semitoneOffset: 4 },
        ],
        id: "minor-second",
        intervalSemitoneOffset: 1,
      },
      {
        anchorNote: "D4",
        baseNote: "G3",
        candidates: [
          { id: "A", semitoneOffset: 5 },
          { id: "B", semitoneOffset: 6 },
          { id: "C", semitoneOffset: 7 },
          { id: "D", semitoneOffset: 8 },
        ],
        id: "tritone",
        intervalSemitoneOffset: 6,
      },
      {
        anchorNote: "E4",
        baseNote: "Bb3",
        candidates: [
          { id: "A", semitoneOffset: 7 },
          { id: "B", semitoneOffset: 8 },
          { id: "C", semitoneOffset: 9 },
          { id: "D", semitoneOffset: 10 },
        ],
        id: "minor-sixth",
        intervalSemitoneOffset: 8,
      },
      {
        anchorNote: "F4",
        baseNote: "B3",
        candidates: [
          { id: "A", semitoneOffset: 4 },
          { id: "B", semitoneOffset: 5 },
          { id: "C", semitoneOffset: 6 },
          { id: "D", semitoneOffset: 7 },
        ],
        id: "perfect-fourth",
        intervalSemitoneOffset: 5,
      },
      {
        anchorNote: "G4",
        baseNote: "C4",
        candidates: [
          { id: "A", semitoneOffset: 2 },
          { id: "B", semitoneOffset: 3 },
          { id: "C", semitoneOffset: 4 },
          { id: "D", semitoneOffset: 5 },
        ],
        id: "major-third",
        intervalSemitoneOffset: 4,
      },
      {
        anchorNote: "A4",
        baseNote: "D4",
        candidates: [
          { id: "A", semitoneOffset: 8 },
          { id: "B", semitoneOffset: 9 },
          { id: "C", semitoneOffset: 10 },
          { id: "D", semitoneOffset: 11 },
        ],
        id: "major-sixth",
        intervalSemitoneOffset: 9,
      },
    ],
    timeLimitSeconds: 96,
  },
};

function frequencyFromSemitone(baseFrequency: number, semitoneOffset: number) {
  return baseFrequency * 2 ** (semitoneOffset / 12);
}

function buildTransposedPitch(note: string, semitoneOffset: number) {
  return { midi: transposeMidiNoteNumber(toMidiNoteNumber(note), semitoneOffset) } as const;
}

export function useRelativePitchSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [audioPhase, setAudioPhase] = useState<AudioPhase>("intro");
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [replayCount, setReplayCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [wrongPickCount, setWrongPickCount] = useState(0);
  const introPhaseTimeoutRef = useRef<BrowserTimeoutHandle>(null);
  const introBaseTimeoutRef = useRef<BrowserTimeoutHandle>(null);

  const currentRound = config.rounds[currentRoundIndex] ?? config.rounds[0];
  const correctCandidateId = currentRound.candidates.find((candidate) => candidate.semitoneOffset === currentRound.intervalSemitoneOffset)?.id ?? currentRound.candidates[0]?.id ?? "A";

  useEffect(() => {
    return () => {
      clearBrowserTimeout(introPhaseTimeoutRef.current);
      clearBrowserTimeout(introBaseTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    clearBrowserTimeout(introPhaseTimeoutRef.current);
    clearBrowserTimeout(introBaseTimeoutRef.current);
    setAudioPhase("intro");
    setCurrentRoundIndex(0);
    setElapsedSeconds(0);
    setReplayCount(0);
    setState("idle");
    setWrongPickCount(0);
  }, [config]);

  useEffect(() => {
    if (state !== "playing") {
      return undefined;
    }

    const interval = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          setState((currentState) => (currentState === "playing" ? "failed" : currentState));
        }

        return next;
      });
    }, 1000);

    return () => clearBrowserInterval(interval);
  }, [config.timeLimitSeconds, state]);

  function playRoundIntro(round: Round) {
    clearBrowserTimeout(introPhaseTimeoutRef.current);
    clearBrowserTimeout(introBaseTimeoutRef.current);
    setAudioPhase("intro");
    playSineSequence([
      { duration: 0.24, gain: 0.24, pitch: { note: round.anchorNote }, startAt: 0 },
      { duration: 0.28, gain: 0.28, pitch: buildTransposedPitch(round.anchorNote, round.intervalSemitoneOffset), startAt: 0.42 },
    ]);
    introBaseTimeoutRef.current = startBrowserTimeout(() => {
      playSineNote({ duration: 0.22, gain: 0.24, pitch: { note: round.baseNote } });
    }, 820);
    introPhaseTimeoutRef.current = startBrowserTimeout(() => {
      setAudioPhase("choice");
    }, 1320);
  }

  function beginRun() {
    setCurrentRoundIndex(0);
    setElapsedSeconds(0);
    setReplayCount(0);
    setState("playing");
    setWrongPickCount(0);
    playRoundIntro(config.rounds[0]);
  }

  function replayReference() {
    if (state !== "playing") {
      return "ignored" as const;
    }

    setReplayCount((current) => current + 1);
    playSineSequence([
      { duration: 0.24, gain: 0.24, pitch: { note: currentRound.anchorNote }, startAt: 0 },
      { duration: 0.28, gain: 0.28, pitch: buildTransposedPitch(currentRound.anchorNote, currentRound.intervalSemitoneOffset), startAt: 0.42 },
    ]);
    return "replayed" as const;
  }

  function replayBase() {
    if (state !== "playing") {
      return "ignored" as const;
    }

    setReplayCount((current) => current + 1);
    playSineNote({ duration: 0.22, gain: 0.24, pitch: { note: currentRound.baseNote } });
    return "replayed" as const;
  }

  function chooseCandidate(candidateId: string) {
    if (state !== "playing" || audioPhase !== "choice") {
      return "ignored" as const;
    }

    const candidate = currentRound.candidates.find((entry) => entry.id === candidateId);

    if (!candidate) {
      return "ignored" as const;
    }

    playSineSequence([
      { duration: 0.22, gain: 0.24, pitch: { note: currentRound.baseNote }, startAt: 0 },
      { duration: 0.28, gain: 0.28, pitch: buildTransposedPitch(currentRound.baseNote, candidate.semitoneOffset), startAt: 0.36 },
    ]);

    if (candidateId !== correctCandidateId) {
      setWrongPickCount((current) => current + 1);
      return "wrong" as const;
    }

    if (currentRoundIndex >= config.rounds.length - 1) {
      setState("cleared");
      return "cleared" as const;
    }

    const nextRoundIndex = currentRoundIndex + 1;

    setCurrentRoundIndex(nextRoundIndex);
    playRoundIntro(config.rounds[nextRoundIndex]);
    return "advanced" as const;
  }

  return {
    audioPhase,
    beginRun,
    chooseCandidate,
    correctCandidateId,
    currentRound,
    currentRoundIndex,
    elapsedSeconds,
    replayBase,
    replayCount,
    replayReference,
    roundsSolvedCount: state === "cleared" ? config.rounds.length : currentRoundIndex,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    totalRoundCount: config.rounds.length,
    wrongPickCount,
  };
}
