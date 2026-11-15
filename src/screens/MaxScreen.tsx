import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Dialog } from "../Dialog";
import { BRANCHES, COSMETICS } from "../data";
import { currentLevel, mascotState, maxMessage } from "../logic";
import { CosmeticGlyph, MaxPortrait } from "../MaxView";
import { COLORS } from "../theme";
import type { AppState, Cosmetic, Slot } from "../types";
import { Card, Icon, ProgressBar, moodIcon, ui } from "../ui";

export type CosmeticResult = "bought" | "worn" | "removed" | "no-coins";

const SLOT_LABEL: Record<Slot, string> = { head: "Голова", face: "Лицо", neck: "Шея" };

export function MaxScreen({ state, onCosmetic }: { state: AppState; onCosmetic: (id: string) => CosmeticResult }) {
  const m = mascotState(state);
  const mood = moodIcon(m.mood);
  const [lack, setLack] = useState<Cosmetic | null>(null);


  function tap(item: Cosmetic) {
    if (onCosmetic(item.id) === "no-coins") setLack(item);
  }

  return (
    <>
      <Text style={ui.kicker}>Твой маскот</Text>
      <Text style={ui.title}>Макс</Text>

      <View style={[s.stage, m.mood === "angry" && { borderColor: COLORS.red }, m.mood === "disappointed" && { borderColor: COLORS.blue }]}>
        <View>
          <MaxPortrait state={state} width={280} />
          <View style={s.mood}><Icon name={mood.name} size={28} color={mood.color} /></View>
        </View>
        <Text style={s.name}>{state.name}, ты на {currentLevel(state)} уровне</Text>
        <Text style={s.form}>{m.physique} · {Math.round(m.physical)}%</Text>
        <Text style={[ui.muted, { marginTop: 3 }]}>Форма зависит от ИМТ и накопленного опыта тренировок</Text>
        <View style={{ width: "100%", marginVertical: 10 }}><ProgressBar value={m.physical} color={COLORS.green} /></View>
        <Text style={[ui.muted, { textAlign: "center" }]}>{maxMessage(state)}</Text>
      </View>

      <Card style={{ marginTop: 12 }}>
        <Text style={ui.cardTitle}>Как меняется Макс</Text>
        <Text style={[ui.muted, { marginTop: 4 }]}>
          ИМТ выбирает одну из 25 базовых форм. Каждые 250 XP за тренировки добавляют одну визуальную ступень, максимум четыре. Профиль использует тот же портрет и те же аксессуары. ИМТ здесь — только игровой параметр, не медицинская оценка.
        </Text>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Text style={ui.cardTitle}>Прогресс по группам мышц</Text>
        <Text style={[ui.muted, { marginTop: 4, marginBottom: 12 }]}>
          Каждая ветка прокачивается отдельно. Больше всего занятий сейчас в разделе «{m.strongestBranch}».
        </Text>
        {BRANCHES.map((branch) => (
          <View key={branch.branch} style={{ marginBottom: 10 }}>
            <View style={s.muscleLabel}>
              <Text style={s.muscleName}>{branch.branch}</Text>
              <Text style={s.muscleValue}>{m.muscleProgress[branch.branch]}%</Text>
            </View>
            <ProgressBar value={m.muscleProgress[branch.branch]} color={branch.color} />
          </View>
        ))}
      </Card>

      <Text style={ui.sectionTitle}>Гардероб и магазин</Text>
      {COSMETICS.map((item) => {
        const owned = state.ownedCosmetics.includes(item.id);
        const on = state.equipped.includes(item.id);
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            onPress={() => tap(item)}
            style={({ pressed }) => [s.shopRow, on && { borderColor: COLORS.green + "88" }, pressed && { opacity: 0.8 }]}
          >
            <View style={s.shopIcon}><CosmeticGlyph id={item.id} size={46} /></View>
            <View style={ui.flex}>
              <Text style={ui.cardTitle}>{item.name}</Text>
              <Text style={ui.muted}>{SLOT_LABEL[item.slot]}</Text>
              {!owned && (
                <View style={s.priceRow}><Icon name="hand-coin" size={16} color={COLORS.yellow} /><Text style={s.price}>{item.price}</Text></View>
              )}
            </View>
            <Text style={[s.action, on && { color: COLORS.muted }]}>{on ? "Снять" : owned ? "Надеть" : "Купить"}</Text>
          </Pressable>
        );
      })}

      <Dialog
        visible={!!lack}
        title="Пока не хватает монет"
        message={lack ? `«${lack.name}» стоит ${lack.price} монет, у тебя ${state.coins}. Ещё ${lack.price - state.coins} — и она твоя. Монеты начисляются за тренировки.` : ""}
        onClose={() => setLack(null)}
        actions={[{ label: "Понятно", onPress: () => setLack(null) }]}
      />
    </>
  );
}

const s = StyleSheet.create({
  stage: { backgroundColor: COLORS.card, borderRadius: 24, alignItems: "center", padding: 18, borderWidth: 1, borderColor: COLORS.line },
  mood: { position: "absolute", left: 8, top: 8, backgroundColor: COLORS.bg, borderRadius: 20, padding: 5 },
  name: { color: COLORS.ink, fontSize: 18, fontWeight: "800", marginTop: 12 },
  form: { color: COLORS.green, fontSize: 13, fontWeight: "700", marginTop: 4 },
  shopRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: COLORS.line, padding: 14, marginBottom: 10 },
  shopIcon: { width: 64, height: 56, borderRadius: 14, backgroundColor: COLORS.cardAlt, alignItems: "center", justifyContent: "center" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  price: { color: COLORS.yellow, fontWeight: "800", fontSize: 14 },
  action: { color: COLORS.green, fontWeight: "700", fontSize: 14 },
  muscleLabel: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  muscleName: { color: COLORS.ink, fontWeight: "700", fontSize: 13 },
  muscleValue: { color: COLORS.muted, fontWeight: "700", fontSize: 12 },
});
