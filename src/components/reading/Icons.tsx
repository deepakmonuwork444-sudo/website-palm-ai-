/** The site's outline icons (Icon.astro, DESIGN_SYSTEM.md §8) as React, for the reading island. */

const common = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
  className: 'rd-icon',
};

export function LockIcon() {
  return (
    <svg {...common}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <path d="M12 7.6v.2" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg {...common}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg {...common}>
      <path d="M12 4v11" />
      <path d="M7.5 10.5 12 15l4.5-4.5" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

/** A chat bubble (the WhatsApp button is labelled with its name; no brand logo). */
export function ChatIcon() {
  return (
    <svg {...common}>
      <path d="M4.5 19.5l1.2-3.6A7.5 7.5 0 1 1 8.4 18.6Z" />
      <path d="M9.2 9.6c.3 1.9 2.3 4 4.4 4.6" />
    </svg>
  );
}

export function ShareIcon() {
  return (
    <svg {...common}>
      <path d="M12 15V4" />
      <path d="M8 7.5 12 3.5l4 4" />
      <path d="M6.5 11H6a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 18 11h-.5" />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg {...common}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  );
}

export function PenIcon() {
  return (
    <svg {...common}>
      <path d="M4.5 19.5l1-4L15.8 5.2a2 2 0 0 1 2.9 0l.1.1a2 2 0 0 1 0 2.9L8.5 18.5Z" />
      <path d="M13.8 7.2l3 3" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg {...common}>
      <path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6Z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </svg>
  );
}
