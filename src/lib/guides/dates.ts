import { site } from '../../config/site';

/**
 * A guide's real dates (WEB-DEC-049, owner decision D10). Before launch the front matter
 * `published` is only the day the draft was finished; once the owner sets `site.launchDate`,
 * a guide counts as published on the launch day, unless its own `published` date is later
 * (a guide added after launch). `modified` is never earlier than `published`.
 * The visible "Last reviewed" line keeps the real review date (`updated`): a launch is not a review.
 */
export function guideDates(
  published: string,
  updated: string,
  launchDate: string | null = site.launchDate,
): { published: string; modified: string } {
  const start = launchDate && launchDate > published ? launchDate : published;
  return { published: start, modified: updated > start ? updated : start };
}
