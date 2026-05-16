export interface Bitacora {
  id: string;
  title: string;
  content: string;
  studentName?: string;
  createdAt: string;
}

export const bitacorasMock: Bitacora[] = [
  {
    id: "bit_001",
    title: "WOD movilidad de hombros",
    content:
      "WOD enfocado en movilidad de hombros y activación de core. La mayoría del grupo respondió bien, solo Martina mostró limitación en flexión. Se recomendaron ejercicios correctivos.",
    studentName: "Martina Gómez",
    createdAt: "2026-05-14T18:30:00",
  },
  {
    id: "bit_002",
    title: "Progresión en sentadilla",
    content:
      "Se trabajó progresión en sentadilla frontal con barra. Lucas y Valentina completaron las 4 series sin inconvenientes. Mateo requiere asistencia en profundidad.",
    studentName: "Mateo Silva",
    createdAt: "2026-05-12T18:30:00",
  },
  {
    id: "bit_003",
    title: "Lesión de muñeca reportada",
    content:
      "Sofía reportó dolor en muñeca derecha durante el WOD de dominadas. Se le asignó variante con agarre neutro y se derivó a kinesiología para evaluación.",
    studentName: "Sofía Rodríguez",
    createdAt: "2026-05-10T19:00:00",
  },
];
