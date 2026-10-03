/**
 * Laptop webcam capture (WEB-DEC-059): the pure parts, unit tested in
 * tests/unit/webcam.test.ts. The dialog (./dialog.ts) loads only when the
 * "Use laptop camera" button is pressed; ./wire.ts and the reading's Pick
 * screen decide whether to show that button.
 */

/** The same query as `.only-desktop` in global.css: a wide screen with a mouse or trackpad. */
export const DESKTOP_QUERY = '(min-width: 64rem) and (hover: hover) and (pointer: fine)';

/** True when this browser can ask for the webcam (secure page, camera API present). */
export function webcamSupported(nav: { mediaDevices?: { getUserMedia?: unknown } } | undefined): boolean {
  return typeof nav?.mediaDevices?.getUserMedia === 'function';
}

/** Show "Use laptop camera" instead of the phone's camera button? */
export function showWebcam(desktop: boolean, nav: Parameters<typeof webcamSupported>[0]): boolean {
  return desktop && webcamSupported(nav);
}

export type CameraErrorKind = 'denied' | 'none' | 'busy' | 'insecure' | 'failed';

/** Maps a getUserMedia failure to the plain-words message the dialog shows. */
export function cameraErrorKind(error: unknown, secure: boolean): CameraErrorKind {
  if (!secure) return 'insecure';
  const name = (error as { name?: unknown } | null)?.name;
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return 'denied';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'none';
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'busy';
    default:
      return 'failed';
  }
}

export interface FrameSource {
  videoWidth: number;
  videoHeight: number;
}

export interface CanvasLike {
  width: number;
  height: number;
  getContext(type: '2d'): { drawImage(source: never, x: number, y: number, w: number, h: number): void } | null;
  toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: number): void;
}

/**
 * One video frame → a JPEG `File`, at the camera's full size and NOT mirrored
 * (the preview is mirrored by CSS only), so it enters the upload pipeline
 * exactly like a photo picked from the gallery.
 */
export async function frameToFile(source: FrameSource, canvas: CanvasLike, now = Date.now()): Promise<File> {
  const { videoWidth: width, videoHeight: height } = source;
  if (!width || !height) throw new Error('frameToFile: the camera has no picture yet');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('frameToFile: no 2D canvas');
  context.drawImage(source as never, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  if (!blob) throw new Error('frameToFile: the photo could not be made');
  return new File([blob], `palm-camera-${now}.jpg`, { type: 'image/jpeg', lastModified: now });
}

/** The page's own address for the "continue on your phone" QR: no hash, no utm_*, plus ?from=desktop. */
export function phoneUrl(href: string, extra: Record<string, string> = {}): string {
  const url = new URL(href);
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (/^utm_/i.test(key) || key === 'from') url.searchParams.delete(key);
  }
  for (const [key, value] of Object.entries(extra)) url.searchParams.set(key, value);
  url.searchParams.set('from', 'desktop');
  return url.href;
}
