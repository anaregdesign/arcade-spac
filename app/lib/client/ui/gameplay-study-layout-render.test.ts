import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GameplayStudyLayout } from "../../../components/gameplay/layouts/GameplayStudyLayout";

vi.mock("../usecase/locale/use-app-locale", () => ({
  useAppLocale: () => ({
    copy: null,
    locale: "en",
    localeSelection: "auto",
  }),
}));

describe("GameplayStudyLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders markdown study content, source attribution, and actions", () => {
    const html = renderToStaticMarkup(
      createElement(GameplayStudyLayout, {
        actions: createElement("button", { className: "action-link action-link-primary", type: "button" }, "Next page"),
        body: [
          "## Study section",
          "",
          "Read the architecture summary before continuing.",
          "",
          "Inline math stays readable as $idf_t = log(N / df_t)$.",
          "",
          "$$",
          "tf-idf_{t,d} = tf_{t,d} * idf_t",
          "$$",
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
    expect(html).toContain("\\(idf_t = log(N / df_t)\\)");
    expect(html).toContain("\\[tf-idf_{t,d} = tf_{t,d} * idf_t\\]");
    expect(html).not.toContain("$$tf-idf_{t,d}");
    expect(html).toContain("<pre>");
    expect(html).toContain("Page 2 of 4");
    expect(html).toContain("Sources");
    expect(html).toContain("MCP Architecture Overview");
    expect(html).toContain("Next page");
  });
});