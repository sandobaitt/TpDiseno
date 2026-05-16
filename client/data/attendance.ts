export type AttendanceStatus = "present" | "absent";

export interface AttendanceRecord {
  id: string;
  date: string;
  className: string;
  trainer: string;
  status: AttendanceStatus;
}

export const attendanceMock: AttendanceRecord[] = [
  {
    id: "att_001",
    date: "2026-05-12T08:00:00",
    className: "Fuerza Bruta",
    trainer: "M. Rossi",
    status: "present",
  },
  {
    id: "att_002",
    date: "2026-05-10T10:00:00",
    className: "Hipertrofia",
    trainer: "L. Costa",
    status: "present",
  },
  {
    id: "att_003",
    date: "2026-05-08T07:00:00",
    className: "Movilidad Articular",
    trainer: "A. Silva",
    status: "absent",
  },
  {
    id: "att_004",
    date: "2026-05-05T18:00:00",
    className: "Acondicionamiento",
    trainer: "M. Rossi",
    status: "present",
  },
  {
    id: "att_005",
    date: "2026-05-03T08:00:00",
    className: "Fuerza Bruta",
    trainer: "M. Rossi",
    status: "absent",
  },
  {
    id: "att_006",
    date: "2026-04-30T10:00:00",
    className: "Hipertrofia",
    trainer: "L. Costa",
    status: "present",
  },
  {
    id: "att_007",
    date: "2026-04-28T07:00:00",
    className: "Crossfit WOD",
    trainer: "P. Gómez",
    status: "present",
  },
  {
    id: "att_008",
    date: "2026-04-25T18:00:00",
    className: "Acondicionamiento",
    trainer: "A. Silva",
    status: "present",
  },
];
