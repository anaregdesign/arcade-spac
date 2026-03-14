import { useEffect, useMemo, useRef, useState } from "react";

import {
  cancelBrowserAnimationFrame,
  requestBrowserAnimationFrame,
  type BrowserAnimationFrameHandle,
} from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type PulseWindow = "good" | "miss" | "perfect";
type SyncResult = PulseWindow | "ignored";

type DifficultyConfig = {
  amplitudePx: number;
  baseRadiusPx: number;
  goodGapPx: number;
  perfectGapPx: number;
  pulseAPeriodRangeMs: [number, number];
  pulseBPeriodRangeMs: [number, number];
  timeLimitSeconds: number;
  waveGoal: number;
};

type WaveDefinition = {
  pulseAPhaseRad: number;
  pulseAPeriodMs: number;
  pulseBPhaseRad: number;
  pulseBPeriodMs: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    amplitudePx: 38,
    baseRadiusPx: 82,
    goodGapPx: 18,
    perfectGapPx: 9,
    pulseAPeriodRangeMs: [860, 1080],
    pulseBPeriodRangeMs: [980, 1280],
    timeLimitSeconds: 40,
    waveGoal: 4,
  },
  NORMAL: {
    amplitudePx: 44,
    baseRadiusPx: 88,
    goodGapPx: 16,
    perfectGapPx: 8,
    pulseAPeriodRangeMs: [780, 1020],
    pulseBPeriodRangeMs: [920, 1220],
    timeLimitSeconds: 48,
    waveGoal: 5,
  },
  HARD: {
    amplitudePx: 50,
    baseRadiusPx: 94,
    goodGapPx: 14,
    perfectGapPx: 7,
    pulseAPeriodRangeMs: [700, 960],
    pulseBPeriodRangeMs: [860, 1120],
    timeLimitSeconds: 60,
    waveGoal: 6,
  },
  EXPERT: {
    amplitudePx: 56,
    baseRadiusPx: 100,
    goodGapPx: 12,
    perfectGapPx: 6,
    pulseAPeriodRangeMs: [620, 900],
    pulseBPeriodRangeMs: [780, 1040],
    timeLimitSeconds: 74,
    waveGoal: 7,
  },
};

function randomIntInRange(minInclusive: number, maxInclusive: number) {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function getPulseWindow(gapPx: number, perfectGapPx: number, goodGapPx: number): PulseWindow {
  if (gapPx <= perfectGapPx) {
    return "perfect";
  }

  if (gapPx <= goodGapPx) {
    return "good";
  }

  return "miss";
}

function buildWaveDefinition(config: DifficultyConfig, index: number, preview = false): WaveDefinition {
  if (preview) {
    return {
      pulseAPhaseRad: 0.45 + index * 0.24,
      pulseAPeriodMs: config.pulseAPeriodRangeMs[0] + 90,
      pulseBPhaseRad: 1.7 + index * 0.18,
      pulseBPeriodMs: config.pulseBPeriodRangeMs[1] - 80,
    };
  }

  const pulseAPeriodMs = randomIntInRange(config.pulseAPeriodRangeMs[0], config.pulseAPeriodRangeMs[1]);
  let pulseBPeriodMs = randomIntInRange(config.pulseBPeriodRangeMs[0], config.pulseBPeriodRangeMs[1]);

  while (Math.abs(pulseAPeriodMs - pulseBPeriodMs) < 120) {
    pulseBPeriodMs = randomIntInRange(config.pulseBPeriodRangeMs[0], config.pulseBPeriodRangeMs[1]);
  }

  return {
    pulseAPhaseRad: Math.random() * Math.PI * 2,
    pulseAPeriodMs,
    pulseBPhaseRad: Math.random() * Math.PI * 2,
    pulseBPeriodMs,
  };
}

function computePulseRadii(config: DifficultyConfig, wave: WaveDefinition, elapsedMs: number) {
  const pulseAPhase = (elapsedMs / wave.pulseAPeriodMs) * Math.PI * 2 + wave.pulseAPhaseRad;
  const pulseBPhase = (elapsedMs / wave.pulseBPeriodMs) * Math.PI * 2 + wave.pulseBPhaseRad;
  const pulseARadiusPx = config.baseRadiusPx + config.amplitudePx * (Math.sin(pulseAPhase) + 0.18 * Math.sin(pulseAPhase * 2.1));
  const pulseBRadiusPx = config.baseRadiusPx + config.amplitudePx * (Math.sin(pulseBPhase) + 0.14 * Math.cos(pulseBPhase * 1.7));

  return {
    gapPx: Math.abs(pulseARadiusPx - pulseBRadiusPx),
    pulseARadiusPx,
    pulseBRadiusPx,
  };
}

export function useSyncPulseSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewWave = useMemo(() => buildWaveDefinition(config, 0, true), [config]);
  const previewFrame = useMemo(() => computePulseRadii(config, previewWave, 0), [config, previewWave]);
  const previewWindow = useMemo(
    () => getPulseWindow(previewFrame.gapPx, config.perfectGapPx, config.goodGapPx),
    [config.goodGapPx, config.perfectGapPx, previewFrame.gapPx],
  );
  const [clearedWaveCount, setClearedWaveCount] = useState(0);
  const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
  const [currentWindow, setCurrentWindow] = useState<PulseWindow>(previewWindow);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [gapPx, setGapPx] = useState(previewFrame.gapPx);
  const [goodHitCount, setGoodHitCount] = useState(0);
  const [lastJudgment, setLastJudgment] = useState<PulseWindow | null>(null);
  const [missCount, setMissCount] = useState(0);
  const [perfectHitCount, setPerfectHitCount] = useState(0);
  const [pulseARadiusPx, setPulseARadiusPx] = useState(previewFrame.pulseARadiusPx);
  const [pulseBRadiusPx, setPulseBRadiusPx] = useState(previewFrame.pulseBRadiusPx);
  const [state, setState] = useState<SessionState>("idle");

  const animationFrameRef = useRef<BrowserAnimationFrameHandle>(null);
  const clearedWaveCountRef = useRef(0);
  const currentWindowRef = useRef<PulseWindow>(previewWindow);
  const lastTapAtRef = useRef(0);
  const missCountRef = useRef(0);
  const perfectHitCountRef = useRef(0);
  const goodHitCountRef = useRef(0);
  const runStartTimeRef = useRef<number | null>(null);
  const waveDefinitionRef = useRef(previewWave);
  const waveStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      cancelBrowserAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    cancelBrowserAnimationFrame(animationFrameRef.current);
    clearedWaveCountRef.current = 0;
    currentWindowRef.current = previewWindow;
    lastTapAtRef.current = 0;
    missCountRef.current = 0;
    perfectHitCountRef.current = 0;
    goodHitCountRef.current = 0;
    runStartTimeRef.current = null;
    waveDefinitionRef.current = previewWave;
    waveStartTimeRef.current = null;

    setClearedWaveCount(0);
    setCurrentWaveIndex(0);
    setCurrentWindow(previewWindow);
    setElapsedSeconds(0);
    setGapPx(previewFrame.gapPx);
    setGoodHitCount(0);
    setLastJudgment(null);
    setMissCount(0);
    setPerfectHitCount(0);
    setPulseARadiusPx(previewFrame.pulseARadiusPx);
    setPulseBRadiusPx(previewFrame.pulseBRadiusPx);
    setState("idle");
  }, [config, previewFrame.gapPx, previewFrame.pulseARadiusPx, previewFrame.pulseBRadiusPx, previewWave, previewWindow]);

  useEffect(() => {
    if (state !== "playing") {
      cancelBrowserAnimationFrame(animationFrameRef.current);
      return;
    }

    const loop = (timestamp: number) => {
      if (runStartTimeRef.current === null) {
        runStartTimeRef.current = timestamp;
      }

      if (waveStartTimeRef.current === null) {
        waveStartTimeRef.current = timestamp;
      }

      const runElapsedMs = timestamp - runStartTimeRef.current;
      const waveElapsedMs = timestamp - waveStartTimeRef.current;
      const elapsed = Math.min(config.timeLimitSeconds, Math.floor(runElapsedMs / 1000));
      const nextFrame = computePulseRadii(config, waveDefinitionRef.current, waveElapsedMs);
      const nextWindow = getPulseWindow(nextFrame.gapPx, config.perfectGapPx, config.goodGapPx);

      currentWindowRef.current = nextWindow;
      setCurrentWindow(nextWindow);
      setElapsedSeconds((current) => (current === elapsed ? current : elapsed));
      setGapPx(nextFrame.gapPx);
      setPulseARadiusPx(nextFrame.pulseARadiusPx);
      setPulseBRadiusPx(nextFrame.pulseBRadiusPx);

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
    const firstWave = buildWaveDefinition(config, 0);
    const firstFrame = computePulseRadii(config, firstWave, 0);
    const firstWindow = getPulseWindow(firstFrame.gapPx, config.perfectGapPx, config.goodGapPx);

    cancelBrowserAnimationFrame(animationFrameRef.current);
    clearedWaveCountRef.current = 0;
    currentWindowRef.current = firstWindow;
    lastTapAtRef.current = 0;
    missCountRef.current = 0;
    perfectHitCountRef.current = 0;
    goodHitCountRef.current = 0;
    runStartTimeRef.current = null;
    waveDefinitionRef.current = firstWave;
    waveStartTimeRef.current = null;

    setClearedWaveCount(0);
    setCurrentWaveIndex(0);
    setCurrentWindow(firstWindow);
    setElapsedSeconds(0);
    setGapPx(firstFrame.gapPx);
    setGoodHitCount(0);
    setLastJudgment(null);
    setMissCount(0);
    setPerfectHitCount(0);
    setPulseARadiusPx(firstFrame.pulseARadiusPx);
    setPulseBRadiusPx(firstFrame.pulseBRadiusPx);
    setState("playing");
  }

  function syncPulse(): SyncResult {
    if (state !== "playing") {
      return "ignored";
    }

    const now = Date.now();

    if (now - lastTapAtRef.current < 120) {
      return "ignored";
    }

    lastTapAtRef.current = now;
    const result = currentWindowRef.current;

    setLastJudgment(result);

    if (result === "miss") {
      const nextMissCount = missCountRef.current + 1;

      missCountRef.current = nextMissCount;
      setMissCount(nextMissCount);
      return "miss";
    }

    const nextClearedWaveCount = clearedWaveCountRef.current + 1;

    clearedWaveCountRef.current = nextClearedWaveCount;
    setClearedWaveCount(nextClearedWaveCount);

    if (result === "perfect") {
      const nextPerfectHitCount = perfectHitCountRef.current + 1;

      perfectHitCountRef.current = nextPerfectHitCount;
      setPerfectHitCount(nextPerfectHitCount);
    } else {
      const nextGoodHitCount = goodHitCountRef.current + 1;

      goodHitCountRef.current = nextGoodHitCount;
      setGoodHitCount(nextGoodHitCount);
    }

    if (nextClearedWaveCount >= config.waveGoal) {
      setCurrentWaveIndex(config.waveGoal);
      setState("cleared");
      return result;
    }

    const nextWave = buildWaveDefinition(config, nextClearedWaveCount);
    const nextFrame = computePulseRadii(config, nextWave, 0);
    const nextWindow = getPulseWindow(nextFrame.gapPx, config.perfectGapPx, config.goodGapPx);

    currentWindowRef.current = nextWindow;
    waveDefinitionRef.current = nextWave;
    waveStartTimeRef.current = null;

    setCurrentWaveIndex(nextClearedWaveCount);
    setCurrentWindow(nextWindow);
    setGapPx(nextFrame.gapPx);
    setPulseARadiusPx(nextFrame.pulseARadiusPx);
    setPulseBRadiusPx(nextFrame.pulseBRadiusPx);

    return result;
  }

  return {
    beginRun,
    clearedWaveCount,
    currentWaveIndex,
    currentWindow,
    elapsedSeconds,
    gapPx,
    goodHitCount,
    lastJudgment,
    missCount,
    perfectHitCount,
    pulseARadiusPx,
    pulseBRadiusPx,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    syncPulse,
    waveGoal: config.waveGoal,
  };
}
