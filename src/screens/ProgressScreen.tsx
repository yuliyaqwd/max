import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { BRANCHES } from "../data";
import { branchProgress, gradeLabel, leaderboard } from "../logic";
import { SportIcon } from "../SportIcon";
import { COLORS } from "../theme";
import type { AppState, WeightEntry } from "../types";
import { Btn, Card, Icon, ProgressBar, ui } from "../ui";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("ru-RU");

// ФТ-19: weight over time.
function WeightChart({ entries }: { entries: WeightEntry[] }) {
  const [width, setWidth] = useState(300);
  const H = 120;
  const pad = 14;
  if (entries.length < 2) {
    return <Text style={[ui.muted, { marginTop: 8 }]}>Запиши вес ещё раз, и здесь появится график изменения.</Text>;
  }
  const times = entries.map((e) => new Date(e.dateISO).getTime());
  const t0 = times[0];
  const span = Math.max(1, times[times.length - 1] - t0);
  const ws = entries.map((e) => e.weight);
  const lo = Math.min(...ws) - 1;
  const hi = Math.max(...ws) + 1;
  const pts = entries.map((e, i) => {
    const x = pad + ((times[i] - t0) / span) * (width - pad * 2);
    const y = pad + (1 - (e.weight - lo) / (hi - lo)) * (H - pad * 2);
    return [x, y] as const;
  });
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ marginTop: 8 }}>
      <Svg width={width} height={H}>
        <Line x1={pad} y1={H - pad} x2={width - pad} y2={H - pad} stroke={COLORS.line} strokeWidth={1} />
        <Path d={d} stroke={COLORS.blue} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <Circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={COLORS.blue} />
        ))}
        <Circle cx={last[0]} cy={last[1]} r={6} fill="none" stroke={COLORS.blue} strokeWidth={2} />
      </Svg>
      <View style={ui.between}>
        <Text style={ui.muted}>{fmt(entries[0].dateISO)} · {entries[0].weight} кг</Text>
        <Text style={ui.muted}>{fmt(entries[entries.length - 1].dateISO)} · {entries[entries.length - 1].weight} кг</Text>
      </View>
    </View>
  );
}

export function ProgressScreen({ state, bmi, onWeigh }: { state: AppState; bmi: number; onWeigh: () => void }) {
  const board = leaderboard(state);
  return (
    <>
      <Text style={ui.kicker}>Статистика</Text>
      <Text style={ui.title}>Твой прогресс</Text>

      <View style={s.big}>
        <Icon name="lightning-bolt" size={40} color={COLORS.yellow} />
        <View>
          <Text style={s.bigValue}>{state.xp}</Text>
          <Text style={s.bigLabel}>XP всего</Text>
        </View>
      </View>

      <Text style={ui.sectionTitle}>Вес</Text>
      <Card>
        <View style={ui.between}>
          <View>
            <Text style={s.weight}>{state.weight.toFixed(1)} кг</Text>
            <Text style={ui.muted}>ИМТ {bmi.toFixed(1)} · справочный показатель</Text>
          </View>
          <Btn label="Записать" color={COLORS.blue} onPress={onWeigh} style={{ minHeight: 42 }} />
        </View>
        <WeightChart entries={state.weights} />
      </Card>

      <Text style={ui.sectionTitle}>Разделы</Text>
      {BRANCHES.map((b) => {
        const pct = branchProgress(state, b.branch);
        return (
          <Card key={b.branch}>
            <View style={ui.between}>
              <View style={s.rowIcon}>
                <View style={[s.dot, { backgroundColor: b.color + "22" }]}>
                  <SportIcon kind={b.icon} size={22} color={b.color} />
                </View>
                <Text style={ui.cardTitle}>{b.branch}</Text>
              </View>
              <Text style={[ui.cardTitle, { color: b.color }]}>{pct}%</Text>
            </View>
            <View style={{ marginTop: 10 }}><ProgressBar value={pct} color={b.color} /></View>
          </Card>
        );
      })}

      <Text style={ui.sectionTitle}>Рейтинг по серии дней</Text>
      <Card>
        {board.map((r) => (
          <View key={r.name + r.place} style={[s.boardRow, r.me && s.boardMe]}>
            <Text style={s.place}>{r.place}</Text>
            <Text style={[ui.cardTitle, { flex: 1 }]}>{r.name}{r.me ? " (ты)" : ""}</Text>
            <Icon name="fire" size={18} color={COLORS.flame} />
            <Text style={s.streak}>{r.streak}</Text>
          </View>
        ))}
        <Text style={[ui.muted, { marginTop: 8 }]}>Демо-рейтинг: остальные участники — примеры. Настоящий рейтинг появится после подключения сервера.</Text>
      </Card>

      <Text style={ui.sectionTitle}>История тренировок</Text>
      {state.history.length === 0 ? (
        <Card><Text style={ui.muted}>Пока пусто. Первая тренировка появится здесь.</Text></Card>
      ) : (
        state.history.slice(0, 10).map((h) => (
          <Card key={h.id}>
            <View style={ui.between}>
              <View style={ui.flex}>
                <Text style={ui.cardTitle}>{h.title}</Text>
                <Text style={ui.muted}>{h.date}{h.duration ? ` · ${h.duration} мин` : ""} · {gradeLabel(h.grade)}</Text>
              </View>
              <Text style={s.reward}>+{h.xp} XP</Text>
            </View>
          </Card>
        ))
      )}
    </>
  );
}

const s = StyleSheet.create({
  big: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.yellow + "66", padding: 20 },
  bigValue: { color: COLORS.ink, fontSize: 42, fontWeight: "800", lineHeight: 46 },
  bigLabel: { color: COLORS.muted, fontSize: 14, fontWeight: "600" },
  rowIcon: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  reward: { color: COLORS.green, fontWeight: "800", fontSize: 16 },
  weight: { color: COLORS.ink, fontSize: 28, fontWeight: "800" },
  boardRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, paddingHorizontal: 8, borderRadius: 12 },
  boardMe: { backgroundColor: COLORS.green + "22" },
  place: { width: 22, color: COLORS.muted, fontSize: 15, fontWeight: "800" },
  streak: { color: COLORS.ink, fontSize: 16, fontWeight: "800", minWidth: 24, textAlign: "right" },
});
