import React, { useEffect, useRef, useState } from "react";
import Svg, { G, Line, Path, Polygon, Rect, Circle } from "react-native-svg";
import { ANIMS, GROUND, VIEW_H, VIEW_W, VIEW_Y, frameAt, type Pt } from "./poses";
import { COLORS } from "./theme";
import type { AnimKey } from "./types";

// Looping stick-figure demo of an exercise (a "gif" drawn in code). The figure has dog ears: it is Max.
export function ExerciseAnimation({ anim, hold, color, width = 240 }: { anim: AnimKey; hold?: boolean; color: string; width?: number }) {
  const spec = ANIMS[anim];
  const [ms, setMs] = useState(0);
  const last = useRef(0);

  useEffect(() => {
    let raf = 0;
    const start = Date.now();
    const loop = () => {
      const now = Date.now() - start;
      if (now - last.current >= 32) {
        last.current = now;
        setMs(now);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [anim]);

  const { sk, p } = frameAt(spec, ms, hold);
  const heightPx = (width * VIEW_H) / VIEW_W;
  const seg = (a: Pt, b: Pt, w = 3.2, o = 1) => <Line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" opacity={o} />;
  const headAngle = (Math.atan2(sk.head[0] - sk.neck[0], -(sk.head[1] - sk.neck[1])) * 180) / Math.PI;
  const scene = spec.scene;

  return (
    <Svg width={width} height={heightPx} viewBox={`0 ${VIEW_Y} ${VIEW_W} ${VIEW_H}`}>
      {/* scenery */}
      {scene !== "bar" && scene !== "none" && <Line x1={4} y1={GROUND + 2} x2={116} y2={GROUND + 2} stroke={COLORS.line} strokeWidth={1.5} strokeLinecap="round" />}
      {scene === "mat" && <Rect x={8} y={GROUND + 1} width={104} height={4} rx={2} fill={color} opacity={0.25} />}
      {scene === "bar" && (
        <>
          <Line x1={28} y1={14} x2={92} y2={14} stroke={COLORS.muted} strokeWidth={2.6} strokeLinecap="round" />
          <Line x1={28} y1={14} x2={28} y2={22} stroke={COLORS.muted} strokeWidth={2.6} strokeLinecap="round" />
          <Line x1={92} y1={14} x2={92} y2={22} stroke={COLORS.muted} strokeWidth={2.6} strokeLinecap="round" />
        </>
      )}
      {scene === "lowbar" && (
        <>
          <Line x1={70} y1={44} x2={96} y2={44} stroke={COLORS.muted} strokeWidth={2.6} strokeLinecap="round" />
          <Line x1={96} y1={44} x2={96} y2={GROUND + 2} stroke={COLORS.muted} strokeWidth={2.6} strokeLinecap="round" />
        </>
      )}
      {scene === "bench" && (
        <>
          <Rect x={22} y={56} width={22} height={3.5} rx={1.5} fill={COLORS.muted} />
          <Line x1={26} y1={59} x2={26} y2={GROUND + 2} stroke={COLORS.muted} strokeWidth={2.4} strokeLinecap="round" />
          <Line x1={40} y1={59} x2={40} y2={GROUND + 2} stroke={COLORS.muted} strokeWidth={2.4} strokeLinecap="round" />
        </>
      )}

      {/* far limbs (dimmer) */}
      {seg(sk.shoulder, sk.elbowF, 2.6, 0.5)}
      {seg(sk.elbowF, sk.handF, 2.6, 0.5)}
      {seg(sk.hip, sk.kneeF, 2.6, 0.5)}
      {seg(sk.kneeF, sk.footF, 2.6, 0.5)}

      {/* body */}
      {seg(sk.hip, sk.neck)}
      {seg(sk.shoulder, sk.elbowN)}
      {seg(sk.elbowN, sk.handN)}
      {seg(sk.hip, sk.kneeN)}
      {seg(sk.kneeN, sk.footN)}

      {/* head with dog ears */}
      <G transform={`translate(${sk.head[0]},${sk.head[1]}) rotate(${headAngle})`}>
        <Polygon points="-4.6,-3 -6,-10 -1,-5.6" fill={color} />
        <Polygon points="4.6,-3 6,-10 1,-5.6" fill={color} />
        <Circle cx={0} cy={0} r={5.4} fill={COLORS.card} stroke={color} strokeWidth={2.8} />
      </G>

      {spec.rope && (() => {
        const hand: Pt = sk.handN;
        const other: Pt = sk.handF;
        const top = sk.head[1] - 12;
        const bottom = GROUND + 4;
        const target = top + (bottom - top) * p;
        const ctrlY = 2 * target - (hand[1] + other[1]) / 2;
        return <Path d={`M ${other[0]} ${other[1]} Q ${(hand[0] + other[0]) / 2} ${ctrlY} ${hand[0]} ${hand[1]}`} stroke={COLORS.yellow} strokeWidth={1.6} fill="none" strokeLinecap="round" />;
      })()}
    </Svg>
  );
}
