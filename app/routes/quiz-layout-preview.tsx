import { useState } from "react";
import { redirect } from "react-router";

import { GameplayQuizLayout } from "../components/gameplay/layouts/GameplayQuizLayout";
import sharedStyles from "../components/gameplay/workspace/GameWorkspaceShared.module.css";

const singlePrompt = [
  "## What does this function return?",
  "",
  "```ts",
  "function double(value: number) {",
  "  return value * 2;",
  "}",
  "",
  "double(6);",
  "```",
].join("\n");

const multiPrompt = [
  "## Select every artifact that is safe to show in the answer area.",
  "",
  "- Markdown bullet lists",
  "- Code blocks",
  "- Inline images",
  "- Keyboard-readable labels",
].join("\n");

export async function loader() {
  if (!import.meta.env.DEV) {
    return redirect("/home");
  }

  return null;
}

export function meta() {
  return [
    { title: "Quiz Layout Preview" },
    { name: "description", content: "Development preview for the shared quiz gameplay layout." },
  ];
}

export default function QuizLayoutPreviewRoute() {
  const [singleSelection, setSingleSelection] = useState("choice-b");
  const [multipleSelection, setMultipleSelection] = useState<string[]>(["choice-a", "choice-d"]);

  function toggleMultipleSelection(choiceKey: string) {
    setMultipleSelection((current) =>
      current.includes(choiceKey) ? current.filter((value) => value !== choiceKey) : [...current, choiceKey],
    );
  }

  return (
    <main className="dashboard-stack">
      <section className="feature-card">
        <p className="eyebrow">Development preview</p>
        <h1 className="section-title">Shared quiz gameplay layout</h1>
        <p className="compact-copy">
          This route exists to verify prompt markdown, choice markdown, single-select, and multi-select behavior before wiring the
          first quiz-format game.
        </p>
      </section>

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"]].join(" ")}>
        <GameplayQuizLayout
          choices={[
            {
              content: "`6`",
              key: "choice-a",
              label: "Option A",
              onSelect: () => setSingleSelection("choice-a"),
              selected: singleSelection === "choice-a",
            },
            {
              content: "`12`",
              key: "choice-b",
              label: "Option B",
              onSelect: () => setSingleSelection("choice-b"),
              selected: singleSelection === "choice-b",
            },
            {
              content: "`18`",
              key: "choice-c",
              label: "Option C",
              onSelect: () => setSingleSelection("choice-c"),
              selected: singleSelection === "choice-c",
            },
          ]}
          detail="Markdown prompt content stays readable above reusable answer cards."
          phase="Single select"
          prompt={singlePrompt}
          selectionMode="single"
          sources={[
            {
              href: "https://modelcontextprotocol.io/introduction",
              label: "Public documentation",
              note: "Use this area to show where a study excerpt or question fact came from.",
              title: "Model Context Protocol Introduction",
            },
          ]}
          title="Read the code and choose one answer"
          tone="logic"
        />
      </section>

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"]].join(" ")}>
        <GameplayQuizLayout
          choices={[
            {
              content: "![Quick Sum preview](/images/games/quick-sum-preview.svg)",
              key: "choice-a",
              label: "Image",
              onSelect: () => toggleMultipleSelection("choice-a"),
              selected: multipleSelection.includes("choice-a"),
            },
            {
              content: "```ts\nconst answer = choices.filter(Boolean);\n```",
              key: "choice-b",
              label: "Code block",
              onSelect: () => toggleMultipleSelection("choice-b"),
              selected: multipleSelection.includes("choice-b"),
            },
            {
              content: "<script>alert('xss')</script>",
              key: "choice-c",
              label: "Raw HTML",
              onSelect: () => toggleMultipleSelection("choice-c"),
              selected: multipleSelection.includes("choice-c"),
            },
            {
              content: "- Accessible labels\n- Visible selected states",
              key: "choice-d",
              label: "Checklist",
              onSelect: () => toggleMultipleSelection("choice-d"),
              selected: multipleSelection.includes("choice-d"),
            },
          ]}
          detail="Multiple selections can stay active until the game-specific submit action runs."
          footer={`Selected ${multipleSelection.length} choices`}
          phase="Multiple select"
          prompt={multiPrompt}
          selectionMode="multiple"
          sources={[
            {
              href: "https://modelcontextprotocol.io/docs/concepts/transports",
              label: "Reference",
              note: "Multiple source entries can be shown when the prompt combines several public pages.",
              title: "MCP Transports",
            },
            {
              href: "https://modelcontextprotocol.io/docs/concepts/tools",
              label: "Reference",
              title: "MCP Tools",
            },
          ]}
          submitAction={<button className="action-link action-link-primary" type="button">Submit current selection</button>}
          title="Review the markdown options and select all valid answers"
          tone="review"
        />
      </section>
    </main>
  );
}