import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { GameInstructionsDialog } from "../../../components/gameplay/workspace/GameInstructionsDialog";
import { GameWorkspaceRuntimeProvider } from "../../../components/gameplay/workspace/game-workspace-runtime";

vi.mock("../usecase/locale/use-app-locale", () => ({
  useAppLocale: () => ({
    copy: {
      closeLabel: "Close",
      helpEyebrow: "How to play",
      howToPlayLabel: "How to play",
    },
    locale: "en",
    localeSelection: "auto",
  }),
}));

describe("GameInstructionsDialog", () => {
  it("renders runtime-supplied actions beside the how-to-play trigger", () => {
    const html = renderToStaticMarkup(
      createElement(
        GameWorkspaceRuntimeProvider,
        {
          children: createElement(GameInstructionsDialog, {
            instructions: {
              sections: [],
              summary: "Review the rules before you start.",
              title: "Tap Safe",
            },
          }),
          value: {
            autoStartRequest: 0,
            instructionsActions: createElement("button", { type: "button" }, "Share"),
            toolbarActions: null,
          },
        },
      ),
    );

    expect(html).toContain("How to play");
    expect(html).toContain("Share");
  });
});