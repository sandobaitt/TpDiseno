export type WorkoutCategory = "strength" | "cardio" | "hiit" | "crossfit" | "functional" | "combat" | "flexibility" | "evaluations";

export type IntensityLevel = "beginner" | "intermediate" | "advanced" | "all";

export interface ClassSlot {
  days: number[]; // 0=LUN … 6=DOM
  time: string;
  durationMin: number;
  capacity: number;
}

export interface WorkoutType {
  id: string;
  name: string;
  description: string;
  category: WorkoutCategory;
  intensity: IntensityLevel;
  defaultDurationMin: number;
  icon: string;
  color: string;
  equipment: string[];
  maxCapacity: number;
  isProOnly: boolean;
  caloriesBurnedEstimate: string;
  weeklySlots: ClassSlot[];
}

export const workoutTypesMock: WorkoutType[] = [
  {
    id: "wt_001",
    name: "Musculación",
    description: "Entrenamiento de fuerza con pesas y máquinas para hipertrofia y tonificación.",
    category: "strength",
    intensity: "all",
    defaultDurationMin: 60,
    icon: "ti-barbell",
    color: "lime",
    equipment: ["barras", "mancuernas", "discos", "multifuerza", "poleas"],
    maxCapacity: 30,
    isProOnly: false,
    caloriesBurnedEstimate: "300–500 kcal",
    weeklySlots: [
      { days: [0,1,2,3,4], time: "08:00", durationMin: 60, capacity: 30 },
      { days: [0,1,2,3,4], time: "10:00", durationMin: 60, capacity: 30 },
      { days: [0,1,2,3,4], time: "14:00", durationMin: 60, capacity: 30 },
      { days: [0,1,2,3,4], time: "18:00", durationMin: 60, capacity: 30 },
      { days: [5], time: "10:00", durationMin: 60, capacity: 30 },
    ],
  },
  {
    id: "wt_002",
    name: "Powerlifting",
    description: "Entrenamiento enfocado en los tres levantamientos principales: sentadilla, press banca y peso muerto.",
    category: "strength",
    intensity: "advanced",
    defaultDurationMin: 90,
    icon: "ti-certificate",
    color: "violet",
    equipment: ["barra olímpica", "discos de competencia", "rack de sentadilla", "banco plano"],
    maxCapacity: 12,
    isProOnly: true,
    caloriesBurnedEstimate: "400–600 kcal",
    weeklySlots: [
      { days: [0,2,4], time: "10:00", durationMin: 90, capacity: 12 },
      { days: [1,3], time: "16:00", durationMin: 90, capacity: 12 },
    ],
  },
  {
    id: "wt_003",
    name: "Crossfit WOD",
    description: "Workout of the Day — entrenamiento funcional de alta intensidad con ejercicios variados.",
    category: "crossfit",
    intensity: "intermediate",
    defaultDurationMin: 45,
    icon: "ti-flame",
    color: "orange",
    equipment: ["kettlebells", "cuerda", "cajón", "barra olímpica", "anillas"],
    maxCapacity: 15,
    isProOnly: false,
    caloriesBurnedEstimate: "500–700 kcal",
    weeklySlots: [
      { days: [0,1,2,3,4], time: "07:00", durationMin: 45, capacity: 15 },
      { days: [0,1,3], time: "17:00", durationMin: 45, capacity: 15 },
      { days: [5], time: "09:00", durationMin: 45, capacity: 15 },
    ],
  },
  {
    id: "wt_004",
    name: "Crossfit Endurance",
    description: "Variante de crossfit con mayor énfasis en resistencia cardiovascular y trabajo aeróbico.",
    category: "crossfit",
    intensity: "advanced",
    defaultDurationMin: 60,
    icon: "ti-heart-rate-monitor",
    color: "red",
    equipment: ["remo", "bicicleta", "kettlebells", "saltos al cajón", "cuerda"],
    maxCapacity: 12,
    isProOnly: true,
    caloriesBurnedEstimate: "600–850 kcal",
    weeklySlots: [
      { days: [0,2,4], time: "09:00", durationMin: 60, capacity: 12 },
      { days: [1,3], time: "19:00", durationMin: 60, capacity: 12 },
    ],
  },
  {
    id: "wt_005",
    name: "HIIT Zone",
    description: "High Intensity Interval Training — ráfagas explosivas seguidas de descansos cortos.",
    category: "hiit",
    intensity: "intermediate",
    defaultDurationMin: 30,
    icon: "ti-bolt",
    color: "amber",
    equipment: ["cronómetro", "esterilla", "bandas elásticas", "pesas ligeras"],
    maxCapacity: 20,
    isProOnly: false,
    caloriesBurnedEstimate: "350–550 kcal",
    weeklySlots: [
      { days: [0,1,2,3,4], time: "08:00", durationMin: 30, capacity: 20 },
      { days: [0,1,2,3,4], time: "12:00", durationMin: 30, capacity: 20 },
      { days: [1,3], time: "18:00", durationMin: 30, capacity: 20 },
      { days: [5], time: "09:00", durationMin: 30, capacity: 20 },
    ],
  },
  {
    id: "wt_006",
    name: "Funcional",
    description: "Ejercicios multiarticulares que imitan movimientos cotidianos para mejorar la condición general.",
    category: "functional",
    intensity: "all",
    defaultDurationMin: 50,
    icon: "ti-activity",
    color: "cyan",
    equipment: ["kettlebells", "balones", "bandas", "TRX", "conos"],
    maxCapacity: 20,
    isProOnly: false,
    caloriesBurnedEstimate: "300–500 kcal",
    weeklySlots: [
      { days: [0,1,2,3,4], time: "09:00", durationMin: 50, capacity: 20 },
      { days: [0,1,2,3,4], time: "11:00", durationMin: 50, capacity: 20 },
      { days: [0,2,4], time: "17:30", durationMin: 50, capacity: 20 },
      { days: [5], time: "10:00", durationMin: 50, capacity: 20 },
    ],
  },
  {
    id: "wt_007",
    name: "Halterofilia",
    description: "Técnica de levantamiento olímpico: arranque y envión con barra.",
    category: "strength",
    intensity: "advanced",
    defaultDurationMin: 60,
    icon: "ti-arrows-up",
    color: "indigo",
    equipment: ["barra olímpica", "discos de goma", "plataforma de levantamiento"],
    maxCapacity: 10,
    isProOnly: true,
    caloriesBurnedEstimate: "400–650 kcal",
    weeklySlots: [
      { days: [1,3], time: "11:00", durationMin: 60, capacity: 10 },
      { days: [0,2,4], time: "15:00", durationMin: 60, capacity: 10 },
    ],
  },
  {
    id: "wt_008",
    name: "Boxeo",
    description: "Entrenamiento de boxeo que combina técnica de golpeo, juego de pies y acondicionamiento.",
    category: "combat",
    intensity: "intermediate",
    defaultDurationMin: 50,
    icon: "ti-fist",
    color: "rose",
    equipment: ["guantes", "pera", "bolsa pesada", "cuerda", "vendas"],
    maxCapacity: 16,
    isProOnly: false,
    caloriesBurnedEstimate: "500–700 kcal",
    weeklySlots: [
      { days: [0,2,4], time: "10:00", durationMin: 50, capacity: 16 },
      { days: [1,3], time: "18:00", durationMin: 50, capacity: 16 },
      { days: [0,2], time: "20:00", durationMin: 50, capacity: 16 },
      { days: [5], time: "11:00", durationMin: 50, capacity: 16 },
    ],
  },
  {
    id: "wt_009",
    name: "Spinning",
    description: "Clase indoor de ciclismo con ritmos musicales y cambios de intensidad guiados.",
    category: "cardio",
    intensity: "all",
    defaultDurationMin: 45,
    icon: "ti-bike",
    color: "blue",
    equipment: ["bicicleta spinning", "toalla", "botella de agua"],
    maxCapacity: 20,
    isProOnly: false,
    caloriesBurnedEstimate: "400–600 kcal",
    weeklySlots: [
      { days: [0,1,2,3,4], time: "07:00", durationMin: 45, capacity: 20 },
      { days: [0,1,2,3,4], time: "12:00", durationMin: 45, capacity: 20 },
      { days: [0,1,2,3], time: "19:00", durationMin: 45, capacity: 20 },
      { days: [5], time: "10:00", durationMin: 45, capacity: 20 },
    ],
  },
  {
    id: "wt_010",
    name: "Zumba",
    description: "Clase de baile fitness con ritmos latinos que combina cardio y diversión.",
    category: "cardio",
    intensity: "beginner",
    defaultDurationMin: 50,
    icon: "ti-music",
    color: "pink",
    equipment: [],
    maxCapacity: 25,
    isProOnly: false,
    caloriesBurnedEstimate: "350–500 kcal",
    weeklySlots: [
      { days: [0,2,4], time: "07:00", durationMin: 50, capacity: 25 },
      { days: [1,3], time: "17:00", durationMin: 50, capacity: 25 },
      { days: [5], time: "10:00", durationMin: 50, capacity: 25 },
    ],
  },
  {
    id: "wt_011",
    name: "Yoga",
    description: "Práctica de posturas, respiración y meditación para mejorar flexibilidad y bienestar.",
    category: "flexibility",
    intensity: "all",
    defaultDurationMin: 60,
    icon: "ti-sun",
    color: "teal",
    equipment: ["esterilla", "bloques", "cintas", "mantas"],
    maxCapacity: 18,
    isProOnly: false,
    caloriesBurnedEstimate: "150–300 kcal",
    weeklySlots: [
      { days: [0,1,2,3,4], time: "07:00", durationMin: 60, capacity: 18 },
      { days: [0,1,2,3,4], time: "16:00", durationMin: 60, capacity: 18 },
      { days: [5], time: "09:00", durationMin: 60, capacity: 18 },
    ],
  },
  {
    id: "wt_012",
    name: "Movilidad Articular",
    description: "Rutina guiada de estiramientos dinámicos y movilidad para prevenir lesiones.",
    category: "flexibility",
    intensity: "beginner",
    defaultDurationMin: 30,
    icon: "ti-stretching",
    color: "emerald",
    equipment: ["esterilla", "rodillo de espuma", "bandas elásticas"],
    maxCapacity: 25,
    isProOnly: false,
    caloriesBurnedEstimate: "100–200 kcal",
    weeklySlots: [
      { days: [0,2,4], time: "06:00", durationMin: 30, capacity: 25 },
      { days: [1,3], time: "20:00", durationMin: 30, capacity: 25 },
    ],
  },
  {
    id: "wt_013",
    name: "Evaluación Física",
    description: "Evaluación personalizada de composición corporal, capacidades físicas y objetivos.",
    category: "evaluations",
    intensity: "all",
    defaultDurationMin: 45,
    icon: "ti-clipboard-list",
    color: "slate",
    equipment: ["cinta métrica", "balanza", "pliegues cutáneos", "cronómetro"],
    maxCapacity: 1,
    isProOnly: false,
    caloriesBurnedEstimate: "—",
    weeklySlots: [],
  },
];
