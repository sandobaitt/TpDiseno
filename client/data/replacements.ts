export interface ReplacementRequest {
  id: string;
  category: string;
  isUrgent: boolean;
  title: string;
  professorToReplace: string;
  date: string;
  dateLabel: string;
  timeLabel: string;
}

export const replacementsMock: ReplacementRequest[] = [
  {
    id: "rep_001",
    category: "CROSSFIT",
    isUrgent: true,
    title: "Sede Central",
    professorToReplace: "Marcos Rojo",
    date: "2026-05-15",
    dateLabel: "15 Oct",
    timeLabel: "18:30 - 19:00",
  },
  {
    id: "rep_002",
    category: "HALTEROFILIA",
    isUrgent: false,
    title: "Sede Norte",
    professorToReplace: "Lucía Gómez",
    date: "2026-05-18",
    dateLabel: "18 Oct",
    timeLabel: "07:00 - 08:30",
  },
];
