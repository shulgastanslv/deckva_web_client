import {
  Circle,
  Gradient,
  Group,
  Rect,
  Text,
  type FabricObject,
} from "fabric";

import {
  CODE_THEMES,
  resolveThemeId,
  themeById,
  themeSyntax,
  type CodeSyntax,
  type CodeThemeId,
} from "@/lib/canvas/code-themes";

export type { CodeThemeId } from "@/lib/canvas/code-themes";
export { CODE_THEMES } from "@/lib/canvas/code-themes";

export type CodeLang =
  | "auto"
  | "plaintext"
  | "typescript"
  | "tsx"
  | "javascript"
  | "jsx"
  | "python"
  | "go"
  | "rust"
  | "java"
  | "kotlin"
  | "swift"
  | "csharp"
  | "cpp"
  | "php"
  | "ruby"
  | "json"
  | "yaml"
  | "toml"
  | "sql"
  | "shell"
  | "css"
  | "scss"
  | "html"
  | "markdown"
  | "graphql"
  | "dockerfile"
  | "prisma"
  | "vue"
  | "svelte";

export type CodePadding = 16 | 32 | 64 | 128;

export type CodeChromeStyle =
  | "none"
  | "macos"
  | "safari"
  | "card"
  | "stack"
  | "stack-2"
  | "arc"
  | "windows";

export const CODE_CHROME_STYLES: {
  id: CodeChromeStyle;
  label: string;
}[] = [
  { id: "none", label: "None" },
  { id: "macos", label: "MacOS" },
  { id: "safari", label: "Safari" },
  { id: "card", label: "Card" },
  { id: "stack", label: "Stack" },
  { id: "stack-2", label: "Stack 2" },
  { id: "arc", label: "Arc" },
  { id: "windows", label: "Windows" },
];

export type CodeTokenKind =
  | "plain"
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "punctuation"
  | "property"
  | "parameter";

export interface CodeBlockOptions {
  code: string;
  lang: CodeLang;
  theme: CodeThemeId;
  darkMode: boolean;
  showBackground: boolean;
  /** Fully transparent window fill (code sits on the canvas / gradient). */
  transparent: boolean;
  padding: CodePadding;
  radius: number;
  fontSize: number;
  /** @deprecated Prefer `chromeStyle`. Kept for older callers. */
  showChrome: boolean;
  chromeStyle: CodeChromeStyle;
  showLineNumbers: boolean;
  filename: string;
}

export function resolveChromeStyle(
  style: CodeChromeStyle | undefined,
  showChrome?: boolean,
): CodeChromeStyle {
  if (style && CODE_CHROME_STYLES.some((item) => item.id === style)) return style;
  return showChrome === false ? "none" : "macos";
}

export function chromeHasBar(style: CodeChromeStyle) {
  return style !== "none" && style !== "arc";
}

export function chromeStackLayers(style: CodeChromeStyle) {
  if (style === "stack") return 1;
  if (style === "stack-2") return 2;
  return 0;
}

export const CODE_PADDINGS: CodePadding[] = [16, 32, 64, 128];

export const CODE_LANGS: { id: CodeLang; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "typescript", label: "TypeScript" },
  { id: "tsx", label: "TSX" },
  { id: "javascript", label: "JavaScript" },
  { id: "jsx", label: "JSX" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "java", label: "Java" },
  { id: "kotlin", label: "Kotlin" },
  { id: "swift", label: "Swift" },
  { id: "csharp", label: "C#" },
  { id: "cpp", label: "C++" },
  { id: "php", label: "PHP" },
  { id: "ruby", label: "Ruby" },
  { id: "json", label: "JSON" },
  { id: "yaml", label: "YAML" },
  { id: "toml", label: "TOML" },
  { id: "sql", label: "SQL" },
  { id: "shell", label: "Bash" },
  { id: "css", label: "CSS" },
  { id: "scss", label: "SCSS" },
  { id: "html", label: "HTML" },
  { id: "markdown", label: "Markdown" },
  { id: "graphql", label: "GraphQL" },
  { id: "dockerfile", label: "Docker" },
  { id: "prisma", label: "Prisma" },
  { id: "vue", label: "Vue" },
  { id: "svelte", label: "Svelte" },
  { id: "plaintext", label: "Plaintext" },
];

export const DEFAULT_CODE = `import { Detail } from "@raycast/api";

export default function Command() {
  return <Detail markdown="Hello from Deckva" />;
}`;

export const DEFAULT_CODE_OPTIONS: CodeBlockOptions = {
  code: DEFAULT_CODE,
  lang: "tsx",
  theme: "breeze",
  darkMode: true,
  showBackground: true,
  transparent: false,
  padding: 64,
  radius: 16,
  fontSize: 28,
  showChrome: true,
  chromeStyle: "macos",
  showLineNumbers: false,
  filename: "Untitled",
};

export const CODE_UI_SCALE_BASE = DEFAULT_CODE_OPTIONS.fontSize;

export function fontSizeFromUiScale(scalePercent: number) {
  return Math.round(
    Math.min(48, Math.max(16, (CODE_UI_SCALE_BASE * scalePercent) / 100)),
  );
}

export function uiScaleFromFontSize(fontSize: number) {
  return Math.round((fontSize / CODE_UI_SCALE_BASE) * 100);
}

const C_LIKE = [
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "import", "export", "from", "async", "await", "class", "extends", "new",
  "type", "interface", "enum", "true", "false", "null", "undefined", "typeof",
  "default", "switch", "case", "break", "continue", "try", "catch", "finally",
  "throw", "static", "public", "private", "protected", "void", "this", "super",
];

const KEYWORDS: Partial<Record<CodeLang, string[]>> = {
  typescript: C_LIKE,
  javascript: C_LIKE,
  tsx: C_LIKE,
  jsx: C_LIKE,
  vue: C_LIKE,
  svelte: C_LIKE,
  java: [
    "public", "private", "protected", "class", "interface", "extends", "implements",
    "return", "if", "else", "for", "while", "new", "static", "void", "true", "false",
    "null", "import", "package", "try", "catch", "throw", "final", "abstract",
  ],
  kotlin: [
    "fun", "val", "var", "class", "object", "interface", "return", "if", "else",
    "when", "for", "while", "import", "package", "true", "false", "null", "suspend",
    "data", "sealed", "override", "private", "public",
  ],
  swift: [
    "func", "let", "var", "class", "struct", "enum", "protocol", "return", "if",
    "else", "for", "while", "import", "true", "false", "nil", "guard", "switch",
    "case", "async", "await", "private", "public",
  ],
  csharp: [
    "public", "private", "protected", "class", "interface", "return", "if", "else",
    "for", "while", "new", "static", "void", "true", "false", "null", "using",
    "namespace", "async", "await", "var", "string", "int",
  ],
  cpp: [
    "int", "void", "return", "if", "else", "for", "while", "class", "struct",
    "public", "private", "protected", "true", "false", "nullptr", "const",
    "auto", "template", "typename", "namespace", "using",
  ],
  php: [
    "function", "return", "if", "else", "foreach", "for", "while", "class",
    "public", "private", "protected", "echo", "true", "false", "null", "new",
    "use", "namespace", "async", "await",
  ],
  ruby: [
    "def", "end", "return", "if", "elsif", "else", "do", "while", "class",
    "module", "true", "false", "nil", "require", "attr_accessor", "yield",
  ],
  rust: [
    "fn", "let", "mut", "return", "if", "else", "for", "while", "loop", "match",
    "struct", "enum", "impl", "trait", "pub", "use", "mod", "true", "false",
    "Self", "self", "async", "await", "const",
  ],
  go: [
    "func", "return", "if", "else", "for", "range", "import", "package",
    "var", "const", "type", "struct", "interface", "go", "defer", "true",
    "false", "nil", "map", "chan",
  ],
  python: [
    "def", "return", "if", "elif", "else", "for", "while", "import", "from",
    "as", "class", "True", "False", "None", "async", "await", "with", "try",
    "except", "yield", "lambda", "pass", "global", "nonlocal",
  ],
  sql: [
    "SELECT", "FROM", "WHERE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER",
    "ON", "AND", "OR", "NOT", "INSERT", "INTO", "VALUES", "UPDATE", "SET",
    "DELETE", "CREATE", "TABLE", "INDEX", "NULL", "AS", "ORDER", "BY", "GROUP",
    "LIMIT", "OFFSET",
  ],
  shell: [
    "if", "then", "else", "fi", "for", "do", "done", "while", "case", "esac",
    "function", "return", "export", "local", "echo", "cd", "sudo",
  ],
  graphql: [
    "type", "query", "mutation", "subscription", "schema", "interface",
    "enum", "input", "extends", "implements", "true", "false", "null",
  ],
  dockerfile: [
    "FROM", "RUN", "CMD", "COPY", "ADD", "WORKDIR", "ENV", "EXPOSE",
    "ENTRYPOINT", "VOLUME", "USER", "ARG", "LABEL",
  ],
  prisma: [
    "model", "generator", "datasource", "enum", "type", "view",
    "String", "Int", "Boolean", "DateTime", "Json", "Float",
  ],
};

type Token = { text: string; kind: CodeTokenKind };

function isLang(value: string): value is CodeLang {
  return CODE_LANGS.some((l) => l.id === value);
}

function isPadding(value: number): value is CodePadding {
  return (CODE_PADDINGS as number[]).includes(value);
}

export function detectLanguage(code: string): Exclude<CodeLang, "auto"> {
  const sample = code.trim().slice(0, 400);
  if (!sample) return "plaintext";
  if (/^FROM\s+\S+/m.test(sample) && /(?:RUN|CMD|COPY)\s+/m.test(sample)) {
    return "dockerfile";
  }
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE)\b/im.test(sample)) return "sql";
  if (/^\s*model\s+\w+\s*\{/m.test(sample) || /prisma\.schema/.test(sample)) {
    return "prisma";
  }
  if (/^\s*query\s+|^\s*type\s+\w+\s*\{/m.test(sample) && /:\s*\w+[!?\]]/.test(sample)) {
    return "graphql";
  }
  if (/^\s*\{[\s\S]*\}\s*$/.test(sample) && /"[^"]+"\s*:/.test(sample)) return "json";
  if (/^---\s*$/m.test(sample) || /^\w+:\s+.+$/m.test(sample) && !/[{;]/.test(sample)) {
    return "yaml";
  }
  if (/^\s*def\s+\w+\(|^\s*import\s+\w+|:\s*$/m.test(sample) && !/[;{}]/.test(sample.slice(0, 120))) {
    return "python";
  }
  if (/^\s*package\s+\w+|^\s*func\s+\w+\(/m.test(sample)) return "go";
  if (/^\s*fn\s+\w+|^\s*let\s+mut\b/m.test(sample)) return "rust";
  if (/<[A-Z][\w.]*[\s/>]/.test(sample) || /<\/[A-Za-z]/.test(sample)) {
    if (/:\s*[A-Z]|interface\s+|type\s+\w+\s*=/.test(sample)) return "tsx";
    return "jsx";
  }
  if (/:\s*(string|number|boolean|React\.|Promise<)/.test(sample) || /\binterface\b|\btype\b.*=/.test(sample)) {
    return "typescript";
  }
  if (/^\s*<(!DOCTYPE|html|div|span|p)\b/i.test(sample)) return "html";
  if (/^\s*([\.#@][\w-]+|\w+)\s*\{/.test(sample)) return "css";
  if (/^\s*#!/.test(sample) || /\b(?:echo|sudo|apt|brew)\b/.test(sample)) return "shell";
  return "javascript";
}

function resolveLang(lang: CodeLang, code: string): Exclude<CodeLang, "auto"> {
  if (lang === "auto") return detectLanguage(code);
  return lang;
}

/** Map legacy lang ids stored on older blocks. */
function migrateLang(raw: string): CodeLang {
  const map: Record<string, CodeLang> = {
    plain: "plaintext",
    ts: "typescript",
    js: "javascript",
    bash: "shell",
    py: "python",
  };
  if (isLang(raw)) return raw;
  return map[raw] ?? "tsx";
}

export function tokenizeLine(line: string, lang: CodeLang): Token[] {
  const resolved = lang === "auto" ? "javascript" : lang;
  if (resolved === "plaintext" || !line) {
    return [{ text: line || " ", kind: "plain" }];
  }
  if (resolved === "json") return tokenizeJson(line);

  const tokens: Token[] = [];
  let i = 0;
  let inJsxTag = false;
  const keywords = KEYWORDS[resolved] ?? [];
  const jsxLike = resolved === "tsx" || resolved === "jsx" || resolved === "html" || resolved === "vue" || resolved === "svelte";
  const hashComment =
    resolved === "python" ||
    resolved === "shell" ||
    resolved === "yaml" ||
    resolved === "toml" ||
    resolved === "ruby";
  const sqlLike = resolved === "sql" || resolved === "dockerfile";

  while (i < line.length) {
    if (hashComment && line[i] === "#") {
      tokens.push({ text: line.slice(i), kind: "comment" });
      break;
    }
    if (
      !hashComment &&
      resolved !== "html" &&
      line.slice(i, i + 2) === "//"
    ) {
      tokens.push({ text: line.slice(i), kind: "comment" });
      break;
    }
    if (resolved === "html" && line.slice(i, i + 4) === "<!--") {
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
      while (j < line.length && /[A-Za-z0-9_$-]/.test(line[j]!)) j += 1;
      const word = line.slice(i, j);
      const next = line[j];
      const prev = tokens[tokens.length - 1]?.text;
      let kind: CodeTokenKind = "plain";
      const kwHit = sqlLike
        ? keywords.some((k) => k.toLowerCase() === word.toLowerCase())
        : keywords.includes(word);
      if (kwHit) kind = "keyword";
      else if (jsxLike && inJsxTag && (prev === "<" || prev === "</")) kind = "function";
      else if (jsxLike && inJsxTag && next === "=") kind = "parameter";
      else if (next === "(") kind = "function";
      else if (/^[A-Z]/.test(word)) kind = "function";
      else if ((resolved === "css" || resolved === "scss") && next === ":") kind = "property";
      else if (resolved === "shell" && i === 0) kind = "function";
      tokens.push({ text: word, kind });
      i = j;
      continue;
    }

    if (jsxLike && ch === "<") inJsxTag = true;
    else if (jsxLike && ch === ">") inJsxTag = false;

    tokens.push({
      text: ch,
      kind: /[{}()[\].,;:=<>!/@#]/.test(ch) ? "punctuation" : "plain",
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
      tokens.push({
        text: line.slice(i, j),
        kind: after.startsWith(":") ? "property" : "string",
      });
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
    tokens.push({
      text: ch,
      kind: /[{}[\],:]/.test(ch) ? "punctuation" : "plain",
    });
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
  if (!ctx) {
    return tokens.reduce((sum, t) => sum + t.text.length, 0) * fontSize * 0.6;
  }
  ctx.font = `${fontSize}px ${fontFamily}`;
  return tokens.reduce((sum, t) => sum + ctx.measureText(t.text).width, 0);
}

function colorForKind(kind: CodeTokenKind, syntax: CodeSyntax): string {
  switch (kind) {
    case "keyword":
      return syntax.keyword;
    case "string":
      return syntax.string;
    case "comment":
      return syntax.comment;
    case "number":
      return syntax.number;
    case "function":
      return syntax.function;
    case "punctuation":
      return syntax.punctuation;
    case "property":
      return syntax.property;
    case "parameter":
      return syntax.parameter;
    default:
      return syntax.foreground;
  }
}

function lineStyles(
  tokens: Token[],
  syntax: CodeSyntax,
): Record<string, { fill: string }> {
  const styles: Record<string, { fill: string }> = {};
  let index = 0;
  for (const token of tokens) {
    const fill = colorForKind(token.kind, syntax);
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
  swibpCodeDarkMode?: string;
  swibpCodeBackground?: string;
  swibpCodeTransparent?: string;
};

export function isCodeBlock(obj: FabricObject | null | undefined): obj is Group {
  if (!obj || obj.type !== "group") return false;
  return (obj as CodeMeta).swibpRole === "code";
}

function parseChromeStyle(raw: unknown, showChromeFallback?: boolean): CodeChromeStyle {
  if (typeof raw === "string") {
    if (raw === "0") return "none";
    if (raw === "1") return "macos";
    return resolveChromeStyle(raw as CodeChromeStyle, showChromeFallback);
  }
  return resolveChromeStyle(undefined, showChromeFallback);
}

export function readCodeOptions(obj: FabricObject): CodeBlockOptions {
  const meta = obj as CodeMeta;
  const lang = migrateLang(meta.swibpCodeLang ?? "");
  const theme = resolveThemeId(meta.swibpCodeTheme);
  const paddingRaw =
    typeof meta.swibpCodePadding === "number"
      ? meta.swibpCodePadding
      : DEFAULT_CODE_OPTIONS.padding;
  const padding: CodePadding = isPadding(paddingRaw)
    ? paddingRaw
    : ([16, 32, 64, 128] as const).reduce((best, n) =>
        Math.abs(n - paddingRaw) < Math.abs(best - paddingRaw) ? n : best,
      );
  const chromeStyle = parseChromeStyle(meta.swibpCodeChrome);
  return {
    code: typeof meta.swibpCode === "string" ? meta.swibpCode : DEFAULT_CODE,
    lang,
    theme,
    darkMode: meta.swibpCodeDarkMode !== "0",
    showBackground: meta.swibpCodeBackground !== "0",
    transparent: meta.swibpCodeTransparent === "1",
    padding,
    radius:
      typeof meta.swibpCodeRadius === "number"
        ? meta.swibpCodeRadius
        : DEFAULT_CODE_OPTIONS.radius,
    fontSize:
      typeof meta.swibpCodeFontSize === "number"
        ? meta.swibpCodeFontSize
        : DEFAULT_CODE_OPTIONS.fontSize,
    showChrome: chromeStyle !== "none",
    chromeStyle,
    showLineNumbers: meta.swibpCodeLineNumbers === "1",
    filename:
      typeof meta.swibpCodeFilename === "string"
        ? meta.swibpCodeFilename
        : DEFAULT_CODE_OPTIONS.filename,
  };
}

function writeCodeMeta(group: Group, options: CodeBlockOptions) {
  const chromeStyle = resolveChromeStyle(options.chromeStyle, options.showChrome);
  group.set({
    swibpRole: "code",
    swibpCode: options.code,
    swibpCodeLang: options.lang,
    swibpCodeTheme: options.theme,
    swibpCodePadding: options.padding,
    swibpCodeRadius: options.radius,
    swibpCodeFontSize: options.fontSize,
    swibpCodeChrome: chromeStyle,
    swibpCodeLineNumbers: options.showLineNumbers ? "1" : "0",
    swibpCodeFilename: options.filename,
    swibpCodeDarkMode: options.darkMode ? "1" : "0",
    swibpCodeBackground: options.showBackground ? "1" : "0",
    swibpCodeTransparent: options.transparent ? "1" : "0",
  } as Partial<FabricObject>);
}

function rayGradient(from: string, to: string) {
  return new Gradient({
    type: "linear",
    gradientUnits: "percentage",
    coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  });
}

function inertRect(props: ConstructorParameters<typeof Rect>[0]) {
  return new Rect({
    selectable: false,
    evented: false,
    originX: "left",
    originY: "top",
    ...props,
  });
}

function paintChrome(
  parts: FabricObject[],
  opts: {
    style: CodeChromeStyle;
    winLeft: number;
    winTop: number;
    windowW: number;
    windowH: number;
    chromeH: number;
    radius: number;
    transparent: boolean;
    chromeBg: string;
    titleColor: string;
    filename: string;
    fontFamily: string;
    fontSize: number;
    darkMode: boolean;
  },
) {
  const {
    style,
    winLeft,
    winTop,
    windowW,
    chromeH,
    transparent,
    chromeBg,
    titleColor,
    filename,
    fontFamily,
    fontSize,
  } = opts;
  if (style === "none" || style === "arc") return;

  if (!transparent) {
    parts.push(
      inertRect({
        left: winLeft,
        top: winTop,
        width: windowW,
        height: chromeH,
        fill: chromeBg,
      }),
    );
    parts.push(
      inertRect({
        left: winLeft,
        top: winTop + chromeH - 10,
        width: windowW,
        height: 10,
        fill: chromeBg,
      }),
    );
  }

  const midY = winTop + chromeH / 2;
  const dots: [string, string, string] = ["#ff5f56", "#ffbd2e", "#27c93f"];

  if (style === "macos" || style === "safari" || style === "card" || style === "stack" || style === "stack-2") {
    dots.forEach((color, index) => {
      parts.push(
        new Circle({
          left: winLeft + 22 + index * 18,
          top: midY,
          radius: 5.5,
          fill: color,
          originX: "center",
          originY: "center",
          selectable: false,
          evented: false,
        }),
      );
    });
  }

  if (style === "windows") {
    const btnY = midY;
    const btnRight = winLeft + windowW - 18;
    const stroke = titleColor;
    // Close / maximize / minimize (right → left)
    parts.push(
      new Text("×", {
        left: btnRight,
        top: btnY,
        fontSize: Math.max(14, Math.round(fontSize * 0.55)),
        fontFamily,
        fill: stroke,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        editable: false,
      }),
    );
    parts.push(
      inertRect({
        left: btnRight - 28,
        top: btnY - 5,
        width: 10,
        height: 10,
        fill: "transparent",
        stroke,
        strokeWidth: 1.5,
      }),
    );
    parts.push(
      inertRect({
        left: btnRight - 52,
        top: btnY - 1,
        width: 12,
        height: 2,
        fill: stroke,
      }),
    );
  }

  if (style === "safari") {
    const barW = Math.min(windowW * 0.55, 280);
    parts.push(
      inertRect({
        left: winLeft + (windowW - barW) / 2,
        top: midY - 11,
        width: barW,
        height: 22,
        rx: 11,
        ry: 11,
        fill: opts.darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      }),
    );
  }

  if (style === "card") {
    parts.push(
      inertRect({
        left: winLeft,
        top: winTop + chromeH - 3,
        width: windowW,
        height: 3,
        fill: opts.darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
      }),
    );
  }

  if (filename.trim() && style !== "safari") {
    parts.push(
      new Text(filename.trim(), {
        left: winLeft + windowW / 2,
        top: midY,
        fontSize: Math.max(13, Math.round(fontSize * 0.48)),
        fontFamily,
        fill: titleColor,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        editable: false,
      }),
    );
  }
}

export function buildCodeBlockGroup(
  options: CodeBlockOptions = DEFAULT_CODE_OPTIONS,
): Group {
  const theme = themeById(options.theme);
  const syntax = themeSyntax(theme, options.darkMode);
  const fontFamily =
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  const fontSize = options.fontSize;
  const lineHeight = fontSize * 1.55;
  const outerPad = options.showBackground ? options.padding : 0;
  const innerPad = Math.round(Math.max(28, fontSize * 1.05));
  const chromeStyle = resolveChromeStyle(options.chromeStyle, options.showChrome);
  const chromeH = chromeHasBar(chromeStyle)
    ? chromeStyle === "safari"
      ? 58
      : 52
    : 0;
  const stackLayers = chromeStackLayers(chromeStyle);
  const stackGap = 10;
  const stackPad = stackLayers * stackGap;
  const lang = resolveLang(options.lang, options.code);
  const lines = (options.code.replace(/\r\n/g, "\n") || " ").split("\n");
  const lineNoWidth = options.showLineNumbers
    ? Math.max(String(lines.length).length, 2) * fontSize * 0.62 + 20
    : 0;

  let maxTextW = 0;
  const tokenized = lines.map((line) => {
    const tokens = tokenizeLine(line, lang);
    maxTextW = Math.max(maxTextW, measureLineWidth(tokens, fontSize, fontFamily));
    return tokens;
  });

  const contentW = Math.max(maxTextW, 320);
  const windowW = innerPad * 2 + lineNoWidth + contentW;
  const windowH = chromeH + innerPad * 2 + lines.length * lineHeight;
  const width = windowW + outerPad * 2 + stackPad;
  const height = windowH + outerPad * 2 + stackPad;
  const winLeft = outerPad;
  const winTop = outerPad;
  const radius =
    chromeStyle === "arc" ? Math.max(options.radius, 22) : options.radius;

  const windowBg = options.transparent
    ? "rgba(0,0,0,0)"
    : options.darkMode
      ? "#0b0b0f"
      : "#ffffff";
  const chromeBg = options.transparent
    ? "rgba(0,0,0,0)"
    : options.darkMode
      ? "#14141a"
      : "#f4f4f5";
  const lineNoColor = options.darkMode ? "#5c5c66" : "#a1a1aa";
  const titleColor = options.darkMode ? "#8b8b96" : "#71717a";
  const stackFill = options.darkMode ? "#1c1c24" : "#e4e4e7";

  const parts: FabricObject[] = [];

  if (options.showBackground) {
    parts.push(
      inertRect({
        left: 0,
        top: 0,
        width,
        height,
        rx: Math.max(radius + 8, 24),
        ry: Math.max(radius + 8, 24),
        fill: rayGradient(theme.background.from, theme.background.to),
      }),
    );
  }

  if (!options.transparent && stackLayers > 0) {
    for (let i = stackLayers; i >= 1; i -= 1) {
      parts.push(
        inertRect({
          left: winLeft + i * stackGap,
          top: winTop + i * stackGap,
          width: windowW,
          height: windowH,
          rx: radius,
          ry: radius,
          fill: stackFill,
        }),
      );
    }
  }

  if (!options.transparent) {
    parts.push(
      inertRect({
        left: winLeft,
        top: winTop,
        width: windowW,
        height: windowH,
        rx: radius,
        ry: radius,
        fill: windowBg,
        stroke:
          chromeStyle === "card" || chromeStyle === "arc"
            ? options.darkMode
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.1)"
            : undefined,
        strokeWidth: chromeStyle === "card" || chromeStyle === "arc" ? 1.5 : 0,
      }),
    );
  }

  paintChrome(parts, {
    style: chromeStyle,
    winLeft,
    winTop,
    windowW,
    windowH,
    chromeH,
    radius,
    transparent: options.transparent,
    chromeBg,
    titleColor,
    filename: options.filename,
    fontFamily,
    fontSize,
    darkMode: options.darkMode,
  });

  tokenized.forEach((tokens, lineIndex) => {
    const top = winTop + chromeH + innerPad + lineIndex * lineHeight;
    const textBody = tokens.map((t) => t.text).join("") || " ";

    if (options.showLineNumbers) {
      parts.push(
        new Text(String(lineIndex + 1), {
          left: winLeft + innerPad,
          top,
          fontSize,
          fontFamily,
          fill: lineNoColor,
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
        left: winLeft + innerPad + lineNoWidth,
        top,
        fontSize,
        fontFamily,
        fill: syntax.foreground,
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
        editable: false,
        styles: {
          0: lineStyles(tokens, syntax),
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
  writeCodeMeta(group, { ...options, chromeStyle, showChrome: chromeStyle !== "none" });
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
