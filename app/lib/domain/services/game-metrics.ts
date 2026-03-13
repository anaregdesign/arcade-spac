import { toRouteGameKey } from "../entities/game-catalog";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function normalizeGameKey(gameKey: string) {
  return toRouteGameKey(gameKey);
}

export function formatPrimaryMetric(gameKey: string, primaryMetric: number) {
  const normalizedGameKey = normalizeGameKey(gameKey);

  if (normalizedGameKey === "drop-line") {
    return `${primaryMetric} px`;
  }

  return formatDuration(primaryMetric);
}

export function formatOptionalPrimaryMetric(gameKey: string, primaryMetric: number | null) {
  if (primaryMetric === null) {
    return "No record yet";
  }

  return formatPrimaryMetric(gameKey, primaryMetric);
}

export function getBestMetricLabel(gameKey: string) {
  const normalizedGameKey = normalizeGameKey(gameKey);

  if (normalizedGameKey === "minesweeper") {
    return "Best clear time";
  }

  if (normalizedGameKey === "sudoku") {
    return "Best solve time";
  }

  return "Best hit offset";
}

export function getResultPrimaryMetricLabel(gameKey: string, status: string) {
  const normalizedGameKey = normalizeGameKey(gameKey);

  if (normalizedGameKey === "drop-line") {
    return status === "FAILED" || status === "ABANDONED" ? "Miss offset" : "Hit offset";
  }

  return status === "FAILED" || status === "ABANDONED" ? "Run time" : "Clear time";
}

export function getDropLineHitRating(primaryMetric: number, status: string) {
  if (status === "FAILED" || status === "ABANDONED") {
    return {
      note: "The ball passed the line before the hit registered.",
      value: "Miss",
    };
  }

  if (primaryMetric <= 4) {
    return {
      note: "Within 4 px of the line center.",
      value: "Perfect",
    };
  }

  if (primaryMetric <= 10) {
    return {
      note: "A tight hit with a small visible offset.",
      value: "Precise",
    };
  }

  if (primaryMetric <= 22) {
    return {
      note: "Close enough to score well, with room to tighten the timing.",
      value: "Close",
    };
  }

  return {
    note: "The hit landed, but the timing window was visibly off the line center.",
    value: "Wide",
  };
}
