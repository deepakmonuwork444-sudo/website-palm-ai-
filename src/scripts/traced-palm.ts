/**
 * The guide hero's one-time show (TracedPalm.astro, WEB-DEC-047). The page
 * already shows the final frame; when the photo is 40% on screen this adds
 * `.tp-play` (CSS draws the lines one by one), then offers "Play again".
 * Nothing runs under reduced motion, lite mode (showroom.ts) or Save-Data.
 */
const root = document.querySelector<HTMLElement>('[data-tp]');
const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
const calm = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.hasAttribute('data-lite') || nav.connection?.saveData === true;

if (root && 'IntersectionObserver' in window) {
  const replay = root.querySelector<HTMLButtonElement>('[data-tp-replay]');
  const play = () => {
    if (calm()) return;
    root.classList.remove('tp-play');
    void root.offsetWidth;
    root.classList.add('tp-play');
    if (replay) replay.hidden = false;
  };
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      io.disconnect();
      play();
    },
    { threshold: 0.4 },
  );
  io.observe(root.querySelector('.tp-box') ?? root);
  replay?.addEventListener('click', play);
}

export {};
