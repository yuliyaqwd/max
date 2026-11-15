import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";

export type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type SportKind = "dumbbell" | "barbell" | "pullup" | "mat" | "kettlebell" | "rope" | "run";

export type AnimKey =
  | "pushup" | "plank" | "holdplank" | "plank_tap" | "squat" | "lunge" | "jumpsquat" | "bridge" | "calf"
  | "crunch" | "legraise" | "bicycle" | "twist" | "superman" | "swimmer" | "pullup" | "row" | "mountain"
  | "jack" | "burpee" | "highknees" | "run" | "rope" | "armcircles" | "dip";

export type Branch = "Грудь" | "Руки" | "Спина" | "Ноги" | "Пресс" | "Кардио";
export type WorkoutGrade = "Perfect" | "Good" | "Completed";
export type Mood = "angry" | "disappointed" | "happy" | "neutral";

export type Exercise = {
  id: string;
  name: string;
  reps: number;
  seconds?: number;
  note: string;
  anim: AnimKey; // animated how-to shown during the exercise
  hold?: boolean; // pause at the end points (e.g. "with a pause")
};

export type Workout = {
  id: string;
  branch: Branch;
  index: number; // position inside the branch path (0-based)
  title: string;
  sport: SportKind; // symbol shown on the path node
  duration: number;
  exercises: Exercise[];
};

export type BranchMeta = {
  branch: Branch;
  icon: SportKind;
  color: string;
  dark: string;
  description: string;
  minLevel: number; // level of the user at which the section opens
};

export type Slot = "head" | "face" | "neck";
export type Cosmetic = { id: string; name: string; price: number; slot: Slot; quip: string };

export type HistoryItem = {
  id: string;
  date: string;
  dateISO: string;
  title: string;
  duration: number;
  grade: WorkoutGrade;
  xp: number;
  coins: number;
};

export type WeightEntry = { dateISO: string; weight: number };
export type Settings = { maxMessages: boolean; weighReminder: boolean };
export type TrainingExperience = "beginner" | "experienced";

export type AppState = {
  onboarded: boolean;
  agreed: boolean; // user agreement accepted (principle 7 of the ТЗ)
  trainingExperience: TrainingExperience;
  name: string;
  birthDate: string; // optional, DD.MM.YYYY
  height: number;
  weight: number;
  xp: number;
  coins: number;
  streak: number;
  completed: string[]; // ids of finished workouts
  history: HistoryItem[];
  weights: WeightEntry[];
  ownedCosmetics: string[];
  equipped: string[]; // one item per slot
  settings: Settings;
  weighDismissedISO: string;
};

export type WorkoutResult = {
  workout: Workout;
  grade: WorkoutGrade;
  xp: number;
  coins: number;
  done: number;
  total: number;
  newLevel: number | null; // set when this workout raised the level
  unlockedBranches: Branch[];
};
