export interface GymClass {
  id: string;
  time: string;
  durationMin: number;
  title: string;
  coach: string;
  capacity: number;
  booked: number;
  isPro?: boolean;
  isFull?: boolean;
}

export interface DaySchedule {
  dayAbbr: string;
  dayFull: string;
  date: number;
  month: string;
  isActive?: boolean;
  classes: GymClass[];
}

export const weekMock: DaySchedule[] = [
  {
    dayAbbr: "LUN",
    dayFull: "Lunes",
    date: 12,
    month: "MAY",
    isActive: false,
    classes: [
      {
        id: "cls_001",
        time: "07:00",
        durationMin: 45,
        title: "CROSS FIT WOD",
        coach: "Coach Marcos",
        capacity: 12,
        booked: 8,
      },
      {
        id: "cls_002",
        time: "18:00",
        durationMin: 60,
        title: "HALTEROFILIA AVANZADA",
        coach: "Coach Elena",
        capacity: 10,
        booked: 10,
        isFull: true,
      },
    ],
  },
  {
    dayAbbr: "MAR",
    dayFull: "Martes",
    date: 13,
    month: "MAY",
    isActive: true,
    classes: [
      {
        id: "cls_003",
        time: "08:00",
        durationMin: 45,
        title: "HIIT ZONE",
        coach: "Coach Diego",
        capacity: 15,
        booked: 9,
        isPro: true,
      },
      {
        id: "cls_004",
        time: "17:30",
        durationMin: 50,
        title: "FUNCIONAL INTENSO",
        coach: "Coach Marcos",
        capacity: 12,
        booked: 12,
        isFull: true,
      },
    ],
  },
  {
    dayAbbr: "MIE",
    dayFull: "Miércoles",
    date: 14,
    month: "MAY",
    isActive: false,
    classes: [],
  },
  {
    dayAbbr: "JUE",
    dayFull: "Jueves",
    date: 15,
    month: "MAY",
    isActive: false,
    classes: [
      {
        id: "cls_005",
        time: "09:00",
        durationMin: 60,
        title: "CROSS FIT ENDURANCE",
        coach: "Coach Elena",
        capacity: 12,
        booked: 6,
      },
    ],
  },
  {
    dayAbbr: "VIE",
    dayFull: "Viernes",
    date: 16,
    month: "MAY",
    isActive: false,
    classes: [],
  },
  {
    dayAbbr: "SAB",
    dayFull: "Sábado",
    date: 17,
    month: "MAY",
    isActive: false,
    classes: [],
  },
  {
    dayAbbr: "DOM",
    dayFull: "Domingo",
    date: 18,
    month: "MAY",
    isActive: false,
    classes: [],
  },
];
