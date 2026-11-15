import React, { useEffect, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { branchMeta, workoutsOf } from "../data";
import { branchDone, isDone, isUnlocked, nextWorkout } from "../logic";
import { SportIcon } from "../SportIcon";
import { COLORS } from "../theme";
import type { AppState, Branch, SportKind, Workout } from "../types";
import { MaxAvatar } from "../MaxView";
import { Btn, Icon, ProgressBar, TopBar, ui } from "../ui";

const NODE = 84;
const ROW_H = 124;
const TOP_PAD = 12;
const POP_H = 132; // fixed popover height so the trail can be computed exactly
const POP_GAP = 8;

type NodeKind = "done" | "current" | "open" | "locked";

// Horizontal offset of the i-th node: a smooth zig-zag.
function offsetOf(i: number) {
  return Math.round(Math.sin(i * 0.9) * 72);
}

export function BranchPathScreen({
  state,
  branch,
  onBack,
  onStart,
}: {
  state: AppState;
  branch: Branch;
  onBack: () => void;
  onStart: (w: Workout) => void;
}) {
  const meta = branchMeta(branch);
  const list = workoutsOf(branch);
  const done = branchDone(state, branch);
  const current = nextWorkout(state, branch);
  const allDone = done === list.length;
  const count = list.length + 1; // lessons + final trophy
  const [selected, setSelected] = useState<number | null>(null); // row index
  const [width, setWidth] = useState(340);

  const extra = POP_H + POP_GAP;
  const centerY = (i: number) => TOP_PAD + i * ROW_H + ROW_H / 2 + (selected !== null && i > selected ? extra : 0);
  const centerX = (i: number) => width / 2 + offsetOf(i);
  const height = TOP_PAD + count * ROW_H + (selected !== null ? extra : 0) + 24;

  function kindOf(w: Workout): NodeKind {
    return isDone(state, w) ? "done" : current?.id === w.id ? "current" : isUnlocked(state, w) ? "open" : "locked";
  }

  const segments = Array.from({ length: count - 1 }, (_, i) => {
    const x0 = centerX(i), y0 = centerY(i), x1 = centerX(i + 1), y1 = centerY(i + 1);
    const k = (y1 - y0) * 0.55;
    const traveled = i < list.length ? isDone(state, list[i]) : false;
    return { d: `M ${x0} ${y0} C ${x0} ${y0 + k} ${x1} ${y1 - k} ${x1} ${y1}`, traveled };
  });

  return (
    <>
      <View style={s.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Назад" onPress={onBack} style={s.back}>
          <Icon name="arrow-left" size={22} color={COLORS.ink} />
        </Pressable>
        <View style={ui.flex}><TopBar state={state} /></View>
      </View>

      <View style={[s.banner, { borderColor: meta.color + "55" }]}>
        <View style={[s.bannerIcon, { backgroundColor: meta.color + "22" }]}>
          <SportIcon kind={meta.icon} size={34} color={meta.color} />
        </View>
        <View style={ui.flex}>
          <Text style={s.bannerTitle}>{branch}</Text>
          <Text style={ui.muted}>{meta.description}</Text>
          <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={ui.flex}><ProgressBar value={(done / list.length) * 100} color={meta.color} height={8} /></View>
            <Text style={[ui.muted, { fontWeight: "700" }]}>{done}/{list.length}</Text>
          </View>
        </View>
      </View>

      <View style={{ height }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
          {segments.map((seg, i) =>
            seg.traveled ? (
              <Path key={i} d={seg.d} stroke={meta.color} strokeWidth={6} strokeLinecap="round" fill="none" />
            ) : (
              <Path key={i} d={seg.d} stroke={COLORS.locked} strokeWidth={6} strokeLinecap="round" strokeDasharray="1 13" fill="none" />
            )
          )}
        </Svg>

        <View style={{ height: TOP_PAD }} />
        {list.map((w, i) => {
          const kind = kindOf(w);
          return (
            <React.Fragment key={w.id}>
              <PathNode
                kind={kind}
                offset={offsetOf(i)}
                color={meta.color}
                dark={meta.dark}
                sport={w.sport}
                state={kind === "current" ? state : null}
                onPress={() => setSelected(selected === i ? null : i)}
              />
              {selected === i && (
                <Popover
                  title={w.title}
                  sub={`Тренировка ${i + 1} из ${list.length} · ${w.exercises.length} упражнения · ${w.duration} мин`}
                  color={meta.color}
                  locked={kind === "locked"}
                  lockedText="Сначала пройди предыдущую тренировку."
                  actionLabel={kind === "done" ? "Повторить" : "Начать"}
                  onAction={() => {
                    setSelected(null);
                    onStart(w);
                  }}
                />
              )}
            </React.Fragment>
          );
        })}

        <PathNode
          kind={allDone ? "done" : "locked"}
          offset={offsetOf(list.length)}
          color={COLORS.yellow}
          dark={COLORS.yellowDark}
          sport={null}
          state={null}
          onPress={() => setSelected(selected === list.length ? null : list.length)}
        />
        {selected === list.length && (
          <Popover
            title={allDone ? "Раздел пройден!" : "Награда раздела"}
            sub={allDone ? `Ты прошёл все тренировки раздела «${branch}».` : "Пройди все тренировки раздела, чтобы открыть награду."}
            color={COLORS.yellow}
            locked={false}
          />
        )}
      </View>
    </>
  );
}

function PathNode({
  kind,
  offset,
  color,
  dark,
  sport,
  state,
  onPress,
}: {
  kind: NodeKind;
  offset: number;
  color: string;
  dark: string;
  sport: SportKind | null; // null = trophy
  state: AppState | null; // set on the current node: Max stands next to it
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (kind !== "current") return;
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [kind, pulse]);

  const locked = kind === "locked";
  const isDoneKind = kind === "done";
  const ring = locked ? COLORS.locked : isDoneKind ? dark : color;
  const fill = isDoneKind ? color : COLORS.card;
  const iconColor = locked ? COLORS.muted : isDoneKind ? COLORS.onAccent : color;

  return (
    <View style={s.row}>
      {state && (
        <View style={[s.mascot, offset >= 0 ? { left: 8 } : { right: 8 }]}>
          <MaxAvatar state={state} size={84} ringColor={color} />
        </View>
      )}
      <View style={{ transform: [{ translateX: offset }] }}>
        {kind === "current" && (
          <Animated.View
            pointerEvents="none"
            style={[
              s.halo,
              { borderColor: color, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }] },
            ]}
          />
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={locked ? "Закрытая тренировка" : "Тренировка"}
          onPress={onPress}
          style={({ pressed }) => [s.node, { borderColor: ring, backgroundColor: fill, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
        >
          {sport ? <SportIcon kind={sport} size={40} color={iconColor} /> : <Icon name="trophy" size={38} color={locked ? COLORS.muted : COLORS.onAccent} />}
        </Pressable>
        {(isDoneKind || locked) && (
          <View style={[s.badge, { backgroundColor: isDoneKind ? COLORS.ink : COLORS.locked }]}>
            <Icon name={isDoneKind ? "check-bold" : "lock"} size={14} color={isDoneKind ? COLORS.onAccent : COLORS.muted} />
          </View>
        )}
      </View>
    </View>
  );
}

function Popover({
  title,
  sub,
  color,
  locked,
  lockedText,
  actionLabel,
  onAction,
}: {
  title: string;
  sub: string;
  color: string;
  locked: boolean;
  lockedText?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={[s.popover, { borderColor: locked ? COLORS.line : color + "88" }]}>
      <Text style={ui.cardTitle}>{title}</Text>
      <Text style={[ui.muted, { marginTop: 2 }]} numberOfLines={2}>{locked ? lockedText : sub}</Text>
      {!locked && actionLabel && onAction && <Btn label={actionLabel} color={color} onPress={onAction} style={{ marginTop: 12, minHeight: 44 }} />}
    </View>
  );
}

const s = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: COLORS.line, alignItems: "center", justifyContent: "center", marginBottom: 16, backgroundColor: COLORS.card },
  banner: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.card, borderWidth: 1, borderRadius: 20, padding: 16 },
  bannerIcon: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  bannerTitle: { color: COLORS.ink, fontSize: 24, fontWeight: "800" },
  row: { height: ROW_H, width: "100%", alignItems: "center", justifyContent: "center" },
  mascot: { position: "absolute", top: 20 },
  node: { width: NODE, height: NODE, borderRadius: NODE / 2, borderWidth: 6, alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", width: NODE, height: NODE, borderRadius: NODE / 2, borderWidth: 2 },
  badge: { position: "absolute", right: -2, bottom: -2, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.bg },
  popover: { alignSelf: "center", width: "88%", height: POP_H, marginBottom: POP_GAP, backgroundColor: COLORS.card, borderWidth: 1, borderRadius: 18, padding: 16, justifyContent: "center" },
});
