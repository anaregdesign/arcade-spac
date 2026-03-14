import { describe, expect, it } from "vitest";

import { useResultScreen } from "./use-result-screen";

type ResultView = Parameters<typeof useResultScreen>[0];

function createResult(overrides: Partial<ResultView> = {}): ResultView {
  return {
    canShare: true,
    competitivePoints: 1280,
    difficulty: "NORMAL",
    gameKey: "precision-drop",
    gameName: "Precision Drop",
    impact: {
      gameRank: {
        note: "Up 2 places",
        value: "#4",
      },
      overallRank: {
        note: "Top 10",
        value: "#9",
      },
      totalPoints: {
        note: "+40",
        value: "1480",
      },
    },
    primaryMetric: "7 px",
    primaryMetricLabel: "Hit offset",
    rankingsHref: "/rankings?period=season&scope=precision-drop",
    selfBestBadge: "New best",
    selfBestDeltaLabel: "-2 px",
    selfBestDetail: "2 px faster than best",
    shareAvailabilityNote: "Available",
    shareText: "Precision Drop in 7 px",
    shareUrl: "https://arcade.example/results/precision-drop?id=42",
    stateExplanation: null,
    status: "COMPLETED",
    statusLabel: "Hit",
    summaryText: "Strong run",
    supportMetricLabel: "Hit rating",
    supportMetricNote: "Tight timing",
    supportMetricValue: "Precise",
    viewerMode: "owner",
    ...overrides,
  };
}

describe("useResultScreen", () => {
  it("builds the completed owner view model", () => {
    const viewModel = useResultScreen(createResult());

    expect(viewModel.compactStateCopy).toBeNull();
    expect(viewModel.shareStatusLabel).toBe("Ready");
    expect(viewModel.statusBadgeClass).toBe("status-badge status-badge-success");
    expect(viewModel.impactCards).toEqual([
      { key: "game-rank", label: "Game rank", value: "#4" },
      { key: "total-points", label: "Total points", value: "1480" },
      { key: "overall-rank", label: "Overall rank", value: "#9" },
    ]);
    expect(viewModel.quickStats).toEqual([
      { label: "Hit rating", value: "Precise" },
      { label: "Vs best", value: "-2 px" },
      { label: "Board score", value: "1280" },
    ]);
    expect(viewModel.alternateGames.some((game) => game.key === "precision-drop")).toBe(false);
    expect(viewModel.teamsShareHref).toBe(
      "https://teams.microsoft.com/share?href=https%3A%2F%2Farcade.example%2Fresults%2Fprecision-drop%3Fid%3D42&msgText=Precision%20Drop%20in%207%20px",
    );
  });

  it("marks pending saves as provisional and locked when sharing is disabled", () => {
    const viewModel = useResultScreen(createResult({
      canShare: false,
      status: "PENDING_SAVE",
    }));

    expect(viewModel.compactStateCopy).toBe("Provisional until save retry");
    expect(viewModel.shareStatusLabel).toBe("Locked");
    expect(viewModel.statusBadgeClass).toBe("status-badge status-badge-pending");
  });

  it("marks failed shared views as owner only and ranking neutral", () => {
    const viewModel = useResultScreen(createResult({
      status: "FAILED",
      viewerMode: "shared",
    }));

    expect(viewModel.compactStateCopy).toBe("History only, no ranking update");
    expect(viewModel.shareStatusLabel).toBe("Owner only");
    expect(viewModel.statusBadgeClass).toBe("status-badge status-badge-neutral");
  });

  it("marks abandoned runs with the abandoned copy", () => {
    const viewModel = useResultScreen(createResult({
      status: "ABANDONED",
    }));

    expect(viewModel.compactStateCopy).toBe("Abandoned run, no ranking update");
  });
});
