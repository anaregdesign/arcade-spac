import { describe, expect, it } from "vitest";

import {
  getMcpPrimerContent,
  getMcpPrimerSections,
  mcpPrimerQuestionCount,
  mcpPrimerQuestions,
  mcpPrimerSectionCount,
  mcpPrimerStudyPageCount,
  mcpPrimerStudyPages,
  mcpPrimerTimeLimitByDifficulty,
} from "./content";
import { supportedArcadeLocales } from "../../../../domain/entities/locale";

describe("mcp-primer content", () => {
  it("keeps the published study pages and count in sync", () => {
    expect(mcpPrimerStudyPages).toHaveLength(6);
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

  it("groups the lesson into source-backed study and quiz sections without losing any page or question", () => {
    const sections = getMcpPrimerSections(getMcpPrimerContent("en"));

    expect(sections).toHaveLength(mcpPrimerSectionCount);
    expect(sections.every((section) => section.studyPages.length > 0)).toBe(true);
    expect(sections.every((section) => section.questions.length > 0)).toBe(true);
    expect(sections.flatMap((section) => section.studyPages).map((page) => page.key)).toEqual(
      mcpPrimerStudyPages.map((page) => page.key),
    );
    expect(sections.flatMap((section) => section.questions).map((question) => question.key)).toEqual([
      "q1",
      "q2",
      "q3",
      "q5",
      "q6",
      "q7",
      "q8",
      "q4",
      "q9",
      "q13",
      "q17",
      "q10",
      "q11",
      "q12",
      "q14",
      "q15",
      "q16",
      "q18",
      "q19",
      "q20",
    ]);
  });

  it("teaches the facts that previously lacked nearby study coverage", () => {
    const [intro, architecture, primitives, tools, resourcesPrompts] = mcpPrimerStudyPages;

    expect(architecture?.body).toContain("Sampling");
    expect(architecture?.body).toContain("Elicitation");
    expect(architecture?.body).toContain("Logging");
    expect(architecture?.body).toContain("`serverInfo`");
    expect(primitives?.body).toContain("`prompts/get`");
    expect(tools?.body).toContain("`annotations`");
    expect(tools?.body).toContain("`isError: true`");
    expect(resourcesPrompts?.body).toContain("`audience`");
    expect(resourcesPrompts?.body).toContain("`priority`");
    expect(resourcesPrompts?.body).toContain("`lastModified`");
    expect(resourcesPrompts?.body).toContain("`prompts/get`");
  });

  it("provides localized study and quiz content for every supported locale", () => {
    for (const locale of supportedArcadeLocales) {
      const localizedContent = getMcpPrimerContent(locale);

      expect(localizedContent.studyPages).toHaveLength(mcpPrimerStudyPageCount);
      expect(localizedContent.questions).toHaveLength(mcpPrimerQuestionCount);
      expect(localizedContent.studyPages.every((page) => page.sources.length > 0)).toBe(true);
      expect(localizedContent.questions.every((question) => question.sources.length > 0)).toBe(true);
      expect(localizedContent.questions[8]?.choices[0]?.content).toBe("`tools/list`");
      expect(localizedContent.studyPages.map((page) => page.key)).toEqual(mcpPrimerStudyPages.map((page) => page.key));
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