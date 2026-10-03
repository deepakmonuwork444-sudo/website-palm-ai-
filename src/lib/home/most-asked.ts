/**
 * "Most asked this week" on the home page: shown ONLY from real, dated counts
 * (the counts API, WEB-FEAT-030 / WEB-SRV-010). There is no data source yet,
 * so this returns null and the block is not rendered. Never fill it by hand:
 * invented popularity is a banned lever (UX_PSYCHOLOGY.md §5, CCPA pattern 1).
 */

export interface MostAskedItem {
  /** The part people opened most (e.g. "Love"), in the page's language. */
  label: string;
  /** Real count for the week, rounded down. */
  count: number;
}

export interface MostAsked {
  items: MostAskedItem[];
  /** ISO date of the week's end, shown with the numbers. */
  weekEnding: string;
}

export function mostAskedThisWeek(): MostAsked | null {
  return null;
}
