export type LegalKind = "terms" | "privacy";

export type LegalSectionDef = { heading: string; body: string[] };

export const TERMS_SECTIONS: LegalSectionDef[] = [
  { heading: "service", body: ["service1", "service2"] },
  { heading: "accounts", body: ["accounts1", "accounts2"] },
  { heading: "yourWork", body: ["yourWork1", "yourWork2", "yourWork3"] },
  {
    heading: "acceptableUse",
    body: ["acceptableUse1", "acceptableUse2", "acceptableUse3"],
  },
  { heading: "otherServices", body: ["otherServices1", "otherServices2"] },
  { heading: "saving", body: ["saving1", "saving2"] },
  { heading: "ending", body: ["ending1"] },
  { heading: "liability", body: ["liability1"] },
  { heading: "changes", body: ["changes1"] },
];

export const PRIVACY_SECTIONS: LegalSectionDef[] = [
  { heading: "who", body: ["who1"] },
  { heading: "account", body: ["account1", "account2", "account3"] },
  { heading: "projects", body: ["projects1", "projects2"] },
  { heading: "session", body: ["session1", "session2"] },
  { heading: "news", body: ["news1"] },
  { heading: "processors", body: ["processors1", "processors2"] },
  { heading: "retention", body: ["retention1", "retention2"] },
  { heading: "choices", body: ["choices1", "choices2"] },
  { heading: "children", body: ["children1"] },
  { heading: "security", body: ["security1", "security2"] },
];

export function legalSectionsFor(kind: LegalKind): LegalSectionDef[] {
  return kind === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS;
}
