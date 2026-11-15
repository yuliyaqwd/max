import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Dialog } from "../Dialog";
import { QUIPS, branchMeta } from "../data";
import { ExerciseAnimation } from "../ExerciseAnimation";
import { MaxAvatar } from "../MaxView";
import { COLORS } from "../theme";
import type { AppState, Workout } from "../types";
import { Btn, Icon, ProgressBar } from "../ui";


const MAX_POSES = [
  require("../../assets/max-poses/max-01.jpg"), require("../../assets/max-poses/max-02.jpg"), require("../../assets/max-poses/max-03.jpg"), require("../../assets/max-poses/max-04.jpg"), require("../../assets/max-poses/max-05.jpg"),
  require("../../assets/max-poses/max-06.jpg"), require("../../assets/max-poses/max-07.jpg"), require("../../assets/max-poses/max-08.jpg"), require("../../assets/max-poses/max-09.jpg"), require("../../assets/max-poses/max-10.jpg"),
  require("../../assets/max-poses/max-11.jpg"), require("../../assets/max-poses/max-12.jpg"), require("../../assets/max-poses/max-13.jpg"), require("../../assets/max-poses/max-14.jpg"), require("../../assets/max-poses/max-15.jpg"),
  require("../../assets/max-poses/max-16.jpg"), require("../../assets/max-poses/max-17.jpg"), require("../../assets/max-poses/max-18.jpg"), require("../../assets/max-poses/max-19.jpg"), require("../../assets/max-poses/max-20.jpg"),
  require("../../assets/max-poses/max-21.jpg"), require("../../assets/max-poses/max-22.jpg"), require("../../assets/max-poses/max-23.jpg"), require("../../assets/max-poses/max-24.jpg"), require("../../assets/max-poses/max-25.jpg"),
];
const POSES_BY_BRANCH: Record<string, number[]> = {
  "Грудь": [7, 2, 21, 17, 22],
  "Руки": [1, 7, 16, 21],
  "Спина": [8, 13, 23, 3],
  "Ноги": [10, 14, 19, 4, 24],
  "Пресс": [5, 11, 17, 18],
  "Кардио": [4, 9, 14, 18, 22],
};

export type WorkoutOutcome = { score: number; done: number; partial: number; skipped: number };

export function WorkoutScreen({
  state,
  workout,
  onExit,
  onFinish,
}: {
  state: AppState;
  workout: Workout;
  onExit: () => void;
  onFinish: (r: WorkoutOutcome) => void;
}) {
  const meta = branchMeta(workout.branch);
  const total = workout.exercises.length;
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [partial, setPartial] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const ex = workout.exercises[index];
  const poseList = POSES_BY_BRANCH[workout.branch] ?? POSES_BY_BRANCH["Кардио"];
  const poseNumber = poseList[(workout.index + index) % poseList.length];
  const pose = MAX_POSES[poseNumber];

  useEffect(() => {
    setSecondsLeft(10);
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const remaining = Math.max(0, 10 - Math.floor((Date.now() - startedAt) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) clearInterval(timer);
    }, 200);
    return () => clearInterval(timer);
  }, [index, ex.id]);
  // a different funny line for every exercise of this workout
  const quip = useMemo(() => QUIPS[(workout.index * 3 + index * 2) % QUIPS.length], [workout.index, index]);

  // FR-08: an exercise is marked as done, partly done (counts half) or skipped.
  function answer(kind: "done" | "partial" | "skip") {
    if (secondsLeft > 0) return;
    const d = done + (kind === "done" ? 1 : 0);
    const p = partial + (kind === "partial" ? 1 : 0);
    if (index < total - 1) {
      setDone(d);
      setPartial(p);
      setIndex(index + 1);
    } else {
      onFinish({ score: d + p * 0.5, done: d, partial: p, skipped: total - d - p });
    }
  }

  return (
    <View style={s.root}>
      <View style={s.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Закрыть тренировку" onPress={() => setConfirmExit(true)} hitSlop={12}>
          <Icon name="close" size={30} color={COLORS.muted} />
        </Pressable>
        <View style={{ flex: 1 }}><ProgressBar value={(index / total) * 100} color={meta.color} height={12} /></View>
      </View>

      <ScrollView contentContainerStyle={s.body}>
        <Text style={[s.kicker, { color: meta.color }]}>{workout.branch} · {workout.title}</Text>
        <Text style={s.counter}>Упражнение {index + 1} из {total}</Text>
        {secondsLeft > 0 && <View style={s.timerNotice}><Text style={s.timerText}>⏱ Минимум на упражнение: {secondsLeft} сек.</Text><Text style={s.timerHint}>Кнопки станут доступны после завершения отсчёта.</Text></View>}

        <View style={[s.card, { borderColor: meta.color + "88" }]}>
          <Image source={pose} resizeMode="contain" style={s.poseImage} accessibilityLabel={`Иллюстрация Макса: ${workout.branch}`} />
          <ExerciseAnimation key={ex.id} anim={ex.anim} hold={ex.hold} color={meta.color} width={290} />
          <Text style={s.exName}>{ex.name}</Text>
          <Text style={[s.reps, { color: meta.color }]}>{ex.seconds ? `${ex.seconds} сек` : `${ex.reps} раз`}</Text>
        </View>

        <View style={s.maxRow}>
          <MaxAvatar state={state} size={64} ringColor={meta.color} />
          <View style={s.bubble}>
            <Text style={s.bubbleText}>{ex.note}</Text>
            <Text style={s.quip}>{quip}</Text>
            <View style={s.bubbleTail} />
          </View>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Btn label={secondsLeft > 0 ? `Подожди ${secondsLeft} сек.` : index === total - 1 ? "Готово — завершить" : "Готово"} icon="check-bold" onPress={() => answer("done")} disabled={secondsLeft > 0} />
        <View style={s.secondary}>
          <Btn label="Частично" tone="secondary" onPress={() => answer("partial")} disabled={secondsLeft > 0} style={{ flex: 1, minHeight: 44 }} />
          <Btn label="Пропустить" tone="secondary" onPress={() => answer("skip")} disabled={secondsLeft > 0} style={{ flex: 1, minHeight: 44 }} />
        </View>
      </View>

      <Dialog
        visible={confirmExit}
        title="Выйти из тренировки?"
        message="Прогресс этой тренировки не сохранится."
        onClose={() => setConfirmExit(false)}
        actions={[
          { label: "Остаться", onPress: () => setConfirmExit(false) },
          { label: "Выйти", tone: "secondary", onPress: onExit },
        ]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  top: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  body: { padding: 20, paddingBottom: 24 },
  kicker: { fontSize: 13, fontWeight: "700", letterSpacing: 0.6 },
  counter: { color: COLORS.muted, fontSize: 14, fontWeight: "600", marginTop: 4, marginBottom: 14 },
  timerNotice: { backgroundColor: "#FFF7E6", borderColor: "#F4D28A", borderWidth: 1, borderRadius: 14, padding: 10, marginBottom: 14 },
  timerText: { color: "#8A5A00", fontSize: 14, fontWeight: "800" },
  timerHint: { color: "#8A5A00", fontSize: 12, marginTop: 3 },
  poseImage: { width: 190, height: 130, borderRadius: 14, marginBottom: 8 },
  card: { backgroundColor: COLORS.card, borderRadius: 24, borderWidth: 1, padding: 16, alignItems: "center" },
  exName: { color: COLORS.ink, fontSize: 24, lineHeight: 30, fontWeight: "800", textAlign: "center", marginTop: 4 },
  reps: { fontSize: 44, fontWeight: "800", marginTop: 4 },
  maxRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 },
  bubble: { flex: 1, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line, borderRadius: 16, padding: 12 },
  bubbleText: { color: COLORS.ink, fontSize: 15, lineHeight: 21, fontWeight: "700" },
  quip: { color: COLORS.muted, fontSize: 13, lineHeight: 19, fontWeight: "600", marginTop: 6, fontStyle: "italic" },
  bubbleTail: { position: "absolute", left: -7, top: 24, width: 12, height: 12, backgroundColor: COLORS.card, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: COLORS.line, transform: [{ rotate: "45deg" }] },
  footer: { padding: 16, paddingBottom: 24, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.bg },
  secondary: { flexDirection: "row", gap: 8, marginTop: 8 },
});
