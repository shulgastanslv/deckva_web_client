import {
  Circle,
  Group,
  Rect,
  Text,
  type FabricObject,
} from "fabric";

export type CodeLang =
  | "plain"
  | "ts"
  | "js"
  | "tsx"
  | "python"
  | "go"
  | "json"
  | "bash"
  | "css"
  | "html";

export type CodeThemeId = "ray" | "dark" | "light" | "candy";

export type CodeTokenKind =
  | "plain"
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "punctuation";

export interface CodeTheme {
  id: CodeThemeId;
  label: string;
  background: string;
  chrome: string;
  foreground: string;
  lineNumber: string;
  colors: Record<CodeTokenKind, string>;
  dots: [string, string, string];
}

export interface CodeBlockOptions {
  code: string;
  lang: CodeLang;
  theme: CodeThemeId;
  padding: number;
  radius: number;
  fontSize: number;
  showChrome: boolean;
  showLineNumbers: boolean;
  filename: string;
}

export const CODE_LANGS: { id: CodeLang; label: string }[] = [
  { id: "ts", label: "TypeScript" },
  { id: "tsx", label: "TSX" },
  { id: "js", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "json", label: "JSON" },
  { id: "bash", label: "Bash" },
  { id: "css", label: "CSS" },
  { id: "html", label: "HTML" },
  { id: "plain", label: "Plain" },
];

export const CODE_THEMES: CodeTheme[] = [
  {
    id: "ray",
    label: "Ray",
    background: "#0a0a0a",
    chrome: "#141414",
    foreground: "#f5f5f5",
    lineNumber: "#555555",
    dots: ["#ff5f56", "#ffbd2e", "#27c93f"],
    colors: {
      plain: "#f5f5f5",
      keyword: "#ff7edb",
      string: "#7ee787",
      comment: "#6e7681",
      number: "#79c0ff",
      function: "#c4b5fd",
      punctuation: "#f5f5f5",
    },
  },
  {
    id: "dark",
    label: "GitHub",
    background: "#0d1117",
    chrome: "#161b22",
    foreground: "#e6edf3",
    lineNumber: "#6e7681",
    dots: ["#ff5f56", "#ffbd2e", "#27c93f"],
    colors: {
      plain: "#e6edf3",
      keyword: "#ff7b72",
      string: "#a5d6ff",
      comment: "#8b949e",
      number: "#79c0ff",
      function: "#d2a8ff",
      punctuation: "#c9d1d9",
    },
  },
  {
    id: "light",
    label: "Light",
    background: "#ffffff",
    chrome: "#f6f8fa",
    foreground: "#1f2328",
    lineNumber: "#8c959f",
    dots: ["#ff5f56", "#ffbd2e", "#27c93f"],
    colors: {
      plain: "#1f2328",
      keyword: "#cf222e",
      string: "#0a3069",
      comment: "#6e7781",
      number: "#0550ae",
      function: "#8250df",
      punctuation: "#1f2328",
    },
  },
  {
    id: "candy",
    label: "Candy",
    background: "#2a1936",
    chrome: "#3b2449",
    foreground: "#f8e8ff",
    lineNumber: "#b08bc0",
    dots: ["#ff7ad9", "#ffd57a", "#7affc4"],
    colors: {
      plain: "#f8e8ff",
      keyword: "#ff7ad9",
      string: "#7affc4",
      comment: "#b08bc0",
      number: "#ffd57a",
      function: "#9ad4ff",
      punctuation: "#e8d0f5",
    },
  },
];

export const DEFAULT_CODE = `import { Detail } from "@raycast/api";

export default function Command() {
  return <Detail markdown="Hello World" />;
}`;

export const DEFAULT_CODE_OPTIONS: CodeBlockOptions = {
  code: DEFAULT_CODE,
  lang: "tsx",
  theme: "ray",
  padding: 48,
  radius: 6,
  fontSize: 28,
  showChrome: false,
  showLineNumbers: false,
  filename: "command.tsx",
};

const KEYWORDS: Record<Exclude<CodeLang, "plain" | "json" | "bash" | "css" | "html">, string[]> = {
  ts: [
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "import", "export", "from", "async", "await", "class", "extends", "new",
    "type", "interface", "enum", "true", "false", "null", "undefined", "typeof",
  ],
  js: [
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "import", "export", "from", "async", "await", "class", "extends", "new",
    "true", "false", "null", "undefined", "typeof",
  ],
  tsx: [
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "import", "export", "from", "async", "await", "class", "extends", "new",
    "type", "interface", "true", "false", "null", "undefined", "typeof", "default",
  ],
  python: [
    "def", "return", "if", "elif", "else", "for", "while", "import", "from",
    "as", "class", "True", "False", "None", "async", "await", "with", "try",
    "except", "yield", "lambda", "pass",
  ],
  go: [
    "func", "return", "if", "else", "for", "range", "import", "package",
    "var", "const", "type", "struct", "interface", "go", "defer", "true",
    "false", "nil", "map", "chan",
  ],
};

type Token = { text: string; kind: CodeTokenKind };

function themeById(id: CodeThemeId): CodeTheme {
  return CODE_THEMES.find((t) => t.id === id) ?? CODE_THEMES[0]!;
}

function isLang(value: string): value is CodeLang {
  return CODE_LANGS.some((l) => l.id === value);
}

function isTheme(value: string): value is CodeThemeId {
  return CODE_THEMES.some((t) => t.id === value);
}

export function tokenizeLine(line: string, lang: CodeLang): Token[] {
  if (lang === "plain" || !line) return [{ text: line || " ", kind: "plain" }];

  if (lang === "json") {
    return tokenizeJson(line);
  }

  const tokens: Token[] = [];
  let i = 0;
  let inJsxTag = false;
  const keywords =
    lang === "bash" || lang === "css" || lang === "html"
      ? []
      : KEYWORDS[lang] ?? [];
  const jsxLike = lang === "tsx" || lang === "html";

  while (i < line.length) {
    if (lang === "python" && line[i] === "#") {
      tokens.push({ text: line.slice(i), kind: "comment" });
      break;
    }
    if (
      (lang === "ts" || lang === "js" || lang === "tsx" || lang === "go" || lang === "css") &&
      line.slice(i, i + 2) === "//"
    ) {
      tokens.push({ text: line.slice(i), kind: "comment" });
      break;
    }
    if (lang === "bash" && line[i] === "#") {
      tokens.push({ text: line.slice(i), kind: "comment" });
      break;
    }
    if (lang === "html" && line.slice(i, i + 4) === "<!--") {
      tokens.push({ text: line.slice(i), kind: "comment" });
      break;
    }

    const ch = line[i]!;
    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === "\\") {
          j += 2;
          continue;
        }
        if (line[j] === ch) {
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ text: line.slice(i, j), kind: "string" });
      i = j;
      continue;
    }

    if (/\d/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[\d._]/.test(line[j]!)) j += 1;
      tokens.push({ text: line.slice(i, j), kind: "number" });
      i = j;
      continue;
    }

    if (/[A-Za-z_$]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_$]/.test(line[j]!)) j += 1;
      const word = line.slice(i, j);
      const next = line[j];
      const prev = tokens[tokens.length - 1]?.text;
      let kind: CodeTokenKind = "plain";
      if (keywords.includes(word) || word === "default") kind = "keyword";
      else if (jsxLike && inJsxTag && (prev === "<" || prev === "</")) kind = "function";
      else if (jsxLike && inJsxTag && next === "=") kind = "keyword";
      else if (next === "(") kind = "function";
      else if (/^[A-Z]/.test(word)) kind = "function";
      else if (lang === "css" && next === ":") kind = "keyword";
      else if (lang === "bash" && i === 0) kind = "function";
      tokens.push({ text: word, kind });
      i = j;
      continue;
    }

    if (jsxLike && ch === "<") {
      inJsxTag = true;
    } else if (jsxLike && ch === ">") {
      inJsxTag = false;
    }

    tokens.push({
      text: ch,
      kind: /[{}()[\].,;:=<>!/]/.test(ch) ? "punctuation" : "plain",
    });
    i += 1;
  }

  return tokens.length ? tokens : [{ text: " ", kind: "plain" }];
}

function tokenizeJson(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i]!;
    if (ch === '"') {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === "\\") {
          j += 2;
          continue;
        }
        if (line[j] === '"') {
          j += 1;
          break;
        }
        j += 1;
      }
      const after = line.slice(j).trimStart();
      tokens.push({ text: line.slice(i, j), kind: after.startsWith(":") ? "keyword" : "string" });
      i = j;
      continue;
    }
    if (/\d/.test(ch) || (ch === "-" && /\d/.test(line[i + 1] ?? ""))) {
      let j = i + 1;
      while (j < line.length && /[\d.eE+-]/.test(line[j]!)) j += 1;
      tokens.push({ text: line.slice(i, j), kind: "number" });
      i = j;
      continue;
    }
    if (/true|false|null/.test(line.slice(i, i + 5))) {
      for (const lit of ["true", "false", "null"] as const) {
        if (line.startsWith(lit, i)) {
          tokens.push({ text: lit, kind: "keyword" });
          i += lit.length;
          break;
        }
      }
      continue;
    }
    tokens.push({ text: ch, kind: /[{}[\],:]/.test(ch) ? "punctuation" : "plain" });
    i += 1;
  }
  return tokens.length ? tokens : [{ text: " ", kind: "plain" }];
}

function measureLineWidth(
  tokens: Token[],
  fontSize: number,
  fontFamily: string,
): number {
  if (typeof document === "undefined") {
    return tokens.reduce((sum, t) => sum + t.text.length, 0) * fontSize * 0.6;
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return tokens.reduce((sum, t) => sum + t.text.length, 0) * fontSize * 0.6;
  ctx.font = `${fontSize}px ${fontFamily}`;
  return tokens.reduce((sum, t) => sum + ctx.measureText(t.text).width, 0);
}

function lineStyles(
  tokens: Token[],
  colors: CodeTheme["colors"],
): Record<string, { fill: string }> {
  const styles: Record<string, { fill: string }> = {};
  let index = 0;
  for (const token of tokens) {
    const fill = colors[token.kind] ?? colors.plain;
    for (let c = 0; c < token.text.length; c += 1) {
      styles[String(index + c)] = { fill };
    }
    index += token.text.length;
  }
  return styles;
}

type CodeMeta = FabricObject & {
  swibpRole?: string;
  swibpCode?: string;
  swibpCodeLang?: string;
  swibpCodeTheme?: string;
  swibpCodePadding?: number;
  swibpCodeRadius?: number;
  swibpCodeFontSize?: number;
  swibpCodeChrome?: string;
  swibpCodeLineNumbers?: string;
  swibpCodeFilename?: string;
};

export function isCodeBlock(obj: FabricObject | null | undefined): obj is Group {
  if (!obj || obj.type !== "group") return false;
  return (obj as CodeMeta).swibpRole === "code";
}

export function readCodeOptions(obj: FabricObject): CodeBlockOptions {
  const meta = obj as CodeMeta;
  const rawLang = meta.swibpCodeLang ?? "";
  const rawTheme = meta.swibpCodeTheme ?? "";
  const lang: CodeLang = isLang(rawLang) ? rawLang : DEFAULT_CODE_OPTIONS.lang;
  const theme: CodeThemeId = isTheme(rawTheme) ? rawTheme : DEFAULT_CODE_OPTIONS.theme;
  return {
    code: typeof meta.swibpCode === "string" ? meta.swibpCode : DEFAULT_CODE,
    lang,
    theme,
    padding:
      typeof meta.swibpCodePadding === "number"
        ? meta.swibpCodePadding
        : DEFAULT_CODE_OPTIONS.padding,
    radius:
      typeof meta.swibpCodeRadius === "number"
        ? meta.swibpCodeRadius
        : DEFAULT_CODE_OPTIONS.radius,
    fontSize:
      typeof meta.swibpCodeFontSize === "number"
        ? meta.swibpCodeFontSize
        : DEFAULT_CODE_OPTIONS.fontSize,
    showChrome: meta.swibpCodeChrome !== "0",
    showLineNumbers: meta.swibpCodeLineNumbers !== "0",
    filename:
      typeof meta.swibpCodeFilename === "string"
        ? meta.swibpCodeFilename
        : DEFAULT_CODE_OPTIONS.filename,
  };
}

function writeCodeMeta(group: Group, options: CodeBlockOptions) {
  group.set({
    swibpRole: "code",
    swibpCode: options.code,
    swibpCodeLang: options.lang,
    swibpCodeTheme: options.theme,
    swibpCodePadding: options.padding,
    swibpCodeRadius: options.radius,
    swibpCodeFontSize: options.fontSize,
    swibpCodeChrome: options.showChrome ? "1" : "0",
    swibpCodeLineNumbers: options.showLineNumbers ? "1" : "0",
    swibpCodeFilename: options.filename,
  } as Partial<FabricObject>);
}

export function buildCodeBlockGroup(
  options: CodeBlockOptions = DEFAULT_CODE_OPTIONS,
): Group {
  const theme = themeById(options.theme);
  const fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  const fontSize = options.fontSize;
  const lineHeight = fontSize * 1.45;
  const padding = options.padding;
  const chromeH = options.showChrome ? 44 : 0;
  const lines = (options.code.replace(/\r\n/g, "\n") || " ").split("\n");
  const lineNoWidth = options.showLineNumbers
    ? Math.max(String(lines.length).length, 2) * fontSize * 0.65 + 16
    : 0;

  let maxTextW = 0;
  const tokenized = lines.map((line) => {
    const tokens = tokenizeLine(line, options.lang);
    maxTextW = Math.max(maxTextW, measureLineWidth(tokens, fontSize, fontFamily));
    return tokens;
  });

  const contentW = Math.max(maxTextW, 280);
  const width = padding * 2 + lineNoWidth + contentW;
  const height = chromeH + padding * 2 + lines.length * lineHeight;

  const parts: FabricObject[] = [];

  const bg = new Rect({
    left: 0,
    top: 0,
    width,
    height,
    rx: options.radius,
    ry: options.radius,
    fill: theme.background,
    selectable: false,
    evented: false,
    originX: "left",
    originY: "top",
  });
  parts.push(bg);

  if (options.showChrome) {
    const bar = new Rect({
      left: 0,
      top: 0,
      width,
      height: chromeH,
      fill: theme.chrome,
      selectable: false,
      evented: false,
      originX: "left",
      originY: "top",
    });
    // Clip top corners visually by overlay — keep simple rect under rounded bg
    parts.push(bar);

    const dotsX = 22;
    const dotsY = chromeH / 2;
    theme.dots.forEach((color, index) => {
      parts.push(
        new Circle({
          left: dotsX + index * 18,
          top: dotsY,
          radius: 5,
          fill: color,
          originX: "center",
          originY: "center",
          selectable: false,
          evented: false,
        }),
      );
    });

    if (options.filename.trim()) {
      parts.push(
        new Text(options.filename.trim(), {
          left: width / 2,
          top: chromeH / 2,
          fontSize: Math.max(12, fontSize * 0.55),
          fontFamily,
          fill: theme.lineNumber,
          originX: "center",
          originY: "center",
          selectable: false,
          evented: false,
          editable: false,
        }),
      );
    }
  }

  tokenized.forEach((tokens, lineIndex) => {
    const top = chromeH + padding + lineIndex * lineHeight;
    const textBody = tokens.map((t) => t.text).join("") || " ";

    if (options.showLineNumbers) {
      parts.push(
        new Text(String(lineIndex + 1), {
          left: padding,
          top,
          fontSize,
          fontFamily,
          fill: theme.lineNumber,
          originX: "left",
          originY: "top",
          selectable: false,
          evented: false,
          editable: false,
        }),
      );
    }

    parts.push(
      new Text(textBody, {
        left: padding + lineNoWidth,
        top,
        fontSize,
        fontFamily,
        fill: theme.foreground,
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
        editable: false,
        styles: {
          0: lineStyles(tokens, theme.colors),
        },
      }),
    );
  });

  const group = new Group(parts, {
    originX: "center",
    originY: "center",
    subTargetCheck: false,
    interactive: false,
  });
  writeCodeMeta(group, options);
  return group;
}

export function rebuildCodeBlock(
  group: Group,
  options: CodeBlockOptions,
): Group {
  const left = group.left ?? 0;
  const top = group.top ?? 0;
  const scaleX = group.scaleX ?? 1;
  const scaleY = group.scaleY ?? 1;
  const angle = group.angle ?? 0;
  const fresh = buildCodeBlockGroup(options);
  fresh.set({ left, top, scaleX, scaleY, angle });
  return fresh;
}
