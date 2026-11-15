import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";
import { COSMETICS } from "./data";
import { mascotPhotoIndex } from "./logic";
import { COLORS } from "./theme";
import type { AppState, Slot } from "./types";

type Pt = [number, number];

type Photo = { src: number; w: number; h: number; eyeL: Pt; eyeR: Pt; neckU: number };

const SLOT_ORDER: Slot[] = ["neck", "head", "face"];

// ---- cosmetic shapes, drawn in "eye units": origin = point between the eyes, 1 = distance between the eyes ----
export function CosmeticShape({ id, neckU }: { id: string; neckU: number }) {
  const y0 = neckU - 0.15;
  switch (id) {
    case "cap":
      return (
        <G>
          <Path d="M -0.75 -0.95 C -0.75 -1.72 0.75 -1.72 0.75 -0.95 Z" fill="#E5484D" />
          <Ellipse cx={0} cy={-0.95} rx={0.98} ry={0.14} fill="#B5303A" />
          <Circle cx={0} cy={-1.5} r={0.06} fill="#B5303A" />
        </G>
      );
    case "crown":
      return (
        <G>
          <Path d="M -0.6 -0.95 L -0.6 -1.55 L -0.3 -1.25 L 0 -1.72 L 0.3 -1.25 L 0.6 -1.55 L 0.6 -0.95 Z" fill="#FBBF24" stroke="#B7791F" strokeWidth={0.045} strokeLinejoin="round" />
          <Circle cx={0} cy={-1.12} r={0.07} fill="#E5484D" />
          <Circle cx={-0.36} cy={-1.12} r={0.05} fill="#38BDF8" />
          <Circle cx={0.36} cy={-1.12} r={0.05} fill="#38BDF8" />
        </G>
      );
    case "sunglasses":
      return (
        <G>
          <Line x1={-0.78} y1={-0.04} x2={-1.02} y2={-0.12} stroke="#0B0F14" strokeWidth={0.07} strokeLinecap="round" />
          <Line x1={0.78} y1={-0.04} x2={1.02} y2={-0.12} stroke="#0B0F14" strokeWidth={0.07} strokeLinecap="round" />
          <Path d="M -0.24 -0.04 Q 0 -0.16 0.24 -0.04" stroke="#0B0F14" strokeWidth={0.07} fill="none" strokeLinecap="round" />
          <Rect x={-0.8} y={-0.2} width={0.58} height={0.42} rx={0.15} fill="#0B0F14" opacity={0.94} />
          <Rect x={0.22} y={-0.2} width={0.58} height={0.42} rx={0.15} fill="#0B0F14" opacity={0.94} />
          <Line x1={-0.66} y1={-0.1} x2={-0.5} y2={-0.1} stroke="#FFFFFF" strokeWidth={0.04} strokeLinecap="round" opacity={0.7} />
          <Line x1={0.36} y1={-0.1} x2={0.52} y2={-0.1} stroke="#FFFFFF" strokeWidth={0.04} strokeLinecap="round" opacity={0.7} />
        </G>
      );
    case "bandana":
      return (
        <G>
          <Path d={`M -0.85 ${y0} L 0.85 ${y0} L 0 ${y0 + 0.95} Z`} fill="#E5484D" />
          <Path d={`M -0.88 ${y0} L 0.88 ${y0}`} stroke="#B5303A" strokeWidth={0.12} strokeLinecap="round" />
          <Circle cx={-0.3} cy={y0 + 0.25} r={0.05} fill="#FFFFFF" />
          <Circle cx={0.3} cy={y0 + 0.25} r={0.05} fill="#FFFFFF" />
          <Circle cx={0} cy={y0 + 0.5} r={0.05} fill="#FFFFFF" />
        </G>
      );
    case "medal":
    case "starbadge":
      return (
        <G>
          <Path d={`M -0.42 ${y0} L 0.06 ${y0 + 0.62}`} stroke="#38BDF8" strokeWidth={0.13} />
          <Path d={`M 0.42 ${y0} L -0.06 ${y0 + 0.62}`} stroke="#0EA5E9" strokeWidth={0.13} />
          <Circle cx={0} cy={y0 + 0.82} r={0.3} fill="#FBBF24" stroke="#B7791F" strokeWidth={0.05} />
          {id === "starbadge" ? <Path d={`M 0 ${y0 + 0.58} l 0.07 0.16 0.18 0.02 -0.13 0.12 0.04 0.18 -0.16 -0.09 -0.16 0.09 0.04 -0.18 -0.13 -0.12 0.18 -0.02 Z`} fill="#FFFFFF" /> : <Circle cx={0} cy={y0 + 0.82} r={0.17} fill="none" stroke="#B7791F" strokeWidth={0.04} />}
        </G>
      );
    case "beanie":
      return <G><Path d="M -0.72 -0.9 C -0.8 -1.8 0.8 -1.8 0.72 -0.9 Z" fill="#7C3AED" /><Ellipse cx={0} cy={-0.9} rx={0.78} ry={0.16} fill="#A78BFA" /></G>;
    case "partyhat":
      return <G><Path d="M -0.62 -0.85 L 0 -1.95 L 0.62 -0.85 Z" fill="#F97316" /><Circle cx={0} cy={-1.95} r={0.12} fill="#FBBF24" /><Circle cx={-0.2} cy={-1.15} r={0.07} fill="#38BDF8" /><Circle cx={0.22} cy={-1.3} r={0.07} fill="#F472B6" /></G>;
    case "headband":
      return <G><Path d="M -0.9 -0.72 Q 0 -1.05 0.9 -0.72" fill="none" stroke="#22C55E" strokeWidth={0.22} strokeLinecap="round" /></G>;
    case "roundglasses":
      return <G><Circle cx={-0.48} cy={0} r={0.32} fill="none" stroke="#CBD5E1" strokeWidth={0.09} /><Circle cx={0.48} cy={0} r={0.32} fill="none" stroke="#CBD5E1" strokeWidth={0.09} /><Line x1={-0.16} y1={0} x2={0.16} y2={0} stroke="#CBD5E1" strokeWidth={0.08} /></G>;
    case "sleepmask":
    case "pirate":
      return <G><Rect x={-0.83} y={-0.2} width={1.66} height={0.42} rx={0.08} fill={id === "pirate" ? "#111827" : "#F472B6"} /><Circle cx={0} cy={0} r={0.12} fill="#FBBF24" /></G>;
    case "bowtie":
      return <G><Path d={`M -0.08 ${y0 + 0.25} L -0.72 ${y0 - 0.05} L -0.72 ${y0 + 0.55} Z`} fill="#F472B6" /><Path d={`M 0.08 ${y0 + 0.25} L 0.72 ${y0 - 0.05} L 0.72 ${y0 + 0.55} Z`} fill="#F472B6" /><Circle cx={0} cy={y0 + 0.25} r={0.12} fill="#BE185D" /></G>;
    case "scarf":
      return <G><Path d={`M -0.78 ${y0} Q 0 ${y0 + 0.2} 0.78 ${y0}`} stroke="#0EA5E9" strokeWidth={0.3} fill="none" /><Path d={`M 0.35 ${y0 + 0.04} L 0.58 ${y0 + 0.9}`} stroke="#0EA5E9" strokeWidth={0.25} /></G>;
    case "goldchain":
      return <G><Ellipse cx={0} cy={y0 + 0.35} rx={0.78} ry={0.38} fill="none" stroke="#FBBF24" strokeWidth={0.15} /></G>;
    case "whistle":
      return <G><Path d={`M -0.2 ${y0} L 0.2 ${y0 + 0.6}`} stroke="#FBBF24" strokeWidth={0.12} /><Rect x={-0.25} y={y0 + 0.52} width={0.55} height={0.28} rx={0.08} fill="#FBBF24" /></G>;
    case "flower":
      return <G>{[0, 1, 2, 3, 4].map((n) => <Ellipse key={n} cx={Math.cos(n * Math.PI * 2 / 5) * 0.18} cy={-1.15 + Math.sin(n * Math.PI * 2 / 5) * 0.18} rx={0.13} ry={0.18} fill="#F472B6" />)}<Circle cx={0} cy={-1.15} r={0.1} fill="#FBBF24" /></G>;
    case "halo":
      return <G><Ellipse cx={0} cy={-1.55} rx={0.65} ry={0.18} fill="none" stroke="#FBBF24" strokeWidth={0.13} /></G>;
    case "bow":
      return <G><Path d="M 0 -1.3 L -0.62 -1.65 L -0.62 -0.95 Z" fill="#F472B6" /><Path d="M 0 -1.3 L 0.62 -1.65 L 0.62 -0.95 Z" fill="#F472B6" /><Circle cx={0} cy={-1.3} r={0.13} fill="#BE185D" /></G>;
    case "earmuffs":
      return <G><Path d="M -0.65 -0.05 C -0.8 -1.25 0.8 -1.25 0.65 -0.05" stroke="#0EA5E9" strokeWidth={0.16} fill="none" /><Rect x={-0.82} y={-0.12} width={0.3} height={0.45} rx={0.1} fill="#0EA5E9" /><Rect x={0.52} y={-0.12} width={0.3} height={0.45} rx={0.1} fill="#0EA5E9" /></G>;
    default:
      return null;
  }
}

const GLYPH_BOX: Record<string, [number, number, number, number]> = {
  cap: [-1.1, -1.8, 2.2, 1.0],
  crown: [-0.8, -1.85, 1.6, 1.0],
  sunglasses: [-1.1, -0.3, 2.2, 0.65],
  bandana: [-0.95, -0.05, 1.9, 1.1],
  medal: [-0.55, -0.05, 1.1, 1.3],
  beanie: [-0.9, -1.9, 1.8, 1.2],
  partyhat: [-0.8, -2.05, 1.6, 1.3],
  headband: [-1, -1.1, 2, 0.8],
  roundglasses: [-0.9, -0.45, 1.8, 0.9],
  sleepmask: [-0.9, -0.4, 1.8, 0.9],
  pirate: [-0.9, -0.4, 1.8, 0.9],
  bowtie: [-0.9, -0.1, 1.8, 1.1],
  scarf: [-1, -0.1, 2, 1.2],
  goldchain: [-0.9, -0.1, 1.8, 1.1],
  whistle: [-0.5, -0.1, 1, 1.1],
  flower: [-0.5, -1.6, 1, 1],
  halo: [-0.8, -1.9, 1.6, 0.8],
  starbadge: [-0.55, -0.05, 1.1, 1.3],
  bow: [-0.8, -1.8, 1.6, 1],
  earmuffs: [-1, -1.2, 2, 1.4],
};

// Small preview of an item (used in the shop).
export function CosmeticGlyph({ id, size = 44 }: { id: string; size?: number }) {
  const box = GLYPH_BOX[id] ?? [-1, -1, 2, 2];
  return (
    <Svg width={size} height={(size * box[3]) / box[2]} viewBox={box.join(" ")}>
      <CosmeticShape id={id} neckU={0.15} />
    </Svg>
  );
}

function overlay(state: AppState, img: Photo, scale: number, left: number, top: number, w: number, h: number, withNeck = true) {
  const L: Pt = [img.eyeL[0] * scale + left, img.eyeL[1] * scale + top];
  const R: Pt = [img.eyeR[0] * scale + left, img.eyeR[1] * scale + top];
  const mid: Pt = [(L[0] + R[0]) / 2, (L[1] + R[1]) / 2];
  const u = Math.hypot(R[0] - L[0], R[1] - L[1]);
  const deg = (Math.atan2(R[1] - L[1], R[0] - L[0]) * 180) / Math.PI;
  const worn = COSMETICS.filter((c) => state.equipped.includes(c.id) && (withNeck || c.slot !== "neck")).sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      <G transform={`translate(${mid[0]},${mid[1]}) rotate(${deg}) scale(${u})`}>
        {worn.map((c) => (
          <CosmeticShape key={c.id} id={c.id} neckU={img.neckU} />
        ))}
      </G>
    </Svg>
  );
}

// The same full-body image is used in both the Profile and Max tabs.
// Cosmetics are rendered above the image and stay anchored to the eyes/neck.
const MAX_STAGE_PHOTOS = [
  require("../assets/max-stage/max-stage-01.png"),
  require("../assets/max-stage/max-stage-02.png"),
  require("../assets/max-stage/max-stage-03.png"),
  require("../assets/max-stage/max-stage-04.png"),
  require("../assets/max-stage/max-stage-05.png"),
  require("../assets/max-stage/max-stage-06.png"),
  require("../assets/max-stage/max-stage-07.png"),
  require("../assets/max-stage/max-stage-08.png"),
  require("../assets/max-stage/max-stage-09.png"),
  require("../assets/max-stage/max-stage-10.png"),
  require("../assets/max-stage/max-stage-11.png"),
  require("../assets/max-stage/max-stage-12.png"),
  require("../assets/max-stage/max-stage-13.png"),
  require("../assets/max-stage/max-stage-14.png"),
  require("../assets/max-stage/max-stage-15.png"),
  require("../assets/max-stage/max-stage-16.png"),
  require("../assets/max-stage/max-stage-17.png"),
  require("../assets/max-stage/max-stage-18.png"),
  require("../assets/max-stage/max-stage-19.png"),
  require("../assets/max-stage/max-stage-20.png"),
  require("../assets/max-stage/max-stage-21.png"),
  require("../assets/max-stage/max-stage-22.png"),
  require("../assets/max-stage/max-stage-23.png"),
  require("../assets/max-stage/max-stage-24.png"),
  require("../assets/max-stage/max-stage-25.png"),
];

export function MaxPortrait({ state, width }: { state: AppState; width: number }) {
  const index = mascotPhotoIndex(state);
  const src = MAX_STAGE_PHOTOS[index];
  const img: Photo = {
    src, w: 1024, h: 1024, eyeL: [580, 213], eyeR: [686, 213], neckU: 1.75,
  };
  const scale = width / img.w;
  return (
    <View style={{ width, height: width, borderRadius: 22, overflow: "hidden", backgroundColor: COLORS.cardAlt }}>
      <Image source={src} resizeMode="contain" style={{ width, height: width }} />
      {overlay(state, img, scale, 0, 0, width, width, true)}
    </View>
  );
}

// Round avatar: the whole head of Max (ears to chin) in the current form, wearing the equipped items.
export function MaxAvatar({ state, size, ringColor }: { state: AppState; size: number; ringColor?: string }) {
  const src = MAX_STAGE_PHOTOS[mascotPhotoIndex(state)];
  const img: Photo = { src, w: 1024, h: 1024, eyeL: [300, 500], eyeR: [600, 370], neckU: 1.75 };
  const eyeDist = Math.hypot(img.eyeR[0] - img.eyeL[0], img.eyeR[1] - img.eyeL[1]);
  const scale = (0.38 * size) / eyeDist; // eye distance = 21% of the avatar, so the head fits with its ears
  const midX = ((img.eyeL[0] + img.eyeR[0]) / 2) * scale;
  const midY = ((img.eyeL[1] + img.eyeR[1]) / 2) * scale;
  const left = size / 2 - midX;
  const top = 0.5 * size - midY; // eyes on the horizontal middle line
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", backgroundColor: COLORS.cardAlt }}>
      <Image source={img.src} resizeMode="stretch" style={{ position: "absolute", left, top, width: img.w * scale, height: img.h * scale }} />
      {overlay(state, img, scale, left, top, size, size, false)}
      {ringColor && <View pointerEvents="none" style={{ ...StyleSheet.absoluteFillObject, borderRadius: size / 2, borderWidth: 3, borderColor: ringColor }} />}
    </View>
  );
}


export function MaxStage({ state, width }: { state: AppState; width: number; poseIndex?: number }) {
  return <MaxPortrait state={state} width={width} />;
}
