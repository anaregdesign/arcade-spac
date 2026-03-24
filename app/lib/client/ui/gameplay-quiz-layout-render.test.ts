import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GameplayQuizLayout } from "../../../components/gameplay/layouts/GameplayQuizLayout";

vi.mock("../usecase/locale/use-app-locale", () => ({
  useAppLocale: () => ({
    copy: null,
    locale: "en",
    localeSelection: "auto",
  }),
}));

describe("GameplayQuizLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders markdown prompt and selected choices", () => {
    const html = renderToStaticMarkup(
      createElement(GameplayQuizLayout, {
        choices: [
          {
            content: [
              "```ts",
              "console.log('alpha');",
              "```",
              "",
              "The weighting term is $idf_t = log(N / df_t)$.",
            ].join("\n"),
            key: "alpha",
            label: "Option A",
            onSelect: () => undefined,
            selected: true,
          },
          {
            content: "![Quick Sum preview](/images/games/quick-sum-preview.svg)",
            key: "beta",
            label: "Option B",
            onSelect: () => undefined,
          },
        ],
        prompt: [
          "### Which examples belong in the final answer?",
          "",
          "- Use `console.log` only in examples",
          "- Keep screenshots readable",
          "",
          "$$",
          "tf-idf_{t,d} = tf_{t,d} * idf_t",
          "$$",
        ].join("\n"),
        selectionMode: "multiple",
        sources: [
          {
            href: "https://modelcontextprotocol.io/introduction",
            label: "Public documentation",
            note: "This source block should stay near the question.",
            title: "Model Context Protocol Introduction",
          },
        ],
        footer: "Review the formula $idf_t = log(N / df_t)$ before submitting.",
        submitAction: createElement("button", { className: "action-link action-link-primary", type: "button" }, "Submit answer"),
        title: "Review the question",
      }),
    );

    expect(html).toContain("Select all that apply, then submit.");
    expect(html).toContain("<pre>");
    expect(html).toContain("console.log");
    expect(html).toContain("\\(idf_t = log(N / df_t)\\)");
    expect(html).toContain("\\[tf-idf_{t,d} = tf_{t,d} * idf_t\\]");
    expect(html).toContain("quick-sum-preview.svg");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Sources");
    expect(html).toContain("Model Context Protocol Introduction");
    expect(html).toContain("https://modelcontextprotocol.io/introduction");
    expect(html).toContain("Review the formula");
    expect(html).toContain("Submit answer");
    expect(html).not.toContain("Option A");
    expect(html).not.toContain("Option B");
  });
});