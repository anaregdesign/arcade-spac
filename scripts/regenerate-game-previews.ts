import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import * as path from "node:path";

import { previewByGameKey } from "../app/lib/client/usecase/home-hub/selectors";
import { supportedGames } from "../app/lib/domain/entities/game-catalog";

type Attributes = Record<string, number | string | undefined>;

type CellStyle = {
  extra?: string;
  fill?: string;
  label?: string;
  labelColor?: string;
  labelSize?: number;
  stroke?: string;
};

type GridSpec = {
  baseFill?: string;
  cellSize: number;
  cells?: Record<string, CellStyle>;
  cols: number;
  gap: number;
  rows: number;
  x: number;
  y: number;
};

type Theme = {
  accent: string;
  accentGlow: string;
  accentSoft: string;
  accentStrong: string;
  backgroundBottom: string;
  backgroundTop: string;
  card: string;
  cardAlt: string;
  danger: string;
  gridBase: string;
  info: string;
  line: string;
  neutral: string;
  panel: string;
  success: string;
  text: string;
  textMuted: string;
  warning: string;
};

type SceneRenderer = (theme: Theme) => string;

const FONT_STACK = "'Avenir Next', 'Trebuchet MS', 'Segoe UI', sans-serif";
const PREVIEW_DIRECTORY = path.resolve(process.cwd(), "public/images/games");
const SVG_SIZE = 512;
const PREVIEW_FRAME_INSET = 12;
const PREVIEW_FRAME_RADIUS = 42;
const PREVIEW_SCENE_SCALE = 1.12;
const PREVIEW_SCENE_CENTER = SVG_SIZE / 2;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attrs(attributes: Attributes) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => ` ${name}="${escapeXml(String(value))}"`)
    .join("");
}

function selfClosing(tag: string, attributes: Attributes) {
  return `<${tag}${attrs(attributes)} />`;
}

function node(tag: string, attributes: Attributes, children: string) {
  return `<${tag}${attrs(attributes)}>${children}</${tag}>`;
}

function rect(x: number, y: number, width: number, height: number, attributes: Attributes = {}) {
  return selfClosing("rect", { x, y, width, height, ...attributes });
}

function circle(cx: number, cy: number, r: number, attributes: Attributes = {}) {
  return selfClosing("circle", { cx, cy, r, ...attributes });
}

function line(x1: number, y1: number, x2: number, y2: number, attributes: Attributes = {}) {
  return selfClosing("line", { x1, y1, x2, y2, ...attributes });
}

function pathElement(d: string, attributes: Attributes = {}) {
  return selfClosing("path", { d, ...attributes });
}

function polygon(points: Array<[number, number]>, attributes: Attributes = {}) {
  return selfClosing("polygon", {
    points: points.map(([x, y]) => `${x},${y}`).join(" "),
    ...attributes,
  });
}

function text(x: number, y: number, value: string, attributes: Attributes = {}) {
  return node(
    "text",
    {
      x,
      y,
      "font-family": FONT_STACK,
      "font-weight": 700,
      "text-anchor": "middle",
      "dominant-baseline": "middle",
      ...attributes,
    },
    escapeXml(value),
  );
}

function group(children: string, attributes: Attributes = {}) {
  return node("g", attributes, children);
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const [r, g, b] =
    normalized.length === 3
      ? normalized.split("").map((value) => Number.parseInt(`${value}${value}`, 16))
      : [
          Number.parseInt(normalized.slice(0, 2), 16),
          Number.parseInt(normalized.slice(2, 4), 16),
          Number.parseInt(normalized.slice(4, 6), 16),
        ];

  return { b, g, r };
}

function rgbToHex({ b, g, r }: { b: number; g: number; r: number }) {
  return `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixHex(source: string, target: string, amount: number) {
  const sourceRgb = hexToRgb(source);
  const targetRgb = hexToRgb(target);

  return rgbToHex({
    b: sourceRgb.b + (targetRgb.b - sourceRgb.b) * amount,
    g: sourceRgb.g + (targetRgb.g - sourceRgb.g) * amount,
    r: sourceRgb.r + (targetRgb.r - sourceRgb.r) * amount,
  });
}

function alpha(hex: string, opacity: number) {
  const { b, g, r } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function createTheme(accent: string): Theme {
  return {
    accent,
    accentGlow: mixHex(accent, "#ffffff", 0.16),
    accentSoft: mixHex(accent, "#e2e8f0", 0.42),
    accentStrong: mixHex(accent, "#08111f", 0.16),
    backgroundBottom: mixHex(accent, "#020617", 0.9),
    backgroundTop: mixHex(accent, "#0f172a", 0.78),
    card: alpha(mixHex(accent, "#1f2937", 0.82), 0.96),
    cardAlt: alpha(mixHex(accent, "#334155", 0.72), 0.92),
    danger: "#fb7185",
    gridBase: mixHex(accent, "#334155", 0.78),
    info: "#38bdf8",
    line: mixHex(accent, "#cbd5e1", 0.62),
    neutral: "#64748b",
    panel: alpha(mixHex(accent, "#111827", 0.86), 0.94),
    success: "#22c55e",
    text: "#f8fafc",
    textMuted: "#cbd5e1",
    warning: "#f59e0b",
  };
}

function card(theme: Theme, x: number, y: number, width: number, height: number, attributes: Attributes = {}) {
  return rect(x, y, width, height, {
    rx: 26,
    fill: theme.card,
    stroke: alpha(theme.line, 0.22),
    "stroke-width": 1.5,
    ...attributes,
  });
}

function chip(theme: Theme, x: number, y: number, width: number, height: number, label: string, active = false) {
  return [
    rect(x, y, width, height, {
      rx: 16,
      fill: active ? alpha(theme.accent, 0.28) : theme.cardAlt,
      stroke: active ? alpha(theme.accentSoft, 0.85) : alpha(theme.line, 0.24),
      "stroke-width": 1.5,
    }),
    text(x + width / 2, y + height / 2 + 1, label, {
      fill: active ? theme.text : theme.textMuted,
      "font-size": Math.min(24, width * 0.28),
    }),
  ].join("");
}

function cellKey(row: number, col: number) {
  return `${row}:${col}`;
}

function cells(entries: Array<[number, number, CellStyle]>) {
  return Object.fromEntries(entries.map(([row, col, style]) => [cellKey(row, col), style]));
}

function drawGrid(theme: Theme, spec: GridSpec) {
  const markup: string[] = [];
  const baseFill = spec.baseFill ?? theme.gridBase;

  for (let rowIndex = 0; rowIndex < spec.rows; rowIndex += 1) {
    for (let colIndex = 0; colIndex < spec.cols; colIndex += 1) {
      const x = spec.x + colIndex * (spec.cellSize + spec.gap);
      const y = spec.y + rowIndex * (spec.cellSize + spec.gap);
      const cell = spec.cells?.[cellKey(rowIndex, colIndex)];

      markup.push(
        rect(x, y, spec.cellSize, spec.cellSize, {
          rx: Math.max(6, Math.floor(spec.cellSize * 0.2)),
          fill: cell?.fill ?? baseFill,
          stroke: cell?.stroke ?? alpha(theme.line, 0.18),
          "stroke-width": 1.2,
        }),
      );

      if (cell?.label) {
        markup.push(
          text(x + spec.cellSize / 2, y + spec.cellSize / 2 + 1, cell.label, {
            fill: cell.labelColor ?? theme.text,
            "font-size": cell.labelSize ?? Math.max(15, Math.floor(spec.cellSize * 0.46)),
          }),
        );
      }

      if (cell?.extra) {
        markup.push(cell.extra);
      }
    }
  }

  return markup.join("");
}

function boardDimensions(spec: Pick<GridSpec, "cellSize" | "cols" | "gap" | "rows">) {
  return {
    height: spec.rows * spec.cellSize + (spec.rows - 1) * spec.gap,
    width: spec.cols * spec.cellSize + (spec.cols - 1) * spec.gap,
  };
}

function drawBoard(theme: Theme, spec: GridSpec, padding = 18) {
  const { height, width } = boardDimensions(spec);

  return [
    card(theme, spec.x - padding, spec.y - padding, width + padding * 2, height + padding * 2),
    drawGrid(theme, spec),
  ].join("");
}

function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 6) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const tailX = x2 - Math.cos(angle) * 18;
  const tailY = y2 - Math.sin(angle) * 18;
  const left: [number, number] = [tailX + Math.sin(angle) * 8, tailY - Math.cos(angle) * 8];
  const right: [number, number] = [tailX - Math.sin(angle) * 8, tailY + Math.cos(angle) * 8];

  return [
    line(x1, y1, x2, y2, {
      stroke: color,
      "stroke-linecap": "round",
      "stroke-width": width,
    }),
    polygon([
      [x2, y2],
      left,
      right,
    ], { fill: color }),
  ].join("");
}

function triangle(cx: number, cy: number, size: number, attributes: Attributes = {}) {
  return polygon(
    [
      [cx, cy - size],
      [cx - size * 0.9, cy + size],
      [cx + size * 0.9, cy + size],
    ],
    attributes,
  );
}

function diamond(cx: number, cy: number, size: number, attributes: Attributes = {}) {
  return polygon(
    [
      [cx, cy - size],
      [cx - size, cy],
      [cx, cy + size],
      [cx + size, cy],
    ],
    attributes,
  );
}

function iconShape(kind: "circle" | "diamond" | "ring" | "square" | "triangle", cx: number, cy: number, size: number, color: string) {
  switch (kind) {
    case "circle":
      return circle(cx, cy, size, { fill: color });
    case "diamond":
      return diamond(cx, cy, size, { fill: color });
    case "ring":
      return circle(cx, cy, size, { fill: "none", stroke: color, "stroke-width": Math.max(3, size * 0.34) });
    case "square":
      return rect(cx - size, cy - size, size * 2, size * 2, { rx: size * 0.44, fill: color });
    case "triangle":
      return triangle(cx, cy, size, { fill: color });
  }
}

function targetRing(cx: number, cy: number, radius: number, color: string) {
  return [circle(cx, cy, radius, { fill: "none", stroke: alpha(color, 0.42), "stroke-width": 8 }), circle(cx, cy, radius * 0.42, { fill: color })].join("");
}

function makeSvg(key: string, alt: string, theme: Theme, scene: string) {
  const gradientId = `${key}-background`;
  const frameSize = SVG_SIZE - PREVIEW_FRAME_INSET * 2;
  const sceneTransform = `translate(${PREVIEW_SCENE_CENTER} ${PREVIEW_SCENE_CENTER}) scale(${PREVIEW_SCENE_SCALE}) translate(-${PREVIEW_SCENE_CENTER} -${PREVIEW_SCENE_CENTER})`;

  return `<svg width="${SVG_SIZE}" height="${SVG_SIZE}" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <title>${escapeXml(alt)}</title>
  <defs>
    <linearGradient id="${gradientId}" x1="48" y1="36" x2="454" y2="474" gradientUnits="userSpaceOnUse">
      <stop stop-color="${theme.backgroundTop}" />
      <stop offset="1" stop-color="${theme.backgroundBottom}" />
    </linearGradient>
  </defs>
  <rect width="${SVG_SIZE}" height="${SVG_SIZE}" rx="44" fill="url(#${gradientId})" />
  <circle cx="410" cy="92" r="136" fill="${alpha(theme.accent, 0.16)}" />
  <circle cx="104" cy="418" r="118" fill="${alpha(theme.info, 0.09)}" />
  <rect x="${PREVIEW_FRAME_INSET}" y="${PREVIEW_FRAME_INSET}" width="${frameSize}" height="${frameSize}" rx="${PREVIEW_FRAME_RADIUS}" fill="${theme.panel}" stroke="${alpha(theme.line, 0.16)}" stroke-width="2" />
  <g transform="${sceneTransform}">${scene}</g>
</svg>
`;
}

function renderBeatMatch(theme: Theme) {
  return [
    card(theme, 56, 74, 400, 118, { fill: theme.cardAlt }),
    rect(92, 117, 328, 18, { rx: 9, fill: alpha(theme.line, 0.18) }),
    rect(192, 102, 128, 46, { rx: 23, fill: alpha(theme.info, 0.24) }),
    rect(236, 92, 40, 66, { rx: 20, fill: theme.text }),
    card(theme, 72, 246, 108, 152),
    card(theme, 202, 228, 108, 170, { fill: alpha(theme.accent, 0.22), stroke: alpha(theme.accentSoft, 0.72) }),
    card(theme, 332, 246, 108, 152),
    text(126, 323, "L", { fill: theme.textMuted, "font-size": 52 }),
    text(256, 314, "HIT", { fill: theme.text, "font-size": 34 }),
    text(386, 323, "R", { fill: theme.textMuted, "font-size": 52 }),
  ].join("");
}

function renderBlockTessellate(theme: Theme) {
  const board = {
    cellSize: 34,
    cells: cells([
      [0, 0, { fill: alpha(theme.line, 0.12) }],
      [0, 1, { fill: alpha(theme.line, 0.12) }],
      [0, 2, { fill: alpha(theme.line, 0.12) }],
      [1, 2, { fill: alpha(theme.line, 0.12) }],
      [2, 2, { fill: alpha(theme.line, 0.12) }],
      [2, 3, { fill: alpha(theme.line, 0.12) }],
      [3, 3, { fill: alpha(theme.line, 0.12) }],
      [4, 3, { fill: alpha(theme.line, 0.12) }],
    ]),
    cols: 5,
    gap: 6,
    rows: 5,
    x: 238,
    y: 116,
  } satisfies GridSpec;

  return [
    drawBoard(theme, board),
    drawPolyomino(168, 96, 24, 4, [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ], theme.accentGlow),
    drawPolyomino(108, 296, 22, 4, [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ], alpha(theme.warning, 0.92)),
    drawPolyomino(114, 362, 22, 4, [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ], alpha(theme.info, 0.92)),
    arrow(182, 172, 226, 194, theme.textMuted, 5),
    chip(theme, 80, 238, 84, 42, "DROP", true),
  ].join("");
}

function drawPolyomino(x: number, y: number, cellSize: number, gap: number, shape: Array<[number, number]>, fill: string) {
  return shape
    .map(([colIndex, rowIndex]) =>
      rect(x + colIndex * (cellSize + gap), y + rowIndex * (cellSize + gap), cellSize, cellSize, {
        rx: Math.max(6, cellSize * 0.22),
        fill,
        stroke: alpha(fill, 0.6),
        "stroke-width": 1.2,
      }),
    )
    .join("");
}

function renderBounceAngle(theme: Theme) {
  return [
    card(theme, 62, 64, 388, 356),
    line(94, 88, 94, 388, { stroke: alpha(theme.line, 0.28), "stroke-width": 4 }),
    line(418, 88, 418, 388, { stroke: alpha(theme.line, 0.28), "stroke-width": 4 }),
    circle(164, 100, 18, { fill: alpha(theme.danger, 0.9) }),
    circle(256, 100, 18, { fill: alpha(theme.success, 0.94) }),
    circle(348, 100, 18, { fill: alpha(theme.danger, 0.9) }),
    pathElement("M156 342 L212 254 L136 182 L256 102", {
      fill: "none",
      stroke: theme.accentGlow,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": 10,
    }),
    circle(156, 342, 18, { fill: theme.warning }),
    chip(theme, 110, 388, 84, 40, "30"),
    chip(theme, 214, 388, 84, 40, "45", true),
    chip(theme, 318, 388, 84, 40, "60"),
  ].join("");
}

function renderCascadeFlip(theme: Theme) {
  return [
    ...[78, 162, 246, 330].map((x, index) =>
      card(theme, x, 68, 64, 88, {
        fill: index === 1 ? alpha(theme.accent, 0.26) : theme.cardAlt,
      }),
    ),
    text(110, 112, "1", { fill: theme.text, "font-size": 30 }),
    text(194, 112, "2", { fill: theme.text, "font-size": 30 }),
    text(278, 112, "3", { fill: theme.text, "font-size": 30 }),
    text(362, 112, "4", { fill: theme.text, "font-size": 30 }),
    drawBoard(theme, {
      cellSize: 54,
      cells: cells([
        [0, 1, { fill: alpha(theme.accent, 0.24), label: "2", labelColor: theme.text }],
        [1, 0, { label: "4", labelColor: theme.textMuted }],
        [1, 2, { label: "1", labelColor: theme.textMuted }],
        [2, 1, { label: "3", labelColor: theme.textMuted }],
      ]),
      cols: 3,
      gap: 14,
      rows: 3,
      x: 130,
      y: 214,
    }),
    arrow(376, 246, 430, 246, theme.info, 5),
    arrow(430, 246, 430, 312, theme.info, 5),
  ].join("");
}

function renderGapRush(theme: Theme) {
  return [
    card(theme, 168, 56, 176, 364),
    rect(200, 92, 112, 36, { rx: 18, fill: alpha(theme.line, 0.12) }),
    rect(200, 164, 56, 40, { rx: 18, fill: alpha(theme.danger, 0.84) }),
    rect(200, 238, 112, 40, { rx: 18, fill: alpha(theme.line, 0.12) }),
    rect(256, 312, 56, 40, { rx: 18, fill: alpha(theme.danger, 0.84) }),
    circle(256, 356, 18, { fill: theme.accentGlow }),
    chip(theme, 88, 388, 90, 42, "L1"),
    chip(theme, 211, 388, 90, 42, "L2", true),
    chip(theme, 334, 388, 90, 42, "L3"),
  ].join("");
}

function renderBoxFill(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 34,
      cells: cells([
        [1, 1, { fill: alpha(theme.accent, 0.18) }],
        [1, 2, { fill: alpha(theme.accent, 0.18) }],
        [2, 1, { fill: alpha(theme.accent, 0.18) }],
        [3, 3, { fill: alpha(theme.warning, 0.28) }],
        [3, 4, { fill: alpha(theme.warning, 0.28) }],
      ]),
      cols: 5,
      gap: 6,
      rows: 5,
      x: 236,
      y: 118,
    }),
    drawPolyomino(84, 132, 24, 4, [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ], theme.accentGlow),
    drawPolyomino(92, 228, 24, 4, [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ], alpha(theme.info, 0.92)),
    circle(340, 296, 12, { fill: "none", stroke: theme.warning, "stroke-width": 4 }),
    arrow(168, 218, 226, 218, theme.textMuted, 5),
  ].join("");
}

function renderBubbleSpawn(theme: Theme) {
  const bubbles = [
    circle(142, 178, 42, { fill: alpha(theme.accent, 0.42) }),
    circle(228, 156, 26, { fill: alpha(theme.info, 0.68) }),
    circle(316, 182, 34, { fill: alpha(theme.warning, 0.7) }),
    circle(360, 274, 48, { fill: alpha(theme.success, 0.42), stroke: alpha(theme.success, 0.9), "stroke-width": 5 }),
    circle(190, 286, 58, { fill: alpha(theme.danger, 0.4) }),
    circle(118, 306, 24, { fill: alpha(theme.info, 0.72) }),
  ];

  return [
    card(theme, 60, 72, 340, 308),
    ...bubbles,
    card(theme, 416, 116, 34, 210, { fill: alpha(theme.success, 0.16) }),
    rect(420, 178, 26, 112, { rx: 13, fill: alpha(theme.success, 0.88) }),
    card(theme, 52, 396, 124, 36, { fill: alpha(theme.info, 0.16) }),
    rect(58, 402, 74, 24, { rx: 12, fill: alpha(theme.info, 0.82) }),
    targetRing(360, 274, 64, theme.success),
  ].join("");
}

function renderCascadeClear(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 38,
      cells: cells([
        [0, 0, { fill: alpha(theme.danger, 0.68) }],
        [0, 1, { fill: alpha(theme.warning, 0.82) }],
        [0, 2, { fill: alpha(theme.info, 0.78) }],
        [1, 0, { fill: alpha(theme.success, 0.72) }],
        [1, 1, { fill: alpha(theme.info, 0.78) }],
        [1, 2, { fill: alpha(theme.warning, 0.82) }],
        [2, 0, { fill: alpha(theme.warning, 0.82) }],
        [2, 1, { fill: alpha(theme.success, 0.72) }],
        [2, 2, { fill: alpha(theme.danger, 0.68) }],
      ]),
      cols: 3,
      gap: 8,
      rows: 3,
      x: 188,
      y: 176,
    }),
    chip(theme, 178, 96, 54, 40, "R", true),
    chip(theme, 240, 96, 54, 40, "R"),
    chip(theme, 302, 96, 54, 40, "R"),
    chip(theme, 110, 170, 40, 54, "C", true),
    chip(theme, 110, 232, 40, 54, "C"),
    chip(theme, 110, 294, 40, 54, "C"),
  ].join("");
}

function renderChainTrigger(theme: Theme) {
  return [
    card(theme, 68, 90, 376, 300),
    arrow(146, 198, 220, 198, alpha(theme.line, 0.6), 5),
    arrow(256, 198, 332, 150, alpha(theme.line, 0.6), 5),
    arrow(256, 198, 332, 248, alpha(theme.line, 0.6), 5),
    circle(134, 198, 34, { fill: alpha(theme.success, 0.24), stroke: alpha(theme.success, 0.9), "stroke-width": 4 }),
    circle(256, 198, 30, { fill: alpha(theme.accent, 0.24), stroke: alpha(theme.accentSoft, 0.9), "stroke-width": 4 }),
    circle(356, 146, 28, { fill: alpha(theme.info, 0.24), stroke: alpha(theme.info, 0.9), "stroke-width": 4 }),
    circle(356, 250, 28, { fill: alpha(theme.warning, 0.24), stroke: alpha(theme.warning, 0.9), "stroke-width": 4 }),
    text(134, 198, "S", { fill: theme.text, "font-size": 28 }),
    text(256, 198, "+", { fill: theme.text, "font-size": 30 }),
  ].join("");
}

function renderIconChain(theme: Theme) {
  return [
    card(theme, 60, 70, 392, 96),
    iconShape("circle", 116, 118, 20, theme.accentGlow),
    arrow(144, 118, 208, 118, theme.textMuted, 4),
    iconShape("diamond", 236, 118, 20, theme.warning),
    arrow(264, 118, 328, 118, theme.textMuted, 4),
    iconShape("triangle", 356, 118, 20, theme.info),
    card(theme, 78, 210, 104, 154),
    card(theme, 204, 210, 104, 154, { fill: alpha(theme.accent, 0.2) }),
    card(theme, 330, 210, 104, 154),
    iconShape("circle", 130, 264, 18, theme.accentGlow),
    iconShape("diamond", 256, 264, 18, theme.warning),
    iconShape("triangle", 382, 264, 18, theme.info),
    text(130, 320, "1", { fill: theme.textMuted, "font-size": 28 }),
    text(256, 320, "2", { fill: theme.text, "font-size": 28 }),
    text(382, 320, "3", { fill: theme.textMuted, "font-size": 28 }),
  ].join("");
}

function renderLineConnect(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 50,
      cells: cells([
        [0, 0, { extra: targetRing(126, 144, 16, theme.info) }],
        [0, 3, { extra: targetRing(294, 144, 16, theme.warning) }],
        [3, 0, { extra: targetRing(126, 312, 16, theme.info) }],
        [3, 3, { extra: targetRing(294, 312, 16, theme.warning) }],
      ]),
      cols: 4,
      gap: 6,
      rows: 4,
      x: 100,
      y: 118,
    }),
    pathElement("M126 144 L180 144 L180 222 L238 222 L238 312 L294 312", {
      fill: "none",
      stroke: theme.accentGlow,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": 10,
    }),
  ].join("");
}

function renderMergeClimb(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 50,
      cells: cells([
        [0, 0, { label: "2", fill: alpha(theme.warning, 0.28), labelColor: theme.text }],
        [0, 1, { label: "4", fill: alpha(theme.info, 0.24), labelColor: theme.text }],
        [1, 1, { label: "8", fill: alpha(theme.accent, 0.22), labelColor: theme.text }],
        [2, 2, { label: "16", fill: alpha(theme.success, 0.22), labelColor: theme.text, labelSize: 18 }],
        [3, 3, { label: "32", fill: alpha(theme.warning, 0.32), labelColor: theme.text, labelSize: 18 }],
      ]),
      cols: 4,
      gap: 8,
      rows: 4,
      x: 90,
      y: 112,
    }),
    chip(theme, 370, 134, 64, 42, "UP"),
    chip(theme, 370, 188, 64, 42, "RT", true),
    chip(theme, 370, 242, 64, 42, "DN"),
    chip(theme, 370, 296, 64, 42, "NX"),
  ].join("");
}

function renderRelativePitch(theme: Theme) {
  return [
    card(theme, 152, 78, 208, 142),
    circle(256, 132, 30, { fill: alpha(theme.accent, 0.24), stroke: alpha(theme.accentSoft, 0.8), "stroke-width": 4 }),
    pathElement("M292 132 C310 118 316 108 326 90", { fill: "none", stroke: theme.textMuted, "stroke-width": 4, "stroke-linecap": "round" }),
    pathElement("M294 132 C320 120 334 106 348 78", { fill: "none", stroke: theme.textMuted, "stroke-width": 4, "stroke-linecap": "round" }),
    chip(theme, 84, 282, 110, 54, "LOW"),
    chip(theme, 201, 282, 110, 54, "SAME", true),
    chip(theme, 318, 282, 110, 54, "HIGH"),
    chip(theme, 201, 346, 110, 54, "REPLAY"),
  ].join("");
}

function renderColorSweep(theme: Theme) {
  return [
    chip(theme, 80, 72, 132, 46, "TARGET", true),
    rect(228, 72, 64, 46, { rx: 20, fill: theme.accentGlow }),
    drawBoard(theme, {
      baseFill: theme.gridBase,
      cellSize: 62,
      cells: cells([
        [0, 0, { fill: theme.accentGlow }],
        [0, 1, { fill: "#f97316" }],
        [0, 2, { fill: "#22c55e" }],
        [1, 0, { fill: "#38bdf8" }],
        [1, 1, { fill: theme.accentGlow }],
        [1, 2, { fill: "#f43f5e" }],
        [2, 0, { fill: "#f59e0b" }],
        [2, 1, { fill: "#8b5cf6" }],
        [2, 2, { fill: theme.accentGlow }],
      ]),
      cols: 3,
      gap: 10,
      rows: 3,
      x: 142,
      y: 154,
    }),
  ].join("");
}

function renderColorCensus(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 44,
      cells: cells([
        [0, 0, { fill: "#f97316" }],
        [0, 1, { fill: "#22c55e" }],
        [0, 2, { fill: "#f97316" }],
        [0, 3, { fill: "#ec4899" }],
        [1, 0, { fill: "#22c55e" }],
        [1, 1, { fill: "#f97316" }],
        [1, 2, { fill: "#38bdf8" }],
        [1, 3, { fill: "#f97316" }],
        [2, 0, { fill: "#f97316" }],
        [2, 1, { fill: "#ec4899" }],
        [2, 2, { fill: "#f97316" }],
        [2, 3, { fill: "#22c55e" }],
      ]),
      cols: 4,
      gap: 8,
      rows: 3,
      x: 78,
      y: 176,
    }),
    card(theme, 318, 118, 124, 120, { fill: alpha(theme.accent, 0.18) }),
    text(380, 154, "MOST", { fill: theme.text, "font-size": 28 }),
    chip(theme, 338, 186, 84, 34, "OR?", true),
  ].join("");
}

function renderFlipMatch(theme: Theme) {
  return drawDualBoards(theme, {
    left: cells([
      [0, 0, { fill: alpha(theme.accent, 0.26) }],
      [1, 1, { fill: alpha(theme.accent, 0.26) }],
      [2, 2, { fill: alpha(theme.accent, 0.26) }],
    ]),
    right: cells([
      [0, 0, { fill: alpha(theme.accent, 0.26) }],
      [1, 0, { fill: alpha(theme.accent, 0.26) }],
      [1, 1, { fill: alpha(theme.accent, 0.26) }],
      [1, 2, { fill: alpha(theme.accent, 0.26) }],
    ]),
  });
}

function drawDualBoards(theme: Theme, options: { left: Record<string, CellStyle>; right: Record<string, CellStyle> }) {
  return [
    drawBoard(theme, { cellSize: 36, cells: options.left, cols: 3, gap: 8, rows: 3, x: 92, y: 160 }),
    drawBoard(theme, { cellSize: 36, cells: options.right, cols: 3, gap: 8, rows: 3, x: 290, y: 160 }),
    arrow(232, 220, 280, 220, theme.info, 6),
  ].join("");
}

function renderPositionLock(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 48,
      cells: cells([
        [0, 1, { extra: circle(180, 136, 16, { fill: "none", stroke: alpha(theme.accent, 0.52), "stroke-width": 4 }) }],
        [1, 2, { extra: circle(236, 192, 16, { fill: "none", stroke: alpha(theme.info, 0.52), "stroke-width": 4 }) }],
        [2, 1, { extra: circle(180, 248, 16, { fill: "none", stroke: alpha(theme.warning, 0.52), "stroke-width": 4 }) }],
        [3, 3, { extra: circle(292, 304, 16, { fill: "none", stroke: alpha(theme.success, 0.52), "stroke-width": 4 }) }],
      ]),
      cols: 4,
      gap: 8,
      rows: 4,
      x: 100,
      y: 112,
    }),
    circle(124, 304, 18, { fill: theme.accentGlow }),
    circle(236, 136, 18, { fill: theme.info }),
    circle(292, 248, 18, { fill: theme.warning }),
    text(124, 304, "1", { fill: theme.text, "font-size": 20 }),
    text(236, 136, "2", { fill: theme.text, "font-size": 20 }),
    text(292, 248, "3", { fill: theme.text, "font-size": 20 }),
  ].join("");
}

function renderPhaseLock(theme: Theme) {
  return [
    circle(256, 256, 122, { fill: "none", stroke: alpha(theme.line, 0.16), "stroke-width": 28 }),
    circle(256, 256, 82, { fill: "none", stroke: alpha(theme.line, 0.16), "stroke-width": 28 }),
    circle(256, 256, 42, { fill: "none", stroke: alpha(theme.line, 0.16), "stroke-width": 28 }),
    pathElement("M256 106 A150 150 0 0 1 354 144", {
      fill: "none",
      stroke: theme.accentGlow,
      "stroke-linecap": "round",
      "stroke-width": 20,
    }),
    pathElement("M174 322 A98 98 0 0 0 338 322", {
      fill: "none",
      stroke: theme.info,
      "stroke-linecap": "round",
      "stroke-width": 18,
    }),
    pathElement("M230 256 A54 54 0 0 1 282 256", {
      fill: "none",
      stroke: theme.warning,
      "stroke-linecap": "round",
      "stroke-width": 16,
    }),
    circle(256, 134, 10, { fill: theme.text }),
    circle(338, 322, 10, { fill: theme.text }),
    circle(282, 256, 10, { fill: theme.text }),
  ].join("");
}

function renderSyncPulse(theme: Theme) {
  return [
    circle(170, 224, 72, { fill: "none", stroke: alpha(theme.info, 0.42), "stroke-width": 10 }),
    circle(342, 224, 72, { fill: "none", stroke: alpha(theme.accent, 0.42), "stroke-width": 10 }),
    circle(170, 224, 22, { fill: theme.info }),
    circle(342, 224, 22, { fill: theme.accentGlow }),
    rect(210, 330, 92, 48, { rx: 24, fill: alpha(theme.success, 0.24), stroke: alpha(theme.success, 0.82), "stroke-width": 3 }),
    arrow(206, 224, 248, 330, theme.textMuted, 5),
    arrow(306, 330, 306, 252, theme.textMuted, 5),
  ].join("");
}

function renderGlowCycle(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 58,
      cells: cells([
        [0, 0, { extra: circle(131, 161, 10, { fill: theme.textMuted }) }],
        [0, 1, { extra: circle(197, 161, 10, { fill: theme.textMuted }) }],
        [0, 2, { extra: circle(263, 161, 10, { fill: theme.textMuted }) }],
        [1, 0, { extra: circle(131, 227, 10, { fill: theme.textMuted }) }],
        [1, 1, { extra: circle(197, 227, 15, { fill: theme.accentGlow }) }],
        [1, 2, { extra: circle(263, 227, 10, { fill: theme.textMuted }) }],
        [2, 0, { extra: circle(131, 293, 10, { fill: theme.textMuted }) }],
        [2, 1, { extra: circle(197, 293, 10, { fill: theme.textMuted }) }],
        [2, 2, { extra: circle(263, 293, 10, { fill: theme.textMuted }) }],
      ]),
      cols: 3,
      gap: 8,
      rows: 3,
      x: 102,
      y: 132,
    }),
    card(theme, 334, 162, 72, 176, { fill: alpha(theme.success, 0.14) }),
    rect(346, 220, 48, 96, { rx: 18, fill: alpha(theme.success, 0.86) }),
  ].join("");
}

function renderTempoHold(theme: Theme) {
  return [
    card(theme, 82, 146, 348, 96),
    rect(114, 182, 284, 22, { rx: 11, fill: alpha(theme.line, 0.18) }),
    rect(238, 172, 70, 42, { rx: 21, fill: alpha(theme.success, 0.26), stroke: alpha(theme.success, 0.92), "stroke-width": 3 }),
    rect(124, 176, 200, 34, { rx: 17, fill: alpha(theme.accent, 0.8) }),
    circle(324, 193, 16, { fill: theme.text }),
    chip(theme, 160, 294, 192, 46, "HOLD", true),
  ].join("");
}

function renderTempoWeave(theme: Theme) {
  return [
    card(theme, 88, 96, 132, 278),
    card(theme, 292, 96, 132, 278),
    rect(116, 220, 76, 22, { rx: 11, fill: alpha(theme.info, 0.26) }),
    rect(320, 186, 76, 22, { rx: 11, fill: alpha(theme.accent, 0.26) }),
    rect(152, 142, 20, 90, { rx: 10, fill: theme.info }),
    rect(356, 154, 20, 90, { rx: 10, fill: theme.accentGlow }),
    arrow(220, 235, 292, 197, theme.textMuted, 5),
  ].join("");
}

function renderTapSafe(theme: Theme) {
  return [
    card(theme, 60, 110, 392, 256),
    circle(116, 206, 28, { fill: alpha(theme.success, 0.88) }),
    circle(192, 170, 24, { fill: alpha(theme.success, 0.88) }),
    circle(260, 224, 30, { fill: alpha(theme.danger, 0.9) }),
    circle(340, 180, 26, { fill: alpha(theme.success, 0.88) }),
    diamond(404, 240, 28, { fill: alpha(theme.danger, 0.9) }),
    line(244, 208, 276, 240, { stroke: theme.text, "stroke-width": 5, "stroke-linecap": "round" }),
    line(276, 208, 244, 240, { stroke: theme.text, "stroke-width": 5, "stroke-linecap": "round" }),
    chip(theme, 86, 384, 150, 44, "SAFE", true),
    chip(theme, 276, 384, 150, 44, "AVOID"),
  ].join("");
}

function renderRotateAlign(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 54,
      cells: cells([
        [0, 0, { extra: pathElement("M112 146 L146 146 L146 180", { fill: "none", stroke: theme.textMuted, "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round" }) }],
        [0, 1, { extra: pathElement("M174 146 L174 180", { fill: "none", stroke: theme.textMuted, "stroke-width": 8, "stroke-linecap": "round" }) }],
        [0, 2, { extra: pathElement("M236 146 L236 180 L270 180", { fill: "none", stroke: theme.textMuted, "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round" }) }],
        [1, 2, { fill: alpha(theme.accent, 0.18), extra: pathElement("M236 210 L270 210 L270 244", { fill: "none", stroke: theme.accentGlow, "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round" }) }],
        [2, 2, { extra: pathElement("M270 274 L270 308", { fill: "none", stroke: theme.textMuted, "stroke-width": 8, "stroke-linecap": "round" }) }],
      ]),
      cols: 3,
      gap: 8,
      rows: 3,
      x: 94,
      y: 128,
    }),
    circle(112, 146, 10, { fill: theme.success }),
    circle(270, 308, 10, { fill: theme.warning }),
    chip(theme, 352, 198, 72, 52, "ROT", true),
  ].join("");
}

function renderSpinnerAim(theme: Theme) {
  return [
    circle(256, 236, 126, { fill: "none", stroke: alpha(theme.line, 0.18), "stroke-width": 26 }),
    pathElement("M182 130 A126 126 0 0 1 330 132", {
      fill: "none",
      stroke: theme.success,
      "stroke-linecap": "round",
      "stroke-width": 22,
    }),
    pathElement("M154 274 A126 126 0 0 0 208 344", {
      fill: "none",
      stroke: theme.danger,
      "stroke-linecap": "round",
      "stroke-width": 22,
    }),
    line(256, 236, 348, 164, { stroke: theme.accentGlow, "stroke-linecap": "round", "stroke-width": 8 }),
    circle(256, 236, 16, { fill: theme.text }),
    chip(theme, 194, 392, 124, 44, "AIM", true),
  ].join("");
}

function renderMinesweeper(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 42,
      cells: cells([
        [0, 0, { fill: "#cbd5e1", label: "1", labelColor: theme.info }],
        [0, 1, { fill: "#e2e8f0", label: "1", labelColor: theme.success }],
        [0, 2, { fill: theme.gridBase }],
        [1, 0, { fill: "#e2e8f0", label: "2", labelColor: theme.warning }],
        [1, 1, { fill: "#cbd5e1", extra: text(191, 191, "*", { fill: theme.danger, "font-size": 30 }) }],
        [1, 2, { fill: theme.gridBase }],
        [2, 0, { fill: "#cbd5e1", label: "1", labelColor: theme.info }],
        [2, 1, { fill: "#e2e8f0", label: "2", labelColor: theme.warning }],
        [2, 2, { fill: theme.gridBase, extra: text(239, 239, "F", { fill: theme.accentGlow, "font-size": 24 }) }],
      ]),
      cols: 6,
      gap: 4,
      rows: 6,
      x: 106,
      y: 94,
    }),
  ].join("");
}

function renderNumberChain(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 62,
      cells: cells([
        [0, 0, { label: "1", fill: alpha(theme.accent, 0.24), labelColor: theme.text }],
        [1, 0, { label: "2", fill: alpha(theme.info, 0.22), labelColor: theme.text }],
        [1, 1, { label: "3", fill: alpha(theme.warning, 0.22), labelColor: theme.text }],
        [2, 1, { label: "4", fill: alpha(theme.success, 0.22), labelColor: theme.text }],
      ]),
      cols: 3,
      gap: 10,
      rows: 3,
      x: 118,
      y: 118,
    }),
    pathElement("M149 149 L149 221 L221 221 L221 293", {
      fill: "none",
      stroke: theme.textMuted,
      "stroke-dasharray": "10 12",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": 6,
    }),
  ].join("");
}

function renderOrbitTap(theme: Theme) {
  return [
    circle(256, 236, 126, { fill: "none", stroke: alpha(theme.line, 0.18), "stroke-width": 28 }),
    pathElement("M208 118 A126 126 0 0 1 304 118", {
      fill: "none",
      stroke: theme.success,
      "stroke-linecap": "round",
      "stroke-width": 22,
    }),
    circle(326, 336, 18, { fill: theme.accentGlow }),
    circle(256, 236, 12, { fill: theme.text }),
    line(256, 236, 326, 336, { stroke: alpha(theme.accent, 0.72), "stroke-width": 5, "stroke-linecap": "round" }),
  ].join("");
}

function renderPathRecall(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 46,
      cells: cells([
        [0, 0, { fill: alpha(theme.accent, 0.22) }],
        [0, 1, { fill: alpha(theme.accent, 0.22) }],
        [1, 1, { fill: alpha(theme.accent, 0.22) }],
        [2, 1, { fill: alpha(theme.accent, 0.22) }],
        [2, 2, { fill: alpha(theme.accent, 0.22) }],
        [3, 2, { fill: alpha(theme.accent, 0.22) }],
      ]),
      cols: 4,
      gap: 8,
      rows: 4,
      x: 114,
      y: 116,
    }),
    pathElement("M137 139 L191 139 L191 193 L191 247 L245 247 L245 301", {
      fill: "none",
      stroke: theme.accentGlow,
      "stroke-dasharray": "12 10",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": 8,
    }),
  ].join("");
}

function renderPairFlip(theme: Theme) {
  return [
    ...[
      [88, 118, false],
      [212, 118, true],
      [336, 118, false],
      [150, 254, true],
      [274, 254, false],
    ].map(([x, y, faceUp]) =>
      card(theme, Number(x), Number(y), 86, 118, {
        fill: faceUp ? alpha(theme.accent, 0.22) : theme.cardAlt,
      }),
    ),
    iconShape("diamond", 255, 176, 20, theme.accentGlow),
    iconShape("diamond", 193, 312, 20, theme.accentGlow),
    text(131, 178, "?", { fill: theme.textMuted, "font-size": 36 }),
    text(379, 178, "?", { fill: theme.textMuted, "font-size": 36 }),
    text(317, 312, "?", { fill: theme.textMuted, "font-size": 36 }),
  ].join("");
}

function renderPatternEcho(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 78,
      cells: cells([
        [0, 0, { fill: "#38bdf8", label: "1", labelColor: theme.text }],
        [1, 1, { fill: "#f59e0b", label: "2", labelColor: theme.text }],
        [2, 2, { fill: "#ec4899", label: "3", labelColor: theme.text }],
      ]),
      cols: 3,
      gap: 10,
      rows: 3,
      x: 114,
      y: 98,
    }),
  ].join("");
}

function renderSequencePoint(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 50,
      cells: cells([
        [0, 1, { extra: targetRing(177, 141, 14, theme.accentGlow) }],
        [1, 2, { extra: targetRing(235, 199, 14, theme.info) }],
        [2, 1, { extra: targetRing(177, 257, 14, theme.warning) }],
        [3, 2, { extra: targetRing(235, 315, 14, theme.success) }],
      ]),
      cols: 4,
      gap: 8,
      rows: 4,
      x: 90,
      y: 112,
    }),
    pathElement("M177 141 L235 199 L177 257 L235 315", {
      fill: "none",
      stroke: theme.textMuted,
      "stroke-dasharray": "8 10",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": 6,
    }),
  ].join("");
}

function renderHueDrift(theme: Theme) {
  return [
    ...["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e"].map((fill, index) =>
      rect(68 + index * 76, 118, 58, 124, {
        rx: 20,
        fill,
        stroke: index === 2 ? alpha(theme.text, 0.8) : alpha(theme.line, 0.2),
        "stroke-width": index === 2 ? 4 : 1.5,
        opacity: index === 2 ? 0.28 : 1,
      }),
    ),
    chip(theme, 92, 308, 72, 44, "A"),
    chip(theme, 176, 308, 72, 44, "B", true),
    chip(theme, 260, 308, 72, 44, "C"),
    chip(theme, 344, 308, 72, 44, "D"),
  ].join("");
}

function renderPrecisionDrop(theme: Theme) {
  return [
    card(theme, 196, 66, 120, 322),
    rect(238, 100, 36, 244, { rx: 18, fill: alpha(theme.line, 0.12) }),
    circle(256, 154, 18, { fill: theme.accentGlow }),
    rect(214, 300, 84, 14, { rx: 7, fill: alpha(theme.success, 0.88) }),
    targetRing(256, 307, 36, theme.success),
  ].join("");
}

function renderPulseCount(theme: Theme) {
  return [
    circle(256, 176, 42, { fill: theme.accentGlow }),
    circle(256, 176, 76, { fill: "none", stroke: alpha(theme.accent, 0.44), "stroke-width": 8 }),
    circle(256, 176, 108, { fill: "none", stroke: alpha(theme.accent, 0.26), "stroke-width": 8 }),
    chip(theme, 114, 320, 80, 48, "2"),
    chip(theme, 216, 320, 80, 48, "3", true),
    chip(theme, 318, 320, 80, 48, "4"),
  ].join("");
}

function renderQuickSum(theme: Theme) {
  return [
    card(theme, 112, 92, 288, 122, { fill: alpha(theme.accent, 0.2) }),
    text(256, 154, "8 + 5 = ?", { fill: theme.text, "font-size": 46 }),
    chip(theme, 78, 288, 84, 46, "12"),
    chip(theme, 176, 288, 84, 46, "13", true),
    chip(theme, 274, 288, 84, 46, "14"),
    chip(theme, 372, 288, 84, 46, "15"),
  ].join("");
}

function renderShapeMorph(theme: Theme) {
  return [
    card(theme, 56, 82, 400, 122),
    iconShape("square", 116, 144, 22, theme.textMuted),
    arrow(144, 144, 196, 144, theme.textMuted, 4),
    iconShape("diamond", 228, 144, 24, theme.textMuted),
    arrow(256, 144, 308, 144, theme.textMuted, 4),
    polygon(
      [
        [338, 118],
        [370, 118],
        [392, 144],
        [370, 170],
        [338, 170],
        [320, 144],
      ],
      { fill: theme.accentGlow },
    ),
    chip(theme, 72, 286, 84, 54, "A"),
    chip(theme, 170, 286, 84, 54, "B"),
    chip(theme, 268, 286, 84, 54, "C", true),
    chip(theme, 366, 286, 84, 54, "D"),
  ].join("");
}

function renderSumGrid(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 62,
      cells: cells([
        [0, 0, { label: "4", labelColor: theme.textMuted }],
        [0, 1, { label: "1", labelColor: theme.textMuted }],
        [1, 1, { label: "3", labelColor: theme.text }],
        [2, 0, { label: "2", labelColor: theme.textMuted }],
      ]),
      cols: 3,
      gap: 8,
      rows: 3,
      x: 110,
      y: 120,
    }),
    chip(theme, 332, 136, 70, 42, "9", true),
    chip(theme, 332, 206, 70, 42, "8"),
    chip(theme, 332, 276, 70, 42, "7"),
    chip(theme, 132, 336, 70, 42, "6"),
    chip(theme, 206, 336, 70, 42, "8", true),
    chip(theme, 280, 336, 70, 42, "10"),
  ].join("");
}

function renderSwapSolve(theme: Theme) {
  return [
    drawBoard(theme, { cellSize: 36, cells: cells([[0, 1, { fill: alpha(theme.accent, 0.26) }], [2, 2, { fill: alpha(theme.info, 0.22) }]]), cols: 3, gap: 8, rows: 3, x: 92, y: 160 }),
    drawBoard(theme, { cellSize: 36, cells: cells([[0, 1, { fill: alpha(theme.info, 0.22) }], [2, 2, { fill: alpha(theme.accent, 0.26) }]]), cols: 3, gap: 8, rows: 3, x: 290, y: 160 }),
    arrow(228, 208, 280, 208, theme.textMuted, 5),
    arrow(280, 248, 228, 248, theme.textMuted, 5),
  ].join("");
}

function renderSymbolHunt(theme: Theme) {
  return [
    chip(theme, 64, 76, 98, 46, "FIND", true),
    card(theme, 180, 70, 72, 58, { fill: alpha(theme.accent, 0.2) }),
    iconShape("triangle", 216, 100, 16, theme.accentGlow),
    drawBoard(theme, {
      cellSize: 56,
      cells: cells([
        [0, 0, { extra: iconShape("circle", 124, 180, 12, theme.textMuted) }],
        [0, 1, { extra: iconShape("triangle", 188, 180, 12, theme.textMuted) }],
        [0, 2, { extra: iconShape("diamond", 252, 180, 12, theme.textMuted) }],
        [1, 0, { extra: iconShape("square", 124, 244, 12, theme.textMuted) }],
        [1, 1, { extra: iconShape("triangle", 188, 244, 14, theme.accentGlow) }],
        [1, 2, { extra: iconShape("circle", 252, 244, 12, theme.textMuted) }],
        [2, 0, { extra: iconShape("ring", 124, 308, 12, theme.textMuted) }],
        [2, 1, { extra: iconShape("square", 188, 308, 12, theme.textMuted) }],
        [2, 2, { extra: iconShape("diamond", 252, 308, 12, theme.textMuted) }],
      ]),
      cols: 3,
      gap: 8,
      rows: 3,
      x: 96,
      y: 152,
    }),
    targetRing(188, 244, 28, theme.accentGlow),
  ].join("");
}

function renderHiddenFind(theme: Theme) {
  return [
    chip(theme, 66, 70, 110, 48, "TARGET", true),
    card(theme, 194, 64, 88, 60, { fill: alpha(theme.accent, 0.2) }),
    iconShape("diamond", 238, 94, 14, theme.accentGlow),
    iconShape("triangle", 238, 110, 8, theme.textMuted),
    drawBoard(theme, {
      cellSize: 48,
      cells: cells([
        [0, 0, { extra: group(iconShape("diamond", 120, 176, 10, theme.textMuted) + iconShape("triangle", 120, 190, 6, theme.textMuted)) }],
        [0, 1, { extra: group(iconShape("circle", 176, 176, 10, theme.textMuted) + iconShape("triangle", 176, 190, 6, theme.textMuted)) }],
        [0, 2, { extra: group(iconShape("diamond", 232, 176, 10, theme.textMuted) + iconShape("square", 232, 190, 6, theme.textMuted)) }],
        [1, 0, { extra: group(iconShape("square", 120, 232, 10, theme.textMuted) + iconShape("triangle", 120, 246, 6, theme.textMuted)) }],
        [1, 1, { extra: group(iconShape("diamond", 176, 232, 10, theme.accentGlow) + iconShape("triangle", 176, 246, 6, theme.textMuted)) }],
        [1, 2, { extra: group(iconShape("circle", 232, 232, 10, theme.textMuted) + iconShape("square", 232, 246, 6, theme.textMuted)) }],
        [2, 0, { extra: group(iconShape("diamond", 120, 288, 10, theme.textMuted) + iconShape("circle", 120, 302, 6, theme.textMuted)) }],
        [2, 1, { extra: group(iconShape("square", 176, 288, 10, theme.textMuted) + iconShape("triangle", 176, 302, 6, theme.textMuted)) }],
        [2, 2, { extra: group(iconShape("ring", 232, 288, 10, theme.textMuted) + iconShape("triangle", 232, 302, 6, theme.textMuted)) }],
      ]),
      cols: 3,
      gap: 8,
      rows: 3,
      x: 92,
      y: 148,
    }),
    targetRing(176, 232, 28, theme.accentGlow),
  ].join("");
}

function renderSpotChange(theme: Theme) {
  return [
    drawBoard(theme, { cellSize: 36, cells: cells([[0, 0, { fill: alpha(theme.warning, 0.24) }], [1, 1, { fill: alpha(theme.info, 0.22) }], [2, 0, { fill: alpha(theme.success, 0.22) }]]), cols: 3, gap: 8, rows: 3, x: 92, y: 160 }),
    drawBoard(theme, { cellSize: 36, cells: cells([[0, 0, { fill: alpha(theme.warning, 0.24) }], [1, 1, { fill: alpha(theme.danger, 0.32) }], [2, 0, { fill: alpha(theme.success, 0.22) }]]), cols: 3, gap: 8, rows: 3, x: 290, y: 160 }),
    targetRing(352, 220, 30, theme.danger),
  ].join("");
}

function renderSudoku(theme: Theme) {
  const cellsMarkup: string[] = [];
  const cellSize = 32;
  const boardX = 110;
  const boardY = 98;

  cellsMarkup.push(card(theme, boardX - 18, boardY - 18, 312, 312));

  for (let rowIndex = 0; rowIndex < 9; rowIndex += 1) {
    for (let colIndex = 0; colIndex < 9; colIndex += 1) {
      const x = boardX + colIndex * cellSize;
      const y = boardY + rowIndex * cellSize;
      cellsMarkup.push(
        rect(x, y, cellSize, cellSize, {
          fill: (rowIndex + colIndex) % 2 === 0 ? theme.gridBase : alpha(theme.line, 0.06),
          stroke: alpha(theme.line, 0.14),
          "stroke-width": 1,
        }),
      );
    }
  }

  for (let index = 0; index <= 9; index += 1) {
    const strokeWidth = index % 3 === 0 ? 3 : 1;
    cellsMarkup.push(line(boardX + index * cellSize, boardY, boardX + index * cellSize, boardY + 288, { stroke: alpha(theme.line, 0.38), "stroke-width": strokeWidth }));
    cellsMarkup.push(line(boardX, boardY + index * cellSize, boardX + 288, boardY + index * cellSize, { stroke: alpha(theme.line, 0.38), "stroke-width": strokeWidth }));
  }

  cellsMarkup.push(text(boardX + 16, boardY + 16, "5", { fill: theme.text, "font-size": 20 }));
  cellsMarkup.push(text(boardX + 80, boardY + 48, "3", { fill: theme.text, "font-size": 20 }));
  cellsMarkup.push(text(boardX + 176, boardY + 80, "7", { fill: theme.text, "font-size": 20 }));
  cellsMarkup.push(text(boardX + 240, boardY + 144, "1", { fill: theme.textMuted, "font-size": 20 }));
  cellsMarkup.push(text(boardX + 112, boardY + 208, "9", { fill: theme.textMuted, "font-size": 20 }));
  cellsMarkup.push(text(boardX + 208, boardY + 240, "4", { fill: theme.text, "font-size": 20 }));

  return cellsMarkup.join("");
}

function renderTargetTrail(theme: Theme) {
  return [
    drawBoard(theme, {
      cellSize: 46,
      cells: cells([
        [0, 0, { fill: alpha(theme.accent, 0.18) }],
        [1, 0, { fill: alpha(theme.accent, 0.18) }],
        [1, 1, { fill: alpha(theme.accent, 0.18) }],
        [2, 1, { fill: alpha(theme.accent, 0.18) }],
        [2, 2, { fill: alpha(theme.accent, 0.18) }],
        [3, 2, { fill: alpha(theme.accent, 0.18) }],
        [3, 3, { fill: alpha(theme.warning, 0.28), extra: targetRing(281, 299, 16, theme.warning) }],
      ]),
      cols: 4,
      gap: 8,
      rows: 4,
      x: 110,
      y: 118,
    }),
  ].join("");
}

function renderLightGrid(theme: Theme) {
  return drawDualBoards(theme, {
    left: cells([
      [0, 1, { fill: alpha(theme.accent, 0.26) }],
      [1, 0, { fill: alpha(theme.accent, 0.26) }],
      [1, 2, { fill: alpha(theme.accent, 0.26) }],
      [2, 1, { fill: alpha(theme.accent, 0.26) }],
    ]),
    right: cells([
      [0, 1, { fill: alpha(theme.accent, 0.26) }],
      [1, 0, { fill: alpha(theme.accent, 0.26) }],
      [1, 1, { fill: alpha(theme.accent, 0.26) }],
      [1, 2, { fill: alpha(theme.accent, 0.26) }],
      [2, 1, { fill: alpha(theme.accent, 0.26) }],
    ]),
  });
}

function renderTileShift(theme: Theme) {
  return [
    drawBoard(theme, { cellSize: 36, cells: cells([[0, 0, { fill: alpha(theme.accent, 0.24) }], [1, 1, { fill: alpha(theme.info, 0.2) }], [2, 2, { fill: alpha(theme.warning, 0.22) }]]), cols: 3, gap: 8, rows: 3, x: 80, y: 164 }),
    drawBoard(theme, { cellSize: 36, cells: cells([[0, 1, { fill: alpha(theme.accent, 0.24) }], [1, 2, { fill: alpha(theme.info, 0.2) }], [2, 0, { fill: alpha(theme.warning, 0.22) }]]), cols: 3, gap: 8, rows: 3, x: 254, y: 164 }),
    chip(theme, 390, 176, 42, 38, "R", true),
    chip(theme, 390, 224, 42, 38, "C"),
  ].join("");
}

function renderTileInstant(theme: Theme) {
  return [
    drawBoard(theme, { cellSize: 36, cells: cells([[0, 0, { fill: alpha(theme.accent, 0.24) }], [0, 1, { fill: alpha(theme.info, 0.22) }], [1, 1, { fill: alpha(theme.warning, 0.22) }], [2, 2, { fill: alpha(theme.success, 0.22) }]]), cols: 3, gap: 8, rows: 3, x: 80, y: 164 }),
    drawBoard(theme, { cellSize: 36, cells: cells([[0, 2, { fill: alpha(theme.accent, 0.24) }], [1, 0, { fill: alpha(theme.info, 0.22) }], [1, 2, { fill: alpha(theme.warning, 0.22) }], [2, 1, { fill: alpha(theme.success, 0.22) }]]), cols: 3, gap: 8, rows: 3, x: 254, y: 164 }),
    pathElement("M212 154 L256 136 L300 154", { fill: "none", stroke: theme.textMuted, "stroke-dasharray": "8 8", "stroke-linecap": "round", "stroke-width": 4 }),
  ].join("");
}

function renderZoneLock(theme: Theme) {
  return [
    drawBoard(theme, { cellSize: 52, cells: cells([]), cols: 4, gap: 8, rows: 4, x: 102, y: 104 }),
    rect(136, 138, 120, 120, { rx: 22, fill: alpha(theme.info, 0.22) }),
    rect(214, 188, 126, 120, { rx: 22, fill: alpha(theme.accent, 0.22) }),
    chip(theme, 370, 156, 56, 40, "2", true),
    chip(theme, 370, 212, 56, 40, "3"),
    chip(theme, 370, 268, 56, 40, "1"),
  ].join("");
}

function renderStackSort(theme: Theme) {
  return [
    ...[96, 176, 256, 336].map((x) => card(theme, x, 118, 56, 222, { fill: alpha(theme.line, 0.08) })),
    circle(124, 310, 18, { fill: "#fb7185" }),
    circle(124, 266, 18, { fill: "#f59e0b" }),
    circle(204, 310, 18, { fill: "#38bdf8" }),
    circle(204, 266, 18, { fill: "#fb7185" }),
    circle(284, 310, 18, { fill: "#f59e0b" }),
    circle(284, 266, 18, { fill: "#38bdf8" }),
  ].join("");
}

function renderMirrorMatch(theme: Theme) {
  return [
    drawBoard(theme, { cellSize: 36, cells: cells([[0, 0, { fill: alpha(theme.accent, 0.24) }], [1, 1, { fill: alpha(theme.accent, 0.24) }], [2, 2, { fill: alpha(theme.accent, 0.24) }]]), cols: 3, gap: 8, rows: 3, x: 80, y: 164 }),
    drawBoard(theme, { cellSize: 36, cells: cells([[0, 2, { fill: alpha(theme.accent, 0.24) }], [1, 1, { fill: alpha(theme.accent, 0.24) }], [2, 0, { fill: alpha(theme.accent, 0.24) }]]), cols: 3, gap: 8, rows: 3, x: 254, y: 164 }),
    line(332, 150, 332, 310, { stroke: alpha(theme.line, 0.6), "stroke-dasharray": "8 8", "stroke-width": 4 }),
  ].join("");
}

const sceneByGameKey: Record<string, SceneRenderer> = {
  "beat-match": renderBeatMatch,
  "block-tessellate": renderBlockTessellate,
  "bounce-angle": renderBounceAngle,
  "box-fill": renderBoxFill,
  "bubble-spawn": renderBubbleSpawn,
  "cascade-clear": renderCascadeClear,
  "cascade-flip": renderCascadeFlip,
  "chain-trigger": renderChainTrigger,
  "color-census": renderColorCensus,
  "color-sweep": renderColorSweep,
  "flip-match": renderFlipMatch,
  "gap-rush": renderGapRush,
  "glow-cycle": renderGlowCycle,
  "hidden-find": renderHiddenFind,
  "hue-drift": renderHueDrift,
  "icon-chain": renderIconChain,
  "light-grid": renderLightGrid,
  "line-connect": renderLineConnect,
  "merge-climb": renderMergeClimb,
  minesweeper: renderMinesweeper,
  "mirror-match": renderMirrorMatch,
  "number-chain": renderNumberChain,
  "orbit-tap": renderOrbitTap,
  "pair-flip": renderPairFlip,
  "path-recall": renderPathRecall,
  "pattern-echo": renderPatternEcho,
  "phase-lock": renderPhaseLock,
  "position-lock": renderPositionLock,
  "precision-drop": renderPrecisionDrop,
  "pulse-count": renderPulseCount,
  "quick-sum": renderQuickSum,
  "relative-pitch": renderRelativePitch,
  "rotate-align": renderRotateAlign,
  "sequence-point": renderSequencePoint,
  "shape-morph": renderShapeMorph,
  "spinner-aim": renderSpinnerAim,
  "spot-change": renderSpotChange,
  "stack-sort": renderStackSort,
  sudoku: renderSudoku,
  "sum-grid": renderSumGrid,
  "swap-solve": renderSwapSolve,
  "symbol-hunt": renderSymbolHunt,
  "sync-pulse": renderSyncPulse,
  "tap-safe": renderTapSafe,
  "target-trail": renderTargetTrail,
  "tempo-hold": renderTempoHold,
  "tempo-weave": renderTempoWeave,
  "tile-instant": renderTileInstant,
  "tile-shift": renderTileShift,
  "zone-lock": renderZoneLock,
};

function ensureCoverage(keys: string[], label: string, actualKeys: string[]) {
  const expected = [...keys].sort();
  const actual = [...actualKeys].sort();

  if (expected.join("|") !== actual.join("|")) {
    throw new Error(`${label} coverage mismatch.\nExpected: ${expected.join(", ")}\nActual: ${actual.join(", ")}`);
  }
}

function main() {
  const gameKeys = supportedGames.map((game) => game.key);

  ensureCoverage(gameKeys, "Preview metadata", Object.keys(previewByGameKey));
  ensureCoverage(gameKeys, "Scene renderer", Object.keys(sceneByGameKey));

  mkdirSync(PREVIEW_DIRECTORY, { recursive: true });

  const expectedFiles = new Set<string>();

  for (const game of supportedGames) {
    const preview = previewByGameKey[game.key];

    if (!preview?.previewSrc) {
      throw new Error(`Missing previewSrc for ${game.key}`);
    }

    if (!preview.previewSrc.endsWith(".svg")) {
      throw new Error(`Preview generator only supports SVG output. Received ${preview.previewSrc} for ${game.key}`);
    }

    const renderer = sceneByGameKey[game.key];
    const outputPath = path.resolve(process.cwd(), "public", preview.previewSrc.replace(/^\//, ""));

    expectedFiles.add(path.basename(outputPath));

    writeFileSync(outputPath, makeSvg(game.key, preview.previewAlt ?? game.name, createTheme(game.accentColor), renderer(createTheme(game.accentColor))));
  }

  for (const fileName of readdirSync(PREVIEW_DIRECTORY)) {
    if (/preview\.(png|svg)$/.test(fileName) && !expectedFiles.has(fileName)) {
      rmSync(path.join(PREVIEW_DIRECTORY, fileName));
    }
  }

  console.log(`Generated ${expectedFiles.size} square game preview assets.`);
}

main();
