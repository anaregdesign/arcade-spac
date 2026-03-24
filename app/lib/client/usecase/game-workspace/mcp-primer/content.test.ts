import { describe, expect, it } from "vitest";

import {
  getMcpPrimerContent,
  mcpPrimerQuestionCount,
  mcpPrimerQuestions,
  mcpPrimerStudyPageCount,
  mcpPrimerStudyPages,
  mcpPrimerTimeLimitByDifficulty,
} from "./content";
import { supportedArcadeLocales } from "../../../../domain/entities/locale";

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

  it("provides localized study and quiz content for every supported locale", () => {
    for (const locale of supportedArcadeLocales) {
      const localizedContent = getMcpPrimerContent(locale);

      expect(localizedContent.studyPages).toHaveLength(mcpPrimerStudyPageCount);
      expect(localizedContent.questions).toHaveLength(mcpPrimerQuestionCount);
      expect(localizedContent.studyPages.every((page) => page.sources.length > 0)).toBe(true);
      expect(localizedContent.questions.every((question) => question.sources.length > 0)).toBe(true);
      expect(localizedContent.questions[8]?.choices[0]?.content).toBe("`tools/list`");
    }
  });

  it("keeps MCP canonical terms untranslated in localized quiz choices", () => {
    for (const locale of ["ja", "zh", "fr"] as const) {
      const localizedContent = getMcpPrimerContent(locale);
      const primitiveChoices = localizedContent.questions[3]?.choices.slice(0, 3).map((choice) => choice.content);

      expect(primitiveChoices).toEqual(["Tools", "Resources", "Prompts"]);
    }
  });
});