/**
 * Home page only (a few hundred bytes): "You have N readings saved in this
 * browser", counted from the reading page's own IndexedDB store — a real,
 * personal number, never a guess (UX_PSYCHOLOGY.md §5). Nothing shows when
 * there is nothing saved, when storage is blocked, or when the browser can't
 * list its databases.
 *
 * It never CREATES the database: opening a missing one would make an empty
 * version-1 database without its store and break the reading page later.
 * The names must match src/lib/reading/store.ts (a unit test checks them).
 */

export const READINGS_DB = 'palmsays-readings';
export const READINGS_STORE = 'readings';

async function savedReadings(): Promise<number> {
  if (typeof indexedDB === 'undefined' || typeof indexedDB.databases !== 'function') return 0;
  const list = await indexedDB.databases();
  if (!list.some((db) => db.name === READINGS_DB)) return 0;
  return new Promise((resolve) => {
    const request = indexedDB.open(READINGS_DB);
    request.onupgradeneeded = () => {
      request.transaction?.abort();
      resolve(0);
    };
    request.onerror = () => resolve(0);
    request.onblocked = () => resolve(0);
    request.onsuccess = () => {
      const db = request.result;
      try {
        if (!db.objectStoreNames.contains(READINGS_STORE)) {
          db.close();
          resolve(0);
          return;
        }
        const count = db.transaction(READINGS_STORE, 'readonly').objectStore(READINGS_STORE).count();
        count.onsuccess = () => {
          db.close();
          resolve(count.result);
        };
        count.onerror = () => {
          db.close();
          resolve(0);
        };
      } catch {
        db.close();
        resolve(0);
      }
    };
  });
}

async function showSaved(): Promise<void> {
  const box = document.querySelector<HTMLElement>('[data-saved]');
  const text = box?.querySelector<HTMLElement>('[data-saved-text]');
  if (!box || !text) return;
  const count = await savedReadings().catch(() => 0);
  if (count < 1) return;
  const template = count === 1 ? box.dataset.one : box.dataset.many;
  if (!template) return;
  text.textContent = template.replace('{n}', String(count));
  box.hidden = false;
}

if (typeof document !== 'undefined') void showSaved();
