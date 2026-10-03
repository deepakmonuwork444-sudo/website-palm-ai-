/**
 * Showroom motion (WEB-DEC-042): scroll reveal, card spotlight and device tilt.
 * Progressive: nothing is hidden until this script runs, and nothing runs under
 * reduced motion. Tilt and spotlight only on a fine hover pointer (desktop).
 */
const html = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
// deviceMemory rounds down (a 6 GB device reports 4), so lite means truly low-end: under 4 threads or under 4 GB, or Save-Data.
const lite = (navigator.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4 || nav.connection?.saveData === true;
if (lite) html.dataset.lite = '';

// Elements that rise in. The home story animates itself, so it is left alone.
const REVEAL = [
  '.section-head', '.glass-card', '.card', '.step', '.glance', '.part', '.faq', '.app-card', '.sample-head',
  '.showroom-reveal', '.tool-panel', '.guide-block',
].join(',');

if (!reduced && 'IntersectionObserver' in window) {
  const targets = [...document.querySelectorAll<HTMLElement>(REVEAL)].filter(
    (el) => !el.closest('[data-story], dialog, header, [data-no-reveal]') && !el.parentElement?.closest(REVEAL),
  );
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('rv-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  for (const el of targets) {
    // Stagger siblings in the same row: 70 ms apart, at most 5 steps.
    const index = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    const liIndex = el.parentElement?.tagName === 'LI' ? [...(el.parentElement.parentElement?.children ?? [])].indexOf(el.parentElement) : -1;
    el.style.setProperty('--rv-delay', `${Math.min(Math.max(index, liIndex, 0), 5) * 70}ms`);
    el.classList.add('rv');
    io.observe(el);
  }
  html.dataset.reveal = '';
}

if (!reduced && finePointer && !lite) {
  // Spotlight: a soft light follows the pointer across glass cards.
  document.addEventListener(
    'pointermove',
    (event) => {
      const card = (event.target as Element | null)?.closest<HTMLElement>('.glass-card, .card');
      if (!card) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - box.left}px`);
      card.style.setProperty('--my', `${event.clientY - box.top}px`);
    },
    { passive: true },
  );

  // Tilt: devices and hero objects lean toward the pointer, at most 5 degrees.
  for (const el of document.querySelectorAll<HTMLElement>('[data-tilt], .device')) {
    let frame = 0;
    el.addEventListener('pointermove', (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = el.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        el.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`);
        el.style.setProperty('--tilt-y', `${(x * 8).toFixed(2)}deg`);
      });
    });
    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
    });
  }
}
