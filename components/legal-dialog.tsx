"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type LegalKind = "terms" | "privacy";

const UPDATED = "October 8, 2026";

const TERMS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "The service",
    paragraphs: [
      "Deckva is a studio for designing, saving, and exporting carousel slides. These terms cover the website, the editor, accounts, templates, sharing, and export.",
      "By creating an account or using the studio, you agree to these terms. If you do not agree, do not use Deckva.",
    ],
  },
  {
    heading: "Accounts",
    paragraphs: [
      "You need an account to save projects. You can sign up with email and a password, or with Google. You are responsible for the account and for keeping the sign-in method under your control.",
      "Give accurate account details. We may refuse or close an account that is used to break these terms or the law.",
    ],
  },
  {
    heading: "Your work",
    paragraphs: [
      "You keep the rights to the text, images, and designs you create or upload. Deckva does not claim ownership of your projects.",
      "You give Deckva a limited permission to store, display, and process that work so the studio can save it, show it back to you, generate a preview, and export or share it when you ask.",
      "You confirm that you have the rights you need for anything you upload, including photos, icons, and fonts, and that your work does not infringe someone else's rights.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      "Do not use Deckva to break the law, to harm other people, or to upload malware. Do not attempt to access another person's account, projects, or private data.",
      "Do not overload the service, scrape it in a way that degrades it for others, or bypass a limit that is there to protect the studio.",
      "Built-in templates are for use inside Deckva. Do not present them as your own stock library outside the product.",
    ],
  },
  {
    heading: "Other services",
    paragraphs: [
      "Sign-in can go through Google. Fonts can load from Google Fonts. Icons can come from IconScout, and placing an SVG icon can spend a download on that account. Carousel generation runs locally through Ollama on your machine.",
      "Those services have their own terms. Deckva is not responsible for an outage or a change on their side.",
    ],
  },
  {
    heading: "Saving and availability",
    paragraphs: [
      "Projects are saved to your account, including by autosave. A save can fail if the network drops or the file is unusually large. Keep an export if a project is important.",
      "The studio is provided as it is. Features can change, and access can be interrupted for maintenance or for a failure we do not control.",
    ],
  },
  {
    heading: "Ending use",
    paragraphs: [
      "You can stop using Deckva at any time and delete projects from the projects panel. We can suspend access if an account is used in a way that breaks these terms or puts the service or other people at risk.",
    ],
  },
  {
    heading: "Liability",
    paragraphs: [
      "To the extent the law allows, Deckva is not liable for lost work, lost profits, or indirect damage arising from the use of the studio. Nothing in these terms limits liability that the law does not allow us to limit.",
    ],
  },
  {
    heading: "Changes",
    paragraphs: [
      `These terms were last updated on ${UPDATED}. If the terms change in a material way, the updated text will appear here. Continuing to use Deckva after that update means you accept the new terms.`,
    ],
  },
];

const PRIVACY: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "Who this covers",
    paragraphs: [
      "This policy explains what Deckva collects when you use the carousel studio, why it is collected, and the choices you have. It applies to the account, the editor, saved projects, and the messages we show in the product.",
    ],
  },
  {
    heading: "Account data",
    paragraphs: [
      "If you create an account with email, we store the email address, a hash of the password, your name if you set one, and whether the email is confirmed. We send a confirmation message and can send a password reset. We do not store the password in plain text.",
      "If you sign in with Google, we receive the account id, email, name, and profile image that Google shares for sign-in. We store those so the session can recognize you.",
      "An administrator list can mark some email addresses as admins. That role is stored on the account.",
    ],
  },
  {
    heading: "Projects and files",
    paragraphs: [
      "We store the projects you save: titles, slide data, colors, text, layout, and preview images. Images you upload, including an author avatar, are stored inside the project so it can be opened again.",
      "Autosave writes the open project while you work. Share makes a project available at its link when you turn sharing on.",
    ],
  },
  {
    heading: "Session and technical data",
    paragraphs: [
      "A signed-in session is kept in a cookie so you stay logged in. The cookie is required for the account to work. We also process the usual server logs of a request, such as the time and the page, to run and protect the service.",
      "We do not use a separate advertising tracker, and we do not sell personal information.",
    ],
  },
  {
    heading: "News and notifications",
    paragraphs: [
      "If an admin publishes news or sends a notification, the title and text are stored and shown to accounts. A notification records when you have opened the list.",
    ],
  },
  {
    heading: "Processors",
    paragraphs: [
      "The database that holds accounts and projects is hosted for us. Google handles Google sign-in. Google Fonts serves typefaces you pick, so a font request includes the family name. IconScout serves icon search and downloads when you use that panel. Generation prompts stay on your machine via Ollama.",
      "Those providers process data under their own policies, only for the feature you used.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "Account and project data stay until you delete the project or the account is removed. Server logs are kept only as long as needed to operate and secure the service.",
      "You can delete a project from the projects panel. Deleting a project removes its slides from the studio.",
    ],
  },
  {
    heading: "Your choices",
    paragraphs: [
      "You can edit your project, turn sharing off, and sign out. You can choose not to upload an image or not to use icon search, fonts beyond the ones already on the slide, or AI generation.",
      "If the law where you live gives you a right to access, correct, or delete personal information, write to the address you use to reach Deckva and we will respond.",
    ],
  },
  {
    heading: "Children",
    paragraphs: [
      "Deckva is not directed at children under 16, and we do not knowingly create accounts for them. If you believe a child has given us personal information, contact us and we will delete it.",
    ],
  },
  {
    heading: "Security and changes",
    paragraphs: [
      "We protect stored passwords with a hash and send the session over the connection the site uses. No method of storage is perfect, so do not upload information you cannot afford to lose.",
      `This policy was last updated on ${UPDATED}. The current version is the one shown in the studio.`,
    ],
  },
];

const COPY: Record<LegalKind, { title: string; intro: string; sections: { heading: string; paragraphs: string[] }[] }> = {
  terms: {
    title: "Terms of Service",
    intro: "The rules for using the Deckva studio.",
    sections: TERMS,
  },
  privacy: {
    title: "Privacy Policy",
    intro: "What the studio stores, and why.",
    sections: PRIVACY,
  },
};

interface LegalDialogProps {
  kind: LegalKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LegalDialog({ kind, open, onOpenChange }: LegalDialogProps) {
  const copy = COPY[kind];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl border-border/70 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border/40 px-5 pt-4 pb-3 text-left">
          <DialogTitle className="text-[13px] font-semibold tracking-tight">{copy.title}</DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">{copy.intro}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[min(70vh,560px)] space-y-4 overflow-y-auto px-5 py-4">
          {copy.sections.map((section) => (
            <section key={section.heading} className="space-y-1.5">
              <h3 className="text-[13px] font-medium text-foreground">{section.heading}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-[13px] leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
