import React, { useState } from "react";
import { Linking } from "react-native";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Dialog } from "../Dialog";
import { currentLevel, effectiveStreak, mascotState, trainedToday, validBirthDate } from "../logic";
import { MaxPortrait } from "../MaxView";
import { COLORS } from "../theme";
import type { AppState, IconName, Settings } from "../types";
import { AGREEMENT_TEXT, ProfileInput } from "./OnboardingScreen";
import { Btn, Card, Icon, ui } from "../ui";

function Line({ icon, color, label, value }: { icon: IconName; color: string; label: string; value: string }) {
  return (
    <View style={s.line}>
      <Icon name={icon} size={22} color={color} />
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

function Field({ label, value, onChange, placeholder, numeric }: { label: string; value: string; onChange: (t: string) => void; placeholder?: string; numeric?: boolean }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={COLORS.muted} keyboardType={numeric ? "numeric" : "default"} style={s.input} />
    </View>
  );
}

function Toggle({ title, text, value, onChange }: { title: string; text: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={s.toggle}>
      <View style={ui.flex}>
        <Text style={ui.cardTitle}>{title}</Text>
        <Text style={ui.muted}>{text}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: COLORS.line, true: COLORS.green }} thumbColor="#FFFFFF" />
    </View>
  );
}


export function ProfileScreen({
  state,
  bmi,
  onSave,
  onSettings,
  onReset,
}: {
  state: AppState;
  bmi: number;
  onSave: (p: ProfileInput) => void;
  onSettings: (patch: Partial<Settings>) => void;
  onReset: () => void;
}) {
  // ФТ-04: edit profile and notification settings
  const [name, setName] = useState(state.name);
  const [birth, setBirth] = useState(state.birthDate);
  const [height, setHeight] = useState(String(state.height));
  const [weight, setWeight] = useState(String(state.weight));
  const [experience, setExperience] = useState<"beginner" | "experienced">(state.trainingExperience);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [terms, setTerms] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const mascot = mascotState(state);

  function save() {
    const h = Number(height.replace(",", "."));
    const w = Number(weight.replace(",", "."));
    if (!name.trim()) return setMsg({ ok: false, text: "Имя не может быть пустым." });
    if (!validBirthDate(birth)) return setMsg({ ok: false, text: "Дата рождения: ДД.ММ.ГГГГ или пустое поле." });
    if (!(h >= 100 && h <= 250)) return setMsg({ ok: false, text: "Рост должен быть от 100 до 250 см." });
    if (!(w >= 30 && w <= 300)) return setMsg({ ok: false, text: "Вес должен быть от 30 до 300 кг." });
    onSave({ name: name.trim(), birthDate: birth.trim(), height: h, weight: w, trainingExperience: experience });
    setMsg({ ok: true, text: "Сохранено." });
  }

  return (
    <>
      <Text style={ui.kicker}>Профиль</Text>
      <Text style={ui.title}>{state.name}</Text>

      <Card>
        <Text style={ui.cardTitle}>Твой Макс</Text>
        <View style={s.mascotImage}>
          <MaxPortrait state={state} width={280} />
        </View>
        <Text style={s.mascotTitle}>{mascot.physique}</Text>
        <Text style={[ui.muted, { marginTop: 4 }]}>
          Это тот же Макс, что и во вкладке «Макс». Его образ выбирается по ИМТ, а каждые 250 XP от тренировок продвигают его ещё на одну визуальную ступень (до 4 ступеней).
        </Text>
      </Card>

      <Card>
        <Text style={ui.cardTitle}>Данные</Text>
        <Field label="Имя" value={name} onChange={setName} />
        <Field label="Дата рождения (необязательно)" value={birth} onChange={setBirth} placeholder="ДД.ММ.ГГГГ" />
        <View style={s.row}>
          <View style={ui.flex}><Field label="Рост, см" value={height} onChange={setHeight} numeric /></View>
          <View style={ui.flex}><Field label="Вес, кг" value={weight} onChange={setWeight} numeric /></View>
        </View>
        <Text style={[ui.muted, { marginTop: 8 }]}>ИМТ: {bmi.toFixed(1)} · справочный показатель, не оценка тебя.</Text>
        {bmi >= 30 && <Text style={[ui.muted, { marginTop: 6, color: COLORS.blue }]}>Сейчас план начнётся с ходьбы и низкоударного кардио. ИМТ — ориентир, а не диагноз.</Text>}
        <Text style={s.fieldLabel}>Опыт тренировок</Text>
        <View style={s.row}>
          <Btn label="Начинающий" tone={experience === "beginner" ? "primary" : "secondary"} onPress={() => setExperience("beginner")} style={{ flex: 1, minHeight: 42 }} />
          <Btn label="Есть опыт" tone={experience === "experienced" ? "primary" : "secondary"} onPress={() => setExperience("experienced")} style={{ flex: 1, minHeight: 42 }} />
        </View>
        {msg && <Text style={[s.msg, { color: msg.ok ? COLORS.green : COLORS.red }]}>{msg.text}</Text>}
        <Btn label="Сохранить" onPress={save} style={{ marginTop: 12 }} />
      </Card>

      <Card>
        <Text style={ui.cardTitle}>Игровой профиль</Text>
        <Line icon="lightning-bolt" color={COLORS.yellow} label="Уровень" value={`${currentLevel(state)}`} />
        <Line icon="star" color={COLORS.yellow} label="XP" value={`${state.xp}`} />
        <Line icon="hand-coin" color={COLORS.yellow} label="Монеты" value={`${state.coins}`} />
        <Line icon="fire" color={trainedToday(state) ? COLORS.flame : COLORS.muted} label="Серия дней" value={`${effectiveStreak(state)}${trainedToday(state) ? "" : " · сегодня ещё нет"}`} />
      </Card>

      <Card>
        <Text style={ui.cardTitle}>Уведомления и реплики</Text>
        <Toggle title="Реплики Макса" text="Подбадривания и шуточные «упрёки» на главном экране." value={state.settings.maxMessages} onChange={(v) => onSettings({ maxMessages: v })} />
        <Toggle title="Напоминание о взвешивании" text="Раз в неделю предлагать записать вес." value={state.settings.weighReminder} onChange={(v) => onSettings({ weighReminder: v })} />
        <Text style={[ui.muted, { marginTop: 6 }]}>Push-уведомления вне приложения появятся в следующей версии.</Text>
      </Card>

      <Card>
        <Text style={ui.cardTitle}>О приложении</Text>
        <Text style={[ui.muted, { marginTop: 4 }]}>MVP: данные хранятся на устройстве. Авторизация, API и база данных подключаются на следующем этапе.</Text>
        <View style={s.row}>
          <Btn label="Соглашение" tone="secondary" onPress={() => setTerms(true)} style={{ flex: 1, minHeight: 44, marginTop: 12 }} />
          <Btn label="Сбросить данные" tone="secondary" onPress={() => setConfirmReset(true)} style={{ flex: 1, minHeight: 44, marginTop: 12 }} />
        </View>
      </Card>

      <Dialog visible={terms} title="Пользовательское соглашение" message={AGREEMENT_TEXT} onClose={() => setTerms(false)} actions={[{ label: "Понятно", onPress: () => setTerms(false) }]}>
        <Text style={s.link} onPress={() => Linking.openURL("https://eur-lex.europa.eu/eli/reg/2016/679/oj")}>Открыть официальный текст GDPR</Text>
        <Text style={s.link} onPress={() => Linking.openURL("https://commission.europa.eu/law/law-topic/consumer-protection-law_en")}>Права потребителей ЕС</Text>
      </Dialog>
      <Dialog
        visible={confirmReset}
        title="Сбросить все данные?"
        message="Прогресс, монеты, история и вес будут удалены с этого устройства. Отменить это нельзя."
        onClose={() => setConfirmReset(false)}
        actions={[
          { label: "Оставить как есть", onPress: () => setConfirmReset(false) },
          { label: "Сбросить", tone: "secondary", onPress: () => { setConfirmReset(false); onReset(); } },
        ]}
      />
    </>
  );
}

const s = StyleSheet.create({
  mascotImage: { width: "100%", alignItems: "center", marginTop: 8, borderRadius: 14 },
  mascotTitle: { color: COLORS.ink, fontSize: 16, fontWeight: "800", textAlign: "center", marginTop: 4 },
  line: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  label: { flex: 1, color: COLORS.muted, fontSize: 15, fontWeight: "600" },
  value: { color: COLORS.ink, fontSize: 16, fontWeight: "800" },
  fieldLabel: { color: COLORS.muted, fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 16, fontWeight: "600", color: COLORS.ink },
  row: { flexDirection: "row", gap: 10 },
  msg: { fontSize: 14, fontWeight: "600", marginTop: 10 },
  link: { color: COLORS.blue, textDecorationLine: "underline", marginTop: 8, fontWeight: "700" },
  toggle: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
});
