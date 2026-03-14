import type { GameDifficulty } from "./use-game-workspace";

export type GameplayResultIntent = "completeClean" | "completePending" | "completeSteady" | "fail";

export type GameplayResultSubmission = {
  difficulty: GameDifficulty;
  hintCount?: number;
  intent: GameplayResultIntent;
  mistakeCount?: number;
  primaryMetric: number;
};

export function toGameplayResultFormEntries(input: GameplayResultSubmission): Array<[string, string]> {
  const entries: Array<[string, string]> = [
    ["intent", input.intent],
    ["difficulty", input.difficulty],
    ["primaryMetric", String(input.primaryMetric)],
  ];

  if (input.mistakeCount !== undefined) {
    entries.push(["mistakeCount", String(input.mistakeCount)]);
  }

  if (input.hintCount !== undefined) {
    entries.push(["hintCount", String(input.hintCount)]);
  }

  return entries;
}
