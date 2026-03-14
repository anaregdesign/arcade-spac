import type { GameDifficulty } from "./use-game-workspace";

export type GameplayResultIntent = "completeClean" | "completePending" | "completeSteady" | "fail";

export type GameplayResultSubmission = {
  difficulty: GameDifficulty;
  hintCount?: number;
  intent: GameplayResultIntent;
  mistakeCount?: number;
  primaryMetric: number;
};

export function createGameplayResultFormData(input: GameplayResultSubmission) {
  const formData = new FormData();

  formData.set("intent", input.intent);
  formData.set("difficulty", input.difficulty);
  formData.set("primaryMetric", String(input.primaryMetric));

  if (input.mistakeCount !== undefined) {
    formData.set("mistakeCount", String(input.mistakeCount));
  }

  if (input.hintCount !== undefined) {
    formData.set("hintCount", String(input.hintCount));
  }

  return formData;
}
