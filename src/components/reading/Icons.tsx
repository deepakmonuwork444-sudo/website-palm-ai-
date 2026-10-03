/**
 * The site's icon set (src/lib/icons.ts, DESIGN_SYSTEM.md §8) as React, for the
 * reading island: the same solid duotone drawings, written as JSX (the island
 * never injects HTML). Keep in step with src/lib/icons.ts.
 */
import type { ReactNode } from 'react';

function SiteIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="rd-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={true}
      focusable={false}
    >
      {children}
    </svg>
  );
}

/** Second tone: one group at 40 %. */
const Soft = ({ children }: { children: ReactNode }) => <g opacity={0.4}>{children}</g>;
const Stroke = ({ d, w = 2.4 }: { d: string; w?: number }) => <path d={d} fill="none" stroke="currentColor" strokeWidth={w} />;

export function LockIcon() {
  return (
    <SiteIcon>
      <Soft><Stroke d="M7.9 10.6V8.1a4.1 4.1 0 0 1 8.2 0v2.5" /></Soft>
      <path fillRule="evenodd" d="M7.4 10h9.2a3 3 0 0 1 3 3v5.6a3 3 0 0 1-3 3H7.4a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3zM11.3 15.64a1.6 1.6 0 1 1 1.4 0l.45 2.5h-2.3z" />
    </SiteIcon>
  );
}

export function InfoIcon() {
  return (
    <SiteIcon>
      <Soft><circle cx="12" cy="12" r="9.8" /></Soft>
      <rect x="10.85" y="10.4" width="2.3" height="7.2" rx="1.15" />
      <circle cx="12" cy="7.4" r="1.45" />
    </SiteIcon>
  );
}

export function CheckIcon() {
  return (
    <SiteIcon>
      <Stroke d="M4.8 12.6l4.6 4.6L19.2 7.2" w={2.5} />
    </SiteIcon>
  );
}

export function DownloadIcon() {
  return (
    <SiteIcon>
      <Soft><rect x="2.8" y="15.4" width="18.4" height="6" rx="2.6" /></Soft>
      <Stroke d="M12 3.2v11M7.4 9.8l4.6 4.6 4.6-4.6" />
    </SiteIcon>
  );
}

/** A chat bubble (the WhatsApp button is labelled with its name; no brand logo). */
export function ChatIcon() {
  return (
    <SiteIcon>
      <path
        fillRule="evenodd"
        d="M12 3c5.1 0 9.2 3.6 9.2 8.1s-4.1 8.1-9.2 8.1c-1.2 0-2.4-.2-3.5-.6L3.4 20.8l1.5-4.4C3.6 15 2.8 13.1 2.8 11.1 2.8 6.6 6.9 3 12 3ZM6.7 11.1a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0-2.6 0zM10.7 11.1a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0-2.6 0zM14.7 11.1a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0-2.6 0z"
      />
    </SiteIcon>
  );
}

export function ShareIcon() {
  return (
    <SiteIcon>
      <Soft><rect x="4" y="9.6" width="16" height="12" rx="3" /></Soft>
      <Stroke d="M12 15V3.4M7.8 7.4 12 3.2l4.2 4.2" />
    </SiteIcon>
  );
}

export function LinkIcon() {
  return (
    <SiteIcon>
      <Soft><Stroke d="M10.3 13.7a4.1 4.1 0 0 0 5.8 0l3-3a4.1 4.1 0 0 0-5.8-5.8l-1 1" /></Soft>
      <Stroke d="M13.7 10.3a4.1 4.1 0 0 0-5.8 0l-3 3a4.1 4.1 0 0 0 5.8 5.8l1-1" />
    </SiteIcon>
  );
}

export function PenIcon() {
  return (
    <SiteIcon>
      <g transform="rotate(45 12 12)">
        <Soft><rect x="9.7" y="1.4" width="4.6" height="3.4" rx="1.4" /></Soft>
        <rect x="9.7" y="5.4" width="4.6" height="11.6" rx="0.9" />
        <Soft><path d="M9.7 17.6h4.6L12 22.4Z" /></Soft>
      </g>
    </SiteIcon>
  );
}

export function ShieldIcon() {
  return (
    <SiteIcon>
      <Soft><path d="M12 2.4 4.4 5.4v6c0 4.7 3.2 8.6 7.6 10.2 4.4-1.6 7.6-5.5 7.6-10.2v-6Z" /></Soft>
      <Stroke d="M8.4 12.2l2.5 2.5 4.7-4.9" />
    </SiteIcon>
  );
}
