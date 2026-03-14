import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { randomIntInRange, shuffleValues } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type ShapeKind = "diamond" | "hex" | "square" | "triangle";
type RuleKind = "cut" | "rotate" | "scale";

type Glyph = {
  color: string;
  notches: number;
  rotationQuarter: number;
  scaleStep: number;
  shape: ShapeKind;
};

type ShapeMorphPrompt = {
  choices: Glyph[];
  promptGlyphs: Glyph[];
  promptLabel: string;
  correctChoice: Glyph;
};

type DifficultyConfig = {
  maxNotches: number;
  problemCount: number;
  ruleSet: RuleKind[];
  timeLimitSeconds: number;
};

const palette = ["#38bdf8", "#14b8a6", "#f59e0b", "#fb7185"] as const;
const shapeKinds: ShapeKind[] = ["diamond", "hex", "square", "triangle"];

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { maxNotches: 3, problemCount: 4, ruleSet: ["rotate", "scale"], timeLimitSeconds: 34 },
  NORMAL: { maxNotches: 4, problemCount: 5, ruleSet: ["cut", "rotate", "scale"], timeLimitSeconds: 42 },
  HARD: { maxNotches: 4, problemCount: 6, ruleSet: ["cut", "rotate", "scale"], timeLimitSeconds: 52 },
  EXPERT: { maxNotches: 5, problemCount: 7, ruleSet: ["cut", "rotate", "scale"], timeLimitSeconds: 64 },
};

function cloneGlyph(glyph: Glyph): Glyph {
  return { ...glyph };
}

function normalizeRotation(rotationQuarter: number) {
  return ((rotationQuarter % 4) + 4) % 4;
}

function normalizeScale(scaleStep: number) {
  return ((scaleStep % 4) + 4) % 4;
}

function glyphKey(glyph: Glyph) {
  return [glyph.shape, glyph.color, glyph.rotationQuarter, glyph.scaleStep, glyph.notches].join(":");
}

function applyRule(glyph: Glyph, rule: RuleKind, config: DifficultyConfig): Glyph {
  if (rule === "rotate") {
    return {
      ...glyph,
      rotationQuarter: normalizeRotation(glyph.rotationQuarter + 1),
    };
  }

  if (rule === "scale") {
    return {
      ...glyph,
      scaleStep: normalizeScale(glyph.scaleStep + 1),
    };
  }

  return {
    ...glyph,
    notches: (glyph.notches + 1) % Math.max(2, config.maxNotches + 1),
  };
}

function buildBaseGlyph(config: DifficultyConfig): Glyph {
  return {
    color: palette[randomIntInRange(0, palette.length - 1)],
    notches: randomIntInRange(0, Math.max(1, config.maxNotches - 1)),
    rotationQuarter: randomIntInRange(0, 3),
    scaleStep: randomIntInRange(0, 3),
    shape: shuffleValues(shapeKinds)[0],
  };
}

function buildDistractors(correct: Glyph, rule: RuleKind, config: DifficultyConfig) {
  const candidates = new Map<string, Glyph>([[glyphKey(correct), correct]]);
  const distractorVariants: Glyph[] = rule === "rotate"
    ? [
        { ...correct, rotationQuarter: normalizeRotation(correct.rotationQuarter + 1) },
        { ...correct, rotationQuarter: normalizeRotation(correct.rotationQuarter + 2) },
        { ...correct, rotationQuarter: normalizeRotation(correct.rotationQuarter + 3) },
        { ...correct, scaleStep: normalizeScale(correct.scaleStep + 1) },
      ]
    : rule === "scale"
      ? [
          { ...correct, scaleStep: normalizeScale(correct.scaleStep + 1) },
          { ...correct, scaleStep: normalizeScale(correct.scaleStep + 2) },
          { ...correct, scaleStep: normalizeScale(correct.scaleStep + 3) },
          { ...correct, rotationQuarter: normalizeRotation(correct.rotationQuarter + 1) },
        ]
      : [
          { ...correct, notches: (correct.notches + 1) % Math.max(2, config.maxNotches + 1) },
          { ...correct, notches: (correct.notches + 2) % Math.max(2, config.maxNotches + 1) },
          { ...correct, notches: Math.max(0, correct.notches - 1) },
          { ...correct, rotationQuarter: normalizeRotation(correct.rotationQuarter + 1) },
        ];

  for (const glyph of distractorVariants) {
    candidates.set(glyphKey(glyph), glyph);

    if (candidates.size >= 4) {
      break;
    }
  }

  while (candidates.size < 4) {
    const fallback = buildBaseGlyph(config);
    candidates.set(glyphKey(fallback), fallback);
  }

  return shuffleValues([...candidates.values()]).slice(0, 4);
}

function buildPromptForRule(rule: RuleKind, config: DifficultyConfig, baseGlyph: Glyph): ShapeMorphPrompt {
  const promptGlyphs = [cloneGlyph(baseGlyph)];

  while (promptGlyphs.length < 3) {
    promptGlyphs.push(applyRule(promptGlyphs[promptGlyphs.length - 1], rule, config));
  }

  const correct = applyRule(promptGlyphs[promptGlyphs.length - 1], rule, config);
  const choices = buildDistractors(correct, rule, config);

  return {
    choices,
    correctChoice: correct,
    promptGlyphs,
    promptLabel: rule === "rotate" ? "Rotate forward" : rule === "scale" ? "Scale forward" : "Add one cut",
  };
}

function buildLivePrompt(config: DifficultyConfig) {
  const rule = shuffleValues(config.ruleSet)[0];
  const baseGlyph = buildBaseGlyph(config);
  return buildPromptForRule(rule, config, baseGlyph);
}

function buildPromptSet(config: DifficultyConfig) {
  return Array.from({ length: config.problemCount }, () => buildLivePrompt(config));
}

function createPreviewPrompt(config: DifficultyConfig): ShapeMorphPrompt {
  const previewPrompt = buildPromptForRule("rotate", config, {
    color: palette[0],
    notches: 1,
    rotationQuarter: 0,
    scaleStep: 1,
    shape: "triangle",
  });

  return {
    ...previewPrompt,
    choices: [...previewPrompt.choices].sort((left, right) => glyphKey(left).localeCompare(glyphKey(right))),
  };
}

export function useShapeMorphSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [problems, setProblems] = useState<ShapeMorphPrompt[]>(() => [createPreviewPrompt(config)]);
  const [state, setState] = useState<SessionState>("idle");
  const [wrongAnswerCount, setWrongAnswerCount] = useState(0);

  useEffect(() => {
    setCurrentProblemIndex(0);
    setElapsedSeconds(0);
    setProblems([createPreviewPrompt(config)]);
    setState("idle");
    setWrongAnswerCount(0);
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

  function beginRun() {
    setCurrentProblemIndex(0);
    setElapsedSeconds(0);
    setProblems(buildPromptSet(config));
    setState("playing");
    setWrongAnswerCount(0);
  }

  function answerProblem(choice: Glyph) {
    if (state !== "playing") {
      return "ignored" as const;
    }

    const currentProblem = problems[currentProblemIndex];

    if (!currentProblem) {
      return "ignored" as const;
    }

    const isCorrect = glyphKey(choice) === glyphKey(currentProblem.correctChoice);

    if (!isCorrect) {
      setWrongAnswerCount((current) => current + 1);
    }

    const nextProblemIndex = currentProblemIndex + 1;

    if (nextProblemIndex >= problems.length) {
      setState("cleared");
      return isCorrect ? "correct" as const : "wrong" as const;
    }

    setCurrentProblemIndex(nextProblemIndex);
    return isCorrect ? "correct" as const : "wrong" as const;
  }

  return {
    answerProblem,
    beginRun,
    currentProblem: problems[currentProblemIndex] ?? createPreviewPrompt(config),
    currentProblemIndex,
    elapsedSeconds,
    problemCount: config.problemCount,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    wrongAnswerCount,
  };
}

export type { Glyph };