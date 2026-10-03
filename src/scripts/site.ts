/**
 * The site's only shared script (bundled, external, well under 2 KB):
 * Day/Night toggle, the menu sheet and the glass header after 24px of scroll.
 * Everything works without it except these three enhancements.
 * The theme itself is applied before first paint by the inline head script.
 */

const THEME_KEY = 'palmsays-theme';
type Theme = 'night' | 'day';

function currentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'day' ? 'day' : 'night';
}

function syncToggles(theme: Theme): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    button.setAttribute('aria-pressed', theme === 'day' ? 'true' : 'false');
  }
}

function setTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked (private mode): the choice lasts for this page only.
  }
  syncToggles(theme);
}

function initTheme(): void {
  syncToggles(currentTheme());
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    button.addEventListener('click', () => setTheme(currentTheme() === 'day' ? 'night' : 'day'));
  }
}

function initMenu(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-menu]');
  const openers = document.querySelectorAll<HTMLButtonElement>('[data-menu-open]');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  for (const opener of openers) {
    opener.addEventListener('click', () => {
      dialog.showModal();
      opener.setAttribute('aria-expanded', 'true');
    });
  }
  dialog.addEventListener('close', () => {
    for (const opener of openers) opener.setAttribute('aria-expanded', 'false');
  });
  dialog.querySelector('[data-menu-close]')?.addEventListener('click', () => dialog.close());
  // A tap on the backdrop (outside the sheet) closes it.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const box = dialog.getBoundingClientRect();
      const inside =
        event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
      if (!inside) dialog.close();
    }
  });
  // In-page links (e.g. /#sample) close the sheet so the target is visible.
  for (const link of dialog.querySelectorAll<HTMLAnchorElement>('[data-menu-link]')) {
    link.addEventListener('click', () => dialog.close());
  }
}

function initHeader(): void {
  const sentinel = document.querySelector('[data-scroll-sentinel]');
  if (!sentinel || !('IntersectionObserver' in window)) return;
  const root = document.documentElement;
  new IntersectionObserver(([entry]) => {
    if (!entry) return;
    root.toggleAttribute('data-scrolled', !entry.isIntersecting);
  }).observe(sentinel);
}

/**
 * The one gold action per screen (DESIGN_SYSTEM.md §7.1, §7.10):
 * - <html data-past-hero> once the hero's gold button ([data-hero-cta]) has
 *   scrolled up out of view: the header's outline "Scan my palm" appears.
 * - The mobile bottom bar ([data-sticky-cta]) shows only after that, and hides
 *   again while any in-page scan button ([data-scan-cta]) is on screen.
 * Without JS (or IntersectionObserver) nothing extra appears: the in-page
 * buttons still work.
 */
function initScanCta(): void {
  const hero = document.querySelector('[data-hero-cta]');
  if (!hero || !('IntersectionObserver' in window)) return;
  const root = document.documentElement;
  const bar = document.querySelector<HTMLElement>('[data-sticky-cta]');
  const onScreen = new Set<Element>();
  let pastHero = false;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === hero) pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      if (entry.isIntersecting) onScreen.add(entry.target);
      else onScreen.delete(entry.target);
    }
    root.toggleAttribute('data-past-hero', pastHero);
    if (bar) {
      const show = pastHero && onScreen.size === 0;
      bar.toggleAttribute('data-shown', show);
      bar.inert = !show;
    }
  });
  observer.observe(hero);
  for (const cta of document.querySelectorAll('[data-scan-cta]')) if (cta !== hero) observer.observe(cta);
  // The footer ends the page: the bar steps aside so it never covers the footer.
  const footer = document.querySelector('[data-site-footer]');
  if (footer) observer.observe(footer);
}

/** Footer link groups are disclosure rows on phones and open columns from 64rem. */
function initFooter(): void {
  const wide = matchMedia('(min-width: 64rem)');
  const sync = (): void => {
    for (const group of document.querySelectorAll<HTMLDetailsElement>('[data-footer-group]')) group.open = wide.matches;
  };
  sync();
  wide.addEventListener('change', sync);
}

initTheme();
initMenu();
initFooter();
initHeader();
initScanCta();
