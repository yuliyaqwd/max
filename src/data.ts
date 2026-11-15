import { COLORS } from "./theme";
import type { AnimKey, Branch, BranchMeta, Cosmetic, Exercise, SportKind, Workout } from "./types";

export const BRANCHES: BranchMeta[] = [
  { branch: "Грудь", icon: "barbell", color: COLORS.green, dark: COLORS.greenDark, description: "Сила и осанка верхней части тела", minLevel: 1 },
  { branch: "Руки", icon: "dumbbell", color: COLORS.purple, dark: COLORS.purpleDark, description: "Трицепс, бицепс и предплечья", minLevel: 2 },
  { branch: "Спина", icon: "pullup", color: COLORS.blue, dark: COLORS.blueDark, description: "Крепкая спина без боли", minLevel: 1 },
  { branch: "Ноги", icon: "kettlebell", color: COLORS.red, dark: COLORS.redDark, description: "База для силы и выносливости", minLevel: 1 },
  { branch: "Пресс", icon: "mat", color: COLORS.yellow, dark: COLORS.yellowDark, description: "Кор, баланс и стабильность", minLevel: 3 },
  { branch: "Кардио", icon: "rope", color: COLORS.pink, dark: COLORS.pinkDark, description: "Выносливость и пульс", minLevel: 4 },
];

export function branchMeta(branch: Branch): BranchMeta {
  return BRANCHES.find((b) => b.branch === branch) ?? BRANCHES[0];
}

type Pool = { name: string; anim: AnimKey; hold?: boolean; reps: number; seconds?: number; note: string }[];

const POOLS: Record<Branch, { key: string; pool: Pool }> = {
  Грудь: {
    key: "chest",
    pool: [
      { name: "Отжимания", anim: "pushup", reps: 12, note: "Поставь ладони чуть шире плеч, напряги живот и ягодицы. Опускай грудь к полу, затем выжимай себя вверх, сохраняя прямую линию тела." },
      { name: "Узкие отжимания", anim: "pushup", reps: 8, note: "Если тяжело — выполняй с колен." },
      { name: "Планка", anim: "plank", reps: 30, seconds: 30, note: "Спокойно удерживай положение, не прогибай поясницу." },
      { name: "Широкие отжимания", anim: "pushup", reps: 10, note: "Руки чуть шире плеч." },
      { name: "Отжимания с паузой", anim: "pushup", hold: true, reps: 6, note: "Задержись внизу на секунду." },
      { name: "Планка с касанием плеч", anim: "plank_tap", reps: 20, note: "Не раскачивай таз." },
    ],
  },
  Руки: {
    key: "arms",
    pool: [
      { name: "Обратные отжимания от опоры", anim: "dip", reps: 10, note: "Локти смотрят назад, спина близко к опоре." },
      { name: "Алмазные отжимания", anim: "pushup", reps: 8, note: "Ладони образуют ромб под грудью." },
      { name: "Подъёмы рук в планке", anim: "plank_tap", reps: 12, note: "Поочерёдно, без перекоса корпуса." },
      { name: "Круги руками", anim: "armcircles", reps: 30, seconds: 30, note: "Разминка: плавно, большая амплитуда." },
      { name: "Разгибания рук лёжа", anim: "pushup", reps: 10, note: "Двигаются только предплечья." },
      { name: "Удержание на прямых руках", anim: "holdplank", reps: 40, seconds: 40, note: "Плечи над запястьями." },
    ],
  },
  Спина: {
    key: "back",
    pool: [
      { name: "Супермен", anim: "superman", reps: 12, note: "Поднимай руки и ноги без рывков." },
      { name: "Австралийские подтягивания", anim: "row", reps: 10, note: "Тело держи прямым." },
      { name: "Подтягивания", anim: "pullup", reps: 5, note: "Пока не получается — используй резинку." },
      { name: "Лодочка", anim: "superman", hold: true, reps: 30, seconds: 30, note: "Удержание, шея в нейтральном положении." },
      { name: "Сведение лопаток лёжа", anim: "superman", hold: true, reps: 12, note: "Лопатки тянутся к центру." },
      { name: "Пловец", anim: "swimmer", reps: 20, note: "Поочерёдно рука и противоположная нога." },
    ],
  },
  Ноги: {
    key: "legs",
    pool: [
      { name: "Классические приседания", anim: "squat", reps: 15, note: "Стопы примерно на ширине плеч. Отводи таз назад, сгибай колени по направлению носков и поднимайся, упираясь всей стопой в пол." },
      { name: "Выпады", anim: "lunge", reps: 10, note: "Сделай шаг вперёд, опускайся вертикально до комфортной глубины. Переднее колено направляй по линии носка; выполни повторения на обе стороны." },
      { name: "Выпрыгивания", anim: "jumpsquat", reps: 8, note: "Выпрыгивай только если комфортно. Приземляйся тихо на слегка согнутые колени; новичкам можно заменить прыжок обычным приседанием." },
      { name: "Ягодичный мостик", anim: "bridge", reps: 15, note: "Лёжа на спине, согни колени и поставь стопы на пол. Подними таз до прямой линии плечи—таз—колени, сожми ягодицы и опустись плавно." },
      { name: "Приседания с паузой", anim: "squat", hold: true, reps: 10, note: "Задержись внизу на две секунды." },
      { name: "Подъёмы на носки", anim: "calf", reps: 20, note: "Медленно вниз, быстро вверх." },
    ],
  },
  Пресс: {
    key: "abs",
    pool: [
      { name: "Скручивания", anim: "crunch", reps: 15, note: "Лёжа на спине, согни колени. На выдохе слегка приподними лопатки, не тяни голову руками; медленно вернись на пол." },
      { name: "Подъёмы ног лёжа", anim: "legraise", reps: 10, note: "Лёжа на спине, напряги живот и удерживай поясницу прижатой. Поднимай и опускай ноги в той амплитуде, где поясница не отрывается." },
      { name: "Планка", anim: "plank", reps: 40, seconds: 40, note: "Опирайся на предплечья и носки (или колени в облегчённом варианте). Напряги живот, не провисай в пояснице и спокойно дыши." },
      { name: "Велосипед", anim: "bicycle", reps: 20, note: "Касайся локтем противоположного колена." },
      { name: "Русские скручивания", anim: "twist", reps: 16, note: "Вращай корпус, а не только руки." },
      { name: "Боковая планка", anim: "plank", reps: 30, seconds: 30, note: "По 15 секунд на каждую сторону." },
    ],
  },
  Кардио: {
    key: "cardio",
    pool: [
      { name: "Бег на месте", anim: "run", reps: 60, seconds: 60, note: "Маршируй или беги на месте в устойчивом темпе. Держи корпус прямо, ставь стопу мягко и сохраняй возможность говорить короткими фразами." },
      { name: "Альпинист", anim: "mountain", reps: 20, note: "Из положения планки поочерёдно подтягивай колени к груди. Не раскачивай таз; новичкам выполняй движение медленно или с опорой руками на возвышение." },
      { name: "Прыжки «звёздочка»", anim: "jack", reps: 20, note: "Мягкое приземление." },
      { name: "Бёрпи", anim: "burpee", reps: 8, note: "Не торопись, следи за техникой." },
      { name: "Высокие колени", anim: "highknees", reps: 40, seconds: 40, note: "Колени поднимай до уровня таза." },
      { name: "Прыжки со скакалкой", anim: "rope", reps: 45, seconds: 45, note: "Скакалка воображаемая — ритм настоящий." },
    ],
  },
};

const LESSONS: { title: string; picks: number[] }[] = [
  { title: "Разминка", picks: [0, 1, 2] },
  { title: "Основы", picks: [0, 3, 2] },
  { title: "Закрепление", picks: [1, 3, 4] },
  { title: "Усложнение", picks: [3, 4, 5] },
  { title: "Финальный челлендж", picks: [0, 4, 5] },
  { title: "Новая серия", picks: [2, 3, 5] },
  { title: "Проверка силы", picks: [1, 2, 4] },
  { title: "Мастерство", picks: [0, 3, 5] },
];

// Sport symbol on each path node (5 lessons per section).
const SPORT_BY_BRANCH: Record<Branch, SportKind[]> = {
  Грудь: ["mat", "dumbbell", "barbell", "dumbbell", "barbell"],
  Руки: ["dumbbell", "kettlebell", "dumbbell", "pullup", "barbell"],
  Спина: ["pullup", "mat", "pullup", "kettlebell", "pullup"],
  Ноги: ["mat", "kettlebell", "barbell", "rope", "kettlebell"],
  Пресс: ["mat", "mat", "rope", "mat", "kettlebell"],
  Кардио: ["rope", "run", "rope", "run", "rope"],
};

function buildWorkouts(): Workout[] {
  const result: Workout[] = [];
  BRANCHES.forEach(({ branch }) => {
    const { key, pool } = POOLS[branch];
    LESSONS.forEach((lesson, i) => {
      const scale = 1 + i * 0.1;
      const exercises: Exercise[] = lesson.picks.map((p, j) => {
        const base = pool[p];
        return {
          id: `${key}-${i + 1}-${j + 1}`,
          name: base.name,
          reps: Math.round(base.reps * scale),
          seconds: base.seconds ? Math.round(base.seconds * scale) : undefined,
          note: base.note,
          anim: base.anim,
          hold: base.hold,
        };
      });
      result.push({
        id: `${key}-${i + 1}`,
        branch,
        index: i,
        title: lesson.title,
        sport: SPORT_BY_BRANCH[branch][i],
        duration: 6 + i * 2,
        exercises,
      });
    });
  });
  return result;
}

export const WORKOUTS: Workout[] = buildWorkouts();

export function workoutsOf(branch: Branch): Workout[] {
  return WORKOUTS.filter((w) => w.branch === branch);
}

// Cosmetics are visual only (principle 4 of the ТЗ): they never change Max's physical form or the rewards.
// One item per slot can be worn at a time; Max comments on what he is wearing.
export const COSMETICS: Cosmetic[] = [
  { id: "cap", name: "Кепка", slot: "head", price: 120, quip: "Кепка на месте — теперь я выгляжу на все сто." },
  { id: "crown", name: "Корона", slot: "head", price: 300, quip: "Корона обязывает: сегодня тренируемся по-королевски." },
  { id: "beanie", name: "Шапка-бини", slot: "head", price: 140, quip: "Уши в тепле, настрой боевой." },
  { id: "partyhat", name: "Праздничный колпак", slot: "head", price: 200, quip: "Праздник? Я готов даже к тренировке!" },
  { id: "headband", name: "Спортивная повязка", slot: "head", price: 100, quip: "Повязка на месте — поту не победить." },
  { id: "sunglasses", name: "Очки", slot: "face", price: 180, quip: "В очках я готов к любому спорту." },
  { id: "roundglasses", name: "Круглые очки", slot: "face", price: 160, quip: "Интеллект +10. Это научно не доказано." },
  { id: "sleepmask", name: "Маска для сна", slot: "face", price: 110, quip: "Я не сплю, я визуализирую восстановление." },
  { id: "bandana", name: "Бандана", slot: "neck", price: 150, quip: "Бандана затянута — можно идти в бой." },
  { id: "medal", name: "Медаль", slot: "neck", price: 250, quip: "Эта медаль заслужена тренировками!" },
  { id: "bowtie", name: "Бабочка", slot: "neck", price: 170, quip: "Сразу видно: спортсмен с манерами." },
  { id: "scarf", name: "Шарф", slot: "neck", price: 190, quip: "Стильный шарф для прогулки после тренировки." },
  { id: "goldchain", name: "Золотая цепочка", slot: "neck", price: 350, quip: "Блеск не заменит тренировку, но выглядит мощно." },
  { id: "whistle", name: "Свисток тренера", slot: "neck", price: 220, quip: "Сегодня я тренер. Разминку не пропускать!" },
  { id: "flower", name: "Цветок", slot: "head", price: 130, quip: "Да, я и спортсмен, и красавчик." },
  { id: "halo", name: "Нимб", slot: "head", price: 400, quip: "За идеальную технику полагается сияние." },
  { id: "pirate", name: "Повязка пирата", slot: "face", price: 240, quip: "Йо-хо-хо, курс на тренировочную карту!" },
  { id: "starbadge", name: "Звёздный значок", slot: "neck", price: 280, quip: "Маленькая звезда больших тренировок." },
  { id: "bow", name: "Бант", slot: "head", price: 150, quip: "Немного стиля не повредит." },
  { id: "earmuffs", name: "Наушники", slot: "head", price: 260, quip: "Музыка включена, мотивация на максимум." },
];

// Funny one-liners from Max shown under the exercise demo.
export const QUIPS = [
  "Не жульничай — Макс всё видит!",
  "Дыши ровно. Я серьёзно, ты же не стайер-бургер.",
  "Ещё чуть-чуть, и я перестану смотреть на твои пропуски.",
  "Пока ты это делаешь, я охраняю миску.",
  "Если дрожат ноги — значит, работает.",
  "Хвостом вилять можно, техникой — нельзя.",
  "Я бы показал сам, но у меня лапки.",
  "Каждое повторение — косточка в копилку.",
  "Мне бы такую мотивацию. Ой, она у меня есть — это ты.",
  "Минута боли — и час гордости. Проверено на собаках.",
];
