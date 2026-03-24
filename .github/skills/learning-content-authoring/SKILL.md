---
name: learning-content-authoring
description: 'Create source-backed learning content, study notes, quizzes, and educational game content. Use when asked to produce 学習コンテンツ, クイズ作成, 問題生成, 教材作成, source-based lessons, paired study and quiz sections, question ambiguity review, or answerable educational content from supplied text.'
argument-hint: 'Source text, target audience, desired quiz count or section count, and any locale requirements.'
---

# Learning Content Authoring

## Overview

Use this skill when the task is to turn one or more source texts into learning content that teaches first and tests second.
The core rule is that every quiz item must be answerable from nearby study content, and every study claim must be traceable back to a clear source.

This skill packages the workflow established in this repository's MCP Primer work:
- read the full source before drafting content
- extract only the highest-value ideas for the reader
- build study content and quiz content as a paired unit
- review every question for ambiguity, inaccuracy, and unsupported assumptions
- keep source attribution visible and specific
- preserve canonical terms from the source when translation or paraphrase would reduce precision

## When to Use

- You are given a document, article set, spec, transcript, or notes and asked to create study material
- You need to produce both quizzes and the study content required to answer them
- You need section-based educational flows that alternate study and quiz steps
- You need to review existing educational content for answerability, ambiguity, or factual drift
- You need localized study or quiz content while preserving source-defined canonical terms

## Inputs To Confirm

- The full source text or the exact documents that define truth
- The intended reader level
- Whether the output should be a quick checklist, a lesson, or a full multi-section learning flow
- The requested quiz count, or the number of important topics that should become sections
- Whether localization is required
- Whether the output is pure content, or content plus implementation in an app

If the user does not specify quiz count, derive it from the number of distinct important topics instead of inventing arbitrary volume.

## Procedure

1. Read all source material end to end before drafting.
2. Extract the important topics that a reader must retain.
3. Rank those topics by learning value:
   - foundational concepts first
   - operational distinctions next
   - exceptions, edge cases, and detailed mechanics after that
4. Split the content into sections when the material naturally clusters.
5. For each section, write the minimum study content required to answer the intended quiz items correctly.
6. Attach explicit source attribution to each section, and to each quiz item when needed.
7. Write the quiz items for that section only after the paired study content exists.
8. Check that each question is answerable from the paired study content without requiring hidden external knowledge.
9. Repeat for the remaining sections until all important topics are covered.
10. If the content is for an interactive learning game, prefer an alternating flow:
    - study section
    - quiz section
    - next study section

## Question Authoring Rules

- Every question must test one concrete idea, or one tightly related cluster of ideas.
- Do not ask about facts that were not taught in the paired study content.
- Do not rely on trivia, guesswork, or wording traps.
- Prefer prompts that distinguish meaning, behavior, roles, capabilities, or constraints from the source.
- Keep incorrect choices plausible enough to test understanding, but not so close that multiple answers become defensible.
- For multi-select questions, ensure the number of correct choices is supported clearly in the study content.
- Explanations should state why the correct answer is correct using the source-backed concept, not just restate the chosen option.

## Study Content Rules

- Teach only source-backed claims.
- Keep each section dense enough to support the quiz, but not bloated with low-value detail.
- Prefer short topic-focused sections over one long undifferentiated lesson.
- Surface distinctions that are likely to create confusion in the quiz.
- If the source contains canonical terms, method names, protocol names, or other exact labels, preserve them exactly.
- When localizing, translate surrounding prose naturally but keep canonical source terms unchanged unless the source itself defines a translated form.

## Source Attribution Rules

- Name the source clearly.
- Link to the exact document or page when possible.
- Add a short note explaining which fact or concept that source supports.
- If multiple sections draw from different sources, keep attribution local to the relevant section instead of collapsing everything into one final bibliography.

## Review Checklist

Before finalizing, check every section against this list:

- The study content is sufficient to answer the section's quiz items.
- No question depends on unstated assumptions.
- No choice is accidentally correct because of vague wording.
- No explanation contradicts the source.
- Canonical terms remain intact.
- The section's sources are visible and specific.
- The full set of sections covers all important topics without obvious gaps.

## If Updating Existing Content

1. Audit current study pages and quiz items against the source documents.
2. Mark each question as one of:
   - fully supported
   - under-taught
   - ambiguous
   - inaccurate
3. Expand nearby study content before patching questions when the knowledge gap is real.
4. Rewrite the question only when the wording, choices, or explanation are the problem.
5. Re-test the full progression after restructuring sections or changing ordering.

## If Implementing In A Product

- Keep content structure explicit in code, including section keys, study page keys, and question keys.
- Prefer deterministic grouping so each section's content and quiz inventory can be tested.
- Add tests that verify:
  - all study pages have sources
  - all questions have sources
  - every section has both study content and quiz items
  - the total section mapping covers all pages and all questions exactly once when that is the intended design
- Verify the final rendered flow in the browser, not only in code.

## Completion Criteria

The skill has done its job when:
- the source text has been fully reviewed
- the important topics have been extracted and prioritized
- each important topic has paired study content and quiz coverage
- the quiz is answerable from the provided study content
- source attribution is explicit
- ambiguous or inaccurate question wording has been removed
- canonical terms are preserved where precision depends on them
