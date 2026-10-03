/**
 * "Use laptop camera" on the photo tools (WEB-DEC-059). Each
 * `<button data-webcam="<gallery input id>">` (WebcamButton.astro) is shown on
 * a desktop with a camera API; pressing it loads the dialog by import() and
 * hands the captured JPEG to that gallery input as if the person had picked
 * it, so the tool's own checks run unchanged. Phones never see it.
 */
import { DESKTOP_QUERY, showWebcam } from './core';

const buttons = [...document.querySelectorAll<HTMLButtonElement>('button[data-webcam]')];

if (buttons.length) {
  const query = window.matchMedia(DESKTOP_QUERY);
  const sync = () => {
    const on = showWebcam(query.matches, navigator);
    for (const button of buttons) {
      button.hidden = !on;
      // Lets tools.css drop the desktop gold from the gallery picker: one gold action.
      button.parentElement?.toggleAttribute('data-cam', on);
    }
  };
  sync();
  query.addEventListener('change', sync);

  for (const button of buttons) {
    // Same weight as the phone's camera button: the tool scripts switch it gold/secondary, the webcam button follows.
    const camera = button.parentElement?.querySelector<HTMLElement>('[data-camera-label]');
    if (camera) {
      const follow = () => {
        const gold = camera.classList.contains('btn-gold');
        button.classList.toggle('btn-gold', gold);
        button.classList.toggle('btn-secondary', !gold);
      };
      follow();
      new MutationObserver(follow).observe(camera, { attributes: true, attributeFilter: ['class'] });
    }

    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.webcam ?? '');
      if (!(input instanceof HTMLInputElement)) return;
      void import('./dialog').then(async ({ openWebcam }) => {
        const file = await openWebcam({ onUpload: () => input.click() });
        if (!file) return;
        const transfer = new DataTransfer();
        transfer.items.add(file);
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }
}
