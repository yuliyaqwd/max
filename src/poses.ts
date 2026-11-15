import type { AnimKey } from "./types";

// Tiny forward-kinematics "stick figure" engine. A pose is a set of absolute angles;
// animations interpolate angles between key poses, so limb lengths always stay constant.
// Angles: 0 = pointing down, +90 = forward (right), 180 = up, -90 = backward (left).
// Torso angle: 0 = upright, +90 = leaning forward (horizontal, head to the right).

export const GROUND = 78;
export const VIEW_W = 120;
export const VIEW_Y = -8;
export const VIEW_H = 98;

type Joint = "hip" | "handN" | "handF" | "footN" | "footF";
export type Pt = [number, number];
export type Pose = {
  t: number;
  hd?: number;
  aN: [number, number];
  aF: [number, number];
  lN: [number, number];
  lF: [number, number];
  lift?: number;
  pin?: { joint: Joint; x: number; y?: number };
};
export type Skeleton = {
  head: Pt; neck: Pt; shoulder: Pt; hip: Pt;
  elbowN: Pt; handN: Pt; elbowF: Pt; handF: Pt;
  kneeN: Pt; footN: Pt; kneeF: Pt; footF: Pt;
};
export type Scene = "ground" | "mat" | "bar" | "lowbar" | "bench" | "none";
export type AnimSpec = { frames: Pose[]; mode: "pingpong" | "loop"; period: number; scene: Scene; rope?: boolean };

const rad = (d: number) => (d * Math.PI) / 180;
const down = (a: number, len: number): Pt => [Math.sin(rad(a)) * len, Math.cos(rad(a)) * len];
const up = (t: number, len: number): Pt => [Math.sin(rad(t)) * len, -Math.cos(rad(t)) * len];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];

export function solve(p: Pose): Skeleton {
  const hip: Pt = [0, 0];
  const shoulder = add(hip, up(p.t, 21));
  const neck = add(hip, up(p.t, 24));
  const head = add(neck, up(p.t + (p.hd ?? 0), 9));
  const elbowN = add(shoulder, down(p.aN[0], 11));
  const handN = add(elbowN, down(p.aN[1], 10));
  const elbowF = add(shoulder, down(p.aF[0], 11));
  const handF = add(elbowF, down(p.aF[1], 10));
  const kneeN = add(hip, down(p.lN[0], 14));
  const footN = add(kneeN, down(p.lN[1], 14));
  const kneeF = add(hip, down(p.lF[0], 14));
  const footF = add(kneeF, down(p.lF[1], 14));
  const sk: Skeleton = { head, neck, shoulder, hip, elbowN, handN, elbowF, handF, kneeN, footN, kneeF, footF };

  const pts = Object.values(sk) as Pt[];
  const lowest = Math.max(...pts.map((q) => q[1]));
  let dx = 60 - hip[0];
  let dy = GROUND - (p.lift ?? 0) - lowest;
  if (p.pin) {
    const j = sk[p.pin.joint];
    dx = p.pin.x - j[0];
    if (p.pin.y !== undefined) dy = p.pin.y - j[1];
  }
  const out = {} as Skeleton;
  (Object.keys(sk) as (keyof Skeleton)[]).forEach((k) => {
    out[k] = [sk[k][0] + dx, sk[k][1] + dy];
  });
  return out;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp2 = (a: [number, number], b: [number, number], k: number): [number, number] => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

function blend(a: Pose, b: Pose, k: number): Pose {
  const pin = a.pin && b.pin ? { joint: a.pin.joint, x: lerp(a.pin.x, b.pin.x, k), y: a.pin.y !== undefined && b.pin.y !== undefined ? lerp(a.pin.y, b.pin.y, k) : a.pin.y } : a.pin ?? b.pin;
  return {
    t: lerp(a.t, b.t, k),
    hd: lerp(a.hd ?? 0, b.hd ?? 0, k),
    aN: lerp2(a.aN, b.aN, k),
    aF: lerp2(a.aF, b.aF, k),
    lN: lerp2(a.lN, b.lN, k),
    lF: lerp2(a.lF, b.lF, k),
    lift: lerp(a.lift ?? 0, b.lift ?? 0, k),
    pin,
  };
}

// Skeleton at time `ms` (and the normalized cycle position 0..1, used for props like the rope).
export function frameAt(spec: AnimSpec, ms: number, hold = false): { sk: Skeleton; cycle: number; p: number } {
  const cycle = (ms % spec.period) / spec.period;
  if (spec.mode === "pingpong") {
    let p = (1 - Math.cos(2 * Math.PI * cycle)) / 2;
    if (hold) {
      const q = Math.min(1, Math.max(0, (p - 0.2) / 0.6));
      p = q * q * (3 - 2 * q);
    }
    return { sk: solve(blend(spec.frames[0], spec.frames[1], p)), cycle, p };
  }
  // loop: the last frame equals the first one visually
  const segs = spec.frames.length - 1;
  const x = cycle * segs;
  const i = Math.min(segs - 1, Math.floor(x));
  const f = (1 - Math.cos(Math.PI * (x - i))) / 2;
  return { sk: solve(blend(spec.frames[i], spec.frames[i + 1], f)), cycle, p: f };
}

// ---------- key poses ----------
const STAND: Pose = { t: 0, aN: [4, 4], aF: [-6, -6], lN: [2, 2], lF: [-3, -3] };

const PUSH_UP: Pose = { t: 66, hd: 8, aN: [0, 0], aF: [0, 0], lN: [-66, -66], lF: [-66, -66], pin: { joint: "handN", x: 86 } };
const PUSH_DOWN: Pose = { t: 72, hd: 8, aN: [-50, 25], aF: [-50, 25], lN: [-72, -72], lF: [-72, -72], pin: { joint: "handN", x: 86 } };

const SQUAT: Pose = { t: 38, hd: -12, aN: [90, 90], aF: [86, 86], lN: [75, -12], lF: [72, -12], pin: { joint: "footN", x: 56 } };
const SQUAT_HANDS: Pose = { t: 62, hd: -20, aN: [20, 10], aF: [14, 8], lN: [95, -5], lF: [92, -5], pin: { joint: "footN", x: 56 } };

const LYING: Pose = { t: 90, aN: [-95, -95], aF: [-100, -100], lN: [-135, -45], lF: [-135, -45] };

export const ANIMS: Record<AnimKey, AnimSpec> = {
  pushup: { frames: [PUSH_UP, PUSH_DOWN], mode: "pingpong", period: 1900, scene: "ground" },
  holdplank: { frames: [PUSH_UP, { ...PUSH_UP, t: 64, lN: [-64, -64], lF: [-64, -64] }], mode: "pingpong", period: 2600, scene: "ground" },
  plank: {
    frames: [
      { t: 78, hd: 8, aN: [0, 90], aF: [0, 90], lN: [-78, -78], lF: [-78, -78], pin: { joint: "footN", x: 26 } },
      { t: 75, hd: 8, aN: [0, 90], aF: [0, 90], lN: [-75, -75], lF: [-75, -75], pin: { joint: "footN", x: 26 } },
    ],
    mode: "pingpong", period: 2600, scene: "ground",
  },
  plank_tap: { frames: [PUSH_UP, { ...PUSH_UP, aF: [30, 150] }], mode: "pingpong", period: 1700, scene: "ground" },
  squat: { frames: [STAND, SQUAT], mode: "pingpong", period: 2200, scene: "ground" },
  lunge: {
    frames: [
      { ...STAND, aN: [10, 10], aF: [-10, -10] },
      { t: 4, aN: [10, 10], aF: [-10, -10], lN: [85, -5], lF: [-25, -80] },
    ],
    mode: "pingpong", period: 2200, scene: "ground",
  },
  jumpsquat: { frames: [SQUAT, { t: 0, aN: [160, 160], aF: [150, 150], lN: [6, 6], lF: [-4, -4], lift: 12, pin: { joint: "footN", x: 56 } }], mode: "pingpong", period: 1300, scene: "ground" },
  bridge: { frames: [LYING, { t: 108, aN: [-95, -95], aF: [-100, -100], lN: [-108, -12], lF: [-108, -12] }], mode: "pingpong", period: 2200, scene: "mat" },
  calf: { frames: [STAND, { ...STAND, lift: 5 }], mode: "pingpong", period: 1300, scene: "ground" },
  crunch: { frames: [{ ...LYING, aN: [110, 170], aF: [105, 165] }, { ...LYING, t: 52, hd: -8, aN: [110, 170], aF: [105, 165] }], mode: "pingpong", period: 1900, scene: "mat" },
  legraise: { frames: [{ ...LYING, lN: [-92, -92], lF: [-92, -92], aN: [-95, -95] }, { ...LYING, lN: [-182, -182], lF: [-182, -182], aN: [-95, -95] }], mode: "pingpong", period: 2300, scene: "mat" },
  bicycle: {
    frames: [
      { ...LYING, t: 64, aN: [110, 170], aF: [105, 165], lN: [150, 30], lF: [250, 250] },
      { ...LYING, t: 64, aN: [110, 170], aF: [105, 165], lN: [250, 250], lF: [150, 30] },
    ],
    mode: "pingpong", period: 1500, scene: "mat",
  },
  twist: {
    frames: [
      { t: -28, aN: [70, 75], aF: [64, 70], lN: [112, 112], lF: [108, 108] },
      { t: -28, aN: [10, -25], aF: [5, -30], lN: [112, 112], lF: [108, 108] },
    ],
    mode: "pingpong", period: 1500, scene: "mat",
  },
  superman: {
    frames: [
      { t: 90, hd: 0, aN: [90, 90], aF: [92, 92], lN: [-90, -90], lF: [-92, -92] },
      { t: 80, hd: -10, aN: [122, 126], aF: [118, 122], lN: [-124, -124], lF: [-120, -120] },
    ],
    mode: "pingpong", period: 2000, scene: "mat",
  },
  swimmer: {
    frames: [
      { t: 84, hd: -8, aN: [125, 125], aF: [90, 90], lN: [-90, -90], lF: [-125, -125] },
      { t: 84, hd: -8, aN: [90, 90], aF: [125, 125], lN: [-125, -125], lF: [-90, -90] },
    ],
    mode: "pingpong", period: 1300, scene: "mat",
  },
  pullup: {
    frames: [
      { t: 0, aN: [180, 180], aF: [180, 180], lN: [-10, -60], lF: [-5, -55], pin: { joint: "handN", x: 60, y: 16 } },
      { t: -12, hd: -6, aN: [60, 160], aF: [58, 158], lN: [-14, -64], lF: [-9, -59], pin: { joint: "handN", x: 60, y: 16 } },
    ],
    mode: "pingpong", period: 2200, scene: "bar",
  },
  row: {
    frames: [
      { t: 75, hd: 6, aN: [180, 180], aF: [180, 180], lN: [-75, -75], lF: [-75, -75], pin: { joint: "handN", x: 78, y: 44 } },
      { t: 60, hd: 6, aN: [60, 160], aF: [58, 158], lN: [-60, -60], lF: [-60, -60], pin: { joint: "handN", x: 78, y: 44 } },
    ],
    mode: "pingpong", period: 2100, scene: "lowbar",
  },
  mountain: {
    frames: [
      { ...PUSH_UP, lN: [85, 40], lF: [-66, -66], pin: { joint: "handN", x: 86, y: GROUND } },
      { ...PUSH_UP, lN: [-66, -66], lF: [85, 40], pin: { joint: "handN", x: 86, y: GROUND } },
    ],
    mode: "pingpong", period: 900, scene: "ground",
  },
  jack: {
    frames: [
      { t: 0, aN: [10, 10], aF: [-10, -10], lN: [4, 4], lF: [-4, -4] },
      { t: 0, aN: [160, 165], aF: [-160, -165], lN: [24, 24], lF: [-24, -24], lift: 5 },
    ],
    mode: "pingpong", period: 1000, scene: "ground",
  },
  burpee: {
    frames: [
      STAND,
      SQUAT_HANDS,
      { ...PUSH_UP, pin: undefined },
      SQUAT_HANDS,
      { t: 0, aN: [160, 160], aF: [150, 150], lN: [6, 6], lF: [-4, -4], lift: 12 },
      STAND,
    ],
    mode: "loop", period: 4200, scene: "ground",
  },
  highknees: {
    frames: [
      { t: 8, hd: -6, aN: [-45, 20], aF: [50, 110], lN: [90, 5], lF: [-5, -5], lift: 2 },
      { t: 8, hd: -6, aN: [50, 110], aF: [-45, 20], lN: [-5, -5], lF: [90, 5], lift: 2 },
    ],
    mode: "pingpong", period: 700, scene: "ground",
  },
  run: {
    frames: [
      { t: 10, hd: -6, aN: [-40, 30], aF: [45, 105], lN: [55, -15], lF: [-12, -30], lift: 2 },
      { t: 10, hd: -6, aN: [45, 105], aF: [-40, 30], lN: [-12, -30], lF: [55, -15], lift: 2 },
    ],
    mode: "pingpong", period: 800, scene: "ground",
  },
  rope: {
    frames: [
      { t: 0, aN: [38, 20], aF: [-38, -20], lN: [2, 2], lF: [-2, -2] },
      { t: 0, aN: [38, 20], aF: [-38, -20], lN: [-3, -10], lF: [3, 10], lift: 8 },
    ],
    mode: "pingpong", period: 700, scene: "ground", rope: true,
  },
  armcircles: {
    frames: [
      { t: 0, aN: [180, 180], aF: [172, 172], lN: [3, 3], lF: [-3, -3] },
      { t: 0, aN: [90, 90], aF: [82, 82], lN: [3, 3], lF: [-3, -3] },
      { t: 0, aN: [0, 0], aF: [-8, -8], lN: [3, 3], lF: [-3, -3] },
      { t: 0, aN: [-90, -90], aF: [-98, -98], lN: [3, 3], lF: [-3, -3] },
      { t: 0, aN: [-180, -180], aF: [-188, -188], lN: [3, 3], lF: [-3, -3] },
    ],
    mode: "loop", period: 3200, scene: "ground",
  },
  dip: {
    frames: [
      { t: -6, aN: [-8, -8], aF: [-12, -12], lN: [82, 82], lF: [80, 80], pin: { joint: "handN", x: 40, y: 56 } },
      { t: -6, aN: [-62, -4], aF: [-66, -6], lN: [82, 82], lF: [80, 80], pin: { joint: "handN", x: 40, y: 56 } },
    ],
    mode: "pingpong", period: 2000, scene: "bench",
  },
};
