import { describe, expect, it } from "vitest";

import {
  getIrPrimerContent,
  getIrPrimerSections,
  irPrimerQuestionCount,
  irPrimerQuestions,
  irPrimerSectionCount,
  irPrimerStudyPageCount,
  irPrimerStudyPages,
  irPrimerTimeLimitByDifficulty,
} from "./content";
import { supportedArcadeLocales } from "../../../../domain/entities/locale";

describe("ir-primer content", () => {
  it("keeps the published study pages and count in sync", () => {
    expect(irPrimerStudyPages).toHaveLength(6);
    expect(irPrimerStudyPageCount).toBe(irPrimerStudyPages.length);

    for (const page of irPrimerStudyPages) {
      expect(page.body).toContain("##");
      expect(page.sources.length).toBeGreaterThan(0);
      expect(page.sources.every((source) => source.href.startsWith("https://nlp.stanford.edu/IR-book/"))).toBe(true);
    }
  });

  it("keeps every question answerable and attributed", () => {
    expect(irPrimerQuestions).toHaveLength(18);
    expect(irPrimerQuestionCount).toBe(irPrimerQuestions.length);

    for (const question of irPrimerQuestions) {
      const correctChoices = question.choices.filter((choice) => choice.isCorrect);

      expect(question.sources.length).toBeGreaterThan(0);
      expect(correctChoices.length).toBeGreaterThan(0);
      expect(question.selectionMode === "single" ? correctChoices.length === 1 : correctChoices.length > 1).toBe(true);
    }
  });

  it("keeps difficulty time limits ordered from easiest to hardest", () => {
    expect(irPrimerTimeLimitByDifficulty.EASY).toBeGreaterThan(irPrimerTimeLimitByDifficulty.NORMAL);
    expect(irPrimerTimeLimitByDifficulty.NORMAL).toBeGreaterThan(irPrimerTimeLimitByDifficulty.HARD);
    expect(irPrimerTimeLimitByDifficulty.HARD).toBeGreaterThan(irPrimerTimeLimitByDifficulty.EXPERT);
  });

  it("groups the lesson into source-backed study and quiz sections without losing any page or question", () => {
    const sections = getIrPrimerSections(getIrPrimerContent("en"));

    expect(sections).toHaveLength(irPrimerSectionCount);
    expect(sections.every((section) => section.studyPages.length > 0)).toBe(true);
    expect(sections.every((section) => section.questions.length > 0)).toBe(true);
    expect(sections.flatMap((section) => section.studyPages).map((page) => page.key)).toEqual(
      irPrimerStudyPages.map((page) => page.key),
    );
    expect(sections.flatMap((section) => section.questions).map((question) => question.key)).toEqual(
      irPrimerQuestions.map((question) => question.key),
    );
  });

  it("keeps the study pages aligned with the quiz facts they teach", () => {
    const [booleanBasics, termsPostings, tolerantRetrieval, indexConstruction, ranking, evaluation] = irPrimerStudyPages;

    expect(booleanBasics?.body).toContain("inverted index");
    expect(booleanBasics?.body).toContain("increasing document frequency");
    expect(termsPostings?.body).toContain("Stop words");
    expect(termsPostings?.body).toContain("lemmatization");
    expect(termsPostings?.body).toContain("positional index");
    expect(tolerantRetrieval?.body).toContain("permuterm index");
    expect(tolerantRetrieval?.body).toContain("post-filtering step");
    expect(tolerantRetrieval?.body).toContain("Edit distance");
    expect(indexConstruction?.body).toContain("Theta(T log T)");
    expect(indexConstruction?.body).toContain("Theta(T)");
    expect(ranking?.body).toContain("idf_t");
    expect(ranking?.body).toContain("\\log(N / df_t)");
    expect(ranking?.body).toContain("Documents and queries can both be viewed as vectors");
    expect(evaluation?.body).toContain("Precision");
    expect(evaluation?.body).toContain("MAP");
  });

  it("provides localized study and quiz content for every supported locale", () => {
    for (const locale of supportedArcadeLocales) {
      const localizedContent = getIrPrimerContent(locale);

      expect(localizedContent.studyPages).toHaveLength(irPrimerStudyPageCount);
      expect(localizedContent.questions).toHaveLength(irPrimerQuestionCount);
      expect(localizedContent.studyPages.every((page) => page.sources.length > 0)).toBe(true);
      expect(localizedContent.questions.every((question) => question.sources.length > 0)).toBe(true);
      expect(localizedContent.studyPages.map((page) => page.key)).toEqual(irPrimerStudyPages.map((page) => page.key));
      expect(localizedContent.questions.map((question) => question.key)).toEqual(irPrimerQuestions.map((question) => question.key));
    }

    expect(getIrPrimerContent("ja").studyPages[0]?.title).toBe("Boolean retrieval と inverted index");
    expect(getIrPrimerContent("zh").studyPages[0]?.title).toBe("Boolean retrieval 与 inverted index");
    expect(getIrPrimerContent("fr").studyPages[0]?.title).toBe("Boolean retrieval et inverted index");
    expect(getIrPrimerContent("ja").questions[0]?.prompt).not.toBe(irPrimerQuestions[0]?.prompt);
  });

  it("keeps IR canonical terms and math notation stable in localized content", () => {
    for (const locale of ["ja", "zh", "fr"] as const) {
      const localizedContent = getIrPrimerContent(locale);

      expect(localizedContent.studyPages[0]?.title).toContain("Boolean retrieval");
      expect(localizedContent.studyPages[0]?.title).toContain("inverted index");
      expect(localizedContent.studyPages[3]?.title).toContain("BSBI");
      expect(localizedContent.studyPages[3]?.title).toContain("SPIMI");
      expect(localizedContent.studyPages[4]?.body).toContain("$tf_{t,d}$");
      expect(localizedContent.studyPages[4]?.body).toContain("$idf_t = \\log(N / df_t)$");
      expect(localizedContent.studyPages[5]?.body).toContain("Precision at k");
      expect(localizedContent.studyPages[5]?.body).toContain("MAP");
      expect(localizedContent.questions[13]?.choices[0]?.content).toContain("BSBI");
      expect(localizedContent.questions[13]?.choices[0]?.content).toContain("SPIMI");
      expect(localizedContent.questions[14]?.choices[1]?.content).toContain("$idf_t = \\log(N / df_t)$");
    }
  });
});