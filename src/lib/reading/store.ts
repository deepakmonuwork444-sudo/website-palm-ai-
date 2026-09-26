/**
 * Readings saved in THIS browser only (IndexedDB): the 1,080 px photo, the
 * traced lines and the reading as the visitor saw it — already locked
 * (lockSynthesis), so a locked part's text is never stored here either.
 * Never uploaded again, never moved to the app (SECURITY_PRIVACY.md §1).
 * If IndexedDB is blocked (private mode), readings live for this tab only.
 */

import type { FinishedSynthesis } from './palm/features/knowledge/synthesis/modules';
import type { HandSide } from './palm/features/observation/taxonomy';

export type TracedLineName = 'heart' | 'head' | 'life' | 'fate';

export interface TracedLine {
  type: TracedLineName;
  /** Normalised 0..1 points on the photo (origin top-left). */
  path: [number, number][];
}

export interface SavedReading {
  id: string;
  createdAt: string;
  handSide: HandSide;
  photo: Blob;
  photoWidth: number;
  photoHeight: number;
  lines: TracedLine[];
  /** The four main lines the scan did not trace (drawn as dashed "not clearly seen" chips). */
  missing: TracedLineName[];
  /** The reading as shown: locked parts keep only their first sentence. Null = could not be written. */
  synthesis: FinishedSynthesis | null;
  /** True for a preview (mock) reading: a stored sample scan, not this visitor's palm. */
  preview: boolean;
}

export interface ReadingStore {
  list(): Promise<SavedReading[]>;
  put(reading: SavedReading): Promise<void>;
  remove(id: string): Promise<void>;
}

export function memoryStore(initial: SavedReading[] = []): ReadingStore {
  const items = new Map(initial.map((r) => [r.id, r]));
  return {
    async list() {
      return [...items.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    async put(reading) {
      items.set(reading.id, reading);
    },
    async remove(id) {
      items.delete(id);
    },
  };
}

const DB_NAME = 'palmsays-readings';
const STORE = 'readings';

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('indexeddb'));
  });
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('indexeddb'));
    req.onblocked = () => reject(new Error('indexeddb blocked'));
  });
}

/** IndexedDB when it works; this tab's memory when it does not. */
export function browserStore(): ReadingStore {
  const fallback = memoryStore();
  let db: Promise<IDBDatabase | null> | null = null;
  const database = () => {
    db ??= (typeof indexedDB === 'undefined' ? Promise.resolve(null) : open().catch(() => null));
    return db;
  };
  return {
    async list() {
      const d = await database();
      if (!d) return fallback.list();
      try {
        const all = (await request(d.transaction(STORE, 'readonly').objectStore(STORE).getAll())) as SavedReading[];
        return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      } catch {
        return fallback.list();
      }
    },
    async put(reading) {
      const d = await database();
      if (!d) return fallback.put(reading);
      try {
        await request(d.transaction(STORE, 'readwrite').objectStore(STORE).put(reading));
      } catch {
        await fallback.put(reading);
      }
    },
    async remove(id) {
      const d = await database();
      await fallback.remove(id);
      if (!d) return;
      try {
        await request(d.transaction(STORE, 'readwrite').objectStore(STORE).delete(id));
      } catch {
        // Nothing more to do: it is gone from this tab.
      }
    },
  };
}
