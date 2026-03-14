import { useEffect, useMemo, useRef, useState } from "react";

import {
  cancelBrowserAnimationFrame,
  requestBrowserAnimationFrame,
  type BrowserAnimationFrameHandle,
} from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type BeatWindow = "good" | "miss" | "perfect";
type TapResult = BeatWindow | "ignored";

type DifficultyConfig = {
  goodWindowMs: number;
  hitGoal: number;
  intervalRangeMs: [number, number];
  laneCount: number;
  leadInMs: number;
  perfectWindowMs: number;
  streamLength: number;
  timeLimitSeconds: number;
};

type BeatNote = {
  id: string;
  laneIndex: number;
  timeMs: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { goodWindowMs: 120, hitGoal: 8, intervalRangeMs: [560, 720], laneCount: 3, leadInMs: 920, perfectWindowMs: 60, streamLength: 14, timeLimitSeconds: 40 },
  NORMAL: { goodWindowMs: 110, hitGoal: 10, intervalRangeMs: [520, 680], laneCount: 3, leadInMs: 900, perfectWindowMs: 54, streamLength: 18, timeLimitSeconds: 48 },
  HARD: { goodWindowMs: 96, hitGoal: 12, intervalRangeMs: [480, 640], laneCount: 3, leadInMs: 860, perfectWindowMs: 48, streamLength: 22, timeLimitSeconds: 60 },
  EXPERT: { goodWindowMs: 84, hitGoal: 14, intervalRangeMs: [440, 600], laneCount: 3, leadInMs: 820, perfectWindowMs: 42, streamLength: 26, timeLimitSeconds: 74 },
};

function randomIntInRange(minInclusive: number, maxInclusive: number) {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function getBeatWindow(offsetMs: number, perfectWindowMs: number, goodWindowMs: number): BeatWindow {
  const absoluteOffsetMs = Math.abs(offsetMs);

  if (absoluteOffsetMs <= perfectWindowMs) {
    return "perfect";
  }

  if (absoluteOffsetMs <= goodWindowMs) {
    return "good";
  }

  return "miss";
}

function buildNoteSchedule(config: DifficultyConfig, preview = false): BeatNote[] {
  let timeMs = config.leadInMs;
  let previousLaneIndex = preview ? 2 : -1;

  return Array.from({ length: config.streamLength }, (_, index) => {
    if (preview) {
      previousLaneIndex = [0, 1, 2, 1][index % 4] ?? 1;
      timeMs += 620;
    } else {
      timeMs += randomIntInRange(config.intervalRangeMs[0], config.intervalRangeMs[1]);
      let nextLaneIndex = previousLaneIndex;

      while (nextLaneIndex === previousLaneIndex) {
        nextLaneIndex = randomIntInRange(0, config.laneCount - 1);
      }

      previousLaneIndex = nextLaneIndex;
    }

    return {
      id: `beat-note-${index}`,
      laneIndex: previousLaneIndex,
      timeMs,
    };
  });
}

export function useBeatMatchSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewNotes = useMemo(() => buildNoteSchedule(config, true), [config]);
  const [comboCount, setComboCount] = useState(0);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [currentOffsetMs, setCurrentOffsetMs] = useState(-config.leadInMs);
  const [currentWindow, setCurrentWindow] = useState<BeatWindow>("miss");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [lastJudgment, setLastJudgment] = useState<BeatWindow | null>(null);
  const [maxComboCount, setMaxComboCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [notes, setNotes] = useState<BeatNote[]>(previewNotes);
  const [perfectHitCount, setPerfectHitCount] = useState(0);
  const [state, setState] = useState<SessionState>("idle");

  const animationFrameRef = useRef<BrowserAnimationFrameHandle>(null);
  const comboCountRef = useRef(0);
  const currentNoteIndexRef = useRef(0);
  const hitCountRef = useRef(0);
  const maxComboCountRef = useRef(0);
  const missCountRef = useRef(0);
  const notesRef = useRef<BeatNote[]>(previewNotes);
  const perfectHitCountRef = useRef(0);
  const runStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      cancelBrowserAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    cancelBrowserAnimationFrame(animationFrameRef.current);
    comboCountRef.current = 0;
    currentNoteIndexRef.current = 0;
    hitCountRef.current = 0;
    maxComboCountRef.current = 0;
    missCountRef.current = 0;
    notesRef.current = previewNotes;
    perfectHitCountRef.current = 0;
    runStartTimeRef.current = null;

    setComboCount(0);
    setCurrentNoteIndex(0);
    setCurrentOffsetMs(-(previewNotes[0]?.timeMs ?? config.leadInMs));
    setCurrentWindow("miss");
    setElapsedSeconds(0);
    setHitCount(0);
    setLastJudgment(null);
    setMaxComboCount(0);
    setMissCount(0);
    setNotes(previewNotes);
    setPerfectHitCount(0);
    setState("idle");
  }, [config, previewNotes]);

  function advanceMiss() {
    const nextMissCount = missCountRef.current + 1;
    const nextNoteIndex = currentNoteIndexRef.current + 1;

    comboCountRef.current = 0;
    currentNoteIndexRef.current = nextNoteIndex;
    missCountRef.current = nextMissCount;
    setComboCount(0);
    setCurrentNoteIndex(nextNoteIndex);
    setLastJudgment("miss");
    setMissCount(nextMissCount);

    if (nextNoteIndex >= notesRef.current.length) {
      setState((current) => (current === "playing" ? "failed" : current));
    }
  }

  function advanceHit(result: "good" | "perfect") {
    const nextHitCount = hitCountRef.current + 1;
    const nextComboCount = comboCountRef.current + 1;
    const nextMaxComboCount = Math.max(maxComboCountRef.current, nextComboCount);
    const nextNoteIndex = currentNoteIndexRef.current + 1;

    comboCountRef.current = nextComboCount;
    currentNoteIndexRef.current = nextNoteIndex;
    hitCountRef.current = nextHitCount;
    maxComboCountRef.current = nextMaxComboCount;

    setComboCount(nextComboCount);
    setCurrentNoteIndex(nextNoteIndex);
    setHitCount(nextHitCount);
    setLastJudgment(result);
    setMaxComboCount(nextMaxComboCount);

    if (result === "perfect") {
      const nextPerfectHitCount = perfectHitCountRef.current + 1;

      perfectHitCountRef.current = nextPerfectHitCount;
      setPerfectHitCount(nextPerfectHitCount);
    }

    if (nextHitCount >= config.hitGoal) {
      setState("cleared");
      return;
    }

    if (nextNoteIndex >= notesRef.current.length) {
      setState((current) => (current === "playing" ? "failed" : current));
    }
  }

  useEffect(() => {
    if (state !== "playing") {
      cancelBrowserAnimationFrame(animationFrameRef.current);
      return;
    }

    const loop = (timestamp: number) => {
      if (runStartTimeRef.current === null) {
        runStartTimeRef.current = timestamp;
      }

      const runElapsedMs = timestamp - runStartTimeRef.current;
      const elapsed = Math.min(config.timeLimitSeconds, Math.floor(runElapsedMs / 1000));

      setElapsedSeconds((current) => (current === elapsed ? current : elapsed));

      let currentNote = notesRef.current[currentNoteIndexRef.current] ?? null;

      while (currentNote && runElapsedMs > currentNote.timeMs + config.goodWindowMs) {
        advanceMiss();
        currentNote = notesRef.current[currentNoteIndexRef.current] ?? null;
      }

      if (!currentNote) {
        return;
      }

      const nextOffsetMs = runElapsedMs - currentNote.timeMs;
      const nextWindow = getBeatWindow(nextOffsetMs, config.perfectWindowMs, config.goodWindowMs);

      setCurrentOffsetMs(nextOffsetMs);
      setCurrentWindow(nextWindow);

      if (runElapsedMs >= config.timeLimitSeconds * 1000) {
        setElapsedSeconds(config.timeLimitSeconds);
        setState((current) => (current === "playing" ? "failed" : current));
        return;
      }

      animationFrameRef.current = requestBrowserAnimationFrame(loop);
    };

    animationFrameRef.current = requestBrowserAnimationFrame(loop);

    return () => cancelBrowserAnimationFrame(animationFrameRef.current);
  }, [config, state]);

  function beginRun() {
    const liveNotes = buildNoteSchedule(config);

    cancelBrowserAnimationFrame(animationFrameRef.current);
    comboCountRef.current = 0;
    currentNoteIndexRef.current = 0;
    hitCountRef.current = 0;
    maxComboCountRef.current = 0;
    missCountRef.current = 0;
    notesRef.current = liveNotes;
    perfectHitCountRef.current = 0;
    runStartTimeRef.current = null;

    setComboCount(0);
    setCurrentNoteIndex(0);
    setCurrentOffsetMs(-(liveNotes[0]?.timeMs ?? config.leadInMs));
    setCurrentWindow("miss");
    setElapsedSeconds(0);
    setHitCount(0);
    setLastJudgment(null);
    setMaxComboCount(0);
    setMissCount(0);
    setNotes(liveNotes);
    setPerfectHitCount(0);
    setState("playing");
  }

  function tapLane(laneIndex: number): TapResult {
    if (state !== "playing") {
      return "ignored";
    }

    const currentNote = notesRef.current[currentNoteIndexRef.current];

    if (!currentNote || runStartTimeRef.current === null) {
      return "ignored";
    }

    const runElapsedMs = performance.now() - runStartTimeRef.current;
    const offsetMs = runElapsedMs - currentNote.timeMs;
    const result = laneIndex === currentNote.laneIndex
      ? getBeatWindow(offsetMs, config.perfectWindowMs, config.goodWindowMs)
      : "miss";

    setCurrentOffsetMs(offsetMs);
    setCurrentWindow(result);

    if (result === "miss") {
      advanceMiss();
      return "miss";
    }

    advanceHit(result);
    return result;
  }

  const resolvedNoteCount = hitCount + missCount;
  const accuracyPercent = resolvedNoteCount === 0 ? 100 : Math.round((hitCount / resolvedNoteCount) * 100);
  const activeLaneIndex = notes[currentNoteIndex]?.laneIndex ?? null;
  const upcomingNotes = notes.slice(currentNoteIndex, currentNoteIndex + 4);
  const timingMarkerPercent = Math.max(0, Math.min(100, ((currentOffsetMs + config.leadInMs) / (config.leadInMs * 2)) * 100));

  return {
    accuracyPercent,
    activeLaneIndex,
    beginRun,
    comboCount,
    currentNoteIndex,
    currentOffsetMs,
    currentWindow,
    elapsedSeconds,
    hitCount,
    hitGoal: config.hitGoal,
    laneCount: config.laneCount,
    lastJudgment,
    leadInMs: config.leadInMs,
    maxComboCount,
    missCount,
    perfectHitCount,
    perfectWindowMs: config.perfectWindowMs,
    state,
    tapLane,
    timeLimitSeconds: config.timeLimitSeconds,
    timingMarkerPercent,
    upcomingNotes,
    goodWindowMs: config.goodWindowMs,
  };
}
