import { BRANCHES, COSMETICS, WORKOUTS, branchMeta, workoutsOf } from "./data";
import type { AppState, Branch, HistoryItem, Workout, WorkoutGrade } from "./types";

export const XP_PER_LEVEL = 100;
// Max stops the user from training more than this many times a day (rest is part of training).
export const DAILY_WORKOUT_LIMIT = 3;
export const WEIGH_EVERY_DAYS = 7;

export const initialState: AppState = {
  onboarded: false,
  agreed: false,
  trainingExperience: "beginner",
  name: "",
  birthDate: "",
  height: 175,
  weight: 70,
  xp: 0,
  coins: 0,
  streak: 0,
  completed: [],
  history: [],
  weights: [],
  ownedCosmetics: [],
  equipped: [],
  settings: { maxMessages: true, weighReminder: true },
  weighDismissedISO: "",
};

// Safe restore from storage: unknown / old fields are dropped or migrated, missing ones get defaults.
export function normalizeState(raw: unknown): AppState {
  if (!raw || typeof raw !== "object") return initialState;
  const s = raw as Partial<AppState> & { equippedCosmetic?: string };
  const known = new Set(COSMETICS.map((c) => c.id));

  const owned = (Array.isArray(s.ownedCosmetics) ? s.ownedCosmetics : []).filter((id) => known.has(id));
  let equipped = Array.isArray(s.equipped) ? s.equipped.filter((id) => known.has(id)) : [];
  if (!equipped.length && s.equippedCosmetic && known.has(s.equippedCosmetic)) equipped = [s.equippedCosmetic];

  const state: AppState = {
    ...initialState,
    ...s,
    agreed: s.agreed ?? !!s.onboarded,
    trainingExperience: s.trainingExperience === "experienced" ? "experienced" : "beginner",
    completed: Array.isArray(s.completed) ? s.completed : [],
    history: (Array.isArray(s.history) ? s.history : []).map((h) => ({ ...h, duration: h.duration ?? 0 })),
    weights: Array.isArray(s.weights) ? s.weights : [],
    ownedCosmetics: Array.from(new Set([...owned, ...equipped])),
    equipped,
    settings: { ...initialState.settings, ...(s.settings ?? {}) },
  };
  if (state.onboarded && !state.weights.length) {
    state.weights = [{ dateISO: new Date().toISOString(), weight: state.weight }];
  }
  return state;
}

export function bmi(height: number, weight: number) {
  if (!height) return 0;
  return weight / Math.pow(height / 100, 2);
}

// Starting "form points" of Max from the user's BMI (ТЗ: BMI is a starting parameter of Max's look):
// 30 and above -> 0 (starts as the cosy sofa Max), 25..29.9 -> 20, below 25 -> 38 (starts already athletic).
export function bmiBase(value: number) {
  if (!value || !isFinite(value)) return 0;
  if (value >= 30) return 0;
  if (value >= 25) return 20;
  return 38;
}


// Индекс одной из 25 иллюстраций Макса. ИМТ переводится в 25 последовательных
// визуальных ступеней от BMI 40+ (самая округлая форма) до BMI 18.5 и ниже.
// Тренировочный опыт может продвинуть персонажа максимум на 4 ступени: +1 за каждые 250 XP.
export function mascotPhotoIndex(state: AppState) {
  const currentBmi = bmi(state.height, state.weight);
  const bmiStage = Math.round(((40 - currentBmi) / (40 - 18.5)) * 24);
  const trainingStage = Math.min(4, Math.floor(Math.max(0, state.xp) / 250));
  return Math.max(0, Math.min(24, bmiStage + trainingStage));
}

export function levelFromXp(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// `score` counts a done exercise as 1 and a partly done one as 0.5.
export function gradeFor(score: number, total: number): WorkoutGrade {
  const ratio = total ? score / total : 0;
  return ratio >= 0.999 ? "Perfect" : ratio >= 0.66 ? "Good" : "Completed";
}

export function gradeRewards(grade: WorkoutGrade) {
  if (grade === "Perfect") return { xp: 50, coins: 100 };
  if (grade === "Good") return { xp: 35, coins: 70 };
  return { xp: 20, coins: 40 };
}

export function gradeLabel(grade: WorkoutGrade) {
  return grade === "Perfect" ? "Идеально" : grade === "Good" ? "Хорошо" : "Засчитано";
}

// Whole calendar days between two ISO timestamps ("yesterday 23:50" -> "today 00:10" = 1).
export function calendarDayDiff(fromISO: string, toISO: string) {
  const a = new Date(fromISO);
  const b = new Date(toISO);
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86400000);
}

export function daysSince(iso: string) {
  if (!iso) return Infinity;
  const diff = calendarDayDiff(iso, new Date().toISOString());
  return Number.isNaN(diff) ? Infinity : Math.max(0, diff);
}

export function daysSinceLastWorkout(history: HistoryItem[]) {
  if (!history.length) return 0;
  const lastISO = history[0].dateISO ?? history[0].date.split(".").reverse().join("-");
  const d = daysSince(lastISO);
  return d === Infinity ? 0 : d;
}

// Streak rules:
//  - a workout on the same day does not change the streak;
//  - the next day, or after ONE missed day, the streak grows by 1;
//  - after TWO missed days in a row it starts over from 1.
// Days without a workout (but not yet two missed days) keep the streak, shown in grey.
export const MISSED_DAYS_TO_RESET = 2;

export function nextStreak(state: AppState, nowISO: string) {
  const lastISO = state.history[0]?.dateISO;
  if (!lastISO) return 1;
  const diff = calendarDayDiff(lastISO, nowISO);
  if (diff === 0) return Math.max(1, state.streak);
  return diff <= MISSED_DAYS_TO_RESET ? state.streak + 1 : 1;
}

// The stored streak only changes when a workout is finished, so the visible value also drops to 0
// as soon as two whole calendar days have been missed.
export function effectiveStreak(state: AppState) {
  return daysSinceLastWorkout(state.history) > MISSED_DAYS_TO_RESET ? 0 : state.streak;
}

// True when the user has already trained today (then the flame is "lit"; otherwise it is grey).
export function trainedToday(state: AppState) {
  return state.history.length > 0 && daysSinceLastWorkout(state.history) === 0;
}

export function workoutsToday(state: AppState) {
  return state.history.filter((h) => daysSince(h.dateISO ?? "") === 0).length;
}

export function limitReached(state: AppState) {
  return workoutsToday(state) >= DAILY_WORKOUT_LIMIT;
}

export function currentLevel(state: AppState) {
  return levelFromXp(state.xp);
}

export function branchOpen(state: AppState, branch: Branch) {
  return currentLevel(state) >= branchMeta(branch).minLevel;
}

export function branchesUnlockedBy(oldXp: number, newXp: number): Branch[] {
  const from = levelFromXp(oldXp);
  const to = levelFromXp(newXp);
  return BRANCHES.filter((b) => b.minLevel > from && b.minLevel <= to).map((b) => b.branch);
}

export function isDone(state: AppState, w: Workout) {
  return state.completed.includes(w.id);
}

// A lesson opens when its section is open (level) and the previous lesson of the section is completed.
export function isUnlocked(state: AppState, w: Workout) {
  if (!branchOpen(state, w.branch)) return false;
  if (w.index === 0) return true;
  const prev = workoutsOf(w.branch)[w.index - 1];
  return !!prev && state.completed.includes(prev.id);
}

export function branchDone(state: AppState, branch: Branch) {
  return workoutsOf(branch).filter((w) => isDone(state, w)).length;
}

export function branchProgress(state: AppState, branch: Branch) {
  const list = workoutsOf(branch);
  return list.length ? Math.round((branchDone(state, branch) / list.length) * 100) : 0;
}

export function nextWorkout(state: AppState, branch?: Branch): Workout | null {
  const list = branch ? workoutsOf(branch) : WORKOUTS;
  return list.find((w) => !isDone(state, w) && isUnlocked(state, w)) ?? null;
}

export type Mood = "angry" | "disappointed" | "happy" | "neutral";
export type MascotKey = "start" | "fit" | "strong" | "sad";

export function mascotState(state: AppState) {
  const total = BRANCHES.reduce((sum, b) => sum + branchProgress(state, b.branch), 0);
  const progress = total / BRANCHES.length;
  const inactiveDays = daysSinceLastWorkout(state.history);
  const streak = effectiveStreak(state);

  // Physical form = starting point from BMI + training. BMI only sets where Max starts; training moves him on.
  // Below 25 nothing more is gained from a lower BMI, so there is no reason to get "thinner" for Max.
  const gain = Math.min(100, progress * 0.7 + Math.min(state.xp / 10, 30));
  const currentBmi = bmi(state.height, state.weight);
  const base = bmiBase(currentBmi);
  const physical = Math.min(100, base + ((100 - base) * gain) / 100);
  const mood: Mood =
    inactiveDays >= 5 ? "angry" : inactiveDays >= 2 ? "disappointed" : streak >= 7 ? "happy" : "neutral";

  // BMI sets the starting visual model; training progress can then move Max toward a stronger form.
  // Weight changes therefore recalculate the visual state immediately, without treating BMI as a score.
  const key: MascotKey = currentBmi >= 30 ? "start" : currentBmi >= 25 ? "fit" : "strong";

  const muscleProgress = Object.fromEntries(
    BRANCHES.map(({ branch }) => [branch, branchProgress(state, branch)])
  ) as Record<Branch, number>;
  const strongestBranch = BRANCHES.reduce((best, item) =>
    muscleProgress[item.branch] > muscleProgress[best.branch] ? item : best
  , BRANCHES[0]);

  let physique = "Стартовая форма";
  if (physical >= 70) physique = "Сильная форма";
  else if (physical >= 35) physique = "В хорошей форме";

  return { physical, mood, key, physique, inactiveDays, streak, muscleProgress, strongestBranch: strongestBranch.branch };
}

export function lastWeighISO(state: AppState) {
  return state.weights.length ? state.weights[state.weights.length - 1].dateISO : "";
}

// UC-04: a weigh-in is offered once a week; "later" snoozes the card for two days.
export function weighDue(state: AppState) {
  if (!state.settings.weighReminder || !state.weights.length) return false;
  if (daysSince(lastWeighISO(state)) < WEIGH_EVERY_DAYS) return false;
  return daysSince(state.weighDismissedISO) >= 2;
}

export function maxMessage(state: AppState) {
  if (!state.settings.maxMessages) return "Реплики Макса выключены. Их можно вернуть в профиле.";
  if (limitReached(state)) return `Стоп! Сегодня ты уже сделал ${DAILY_WORKOUT_LIMIT} тренировки. Отдыхать — тоже тренировка. Жду тебя завтра!`;
  const m = mascotState(state);
  const overdue = daysSince(lastWeighISO(state)) >= 14 && state.settings.weighReminder;
  if (m.mood === "angry") return `Тебя не было ${m.inactiveDays} дн. Пока ты пропадал, я навалился на бургеры. Это на твоей совести!`;
  if (m.mood === "disappointed") return "Я уже скучаю по тренировкам. Одна тренировка — и я тебя прощу.";
  if (overdue) return "Весы по тебе скучают. Давай взвесимся — без паники!";
  if (m.mood === "happy") return `Серия ${m.streak} дней! Я так горжусь тобой, что готов вилять хвостом весь день.`;
  const worn = COSMETICS.find((c) => state.equipped.includes(c.id));
  if (worn && state.history.length % 2 === 0) return worn.quip;
  if (m.streak >= 3) return "Три дня подряд — уже похоже на привычку.";
  return "Начнём с одной тренировки. Я рядом.";
}

// Demo leaderboard (ФТ-14.1): real ranking needs the server; until then the other rows are sample data.
export const DEMO_LEADERS = [
  { name: "Аня К.", streak: 12 },
  { name: "Дима Р.", streak: 9 },
  { name: "Лена М.", streak: 6 },
  { name: "Саша В.", streak: 4 },
  { name: "Ира Т.", streak: 2 },
];

export function leaderboard(state: AppState) {
  const rows = [...DEMO_LEADERS.map((r) => ({ ...r, me: false })), { name: state.name || "Ты", streak: effectiveStreak(state), me: true }];
  rows.sort((a, b) => b.streak - a.streak || (a.me ? -1 : 1));
  return rows.map((r, i) => ({ ...r, place: i + 1 }));
}

// Optional date of birth, DD.MM.YYYY.
export function validBirthDate(text: string) {
  if (!text.trim()) return true;
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text.trim());
  if (!m) return false;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d && y >= 1920 && date <= new Date();
}
