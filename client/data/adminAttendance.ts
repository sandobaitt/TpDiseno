export interface TimeBlock {
  id: string;
  day: number; // 0=LUN ... 6=DOM
  start: string;
  end: string;
  trainer: string;
  type: string;
  isPro?: boolean;
  isConflict?: boolean;
  isFree?: boolean;
}

export interface DayInfo {
  abbr: string;
  number: number;
  isActive?: boolean;
}

export const timeSlots = [
  "06:30",
  "07:00",
  "08:30",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
];

export const daysMock: DayInfo[] = [
  { abbr: "LUN", number: 12, isActive: false },
  { abbr: "MAR", number: 13, isActive: false },
  { abbr: "MIE", number: 14, isActive: true },
  { abbr: "JUE", number: 15, isActive: false },
  { abbr: "VIE", number: 16, isActive: false },
  { abbr: "SAB", number: 17, isActive: false },
  { abbr: "DOM", number: 18, isActive: false },
];

export const blocksMock: TimeBlock[] = [
  {
    id: "b1",
    day: 0,
    start: "06:30",
    end: "08:00",
    trainer: "A. Rossi",
    type: "Cross/Fuerza",
    isPro: true,
  },
  {
    id: "b2",
    day: 1,
    start: "06:30",
    end: "08:00",
    trainer: "D. López",
    type: "Musculación",
    isPro: true,
  },
  {
    id: "b3",
    day: 2,
    start: "06:30",
    end: "08:00",
    trainer: "F. Gómez",
    type: "Cross/Fuerza",
    isPro: true,
  },
  {
    id: "b4",
    day: 3,
    start: "06:30",
    end: "08:00",
    trainer: "M. Silva",
    type: "Musculación",
  },
  {
    id: "b5",
    day: 4,
    start: "06:30",
    end: "08:00",
    trainer: "A. Rossi",
    type: "Cross/Fuerza",
    isPro: true,
  },
  {
    id: "b6",
    day: 5,
    start: "06:30",
    end: "08:00",
    trainer: "D. López",
    type: "Evaluaciones",
  },
  {
    id: "b7",
    day: 0,
    start: "08:30",
    end: "10:30",
    trainer: "G. Méndez",
    type: "Solapamiento Staff",
    isConflict: true,
  },
  {
    id: "b8",
    day: 1,
    start: "08:30",
    end: "10:00",
    trainer: "F. Gómez",
    type: "Recepción",
  },
  {
    id: "b9",
    day: 2,
    start: "08:30",
    end: "10:00",
    trainer: "A. Rossi",
    type: "Cross/Fuerza",
    isPro: true,
  },
  {
    id: "b10",
    day: 3,
    start: "08:30",
    end: "10:00",
    trainer: "D. López",
    type: "Musculación",
  },
  {
    id: "b11",
    day: 4,
    start: "08:30",
    end: "10:00",
    trainer: "F. Gómez",
    type: "Evaluaciones",
  },
  {
    id: "b12",
    day: 2,
    start: "10:00",
    end: "12:00",
    trainer: "Turno Libre",
    type: "Recep 12:00",
    isFree: true,
  },
  {
    id: "b13",
    day: 0,
    start: "14:00",
    end: "16:00",
    trainer: "M. Silva",
    type: "Musculación",
  },
  {
    id: "b13b",
    day: 0,
    start: "14:00",
    end: "16:00",
    trainer: "L. Ríos",
    type: "Funcional",
  },
  {
    id: "b14",
    day: 1,
    start: "16:00",
    end: "18:00",
    trainer: "A. Rossi",
    type: "Cross/Fuerza",
    isPro: true,
  },
  {
    id: "b15",
    day: 2,
    start: "18:00",
    end: "20:00",
    trainer: "D. López",
    type: "Musculación",
  },
  {
    id: "b16",
    day: 3,
    start: "14:00",
    end: "16:00",
    trainer: "F. Gómez",
    type: "Recepción",
  },
  {
    id: "b17",
    day: 4,
    start: "16:00",
    end: "18:00",
    trainer: "M. Silva",
    type: "Cross/Fuerza",
    isPro: true,
  },
];
