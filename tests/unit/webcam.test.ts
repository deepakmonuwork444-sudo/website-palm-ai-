import { describe, expect, it, vi } from 'vitest';

import { cameraErrorKind, DESKTOP_QUERY, frameToFile, phoneUrl, showWebcam, webcamSupported, type CanvasLike } from '../../src/lib/webcam/core';

describe('webcam device detection', () => {
  const withCamera = { mediaDevices: { getUserMedia: () => Promise.resolve() } };

  it('matches the .only-desktop query', () => {
    expect(DESKTOP_QUERY).toBe('(min-width: 64rem) and (hover: hover) and (pointer: fine)');
  });

  it('needs the camera API', () => {
    expect(webcamSupported(withCamera)).toBe(true);
    expect(webcamSupported({ mediaDevices: {} })).toBe(false);
    expect(webcamSupported({})).toBe(false);
    expect(webcamSupported(undefined)).toBe(false);
  });

  it('shows the webcam button on a desktop with a camera API only', () => {
    expect(showWebcam(true, withCamera)).toBe(true);
    expect(showWebcam(false, withCamera)).toBe(false); // phones and tablets keep the camera file input
    expect(showWebcam(true, {})).toBe(false); // insecure page or old browser: no button
  });
});

describe('cameraErrorKind', () => {
  const err = (name: string) => Object.assign(new Error(name), { name });

  it('maps getUserMedia errors to plain-words kinds', () => {
    expect(cameraErrorKind(err('NotAllowedError'), true)).toBe('denied');
    expect(cameraErrorKind(err('SecurityError'), true)).toBe('denied');
    expect(cameraErrorKind(err('NotFoundError'), true)).toBe('none');
    expect(cameraErrorKind(err('NotReadableError'), true)).toBe('busy');
    expect(cameraErrorKind(err('TypeError'), true)).toBe('failed');
    expect(cameraErrorKind(null, true)).toBe('failed');
  });

  it('says "insecure" on an http page whatever the error', () => {
    expect(cameraErrorKind(err('NotAllowedError'), false)).toBe('insecure');
    expect(cameraErrorKind(null, false)).toBe('insecure');
  });
});

function fakeCanvas(blob: Blob | null = new Blob(['jpeg'], { type: 'image/jpeg' })) {
  const context = { drawImage: vi.fn(), scale: vi.fn(), setTransform: vi.fn() };
  const toBlob = vi.fn((callback: (b: Blob | null) => void, _type?: string, _quality?: number) => callback(blob));
  const canvas = { width: 0, height: 0, getContext: () => context, toBlob } as unknown as CanvasLike;
  return { canvas, context, toBlob };
}

describe('frameToFile', () => {
  it('makes a full-size, unmirrored JPEG File', async () => {
    const { canvas, context, toBlob } = fakeCanvas();
    const video = { videoWidth: 1920, videoHeight: 1080 };
    const file = await frameToFile(video, canvas, 1700000000000);
    expect(file).toBeInstanceOf(File);
    expect(file.type).toBe('image/jpeg');
    expect(file.name).toBe('palm-camera-1700000000000.jpg');
    expect(file.size).toBeGreaterThan(0);
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
    expect(context.drawImage).toHaveBeenCalledWith(video, 0, 0, 1920, 1080);
    expect(context.scale).not.toHaveBeenCalled();
    expect(context.setTransform).not.toHaveBeenCalled();
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.92);
  });

  it('refuses a camera with no picture yet', async () => {
    const { canvas } = fakeCanvas();
    await expect(frameToFile({ videoWidth: 0, videoHeight: 0 }, canvas)).rejects.toThrow(/no picture/);
  });

  it('fails clearly when the browser cannot encode', async () => {
    const { canvas } = fakeCanvas(null);
    await expect(frameToFile({ videoWidth: 640, videoHeight: 480 }, canvas)).rejects.toThrow(/could not be made/);
  });
});

describe('phoneUrl', () => {
  it('adds ?from=desktop, drops the hash and any utm', () => {
    expect(phoneUrl('https://palmsays.com/reading/?utm_source=x&utm_medium=y#top')).toBe('https://palmsays.com/reading/?from=desktop');
    expect(phoneUrl('https://palmsays.com/tools/hand-type-quiz/')).toBe('https://palmsays.com/tools/hand-type-quiz/?from=desktop');
  });

  it('keeps other parameters and adds extras', () => {
    expect(phoneUrl('https://palmsays.com/reading/?reading=mock&from=desktop', { lang: 'hi' })).toBe('https://palmsays.com/reading/?reading=mock&lang=hi&from=desktop');
  });
});
