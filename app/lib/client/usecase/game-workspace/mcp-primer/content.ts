import type { SupportedArcadeLocale } from "../../../../domain/entities/locale";
import type { GameplaySourceAttributionItem } from "../../../../../components/gameplay/shared/GameplaySourceAttribution";
import { mcpPrimerLocalizedContentByLocale } from "./content-translations";

export type McpPrimerStudyPage = {
  body: string;
  detail: string;
  key: string;
  sources: GameplaySourceAttributionItem[];
  title: string;
};

export type McpPrimerQuestionChoice = {
  content: string;
  isCorrect: boolean;
  key: string;
  label: string;
};

export type McpPrimerQuestion = {
  choices: McpPrimerQuestionChoice[];
  explanation: string;
  key: string;
  prompt: string;
  selectionMode: "multiple" | "single";
  sources: GameplaySourceAttributionItem[];
};

export type McpPrimerLocalizedContent = {
  questions: McpPrimerQuestion[];
  studyPages: McpPrimerStudyPage[];
};

const introSource: GameplaySourceAttributionItem = {
  href: "https://modelcontextprotocol.io/introduction",
  label: "Public documentation",
  title: "What is the Model Context Protocol (MCP)?",
};

const architectureSource: GameplaySourceAttributionItem = {
  href: "https://modelcontextprotocol.io/docs/learn/architecture",
  label: "Public documentation",
  title: "MCP Architecture Overview",
};

const toolsSource: GameplaySourceAttributionItem = {
  href: "https://modelcontextprotocol.io/specification/2025-06-18/server/tools",
  label: "Public specification",
  title: "MCP Tools",
};

const resourcesSource: GameplaySourceAttributionItem = {
  href: "https://modelcontextprotocol.io/specification/2025-06-18/server/resources",
  label: "Public specification",
  title: "MCP Resources",
};

const promptsSource: GameplaySourceAttributionItem = {
  href: "https://modelcontextprotocol.io/specification/2025-06-18/server/prompts",
  label: "Public specification",
  title: "MCP Prompts",
};

const transportsSource: GameplaySourceAttributionItem = {
  href: "https://modelcontextprotocol.io/specification/2025-06-18/basic/transports",
  label: "Public specification",
  title: "MCP Transports",
};

export const mcpPrimerStudyPages: McpPrimerStudyPage[] = [
  {
    key: "intro",
    title: "What MCP is for",
    detail: "Read the high-level value before the protocol details.",
    body: [
      "## MCP in one sentence",
      "",
      "MCP is an **open-source standard** for connecting AI applications to external systems.",
      "",
      "The introduction describes it as a **USB-C port for AI applications**: one standard connection model for many clients, servers, and ecosystems.",
      "",
      "### MCP can connect AI applications to",
      "",
      "- data sources such as local files and databases",
      "- tools such as search engines or calculators",
      "- workflows such as specialized prompts",
      "",
      "### Why it matters",
      "",
      "- developers reduce integration complexity",
      "- AI apps gain access to broader capabilities",
      "- end users get assistants that can both read data and take actions",
    ].join("\n"),
    sources: [
      {
        ...introSource,
        note: "The introduction explains the USB-C analogy, external systems, and ecosystem value.",
      },
    ],
  },
  {
    key: "architecture",
    title: "Participants, layers, and lifecycle",
    detail: "MCP is stateful, and the connection roles matter.",
    body: [
      "## Participants",
      "",
      "- **Host**: the AI application coordinating one or more MCP clients",
      "- **Client**: the connection-holding component for one MCP server",
      "- **Server**: the program that provides context or actions",
      "",
      "A host creates **one MCP client per MCP server**.",
      "",
      "## Two layers",
      "",
      "- **Data layer**: JSON-RPC 2.0 messages, lifecycle, tools, resources, prompts, notifications",
      "- **Transport layer**: communication channel, framing, auth, connection handling",
      "",
      "## Initialization sequence",
      "",
      "```json",
      "{",
      "  \"method\": \"initialize\",",
      "  \"params\": {",
      "    \"protocolVersion\": \"2025-06-18\",",
      "    \"capabilities\": {},",
      "    \"clientInfo\": { \"name\": \"example-client\" }",
      "  }",
      "}",
      "```",
      "",
      "After successful negotiation, the client sends `notifications/initialized`.",
    ].join("\n"),
    sources: [
      {
        ...architectureSource,
        note: "The architecture overview defines participants, layers, primitives, and the initialization handshake.",
      },
    ],
  },
  {
    key: "primitives",
    title: "Tools, resources, and prompts",
    detail: "The three server primitives solve different problems.",
    body: [
      "## Server primitives",
      "",
      "- **Tools**: executable functions that a model can invoke",
      "- **Resources**: contextual data identified by a URI",
      "- **Prompts**: reusable interaction templates",
      "",
      "## Discovery patterns",
      "",
      "- `tools/list` then `tools/call`",
      "- `resources/list` then `resources/read`",
      "- `prompts/list` then `prompts/get`",
      "",
      "## Important details",
      "",
      "- tool definitions include `name`, `description`, `inputSchema`, and optionally `outputSchema`",
      "- resources can expose `subscribe` and `listChanged` features",
      "- prompt messages can contain text, image, audio, or embedded resources",
      "",
      "Tools are model-controlled, resources are application-driven, and prompts are user-controlled.",
    ].join("\n"),
    sources: [
      {
        ...toolsSource,
        note: "Tool discovery, invocation, result content, and error handling come from the tools spec.",
      },
      {
        ...resourcesSource,
        note: "Resources add URI-based context, templates, annotations, and optional subscriptions.",
      },
      {
        ...promptsSource,
        note: "Prompts are exposed for explicit user selection and can return structured messages.",
      },
    ],
  },
  {
    key: "transports",
    title: "Transport choices and session handling",
    detail: "Transport changes the delivery mechanics, not the JSON-RPC core.",
    body: [
      "## Stdio",
      "",
      "- local subprocess communication",
      "- newline-delimited JSON-RPC messages",
      "- `stdout` must contain only valid MCP messages",
      "- `stderr` may be used for logs",
      "",
      "## Streamable HTTP",
      "",
      "- clients send JSON-RPC messages with HTTP `POST`",
      "- clients may open an SSE stream with HTTP `GET`",
      "- later requests may include `Mcp-Session-Id` and `MCP-Protocol-Version` headers",
      "- a `404` for an existing session means the client must initialize a new session",
      "",
      "## Security reminders",
      "",
      "- validate `Origin` for Streamable HTTP",
      "- bind local servers to `127.0.0.1` when appropriate",
      "- use proper authentication for remote connections",
    ].join("\n"),
    sources: [
      {
        ...transportsSource,
        note: "The transport spec covers stdio framing, Streamable HTTP, SSE, resumability, and session headers.",
      },
    ],
  },
];

export const mcpPrimerQuestions: McpPrimerQuestion[] = [
  {
    key: "q1",
    prompt: "## What is MCP primarily described as?",
    selectionMode: "single",
    sources: [introSource],
    explanation: "The introduction calls MCP an open-source standard for connecting AI applications to external systems.",
    choices: [
      { key: "a", label: "Option A", content: "A framework only for model fine-tuning", isCorrect: false },
      { key: "b", label: "Option B", content: "An open-source standard for connecting AI applications to external systems", isCorrect: true },
      { key: "c", label: "Option C", content: "A hosted IDE for AI model training", isCorrect: false },
      { key: "d", label: "Option D", content: "A proprietary protocol limited to one assistant", isCorrect: false },
    ],
  },
  {
    key: "q2",
    prompt: "## Which categories does the introduction say MCP can connect AI applications to? Select all that apply.",
    selectionMode: "multiple",
    sources: [introSource],
    explanation: "The introduction explicitly names data sources, tools, and workflows such as specialized prompts.",
    choices: [
      { key: "a", label: "Option A", content: "Data sources", isCorrect: true },
      { key: "b", label: "Option B", content: "Tools", isCorrect: true },
      { key: "c", label: "Option C", content: "Workflows such as specialized prompts", isCorrect: true },
      { key: "d", label: "Option D", content: "GPU firmware flashing", isCorrect: false },
    ],
  },
  {
    key: "q3",
    prompt: "## In the architecture overview, what does the host create for each MCP server?",
    selectionMode: "single",
    sources: [architectureSource],
    explanation: "The host creates one MCP client for each MCP server.",
    choices: [
      { key: "a", label: "Option A", content: "One MCP client", isCorrect: true },
      { key: "b", label: "Option B", content: "One OAuth tenant", isCorrect: false },
      { key: "c", label: "Option C", content: "One prompt template", isCorrect: false },
      { key: "d", label: "Option D", content: "One SSE stream only", isCorrect: false },
    ],
  },
  {
    key: "q4",
    prompt: "## Which three core primitives can MCP servers expose? Select all that apply.",
    selectionMode: "multiple",
    sources: [architectureSource],
    explanation: "Server primitives are tools, resources, and prompts.",
    choices: [
      { key: "a", label: "Option A", content: "Tools", isCorrect: true },
      { key: "b", label: "Option B", content: "Resources", isCorrect: true },
      { key: "c", label: "Option C", content: "Prompts", isCorrect: true },
      { key: "d", label: "Option D", content: "Widgets", isCorrect: false },
    ],
  },
  {
    key: "q5",
    prompt: "## Which client-side primitives are called out in the architecture overview? Select all that apply.",
    selectionMode: "multiple",
    sources: [architectureSource],
    explanation: "The architecture overview names sampling, elicitation, and logging as client primitives.",
    choices: [
      { key: "a", label: "Option A", content: "Sampling", isCorrect: true },
      { key: "b", label: "Option B", content: "Elicitation", isCorrect: true },
      { key: "c", label: "Option C", content: "Logging", isCorrect: true },
      { key: "d", label: "Option D", content: "Migration", isCorrect: false },
    ],
  },
  {
    key: "q6",
    prompt: "## Which protocol underlies the MCP data layer?",
    selectionMode: "single",
    sources: [architectureSource],
    explanation: "The data layer is based on JSON-RPC 2.0.",
    choices: [
      { key: "a", label: "Option A", content: "GraphQL", isCorrect: false },
      { key: "b", label: "Option B", content: "gRPC", isCorrect: false },
      { key: "c", label: "Option C", content: "JSON-RPC 2.0", isCorrect: true },
      { key: "d", label: "Option D", content: "SOAP", isCorrect: false },
    ],
  },
  {
    key: "q7",
    prompt: "## Which fields are explicitly highlighted in the initialization exchange? Select all that apply.",
    selectionMode: "multiple",
    sources: [architectureSource],
    explanation: "The architecture example highlights protocolVersion, capabilities, clientInfo, and serverInfo as part of the handshake.",
    choices: [
      { key: "a", label: "Option A", content: "`protocolVersion`", isCorrect: true },
      { key: "b", label: "Option B", content: "`capabilities`", isCorrect: true },
      { key: "c", label: "Option C", content: "`clientInfo` / `serverInfo`", isCorrect: true },
      { key: "d", label: "Option D", content: "`nextCursor`", isCorrect: false },
    ],
  },
  {
    key: "q8",
    prompt: "## What notification does the client send after successful initialization?",
    selectionMode: "single",
    sources: [architectureSource],
    explanation: "The architecture walkthrough shows `notifications/initialized` after initialization succeeds.",
    choices: [
      { key: "a", label: "Option A", content: "`notifications/initialized`", isCorrect: true },
      { key: "b", label: "Option B", content: "`notifications/tools/list_changed`", isCorrect: false },
      { key: "c", label: "Option C", content: "`resources/subscribe`", isCorrect: false },
      { key: "d", label: "Option D", content: "`prompts/get`", isCorrect: false },
    ],
  },
  {
    key: "q9",
    prompt: "## Which request is used to discover available tools?",
    selectionMode: "single",
    sources: [toolsSource],
    explanation: "Clients discover tools with `tools/list`.",
    choices: [
      { key: "a", label: "Option A", content: "`tools/list`", isCorrect: true },
      { key: "b", label: "Option B", content: "`tools/get`", isCorrect: false },
      { key: "c", label: "Option C", content: "`tools/read`", isCorrect: false },
      { key: "d", label: "Option D", content: "`tools/discover`", isCorrect: false },
    ],
  },
  {
    key: "q10",
    prompt: "## Which fields belong in a tool definition according to the spec? Select all that apply.",
    selectionMode: "multiple",
    sources: [toolsSource],
    explanation: "The spec lists name, title, description, inputSchema, optional outputSchema, and annotations.",
    choices: [
      { key: "a", label: "Option A", content: "`name`", isCorrect: true },
      { key: "b", label: "Option B", content: "`inputSchema`", isCorrect: true },
      { key: "c", label: "Option C", content: "Optional `outputSchema`", isCorrect: true },
      { key: "d", label: "Option D", content: "A required SQL connection string", isCorrect: false },
    ],
  },
  {
    key: "q11",
    prompt: "## Which content types may appear in tool results? Select all that apply.",
    selectionMode: "multiple",
    sources: [toolsSource],
    explanation: "Tool results may contain text, image, audio, resource links, and embedded resources.",
    choices: [
      { key: "a", label: "Option A", content: "Text", isCorrect: true },
      { key: "b", label: "Option B", content: "Image", isCorrect: true },
      { key: "c", label: "Option C", content: "Audio", isCorrect: true },
      { key: "d", label: "Option D", content: "Resource links or embedded resources", isCorrect: true },
    ],
  },
  {
    key: "q12",
    prompt: "## How does the tools spec distinguish protocol errors from tool execution errors?",
    selectionMode: "single",
    sources: [toolsSource],
    explanation: "Protocol errors use standard JSON-RPC error objects; tool execution errors are returned in the result with `isError: true`.",
    choices: [
      { key: "a", label: "Option A", content: "Protocol errors use JSON-RPC errors, while tool execution errors use `isError: true` in the result.", isCorrect: true },
      { key: "b", label: "Option B", content: "Both always use HTTP 404.", isCorrect: false },
      { key: "c", label: "Option C", content: "Tool execution errors are impossible if `outputSchema` exists.", isCorrect: false },
      { key: "d", label: "Option D", content: "All tool failures are reported only through notifications.", isCorrect: false },
    ],
  },
  {
    key: "q13",
    prompt: "## Which interaction model is associated with resources in the specification?",
    selectionMode: "single",
    sources: [resourcesSource],
    explanation: "Resources are described as application-driven, with host applications deciding how to incorporate them.",
    choices: [
      { key: "a", label: "Option A", content: "Application-driven", isCorrect: true },
      { key: "b", label: "Option B", content: "Model-controlled", isCorrect: false },
      { key: "c", label: "Option C", content: "User-controlled only", isCorrect: false },
      { key: "d", label: "Option D", content: "Transport-controlled", isCorrect: false },
    ],
  },
  {
    key: "q14",
    prompt: "## Which optional resource capability features are named in the spec? Select all that apply.",
    selectionMode: "multiple",
    sources: [resourcesSource],
    explanation: "The resource capability can optionally advertise `subscribe` and `listChanged`.",
    choices: [
      { key: "a", label: "Option A", content: "`subscribe`", isCorrect: true },
      { key: "b", label: "Option B", content: "`listChanged`", isCorrect: true },
      { key: "c", label: "Option C", content: "`batchWrite`", isCorrect: false },
      { key: "d", label: "Option D", content: "`streamBinary`", isCorrect: false },
    ],
  },
  {
    key: "q15",
    prompt: "## Which request retrieves the contents of a specific resource URI?",
    selectionMode: "single",
    sources: [resourcesSource],
    explanation: "`resources/read` fetches the content for a given URI.",
    choices: [
      { key: "a", label: "Option A", content: "`resources/list`", isCorrect: false },
      { key: "b", label: "Option B", content: "`resources/read`", isCorrect: true },
      { key: "c", label: "Option C", content: "`resources/get`", isCorrect: false },
      { key: "d", label: "Option D", content: "`resources/open`", isCorrect: false },
    ],
  },
  {
    key: "q16",
    prompt: "## Which annotations are described for resources, templates, and content blocks? Select all that apply.",
    selectionMode: "multiple",
    sources: [resourcesSource],
    explanation: "The annotations are audience, priority, and lastModified.",
    choices: [
      { key: "a", label: "Option A", content: "`audience`", isCorrect: true },
      { key: "b", label: "Option B", content: "`priority`", isCorrect: true },
      { key: "c", label: "Option C", content: "`lastModified`", isCorrect: true },
      { key: "d", label: "Option D", content: "`cacheForever`", isCorrect: false },
    ],
  },
  {
    key: "q17",
    prompt: "## Which interaction model is associated with prompts?",
    selectionMode: "single",
    sources: [promptsSource],
    explanation: "Prompts are user-controlled and intended for explicit user selection.",
    choices: [
      { key: "a", label: "Option A", content: "User-controlled", isCorrect: true },
      { key: "b", label: "Option B", content: "Application-driven", isCorrect: false },
      { key: "c", label: "Option C", content: "Model-controlled", isCorrect: false },
      { key: "d", label: "Option D", content: "Background-only", isCorrect: false },
    ],
  },
  {
    key: "q18",
    prompt: "## Which statements about prompts are accurate? Select all that apply.",
    selectionMode: "multiple",
    sources: [promptsSource],
    explanation: "The prompts spec defines `prompts/list`, `prompts/get`, optional arguments, and messages with roles and multiple content types.",
    choices: [
      { key: "a", label: "Option A", content: "Clients can discover prompts with `prompts/list`.", isCorrect: true },
      { key: "b", label: "Option B", content: "`prompts/get` can accept arguments to customize a prompt.", isCorrect: true },
      { key: "c", label: "Option C", content: "Prompt messages include a `role` and typed content.", isCorrect: true },
      { key: "d", label: "Option D", content: "Prompts never include embedded resources.", isCorrect: false },
    ],
  },
  {
    key: "q19",
    prompt: "## Which statement about stdio transport is correct?",
    selectionMode: "single",
    sources: [transportsSource],
    explanation: "Stdio uses subprocess communication over stdin/stdout, newline-delimited messages, and optional stderr logs.",
    choices: [
      { key: "a", label: "Option A", content: "The server may write arbitrary logs to stdout between MCP messages.", isCorrect: false },
      { key: "b", label: "Option B", content: "Messages are newline-delimited JSON-RPC, stdout must contain only valid MCP messages, and stderr may carry logs.", isCorrect: true },
      { key: "c", label: "Option C", content: "Stdio requires an HTTP GET endpoint.", isCorrect: false },
      { key: "d", label: "Option D", content: "Stdio is only valid for remote servers on the public internet.", isCorrect: false },
    ],
  },
  {
    key: "q20",
    prompt: "## Which statements about Streamable HTTP are correct? Select all that apply.",
    selectionMode: "multiple",
    sources: [transportsSource],
    explanation: "Streamable HTTP uses POST for client messages, may use GET for SSE, carries session and protocol headers, and requires a new session after a 404 on an existing session.",
    choices: [
      { key: "a", label: "Option A", content: "Client JSON-RPC messages are sent with HTTP `POST`.", isCorrect: true },
      { key: "b", label: "Option B", content: "Clients may open an SSE stream with HTTP `GET`.", isCorrect: true },
      { key: "c", label: "Option C", content: "Clients may need to send `Mcp-Session-Id` and `MCP-Protocol-Version` on later requests.", isCorrect: true },
      { key: "d", label: "Option D", content: "If a session request returns `404`, the client should keep reusing the same session without reinitializing.", isCorrect: false },
    ],
  },
];

export const mcpPrimerQuestionCount = mcpPrimerQuestions.length;

export const mcpPrimerStudyPageCount = mcpPrimerStudyPages.length;

export function getMcpPrimerContent(locale: SupportedArcadeLocale): McpPrimerLocalizedContent {
  const localizedContent = mcpPrimerLocalizedContentByLocale[locale];

  return {
    questions: localizedContent?.questions ?? mcpPrimerQuestions,
    studyPages: localizedContent?.studyPages ?? mcpPrimerStudyPages,
  };
}

export const mcpPrimerTimeLimitByDifficulty = {
  EASY: 900,
  NORMAL: 720,
  HARD: 600,
  EXPERT: 480,
} as const;