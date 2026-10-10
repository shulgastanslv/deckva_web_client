/** Studio empty-state art — muted surfaces with primary accents. */

type ArtProps = {
  className?: string;
};

/** Select an object — canvas frame + cursor, instead of a bare pointer. */
export function SelectObjectArt({ className = "h-auto w-full max-w-[180px]" }: ArtProps) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden>
      <circle cx="100" cy="75" r="54" fill="var(--muted)" />
      <rect x="36" y="22" width="100" height="106" rx="18" fill="var(--card)" />
      <rect x="52" y="40" width="48" height="8" rx="4" fill="var(--foreground)" />
      <rect x="52" y="56" width="32" height="6" rx="3" fill="var(--muted)" />
      <rect x="52" y="72" width="68" height="36" rx="10" fill="var(--muted)" />
      <rect x="60" y="84" width="36" height="6" rx="3" fill="var(--primary)" />
      <circle cx="36" cy="22" r="3.5" fill="var(--primary)" />
      <circle cx="136" cy="22" r="3.5" fill="var(--primary)" />
      <circle cx="36" cy="128" r="3.5" fill="var(--primary)" />
      <circle cx="136" cy="128" r="3.5" fill="var(--primary)" />
      <path d="M152 48v44l11-11 8 14 7-4-8-14 12-2z" fill="var(--foreground)" />
    </svg>
  );
}

/** Share project — link card. */
export function ShareProjectArt({ className = "h-auto w-full max-w-[200px]" }: ArtProps) {
  return (
    <svg viewBox="0 0 220 140" className={className} aria-hidden>
      <circle cx="110" cy="70" r="50" fill="var(--muted)" />
      <rect x="28" y="36" width="100" height="68" rx="18" fill="var(--card)" />
      <rect x="44" y="52" width="44" height="8" rx="4" fill="var(--foreground)" />
      <rect x="44" y="68" width="68" height="6" rx="3" fill="var(--muted)" />
      <rect x="44" y="82" width="40" height="6" rx="3" fill="var(--muted)" />
      <rect x="140" y="42" width="52" height="56" rx="16" fill="var(--card)" />
      <circle cx="166" cy="62" r="10" fill="var(--primary)" />
      <path
        d="M162 62h8M170 58l5 4-5 4"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="152" y="80" width="28" height="6" rx="3" fill="var(--muted)" />
    </svg>
  );
}

/** Notifications empty — quiet bell. */
export function NotificationsArt({ className = "h-auto w-full max-w-[160px]" }: ArtProps) {
  return (
    <svg viewBox="0 0 180 140" className={className} aria-hidden>
      <circle cx="90" cy="70" r="48" fill="var(--muted)" />
      <path
        d="M66 48c0-13 11-24 24-24s24 11 24 24v16l12 16H54l12-16V48z"
        fill="var(--card)"
      />
      <rect x="80" y="96" width="20" height="10" rx="5" fill="var(--foreground)" />
      <circle cx="122" cy="38" r="9" fill="var(--primary)" />
      <circle cx="122" cy="38" r="3.5" fill="var(--primary-foreground)" />
    </svg>
  );
}

/** Export — slide pack and PNG tile. */
export function ExportCanvasArt({ className = "h-auto w-full max-w-[200px]" }: ArtProps) {
  return (
    <svg viewBox="0 0 220 140" className={className} aria-hidden>
      <circle cx="110" cy="70" r="52" fill="var(--muted)" />
      <rect x="28" y="28" width="72" height="88" rx="16" fill="var(--card)" />
      <rect x="42" y="44" width="36" height="8" rx="4" fill="var(--foreground)" />
      <rect x="42" y="60" width="44" height="32" rx="8" fill="var(--muted)" />
      <rect x="112" y="28" width="72" height="88" rx="16" fill="var(--card)" />
      <rect x="126" y="44" width="36" height="8" rx="4" fill="var(--primary)" />
      <rect x="126" y="60" width="44" height="32" rx="8" fill="var(--muted)" />
      <text x="148" y="108" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--primary)">
        PNG
      </text>
    </svg>
  );
}

/** Help — phone with a short tip. */
export function HelpArt({ className = "size-24" }: ArtProps) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden>
      <circle cx="48" cy="48" r="40" fill="var(--muted)" />
      <rect x="28" y="12" width="40" height="72" rx="10" fill="var(--card)" />
      <rect x="40" y="18" width="16" height="4" rx="2" fill="var(--foreground)" />
      <rect x="34" y="28" width="28" height="5" rx="2.5" fill="var(--foreground)" />
      <rect x="34" y="38" width="20" height="4" rx="2" fill="var(--muted)" />
      <rect x="34" y="48" width="28" height="20" rx="6" fill="var(--muted)" />
      <rect x="40" y="55" width="16" height="4" rx="2" fill="var(--primary)" />
      <circle cx="42" cy="76" r="2" fill="var(--primary)" />
      <circle cx="48" cy="76" r="2" fill="var(--muted)" />
      <circle cx="54" cy="76" r="2" fill="var(--muted)" />
    </svg>
  );
}

/** Feedback — note with a photo tile. */
export function FeedbackArt({ className = "h-auto w-full max-w-[180px]" }: ArtProps) {
  return (
    <svg viewBox="0 0 200 130" className={className} aria-hidden>
      <circle cx="100" cy="65" r="48" fill="var(--muted)" />
      <rect x="28" y="28" width="96" height="74" rx="18" fill="var(--card)" />
      <rect x="44" y="44" width="48" height="8" rx="4" fill="var(--foreground)" />
      <rect x="44" y="60" width="64" height="6" rx="3" fill="var(--muted)" />
      <rect x="44" y="74" width="40" height="6" rx="3" fill="var(--muted)" />
      <rect x="136" y="40" width="40" height="40" rx="12" fill="var(--card)" />
      <rect x="144" y="48" width="24" height="24" rx="6" fill="var(--muted)" />
      <circle cx="152" cy="56" r="4" fill="var(--primary)" />
      <path d="M144 68l8-8 8 6 8-10" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
