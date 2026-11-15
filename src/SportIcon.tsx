import React from "react";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "./theme";
import type { SportKind } from "./types";

// Hand-drawn gym symbols (48x48 grid): dumbbell, barbell, pull-up bar, yoga mat, kettlebell, jump rope.
export function SportIcon({ kind, size = 32, color = COLORS.ink }: { kind: SportKind; size?: number; color?: string }) {
  if (kind === "run") return <MaterialCommunityIcons name="run-fast" size={size} color={color} />;

  const line = { stroke: color, strokeWidth: 3.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  let body: React.ReactNode = null;

  switch (kind) {
    case "dumbbell":
      body = (
        <>
          <Line x1={15} y1={24} x2={33} y2={24} {...line} strokeWidth={4} />
          <Rect x={9} y={12} width={6} height={24} rx={2} fill={color} />
          <Rect x={33} y={12} width={6} height={24} rx={2} fill={color} />
          <Rect x={4} y={17} width={5} height={14} rx={2} fill={color} />
          <Rect x={39} y={17} width={5} height={14} rx={2} fill={color} />
        </>
      );
      break;
    case "barbell":
      body = (
        <>
          <Line x1={2} y1={24} x2={46} y2={24} {...line} strokeWidth={3} />
          <Rect x={9} y={8} width={6} height={32} rx={2} fill={color} />
          <Rect x={16} y={13} width={5} height={22} rx={2} fill={color} />
          <Rect x={33} y={8} width={6} height={32} rx={2} fill={color} />
          <Rect x={27} y={13} width={5} height={22} rx={2} fill={color} />
        </>
      );
      break;
    case "pullup":
      body = (
        <>
          <Line x1={8} y1={9} x2={40} y2={9} {...line} strokeWidth={4.5} />
          <Line x1={10} y1={9} x2={10} y2={44} {...line} />
          <Line x1={38} y1={9} x2={38} y2={44} {...line} />
          <Path d="M19 9 L22 19 M29 9 L26 19" {...line} />
          <Circle cx={24} cy={23} r={3.6} fill={color} />
          <Line x1={24} y1={28} x2={24} y2={39} {...line} />
        </>
      );
      break;
    case "mat":
      // rolled yoga mat seen from the side: cylinder, end cap and strap
      body = (
        <>
          <Rect x={7} y={14} width={32} height={22} rx={3} fill={color} fillOpacity={0.28} stroke={color} strokeWidth={3} />
          <Path d="M39 14 C46 14 46 36 39 36" {...line} fill={color} fillOpacity={0.55} />
          <Line x1={20} y1={14} x2={20} y2={36} {...line} strokeWidth={3} />
          <Line x1={28} y1={14} x2={28} y2={36} {...line} strokeWidth={3} />
        </>
      );
      break;
    case "kettlebell":
      body = (
        <>
          <Path d="M17 20 C14 5 34 5 31 20" {...line} strokeWidth={3.6} />
          <Circle cx={24} cy={31} r={11} fill={color} />
        </>
      );
      break;
    case "rope":
      body = (
        <>
          <Path d="M8.5 31 C7 3 41 3 39.5 31" {...line} />
          <Rect x={5} y={30} width={7} height={15} rx={3.5} fill={color} />
          <Rect x={36} y={30} width={7} height={15} rx={3.5} fill={color} />
        </>
      );
      break;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {body}
    </Svg>
  );
}
