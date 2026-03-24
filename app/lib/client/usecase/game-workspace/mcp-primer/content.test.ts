import { describe, expect, it } from "vitest";

import {
  mcpPrimerQuestionCount,
  mcpPrimerQuestions,
  mcpPrimerStudyPageCount,
  mcpPrimerStudyPages,
  mcpPrimerTimeLimitByDifficulty,
} from "./content";

describe("mcp-primer content", () => {
  it("keeps the published study pages and count in sync", () => {
    expect(mcpPrimerStudyPages).toHaveLength(4);
    expect(mcpPrimerStudyPageCount).toBe(mcpPrimerStudyPages.length);

    for (const page of mcpPrimerStudyPages) {
      expect(page.body).toContain("##");
      expect(page.sources.length).toBeGreaterThan(0);
      expect(page.sources.every((source) => source.href.startsWith("https://modelcontextprotocol.io/"))).toBe(true);
    }
  });

  it("keeps every question answerable and attributed", () => {
    expect(mcpPrimerQuestions).toHaveLength(20);
    expect(mcpPrimerQuestionCount).toBe(mcpPrimerQuestions.length);

    for (const question of mcpPrimerQuestions) {
      const correctChoices = question.choices.filter((choice) => choice.isCorrect);

      expect(question.sources.length).toBeGreaterThan(0);
      expect(correctChoices.length).toBeGreaterThan(0);
      expect(question.selectionMode === "single" ? correctChoices.length === 1 : correctChoices.length > 1).toBe(true);
    }
  });

  it("keeps difficulty time limits ordered from easiest to hardest", () => {
    expect(mcpPrimerTimeLimitByDifficulty.EASY).toBeGreaterThan(mcpPrimerTimeLimitByDifficulty.NORMAL);
    expect(mcpPrimerTimeLimitByDifficulty.NORMAL).toBeGreaterThan(mcpPrimerTimeLimitByDifficulty.HARD);
    expect(mcpPrimerTimeLimitByDifficulty.HARD).toBeGreaterThan(mcpPrimerTimeLimitByDifficulty.EXPERT);
  });
});