/**
 * Hand landmarks as MediaPipe's Hand Landmarker returns them (21 points per
 * hand, x/y normalised to the photo, z = relative depth), plus the model's
 * handedness guess. Pure types and constants: the measurement maths and the
 * unit tests import this file, the browser detector fills it.
 *
 * Index map (MediaPipe hand model): 0 wrist; thumb 1 CMC, 2 MCP, 3 IP, 4 tip;
 * index 5–8, middle 9–12, ring 13–16, little 17–20 (each MCP, PIP, DIP, tip).
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export type Handedness = 'Left' | 'Right';

export interface DetectedHand {
  /** 21 points, normalised to the photo the model saw (0–1; a cut-off part can fall outside). */
  landmarks: Landmark[];
  /** 21 points in metres around the hand's centre (the model's 3D estimate), or null. */
  world: Landmark[] | null;
  /**
   * The model's guess of which hand this is. Checked on 2026-09-26 with
   * @mediapipe/tasks-vision 1.0.1 on ordinary (not mirrored) photos: a right
   * palm and the back of a right hand both come back "Right", so the label is
   * the real hand, and the palm/back question is answered by the point order.
   */
  handedness: Handedness;
  handednessScore: number;
}

export interface PhotoHands {
  /** The size of the image the model saw (our downscaled copy). */
  width: number;
  height: number;
  hands: DetectedHand[];
}

export const LM = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  LITTLE_MCP: 17,
  LITTLE_PIP: 18,
  LITTLE_DIP: 19,
  LITTLE_TIP: 20,
} as const;

export type Finger = 'index' | 'middle' | 'ring' | 'little';

/** Each finger's four points, base knuckle (MCP) to tip. */
export const FINGER_POINTS: Record<Finger, readonly [number, number, number, number]> = {
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  little: [17, 18, 19, 20],
};

/** The thumb's visible part: base knuckle (MCP), joint (IP), tip. */
export const THUMB_POINTS = [2, 3, 4] as const;

/** The palm outline through the model's points: wrist, thumb base, the four knuckles. */
export const PALM_OUTLINE = [0, 1, 5, 9, 13, 17] as const;

/** Bones to draw, as [from, to] pairs (MediaPipe's own hand connections). */
export const HAND_BONES: readonly (readonly [number, number])[] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];
