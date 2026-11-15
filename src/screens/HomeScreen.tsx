import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BRANCHES, branchMeta, workoutsOf } from "../data";
import { DAILY_WORKOUT_LIMIT, bmi, branchDone, branchOpen, branchProgress, currentLevel, limitReached, mascotState, maxMessage, nextWorkout, weighDue, workoutsToday, XP_PER_LEVEL } from "../logic";
import { MaxAvatar } from "../MaxView";
import { SportIcon } from "../SportIcon";
import { COLORS } from "../theme";
import type { AppState, Branch, Workout } from "../types";
import { Btn, Card, Icon, ProgressBar, TopBar, moodIcon, ui } from "../ui";

export function HomeScreen({
  state,
  onOpenBranch,
  onStart,
  onWeigh,
  onSnooze,
}: {
  state: AppState;
  onOpenBranch: (b: Branch) => void;
  onStart: (w: Workout) => void;
  onWeigh: () => void;
  onSnooze: () => void;
}) {
  const level = currentLevel(state);
  const levelProgress = state.xp % XP_PER_LEVEL;
  const m = mascotState(state);
  const mood = moodIcon(m.mood);
  const next = nextWorkout(state);
  const resting = limitReached(state);
  const today = workoutsToday(state);
  const nextMeta = next ? branchMeta(next.branch) : null;

  return (
    <>
      <TopBar state={state} />

      <View style={[s.maxCard, m.mood === "angry" && { borderColor: COLORS.red }, m.mood === "disappointed" && { borderColor: COLORS.blue }]}>
        <View>
          <MaxAvatar state={state} size={96} />
          <View style={s.moodBadge}><Icon name={mood.name} size={22} color={mood.color} /></View>
        </View>
        <View style={ui.flex}>
          <Text style={ui.cardTitle}>Привет, {state.name}!</Text>
          <Text style={s.form}>{m.physique} · {Math.round(m.physical)}%</Text>
          <Text style={ui.muted}>{maxMessage(state)}</Text>
        </View>
      </View>

      {weighDue(state) && (
        <Card style={{ borderColor: COLORS.blue + "88" }}>
          <View style={s.weighRow}>
            <Icon name="scale-bathroom" size={30} color={COLORS.blue} />
            <View style={ui.flex}>
              <Text style={ui.cardTitle}>Пора взвеситься</Text>
              <Text style={ui.muted}>Прошла неделя с последнего взвешивания. Это займёт 10 секунд.</Text>
            </View>
          </View>
          <View style={s.weighBtns}>
            <Btn label="Записать вес" color={COLORS.blue} onPress={onWeigh} style={{ flex: 1, minHeight: 44 }} />
            <Btn label="Позже" tone="secondary" onPress={onSnooze} style={{ minHeight: 44 }} />
          </View>
        </Card>
      )}

      {bmi(state.height, state.weight) >= 30 && (
        <Card style={{ borderColor: COLORS.blue + "88" }}>
          <Text style={ui.cardTitle}>Начнём с комфортной нагрузки</Text>
          <Text style={[ui.muted, { marginTop: 6 }]}>Для первого этапа Макс предложит спокойную ходьбу и низкоударное кардио. Постепенно увеличивай длительность только при хорошем самочувствии. ИМТ — ориентир, а не медицинский диагноз.</Text>
        </Card>
      )}

      <Card>
        <View style={ui.between}>
          <Text style={ui.cardTitle}>До уровня {level + 1}</Text>
          <Text style={ui.muted}>{levelProgress}/{XP_PER_LEVEL} XP</Text>
        </View>
        <View style={{ marginTop: 10 }}><ProgressBar value={levelProgress} color={COLORS.yellow} /></View>
        <Text style={[ui.muted, { marginTop: 8 }]}>Сегодня тренировок: {Math.min(today, DAILY_WORKOUT_LIMIT)} из {DAILY_WORKOUT_LIMIT}</Text>
      </Card>

      {resting && (
        <Card style={{ borderColor: COLORS.red + "88" }}>
          <View style={s.weighRow}>
            <Icon name="sleep" size={30} color={COLORS.red} />
            <View style={ui.flex}>
              <Text style={ui.cardTitle}>На сегодня хватит</Text>
              <Text style={ui.muted}>Макс отправляет тебя отдыхать: мышцам нужно время восстановиться. Тренировки откроются завтра.</Text>
            </View>
          </View>
        </Card>
      )}

      {next && nextMeta && !resting && (
        <>
          <Text style={ui.sectionTitle}>Продолжить</Text>
          <View style={[s.continue, { borderColor: nextMeta.color + "66" }]}>
            <Text style={[s.continueKicker, { color: nextMeta.color }]}>{nextMeta.branch} · тренировка {next.index + 1}</Text>
            <Text style={s.continueTitle}>{next.title}</Text>
            <Text style={s.continueSub}>{next.exercises.length} упражнения · {next.duration} мин</Text>
            <Btn label="Начать" color={nextMeta.color} onPress={() => onStart(next)} style={{ marginTop: 14 }} />
          </View>
        </>
      )}

      <Text style={ui.sectionTitle}>Разделы</Text>
      {BRANCHES.map((b, i) => {
        const total = workoutsOf(b.branch).length;
        const done = branchDone(state, b.branch);
        const pct = branchProgress(state, b.branch);
        const open = branchOpen(state, b.branch);
        return (
          <Pressable
            key={b.branch}
            accessibilityRole="button"
            accessibilityLabel={`Раздел ${b.branch}`}
            disabled={!open}
            onPress={() => onOpenBranch(b.branch)}
            style={({ pressed }) => [s.section, !open && { opacity: 0.6 }, pressed && { opacity: 0.8 }]}
          >
            <View style={[s.sectionIcon, { backgroundColor: (open ? b.color : COLORS.muted) + "22" }]}>
              <SportIcon kind={b.icon} size={32} color={open ? b.color : COLORS.muted} />
            </View>
            <View style={ui.flex}>
              <Text style={s.sectionKicker}>Раздел {i + 1}</Text>
              <Text style={ui.cardTitle}>{b.branch}</Text>
              {open ? (
                <>
                  <View style={{ marginTop: 8 }}><ProgressBar value={pct} color={b.color} height={10} /></View>
                  <Text style={[ui.muted, { marginTop: 4 }]}>{done} из {total} тренировок</Text>
                </>
              ) : (
                <Text style={[ui.muted, { marginTop: 6 }]}>Откроется на уровне {b.minLevel} (сейчас {level})</Text>
              )}
            </View>
            <Icon name={open ? "chevron-right" : "lock"} size={open ? 28 : 22} color={COLORS.muted} />
          </Pressable>
        );
      })}
    </>
  );
}

const s = StyleSheet.create({
  maxCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.line, padding: 14, marginBottom: 12 },
  moodBadge: { position: "absolute", right: -6, bottom: -4, backgroundColor: COLORS.bg, borderRadius: 14, padding: 2 },
  form: { color: COLORS.green, fontSize: 13, fontWeight: "700", marginVertical: 3 },
  weighRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  weighBtns: { flexDirection: "row", gap: 8, marginTop: 12 },
  continue: { backgroundColor: COLORS.card, borderWidth: 1, borderRadius: 20, padding: 18 },
  continueKicker: { fontSize: 12, fontWeight: "700", letterSpacing: 0.6 },
  continueTitle: { color: COLORS.ink, fontSize: 24, fontWeight: "800", marginTop: 4 },
  continueSub: { color: COLORS.muted, fontSize: 14, fontWeight: "600", marginTop: 2 },
  section: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.line, padding: 14, marginBottom: 12 },
  sectionIcon: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  sectionKicker: { color: COLORS.muted, fontSize: 12, fontWeight: "600" },
});
