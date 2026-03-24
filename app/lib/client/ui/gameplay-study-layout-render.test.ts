import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GameplayStudyLayout } from "../../../components/gameplay/layouts/GameplayStudyLayout";

describe("GameplayStudyLayout", () => {
  it("renders markdown study content, source attribution, and actions", () => {
    const html = renderToStaticMarkup(
      createElement(GameplayStudyLayout, {
        actions: createElement("button", { className: "action-link action-link-primary", type: "button" }, "Next page"),
        body: [
          "## Study section",
          "",
          "Read the architecture summary before continuing.",
          "",
          "```json",
          '{ "method": "initialize" }',
          "```",
        ].join("\n"),
        detail: "Read this page before opening the quiz.",
        footer: "Four pages appear before the quiz begins.",
        progressLabel: "Page 2 of 4",
        sources: [
          {
            href: "https://modelcontextprotocol.io/docs/learn/architecture",
            label: "Public documentation",
            note: "The architecture overview defines participants and lifecycle.",
            title: "MCP Architecture Overview",
          },
        ],
        title: "Participants, layers, and lifecycle",
      }),
    );

    expect(html).toContain("Study notes");
    expect(html).toContain("Study section");
    expect(html).toContain("<pre>");
    expect(html).toContain("Page 2 of 4");
    expect(html).toContain("Sources");
    expect(html).toContain("MCP Architecture Overview");
    expect(html).toContain("Next page");
  });
});