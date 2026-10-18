export type DocBlock =
  | { type: "callout"; text: string }
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ol"; items: { title: string; points?: string[] }[] }
  | { type: "ul"; items: string[] }
  | { type: "kbd"; rows: { keys: string; action: string }[] };

export type DocPage = {
  slug: string;
  title: string;
  category: string;
  blocks: DocBlock[];
};

export type DocNavItem = {
  slug: string;
  title: string;
  children?: { slug: string; title: string }[];
};

export type DocNavGroup = {
  title: string;
  items: DocNavItem[];
};

export const DOC_NAV: DocNavGroup[] = [
  {
    title: "Getting Started",
    items: [
      { slug: "how-swibp-works", title: "How Swibp works" },
      { slug: "first-carousel", title: "Your first carousel" },
      { slug: "studio-overview", title: "Studio overview" },
    ],
  },
  {
    title: "Create",
    items: [
      { slug: "topic-to-carousel", title: "Topic → carousel" },
      { slug: "templates", title: "Templates" },
      { slug: "icons", title: "Icons library" },
    ],
  },
  {
    title: "Edit",
    items: [
      { slug: "canvas-basics", title: "Canvas basics" },
      { slug: "layers-inspector", title: "Layers & inspector" },
      { slug: "slides", title: "Slide navigator" },
      { slug: "keyboard", title: "Keyboard shortcuts" },
    ],
  },
  {
    title: "Export & Share",
    items: [
      { slug: "export", title: "Export PNG / ZIP" },
      { slug: "share", title: "Share a project" },
      { slug: "publish", title: "Publish a template" },
    ],
  },
  {
    title: "Account",
    items: [
      { slug: "sign-in", title: "Sign in & save" },
      { slug: "profile", title: "Profile settings" },
    ],
  },
  {
    title: "Reference",
    items: [
      { slug: "whats-new", title: "What's new" },
      { slug: "contact", title: "Contact us" },
      { slug: "social", title: "Social" },
      { slug: "resources", title: "Resources" },
      { slug: "faq", title: "FAQ" },
    ],
  },
];

export const DOC_PAGES: DocPage[] = [
  {
    slug: "how-swibp-works",
    title: "How Swibp works",
    category: "Getting Started",
    blocks: [
      {
        type: "callout",
        text: "A topic becomes a sequence of slides. You finish the look on the canvas, then export frames ready for the feed.",
      },
      {
        type: "p",
        text: "Swibp is a studio for carousels — not a blank design board. Generation spreads your idea across cover, middle, and ending. The editor is already in post proportions.",
      },
      { type: "h2", text: "The loop" },
      {
        type: "ol",
        items: [
          {
            title: "Describe the topic",
            points: [
              "A few sentences are enough.",
              "Pick slide count and style if you want.",
            ],
          },
          {
            title: "Open the result in the studio",
            points: [
              "Frames land on the canvas strip.",
              "Cover, middle, and ending are already ordered.",
            ],
          },
          {
            title: "Edit, then export",
            points: [
              "Change text, photos, icons, and backgrounds.",
              "Download PNG frames or a ZIP.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "first-carousel",
    title: "Your first carousel",
    category: "Getting Started",
    blocks: [
      {
        type: "callout",
        text: "Open Studio → create from a topic → tweak one or two frames → export.",
      },
      {
        type: "ol",
        items: [
          {
            title: "Open Studio",
            points: ["From the landing page or the header account menu."],
          },
          {
            title: "Write the topic",
            points: [
              "Use the language you want on the slides.",
              "Keep it concrete: one idea, one audience.",
            ],
          },
          {
            title: "Review the strip",
            points: [
              "Swipe through frames under the canvas.",
              "Fix wording on the cover first — it sells the swipe.",
            ],
          },
          {
            title: "Export",
            points: ["PNG or JPEG per slide, or the whole set as ZIP."],
          },
        ],
      },
    ],
  },
  {
    slug: "studio-overview",
    title: "Studio overview",
    category: "Getting Started",
    blocks: [
      {
        type: "callout",
        text: "Canvas in the center. Slides underneath. Tools and inspector on the sides.",
      },
      {
        type: "ul",
        items: [
          "Home — projects, generate, and quick entry points.",
          "Editor — Fabric canvas sized for the feed.",
          "Templates — start from a layout, rewrite for your topic.",
          "Projects — drafts saved to your account.",
        ],
      },
      {
        type: "p",
        text: "Generation is the start, not the finished post. The studio is where you finish the look.",
      },
    ],
  },
  {
    slug: "topic-to-carousel",
    title: "Topic → carousel",
    category: "Create",
    blocks: [
      {
        type: "callout",
        text: "Cover, middle, ending — from a couple of sentences.",
      },
      {
        type: "p",
        text: "You set the topic, slide count, and style. The model decides what belongs on the cover, what to explain in the middle, and how to close.",
      },
      { type: "h2", text: "Tips" },
      {
        type: "ul",
        items: [
          "One clear promise beats a long brief.",
          "Match the language to your audience.",
          "After generation, reorder or duplicate slides freely.",
        ],
      },
    ],
  },
  {
    slug: "templates",
    title: "Templates",
    category: "Create",
    blocks: [
      {
        type: "callout",
        text: "Cover and ending stay in rhythm. You change the words.",
      },
      {
        type: "p",
        text: "Templates are frames you can open and rewrite. Use them when you want a proven structure without starting from a blank canvas.",
      },
      {
        type: "ul",
        items: [
          "Browse the template library in Studio.",
          "Open a template into the editor.",
          "Publish your own layouts when they work well.",
        ],
      },
    ],
  },
  {
    slug: "icons",
    title: "Icons library",
    category: "Create",
    blocks: [
      {
        type: "callout",
        text: "Search sits next to the canvas. The icon drops onto the slide.",
      },
      {
        type: "p",
        text: "Millions of icons are searchable from the studio. Pick one and place it on the current frame — no separate asset hunt.",
      },
    ],
  },
  {
    slug: "canvas-basics",
    title: "Canvas basics",
    category: "Edit",
    blocks: [
      {
        type: "callout",
        text: "One slide at a time. The strip under the canvas is the carousel.",
      },
      {
        type: "ul",
        items: [
          "Drag objects to move them.",
          "Space pans the canvas. Scroll zooms.",
          "Right-click for actions on the selection.",
          "Esc leaves focus / clears selection.",
        ],
      },
    ],
  },
  {
    slug: "layers-inspector",
    title: "Layers & inspector",
    category: "Edit",
    blocks: [
      {
        type: "p",
        text: "Layers show what sits on the current slide. The inspector edits the selection — text, fill, size, and alignment.",
      },
      {
        type: "ul",
        items: [
          "Select a layer to highlight it on the canvas.",
          "Reorder when something sits behind the wrong object.",
          "Keep body text readable at phone size — zoom out and check.",
        ],
      },
    ],
  },
  {
    slug: "slides",
    title: "Slide navigator",
    category: "Edit",
    blocks: [
      {
        type: "callout",
        text: "Add, duplicate, delete, and reorder frames without leaving the editor.",
      },
      {
        type: "p",
        text: "The strip under the canvas is your carousel. Click a thumbnail to edit that frame. Generation already places cover, middle, and ending — you refine the sequence.",
      },
    ],
  },
  {
    slug: "keyboard",
    title: "Keyboard shortcuts",
    category: "Edit",
    blocks: [
      {
        type: "callout",
        text: "Keys 1–9 switch panels. Keep your hands on the keyboard when you can.",
      },
      {
        type: "kbd",
        rows: [
          { keys: "Ctrl / ⌘ + Z", action: "Undo" },
          { keys: "Ctrl / ⌘ + Y", action: "Redo" },
          { keys: "Space + drag", action: "Pan canvas" },
          { keys: "Scroll", action: "Zoom" },
          { keys: "Esc", action: "Clear focus / selection" },
          { keys: "1–9", action: "Switch sidebar panels" },
          { keys: "Delete / Backspace", action: "Remove selection" },
        ],
      },
    ],
  },
  {
    slug: "export",
    title: "Export PNG / ZIP",
    category: "Export & Share",
    blocks: [
      {
        type: "callout",
        text: "Each slide as its own file. The whole set as one archive. No watermark.",
      },
      {
        type: "ol",
        items: [
          {
            title: "Open Export in the editor header",
          },
          {
            title: "Choose PNG or JPEG frames",
            points: ["Or download a ZIP of the full carousel."],
          },
          {
            title: "Post to Instagram, LinkedIn, Threads, or Telegram",
          },
        ],
      },
    ],
  },
  {
    slug: "share",
    title: "Share a project",
    category: "Export & Share",
    blocks: [
      {
        type: "p",
        text: "Use Share from the editor when you want someone to view the carousel without exporting files. Sign in so the project stays linked to your account.",
      },
    ],
  },
  {
    slug: "publish",
    title: "Publish a template",
    category: "Export & Share",
    blocks: [
      {
        type: "callout",
        text: "Turn a finished layout into a reusable template for the library.",
      },
      {
        type: "p",
        text: "Publish from the editor when a structure is worth repeating. Others (and you) can open it later and rewrite the copy for a new topic.",
      },
    ],
  },
  {
    slug: "sign-in",
    title: "Sign in & save",
    category: "Account",
    blocks: [
      {
        type: "p",
        text: "An account keeps projects so you can come back. Drafts stay on the account — you do not rely on a single browser session.",
      },
      {
        type: "ul",
        items: [
          "Email + password, or Google.",
          "Confirm your email when prompted.",
          "You can set a password later if you started with Google.",
        ],
      },
    ],
  },
  {
    slug: "profile",
    title: "Profile settings",
    category: "Account",
    blocks: [
      {
        type: "p",
        text: "Open Manage Account / Profile from the user menu. Update your display name, password, theme, or delete the account.",
      },
      {
        type: "ul",
        items: [
          "Profile — display name and email (email is read-only).",
          "Security — change or set a password.",
          "Preferences — light / dark theme.",
          "Account — sign out or permanently delete.",
        ],
      },
    ],
  },
  {
    slug: "whats-new",
    title: "What's new",
    category: "Reference",
    blocks: [
      {
        type: "callout",
        text: "Product notes from the Swibp desk. Newest first.",
      },
      {
        type: "p",
        text: "Updates also appear in the editor under What's new. This page mirrors the same feed.",
      },
    ],
  },
  {
    slug: "contact",
    title: "Contact us",
    category: "Reference",
    blocks: [
      {
        type: "callout",
        text: "Questions, bugs, or ideas — write us. Feedback from the studio is welcome too.",
      },
      {
        type: "ul",
        items: [
          "Email: hello@swibp.io",
          "In the editor: Feedback sends a note with optional screenshots.",
          "Telegram & Threads: follow for presets and updates.",
        ],
      },
    ],
  },
  {
    slug: "social",
    title: "Social",
    category: "Reference",
    blocks: [
      {
        type: "callout",
        text: "New presets and updates land on Telegram and Threads.",
      },
      {
        type: "p",
        text: "Open Social from the user menu, or use the links on the Resources page.",
      },
    ],
  },
  {
    slug: "resources",
    title: "Resources",
    category: "Reference",
    blocks: [
      {
        type: "ul",
        items: [
          "Home — swibp.io landing and product story.",
          "Studio — create and edit carousels.",
          "Templates — browse layouts in Studio → Templates.",
          "Docs — this guide.",
          "Social — Telegram and Threads.",
        ],
      },
    ],
  },
  {
    slug: "faq",
    title: "FAQ",
    category: "Reference",
    blocks: [
      { type: "h2", text: "What is Swibp?" },
      {
        type: "p",
        text: "A studio for carousels. A topic becomes a sequence of slides, then you edit them on the canvas and export the frames.",
      },
      { type: "h2", text: "How is this different from Canva?" },
      {
        type: "p",
        text: "Canva starts from an empty layout. Swibp first builds the story across frames, then you finish the look in your studio: layers, templates, export.",
      },
      { type: "h2", text: "Is it free?" },
      {
        type: "p",
        text: "Yes. No subscription: generation, canvas edits, and PNG or ZIP export. Frames have no watermark.",
      },
      { type: "h2", text: "Do I need templates?" },
      {
        type: "p",
        text: "No. Generate from scratch, or take a template as a frame and rewrite it for your topic.",
      },
    ],
  },
];

export const DEFAULT_DOC_SLUG = DOC_PAGES[0]?.slug ?? "how-swibp-works";

export function getDocPage(slug: string): DocPage | undefined {
  return DOC_PAGES.find((page) => page.slug === slug);
}

export function getAllDocSlugs(): string[] {
  return DOC_PAGES.map((page) => page.slug);
}
