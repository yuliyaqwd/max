import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "./theme";
import type { AppState, IconName } from "./types";
import type { Mood } from "./logic";
import { effectiveStreak, levelFromXp, trainedToday } from "./logic";

export function moodIcon(mood: Mood): { name: IconName; color: string } {
  if (mood === "angry") return { name: "emoticon-angry", color: COLORS.red };
  if (mood === "disappointed") return { name: "emoticon-sad", color: COLORS.blue };
  if (mood === "happy") return { name: "emoticon-cool", color: COLORS.yellow };
  return { name: "emoticon-happy", color: COLORS.green };
}

export function Icon({ name, size = 24, color = COLORS.ink }: { name: IconName; size?: number; color?: string }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

type BtnTone = "primary" | "secondary" | "ghost";

// Flat button: fills with the accent (or a section color), dims slightly when pressed.
export function Btn({
  label,
  onPress,
  tone = "primary",
  color,
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: BtnTone;
  color?: string;
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = tone === "primary" ? color ?? COLORS.green : tone === "secondary" ? COLORS.cardAlt : "transparent";
  const fg = tone === "primary" ? COLORS.onAccent : tone === "secondary" ? COLORS.ink : color ?? COLORS.blue;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        btn.base,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        tone === "secondary" && { borderWidth: 1, borderColor: COLORS.line },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={20} color={fg} />}
      <Text style={[btn.text, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const btn = StyleSheet.create({
  base: { minHeight: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 18 },
  text: { fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
});

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[ui.card, style]}>{children}</View>;
}

export function ProgressBar({ value, color = COLORS.green, height = 10 }: { value: number; color?: string; height?: number }) {
  return (
    <View style={[ui.bar, { height, borderRadius: height / 2 }]}>
      <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: "100%", backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

function Pill({ icon, color, value, label, dim }: { icon: IconName; color: string; value: string; label: string; dim?: boolean }) {
  return (
    <View style={ui.pill} accessibilityLabel={`${label}: ${value}${dim ? " (сегодня ещё не занимались)" : ""}`}>
      <Icon name={icon} size={20} color={dim ? COLORS.muted : color} />
      <Text style={[ui.pillText, dim && { color: COLORS.muted }]}>{value}</Text>
    </View>
  );
}

// Top bar: streak, coins, level — small chips.
export function TopBar({ state }: { state: AppState }) {
  return (
    <View style={ui.topBar}>
      <Pill icon="fire" color={COLORS.flame} value={`${effectiveStreak(state)}`} label="Серия дней" dim={!trainedToday(state)} />
      <Pill icon="hand-coin" color={COLORS.yellow} value={`${state.coins}`} label="Монеты" />
      <Pill icon="lightning-bolt" color={COLORS.blue} value={`${levelFromXp(state.xp)}`} label="Уровень" />
    </View>
  );
}

export function NavButton({ icon, label, active, onPress }: { icon: IconName; label: string; active: boolean; onPress: () => void }) {
  const color = active ? COLORS.green : COLORS.muted;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} style={ui.navItem} onPress={onPress}>
      <Icon name={icon} size={26} color={color} />
      <Text style={[ui.navLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

export const ui = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 18, borderWidth: 1, borderColor: COLORS.line, padding: 16, marginBottom: 12 },
  bar: { backgroundColor: COLORS.cardAlt, overflow: "hidden" },
  topBar: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  pill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.line },
  pillText: { fontSize: 15, fontWeight: "700", color: COLORS.ink },
  navItem: { flex: 1, alignItems: "center", gap: 2, paddingTop: 4 },
  navLabel: { fontSize: 11, fontWeight: "600" },
  kicker: { fontSize: 12, fontWeight: "700", letterSpacing: 1.2, color: COLORS.green, marginBottom: 6, textTransform: "uppercase" },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "800", color: COLORS.ink, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.ink, marginTop: 18, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.ink },
  muted: { color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: "500" },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
});
