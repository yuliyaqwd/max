import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { branchMeta } from "../data";
import { DAILY_WORKOUT_LIMIT, gradeLabel, limitReached } from "../logic";
import { MaxStage } from "../MaxView";
import { COLORS } from "../theme";
import type { AppState, IconName, WorkoutResult } from "../types";
import { Btn, Icon } from "../ui";

function Box({ icon, color, value, label }: { icon: IconName; color: string; value: string; label: string }) {
  return (
    <View style={[s.box, { borderColor: color }]}>
      <Text style={[s.boxLabel, { backgroundColor: color }]}>{label}</Text>
      <View style={s.boxBody}>
        <Icon name={icon} size={22} color={color} />
        <Text style={[s.boxValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

export function ResultScreen({ state, result, onContinue }: { state: AppState; result: WorkoutResult; onContinue: () => void }) {
  const meta = branchMeta(result.workout.branch);
  const perfect = result.grade === "Perfect";
  const score = String(result.done).replace(".", ",");
  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.center}>
        <MaxStage state={state} width={150} />
        <View style={[s.badge, { backgroundColor: meta.color }]}>
          <Icon name={perfect ? "trophy" : "check-bold"} size={30} color={COLORS.onAccent} />
        </View>
        <Text style={s.title}>{perfect ? "Идеально!" : "Тренировка пройдена!"}</Text>
        <Text style={s.sub}>{result.workout.branch} · {result.workout.title}</Text>

        <View style={s.boxes}>
          <Box icon="lightning-bolt" color={COLORS.yellow} value={`+${result.xp}`} label="XP" />
          <Box icon="hand-coin" color={COLORS.blue} value={`+${result.coins}`} label="Монеты" />
          <Box icon="bullseye" color={COLORS.green} value={`${score}/${result.total}`} label={gradeLabel(result.grade)} />
        </View>

        {limitReached(state) && (
          <View style={[s.level, { borderColor: COLORS.red + "88" }]}>
            <Icon name="sleep" size={32} color={COLORS.red} />
            <View style={{ flex: 1 }}>
              <Text style={s.levelTitle}>Лимит на сегодня: {DAILY_WORKOUT_LIMIT} из {DAILY_WORKOUT_LIMIT}</Text>
              <Text style={s.levelText}>Макс отправляет тебя отдыхать. Новые тренировки откроются завтра.</Text>
            </View>
          </View>
        )}

        {result.newLevel && (
          <View style={s.level}>
            <Icon name="star-circle" size={34} color={COLORS.yellow} />
            <View style={{ flex: 1 }}>
              <Text style={s.levelTitle}>Новый уровень: {result.newLevel}!</Text>
              <Text style={s.levelText}>
                {result.unlockedBranches.length
                  ? `Открыт раздел: ${result.unlockedBranches.join(", ")}.`
                  : "Макс гордится тобой. Продолжай в том же духе."}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={s.footer}>
        <Btn label="Продолжить" onPress={onContinue} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  center: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  badge: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", marginTop: -30, borderWidth: 4, borderColor: COLORS.bg },
  title: { color: COLORS.yellow, fontSize: 28, fontWeight: "800", marginTop: 14, textAlign: "center" },
  sub: { color: COLORS.muted, fontSize: 15, fontWeight: "600", marginTop: 4 },
  boxes: { flexDirection: "row", gap: 10, marginTop: 24, alignSelf: "stretch" },
  box: { flex: 1, borderWidth: 1, borderRadius: 16, overflow: "hidden", backgroundColor: COLORS.card },
  boxLabel: { color: COLORS.onAccent, fontSize: 12, fontWeight: "700", textAlign: "center", paddingVertical: 4 },
  boxBody: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 14 },
  boxValue: { fontSize: 19, fontWeight: "800" },
  level: { flexDirection: "row", alignItems: "center", gap: 12, alignSelf: "stretch", marginTop: 16, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: COLORS.yellow + "88", backgroundColor: COLORS.card },
  levelTitle: { color: COLORS.ink, fontSize: 17, fontWeight: "800" },
  levelText: { color: COLORS.muted, fontSize: 14, fontWeight: "600", marginTop: 2 },
  footer: { padding: 16, paddingBottom: 24, borderTopWidth: 1, borderTopColor: COLORS.line },
});
