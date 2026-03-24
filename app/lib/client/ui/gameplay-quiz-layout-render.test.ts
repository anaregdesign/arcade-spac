import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GameplayQuizLayout } from "../../../components/gameplay/layouts/GameplayQuizLayout";

describe("GameplayQuizLayout", () => {
  it("renders markdown prompt and selected choices", () => {
    const html = renderToStaticMarkup(
      createElement(GameplayQuizLayout, {
        choices: [
          {
            content: "```ts\nconsole.log('alpha');\n```",
            key: "alpha",
            onSelect: () => undefined,
            selected: true,
          },
          {
            content: "![Quick Sum preview](/images/games/quick-sum-preview.svg)",
            key: "beta",
            onSelect: () => undefined,
          },
        ],
        prompt: [
          "### Which examples belong in the final answer?",
          "",
          "- Use `console.log` only in examples",
          "- Keep screenshots readable",
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
        submitAction: createElement("button", { className: "action-link action-link-primary", type: "button" }, "Submit answer"),
        title: "Review the question",
      }),
    );

    expect(html).toContain("Select all that apply, then submit.");
    expect(html).toContain("<pre>");
    expect(html).toContain("console.log");
    expect(html).toContain("quick-sum-preview.svg");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Sources");
    expect(html).toContain("Model Context Protocol Introduction");
    expect(html).toContain("https://modelcontextprotocol.io/introduction");
    expect(html).toContain("Submit answer");
  });
});