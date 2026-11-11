/**
 * Replace lucide-react imports with @phosphor-icons/react.
 * Keeps local Lucide symbol names via aliases when Phosphor names differ.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

/** @type {Record<string, string>} */
const MAP = {
  AlignCenter: "AlignCenterHorizontal",
  AlignHorizontalDistributeCenter: "AlignCenterHorizontalSimple",
  AlignHorizontalJustifyCenter: "AlignCenterHorizontal",
  AlignHorizontalJustifyEnd: "AlignRight",
  AlignHorizontalJustifyStart: "AlignLeft",
  AlignHorizontalSpaceBetween: "AlignCenterHorizontalSimple",
  AlignJustify: "TextAlignJustify",
  AlignLeft: "TextAlignLeft",
  AlignRight: "TextAlignRight",
  AlignVerticalDistributeCenter: "AlignCenterVerticalSimple",
  AlignVerticalJustifyCenter: "AlignCenterVertical",
  AlignVerticalJustifyEnd: "AlignBottom",
  AlignVerticalJustifyStart: "AlignTop",
  AlignVerticalSpaceBetween: "AlignCenterVerticalSimple",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  ArrowUp: "ArrowUp",
  ArrowUpCircle: "ArrowCircleUp",
  ArrowUpDown: "ArrowsDownUp",
  Bell: "Bell",
  Bold: "TextB",
  Bookmark: "Bookmark",
  BringToFront: "ArrowFatLinesUp",
  BrushCleaning: "Broom",
  CameraIcon: "Camera",
  CaseSensitive: "TextAa",
  ChartNoAxesColumn: "ChartBar",
  Check: "Check",
  CheckIcon: "Check",
  ChevronDown: "CaretDown",
  ChevronDownIcon: "CaretDown",
  ChevronLeft: "CaretLeft",
  ChevronRight: "CaretRight",
  ChevronRightIcon: "CaretRight",
  ChevronUp: "CaretUp",
  ChevronUpIcon: "CaretUp",
  ChevronsDown: "CaretDoubleDown",
  ChevronsUp: "CaretDoubleUp",
  ChevronsUpDown: "CaretUpDown",
  Circle: "Circle",
  ClipboardPaste: "Clipboard",
  Clock3: "Clock",
  Cloud: "Cloud",
  CloudOff: "CloudSlash",
  Code2: "Code",
  Command: "Command",
  Compass: "Compass",
  Copy: "Copy",
  CopyPlus: "CopySimple",
  CreditCard: "CreditCard",
  Crop: "Crop",
  Crown: "Crown",
  Diamond: "Diamond",
  Download: "DownloadSimple",
  Ellipse: "Circle",
  Ellipsis: "DotsThree",
  Eraser: "Eraser",
  ExternalLink: "ArrowSquareOut",
  Eye: "Eye",
  EyeOff: "EyeSlash",
  FilePlus: "FilePlus",
  Focus: "Crosshair",
  Folder: "Folder",
  FolderIcon: "Folder",
  FolderInput: "FolderSimple",
  Globe: "Globe",
  Grid3X3: "GridFour",
  Hand: "Hand",
  Heading1: "TextHOne",
  Heading2: "TextHTwo",
  Heart: "Heart",
  HelpCircle: "Question",
  Hexagon: "Hexagon",
  Home: "House",
  HomeIcon: "House",
  Image: "Image",
  ImageIcon: "Image",
  ImagePlus: "Image",
  Images: "Images",
  Italic: "TextItalic",
  KeyRound: "Key",
  Keyboard: "Keyboard",
  Languages: "Translate",
  Laptop: "Laptop",
  Layers: "Stack",
  Layers2: "Stack",
  LayersIcon: "Stack",
  LayoutGrid: "SquaresFour",
  LayoutTemplate: "Layout",
  Link2: "Link",
  List: "List",
  ListFilter: "Funnel",
  ListOrdered: "ListNumbers",
  Loader2: "SpinnerGap",
  Lock: "Lock",
  LogOut: "SignOut",
  LucideIcon: "Icon",
  Mail: "Envelope",
  MailOpen: "EnvelopeOpen",
  Maximize2: "ArrowsOut",
  Menu: "List",
  MessageCircle: "ChatCircle",
  MessageSquareText: "ChatText",
  Minimize2: "ArrowsIn",
  Minus: "Minus",
  Monitor: "Monitor",
  Moon: "Moon",
  MoreHorizontal: "DotsThree",
  MousePointer2: "Cursor",
  Move: "ArrowsOutCardinal",
  Newspaper: "Newspaper",
  Package: "Package",
  Paintbrush: "PaintBrush",
  Palette: "Palette",
  PaletteIcon: "Palette",
  PanelLeftClose: "SidebarSimple",
  PanelLeftOpen: "Sidebar",
  PanelRightClose: "SidebarSimple",
  PanelRightOpen: "Sidebar",
  PanelTop: "Browser",
  PanelTopClose: "Browser",
  Paperclip: "Paperclip",
  Pencil: "PencilSimple",
  Play: "Play",
  Plus: "Plus",
  Quote: "Quotes",
  RectangleHorizontal: "Rectangle",
  RectangleVertical: "Rectangle",
  Redo2: "ArrowClockwise",
  Repeat2: "ArrowsClockwise",
  Replace: "ArrowsLeftRight",
  RotateCcw: "ArrowCounterClockwise",
  Save: "FloppyDisk",
  ScanSearch: "MagnifyingGlass",
  ScrollText: "Scroll",
  Search: "MagnifyingGlass",
  SearchIcon: "MagnifyingGlass",
  Send: "PaperPlaneTilt",
  SendToBack: "ArrowFatLinesDown",
  SeparatorHorizontal: "Minus",
  Settings: "Gear",
  Shapes: "Shapes",
  ShapesIcon: "Shapes",
  Share: "ShareNetwork",
  Share2: "ShareNetwork",
  Shield: "Shield",
  SlidersHorizontal: "Sliders",
  Smartphone: "DeviceMobile",
  Sparkles: "Sparkle",
  Square: "Square",
  Star: "Star",
  Strikethrough: "TextStrikethrough",
  Sun: "Sun",
  SunMedium: "Sun",
  Tablet: "DeviceTablet",
  Tag: "Tag",
  ThumbsUp: "ThumbsUp",
  ToolCase: "Toolbox",
  Trash2: "Trash",
  Triangle: "Triangle",
  Tv: "Television",
  Type: "TextT",
  Underline: "TextUnderline",
  Undo2: "ArrowCounterClockwise",
  Ungroup: "SelectionInverse",
  Unlock: "LockOpen",
  Upload: "UploadSimple",
  User: "User",
  UserPlus: "UserPlus",
  UserRound: "User",
  Users: "Users",
  UsersIcon: "Users",
  Wallet: "Wallet",
  WandSparkles: "MagicWand",
  Workflow: "FlowArrow",
  X: "X",
  XIcon: "X",
  ZoomIn: "MagnifyingGlassPlus",
  ZoomOut: "MagnifyingGlassMinus",
};

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git" || ent.name === ".next") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(ent.name)) out.push(p);
  }
  return out;
}

function parseSpec(spec) {
  const s = spec.trim();
  if (!s) return null;
  const isType = /^type\s+/.test(s);
  const body = s.replace(/^type\s+/, "").trim();
  const m = body.match(/^(\w+)(?:\s+as\s+(\w+))?$/);
  if (!m) throw new Error(`Cannot parse import spec: ${spec}`);
  return { isType, exported: m[1], local: m[2] || m[1] };
}

function rewriteImportBlock(full, specsRaw, quote) {
  const specs = specsRaw.split(",").map(parseSpec).filter(Boolean);
  const valueSpecs = [];
  const typeSpecs = [];

  for (const spec of specs) {
    const phName = MAP[spec.exported];
    if (!phName) {
      throw new Error(`No Phosphor mapping for Lucide symbol: ${spec.exported}`);
    }
    const local = spec.local;
    // Keep local Lucide names so JSX/usages stay unchanged.
    const rewritten =
      phName === local ? phName : `${phName} as ${local}`;
    if (spec.isType || spec.exported === "LucideIcon") {
      // LucideIcon → Icon (type)
      const typeLocal = local === "LucideIcon" ? "LucideIcon" : local;
      const typePh = MAP[spec.exported] || "Icon";
      typeSpecs.push(
        typePh === typeLocal ? `type ${typePh}` : `type ${typePh} as ${typeLocal}`,
      );
    } else if (spec.isType) {
      typeSpecs.push(
        phName === local ? `type ${phName}` : `type ${phName} as ${local}`,
      );
    } else {
      valueSpecs.push(rewritten);
    }
  }

  // Deduplicate identical value specs (e.g. two Image as ImageIcon)
  const uniq = (arr) => [...new Set(arr)];
  const values = uniq(valueSpecs);
  const types = uniq(typeSpecs);

  const parts = [...values, ...types];
  return `import {\n  ${parts.join(",\n  ")},\n} from ${quote}@phosphor-icons/react${quote}`;
}

function transformFile(filePath) {
  let text = fs.readFileSync(filePath, "utf8");
  if (!text.includes("lucide-react")) return false;

  const importRe =
    /import\s+(type\s+)?\{([^}]+)\}\s+from\s+(["'])lucide-react\3/g;

  let changed = false;
  text = text.replace(importRe, (full, typeKw, specsRaw, quote) => {
    changed = true;
    // If the whole import is `import type { ... }`
    if (typeKw) {
      const specs = specsRaw.split(",").map(parseSpec).filter(Boolean);
      const parts = specs.map((spec) => {
        const phName = MAP[spec.exported];
        if (!phName) throw new Error(`No mapping for ${spec.exported} in ${filePath}`);
        const local = spec.local;
        return phName === local
          ? `type ${phName}`
          : `type ${phName} as ${local}`;
      });
      return `import {\n  ${parts.join(",\n  ")},\n} from ${quote}@phosphor-icons/react${quote}`;
    }
    return rewriteImportBlock(full, specsRaw, quote);
  });

  if (!changed) {
    // bare? unlikely
    if (/from\s+["']lucide-react["']/.test(text)) {
      throw new Error(`Unhandled lucide import form in ${filePath}`);
    }
  }

  fs.writeFileSync(filePath, text);
  return true;
}

const files = walk(ROOT);
let n = 0;
const errors = [];
for (const f of files) {
  try {
    if (transformFile(f)) {
      n++;
      console.log("updated", path.relative(ROOT, f));
    }
  } catch (e) {
    errors.push(`${f}: ${e.message}`);
  }
}
console.log(`\nUpdated ${n} files`);
if (errors.length) {
  console.error("\nErrors:");
  for (const e of errors) console.error(e);
  process.exit(1);
}
