import React, { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

import { COSMETICS } from "./src/data";
import { BranchPathScreen } from "./src/screens/BranchPathScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { CosmeticResult, MaxScreen } from "./src/screens/MaxScreen";
import { OnboardingScreen, ProfileInput } from "./src/screens/OnboardingScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ProgressScreen } from "./src/screens/ProgressScreen";
import { ResultScreen } from "./src/screens/ResultScreen";
import { WorkoutOutcome, WorkoutScreen } from "./src/screens/WorkoutScreen";
import { DAILY_WORKOUT_LIMIT, bmi, branchesUnlockedBy, gradeFor, gradeRewards, initialState, levelFromXp, limitReached, nextStreak, normalizeState } from "./src/logic";
import { COLORS } from "./src/theme";
import type { AppState, Branch, HistoryItem, Settings, Workout, WorkoutResult } from "./src/types";
import { NavButton } from "./src/ui";
import { WeighDialog } from "./src/WeighDialog";
import { Dialog } from "./src/Dialog";
import { MaxAvatar } from "./src/MaxView";
import { Text } from "react-native";

type Tab = "home" | "progress" | "max" | "profile";
const STORAGE_KEY = "max-fit-state";

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [openBranch, setOpenBranch] = useState<Branch | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [result, setResult] = useState<WorkoutResult | null>(null);
  const [weighOpen, setWeighOpen] = useState(false);
  const [restOpen, setRestOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState(normalizeState(JSON.parse(raw)));
      })
      .catch(() => setState(initialState)) // corrupted storage must not crash the app
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  // every screen starts at the top
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [tab, openBranch]);

  const currentBmi = useMemo(() => bmi(state.height, state.weight), [state.height, state.weight]);

  function finishOnboarding(p: ProfileInput) {
    const now = new Date().toISOString();
    setState((s) => ({ ...s, ...p, onboarded: true, agreed: true, weights: [{ dateISO: now, weight: p.weight }] }));
  }

  function saveProfile(p: ProfileInput) {
    setState((s) => {
      const changed = p.weight !== s.weight;
      return { ...s, ...p, weights: changed ? [...s.weights, { dateISO: new Date().toISOString(), weight: p.weight }] : s.weights };
    });
  }

  function addWeight(kg: number) {
    setState((s) => ({ ...s, weight: kg, weights: [...s.weights, { dateISO: new Date().toISOString(), weight: kg }], weighDismissedISO: "" }));
    setWeighOpen(false);
  }

  function snoozeWeigh() {
    setState((s) => ({ ...s, weighDismissedISO: new Date().toISOString() }));
  }

  function changeSettings(patch: Partial<Settings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }

  function resetAll() {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setState(initialState);
    setTab("home");
    setOpenBranch(null);
  }

  function finishWorkout(workout: Workout, r: WorkoutOutcome) {
    const total = workout.exercises.length;
    const grade = gradeFor(r.score, total);
    const reward = gradeRewards(grade);
    const nowISO = new Date().toISOString();
    const item: HistoryItem = {
      id: `${Date.now()}`,
      date: new Date().toLocaleDateString("ru-RU"),
      dateISO: nowISO,
      title: `${workout.branch}: ${workout.title}`,
      duration: workout.duration,
      grade,
      xp: reward.xp,
      coins: reward.coins,
    };
    const oldLevel = levelFromXp(state.xp);
    const newLevel = levelFromXp(state.xp + reward.xp);

    setState((s) => ({
      ...s,
      xp: s.xp + reward.xp,
      coins: s.coins + reward.coins,
      streak: nextStreak(s, nowISO),
      completed: s.completed.includes(workout.id) ? s.completed : [...s.completed, workout.id],
      history: [item, ...s.history].slice(0, 30),
    }));
    setActiveWorkout(null);
    setResult({
      workout,
      grade,
      xp: reward.xp,
      coins: reward.coins,
      done: r.score,
      total,
      newLevel: newLevel > oldLevel ? newLevel : null,
      unlockedBranches: branchesUnlockedBy(state.xp, state.xp + reward.xp),
    });
  }

  // One item per slot: wearing a new item takes the previous one of the same slot off.
  function cosmeticAction(id: string): CosmeticResult {
    const item = COSMETICS.find((c) => c.id === id);
    if (!item) return "removed";
    const owned = state.ownedCosmetics.includes(id);
    const wornNow = state.equipped.includes(id);
    if (owned && wornNow) {
      setState((s) => ({ ...s, equipped: s.equipped.filter((e) => e !== id) }));
      return "removed";
    }
    if (!owned && state.coins < item.price) return "no-coins";
    setState((s) => ({
      ...s,
      coins: owned ? s.coins : s.coins - item.price,
      ownedCosmetics: owned ? s.ownedCosmetics : [...s.ownedCosmetics, id],
      equipped: [...s.equipped.filter((e) => COSMETICS.find((c) => c.id === e)?.slot !== item.slot), id],
    }));
    return owned ? "worn" : "bought";
  }

  // Max stops the user once the daily limit of workouts is reached.
  function startWorkout(w: Workout) {
    if (limitReached(state)) {
      setRestOpen(true);
      return;
    }
    const currentBmi = bmi(state.height, state.weight);
    // A high BMI is a conservative signal to start with low-impact activity, not a diagnosis.
    if (currentBmi >= 30) {
      const walkWorkout: Workout = {
        ...w,
        id: `walk-adaptation-${w.id}`,
        branch: "Кардио",
        title: "Адаптация: ходьба",
        duration: 15,
        exercises: [
          { id: "walk-1", name: "Спокойная ходьба", anim: "run", reps: 5, seconds: 300, note: "Иди по ровной поверхности в разговорном темпе. Дыши свободно, не ускоряйся через силу." },
          { id: "walk-2", name: "Ходьба с постепенным ускорением", anim: "run", reps: 5, seconds: 300, note: "Если чувствуешь себя комфортно, немного увеличь темп. Ты должен мочь говорить полными предложениями." },
          { id: "walk-3", name: "Спокойное завершение", anim: "run", reps: 5, seconds: 300, note: "Замедлись, восстанови дыхание. При боли, головокружении или необычной одышке остановись." },
        ],
      };
      setActiveWorkout(walkWorkout);
      return;
    }
    if (state.trainingExperience === "beginner") {
      const lowImpact = new Set(["jumpsquat", "burpee", "highknees", "jack", "rope"]);
      const beginnerWorkout = {
        ...w,
        title: `Базовый уровень: ${w.title}`,
        duration: Math.max(5, Math.round(w.duration * 0.8)),
        exercises: w.exercises.map((ex) => ({
          ...ex,
          reps: Math.max(4, Math.round(ex.reps * 0.65)),
          seconds: ex.seconds ? Math.max(10, Math.round(ex.seconds * 0.65)) : undefined,
          name: lowImpact.has(ex.anim) ? `${ex.name} (облегчённый вариант)` : ex.name,
          note: lowImpact.has(ex.anim) ? `${ex.note} При необходимости замени прыжки шагами на месте и работай без ударной нагрузки.` : ex.note,
        })),
      };
      setActiveWorkout(beginnerWorkout);
      return;
    }
    setActiveWorkout(w);
  }

  function changeTab(next: Tab) {
    setTab(next);
    if (next === "home") setOpenBranch(null);
  }

  const wrap = (children: React.ReactNode) => (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {children}
    </SafeAreaView>
  );

  if (!loaded) return wrap(null);
  if (!state.onboarded) return wrap(<OnboardingScreen onDone={finishOnboarding} />);

  if (activeWorkout) {
    return wrap(
      <WorkoutScreen
        state={state}
        workout={activeWorkout}
        onExit={() => setActiveWorkout(null)}
        onFinish={(r) => finishWorkout(activeWorkout, r)}
      />
    );
  }

  if (result) {
    return wrap(
      <ResultScreen
        state={state}
        result={result}
        onContinue={() => {
          setOpenBranch(result.workout.branch);
          setTab("home");
          setResult(null);
        }}
      />
    );
  }

  return wrap(
    <View style={styles.app}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.screen}>
        {tab === "home" &&
          (openBranch ? (
            <BranchPathScreen state={state} branch={openBranch} onBack={() => setOpenBranch(null)} onStart={startWorkout} />
          ) : (
            <HomeScreen state={state} onOpenBranch={setOpenBranch} onStart={startWorkout} onWeigh={() => setWeighOpen(true)} onSnooze={snoozeWeigh} />
          ))}
        {tab === "progress" && <ProgressScreen state={state} bmi={currentBmi} onWeigh={() => setWeighOpen(true)} />}
        {tab === "max" && <MaxScreen state={state} onCosmetic={cosmeticAction} />}
        {tab === "profile" && <ProfileScreen state={state} bmi={currentBmi} onSave={saveProfile} onSettings={changeSettings} onReset={resetAll} />}
      </ScrollView>
      <View style={styles.nav}>
        <NavButton icon="home" label="Путь" active={tab === "home"} onPress={() => changeTab("home")} />
        <NavButton icon="chart-bar" label="Прогресс" active={tab === "progress"} onPress={() => changeTab("progress")} />
        <NavButton icon="paw" label="Макс" active={tab === "max"} onPress={() => changeTab("max")} />
        <NavButton icon="account" label="Профиль" active={tab === "profile"} onPress={() => changeTab("profile")} />
      </View>
      <Dialog
        visible={restOpen}
        title="Стоп! Макс против"
        onClose={() => setRestOpen(false)}
        actions={[{ label: "Ладно, отдыхаю", onPress: () => setRestOpen(false) }]}
      >
        <View style={styles.restRow}>
          <MaxAvatar state={state} size={72} ringColor={COLORS.red} />
          <Text style={styles.restText}>
            Ты уже сделал {DAILY_WORKOUT_LIMIT} тренировки за сегодня. Мышцам нужно время, чтобы восстановиться, а перегруз не качает, а ломает. Продолжим завтра!
          </Text>
        </View>
      </Dialog>
      <WeighDialog visible={weighOpen} current={state.weight} onSave={addWeight} onClose={() => setWeighOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  restRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 14 },
  restText: { flex: 1, color: COLORS.muted, fontSize: 15, lineHeight: 22, fontWeight: "600" },
  safe: { flex: 1, backgroundColor: COLORS.bg },
  app: { flex: 1 },
  screen: { padding: 20, paddingBottom: 120 },
  nav: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.line, flexDirection: "row", alignItems: "center", paddingHorizontal: 8 },
});
