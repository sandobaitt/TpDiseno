import type { HealthConditionId } from "./health";
import { BRANCH_SECRETARY, SEED_TODAY, daysAgo, monthsAgo } from "./seed";

/**
 * "active" o "inactive" (baja lógica). El estado de cuenta (al día, por vencer,
 * deudor, bloqueado) NO se guarda: se calcula con `domain/billing.ts`.
 */
export type ClientStatus = "active" | "inactive";

export interface HealthDeclaration {
  weightKg?: number;
  heightCm?: number;
  conditions: HealthConditionId[];
  /** Antecedentes o aclaraciones (cirugías, lesiones, medicación, etc.). */
  history?: string;
  emergencyContact?: string;
  bloodType?: string;
  /** Fecha de firma de la declaración jurada (AAAA-MM-DD). */
  signedAt?: string;
  /** Quién firma: el alumno, o el adulto responsable si es menor. */
  signedBy?: string;
}

export type AttachmentKind = "certificado" | "autorizacion";

export const ATTACHMENT_KIND_LABELS: Record<AttachmentKind, string> = {
  certificado: "Certificado médico",
  autorizacion: "Autorización del adulto responsable",
};

export type AttachmentStatus = "pending" | "approved";

export const ATTACHMENT_STATUS_LABELS: Record<AttachmentStatus, string> = {
  pending: "Pendiente de revisión",
  approved: "Revisado",
};

/** Lo sube el alumno desde la app (queda pendiente) o secretaría al inscribir (queda revisado). */
export interface Attachment {
  id: string;
  kind: AttachmentKind;
  fileName: string;
  sizeKb: number;
  uploadedAt: string; // AAAA-MM-DD
  status: AttachmentStatus;
  /** Id del usuario que lo subió, o "alumno" si lo subió desde la app sin cuenta vinculada. */
  uploadedBy?: string;
  reviewedBy?: string;
  reviewedAt?: string; // AAAA-MM-DD
}

/** Adulto responsable (obligatorio para menores de edad). */
export interface Guardian {
  fullName: string;
  dni: string;
  phone: string;
  relationship: string;
}

export interface ManualRestriction {
  reason: string;
  byUserId: string;
  at: string; // AAAA-MM-DD
}

export interface Client {
  id: string;
  /** Sede principal. El alumno puede entrenar en cualquier sede (acceso cruzado). */
  branchId: string;
  fullName: string;
  email: string;
  dni: string;
  phone?: string;
  birthDate?: string; // AAAA-MM-DD
  address?: string;
  planId?: string;
  /** Fecha de alta (inicio de la membresía). */
  enrolledAt: string; // AAAA-MM-DD
  status: ClientStatus;
  deactivatedAt?: string;
  deactivationReason?: string;
  /** Id del administrador que hizo la baja. */
  deactivatedBy?: string;
  /** Restricción de acceso aplicada a mano por secretaría (además de la automática por deuda). */
  manualRestriction?: ManualRestriction;
  health?: HealthDeclaration;
  attachments?: Attachment[];
  guardian?: Guardian;
  /** Alumnos de la misma familia comparten este id (para el plan familiar). */
  familyGroupId?: string;
  createdAt: string; // ISO con hora
  /** Id del usuario que registró la inscripción. */
  createdBy?: string;
}

const MINOR_BIRTH_YEAR = Number(SEED_TODAY.slice(0, 4)) - 15;

const seedClients: Client[] = [
  {
    id: "cl_001",
    branchId: "br_001",
    fullName: "Martín Rodríguez",
    email: "martin.r@email.com",
    dni: "34.567.890",
    phone: "+54 11 5555-0101",
    birthDate: "1989-07-14",
    address: "Av. Corrientes 2450, CABA",
    planId: "pl_001",
    enrolledAt: monthsAgo(8, 12),
    status: "active",
    health: {
      weightKg: 78,
      heightCm: 176,
      conditions: [],
      emergencyContact: "Lucía Rodríguez (hermana) · 11 5555-0199",
      bloodType: "0+",
      signedAt: monthsAgo(8, 12),
      signedBy: "Martín Rodríguez",
    },
    attachments: [
      {
        id: "doc_001",
        kind: "certificado",
        fileName: "apto-fisico-rodriguez.pdf",
        sizeKb: 412,
        uploadedAt: monthsAgo(8, 12),
        status: "approved",
      },
    ],
    createdAt: `${monthsAgo(8, 12)}T10:20:00`,
  },
  {
    id: "cl_002",
    familyGroupId: "fam_gomez",
    branchId: "br_002",
    fullName: "Laura Gómez",
    email: "laura.g@email.com",
    dni: "38.123.456",
    phone: "+54 11 5555-0202",
    birthDate: "1994-03-02",
    planId: "pl_002",
    enrolledAt: monthsAgo(11, 20),
    status: "active",
    health: {
      weightKg: 61,
      heightCm: 165,
      conditions: ["respiratoria"],
      history: "Asma leve, usa inhalador antes de entrenar.",
      emergencyContact: "Pablo Gómez · 11 5555-0288",
      signedAt: monthsAgo(11, 20),
      signedBy: "Laura Gómez",
    },
    createdAt: `${monthsAgo(11, 20)}T09:05:00`,
  },
  {
    id: "cl_003",
    familyGroupId: "fam_silva",
    branchId: "br_001",
    fullName: "Carlos Silva",
    email: "carlos.s@email.com",
    dni: "32.987.654",
    phone: "+54 11 5555-0303",
    birthDate: "1987-11-23",
    planId: "pl_003",
    enrolledAt: monthsAgo(9, 15),
    status: "active",
    health: {
      weightKg: 84,
      heightCm: 181,
      conditions: ["lesion"],
      history:
        "Cirugía de meniscos (rodilla derecha) en 2023. Alta médica completa.",
      emergencyContact: "Paula Silva · 11 5555-0377",
      signedAt: monthsAgo(9, 15),
      signedBy: "Carlos Silva",
    },
    attachments: [
      {
        id: "doc_002",
        kind: "certificado",
        fileName: "certificado-silva.jpg",
        sizeKb: 860,
        uploadedAt: monthsAgo(9, 15),
        status: "approved",
      },
    ],
    createdAt: `${monthsAgo(9, 15)}T12:00:00`,
  },
  {
    id: "cl_004",
    branchId: "br_001",
    fullName: "Ana Pérez",
    email: "ana.p@email.com",
    dni: "40.111.222",
    phone: "+54 11 5555-0404",
    birthDate: "1997-05-30",
    planId: "pl_002",
    enrolledAt: monthsAgo(14, 8),
    status: "inactive",
    deactivatedAt: monthsAgo(2, 28),
    deactivationReason: "Se mudó a otra ciudad.",
    deactivatedBy: "us_ad_001",
    createdAt: `${monthsAgo(14, 8)}T10:30:00`,
  },
  {
    id: "cl_005",
    branchId: "br_001",
    fullName: "Valentina Costa",
    email: "vale.costa@email.com",
    dni: "41.234.567",
    phone: "+54 11 5555-0505",
    birthDate: "1999-01-19",
    planId: "pl_001",
    enrolledAt: monthsAgo(5, 3),
    status: "active",
    health: {
      weightKg: 58,
      heightCm: 162,
      conditions: [],
      signedAt: monthsAgo(5, 3),
      signedBy: "Valentina Costa",
    },
    attachments: [
      {
        id: "doc_003",
        kind: "certificado",
        fileName: "apto-costa.pdf",
        sizeKb: 300,
        uploadedAt: monthsAgo(5, 3),
        status: "approved",
      },
    ],
    createdAt: `${monthsAgo(5, 3)}T17:45:00`,
  },
  {
    id: "cl_006",
    branchId: "br_002",
    fullName: "Lucas Ferrari",
    email: "lucas.ferrari@email.com",
    dni: "39.876.543",
    phone: "+54 11 5555-0606",
    birthDate: "1996-08-08",
    planId: "pl_002",
    enrolledAt: monthsAgo(3, 10),
    status: "active",
    health: {
      weightKg: 90,
      heightCm: 185,
      conditions: ["presion"],
      history: "Hipertensión controlada con medicación.",
      signedAt: monthsAgo(3, 10),
      signedBy: "Lucas Ferrari",
    },
    createdAt: `${monthsAgo(3, 10)}T19:10:00`,
  },
  {
    id: "cl_007",
    familyGroupId: "fam_silva",
    branchId: "br_002",
    fullName: "Mateo Silva",
    email: "mateo.silva@email.com",
    dni: "42.345.678",
    phone: "+54 11 5555-0707",
    birthDate: "2000-12-01",
    planId: "pl_003",
    enrolledAt: monthsAgo(6, 22),
    status: "active",
    health: {
      weightKg: 72,
      heightCm: 174,
      conditions: [],
      signedAt: monthsAgo(6, 22),
      signedBy: "Mateo Silva",
    },
    createdAt: `${monthsAgo(6, 22)}T08:40:00`,
  },
  {
    id: "cl_008",
    branchId: "br_001",
    fullName: "Camila Rivas",
    email: "cami.rivas@email.com",
    dni: "37.654.321",
    phone: "+54 11 5555-0808",
    birthDate: "1993-04-11",
    planId: "pl_002",
    enrolledAt: monthsAgo(4, 1),
    status: "active",
    health: {
      weightKg: 64,
      heightCm: 168,
      conditions: [],
      signedAt: monthsAgo(4, 1),
      signedBy: "Camila Rivas",
    },
    createdAt: `${monthsAgo(4, 1)}T11:00:00`,
  },
  {
    id: "cl_009",
    branchId: "br_001",
    fullName: "Julián Torres",
    email: "julian.torres@email.com",
    dni: "36.789.012",
    phone: "+54 11 5555-0909",
    birthDate: "1991-09-27",
    planId: "pl_001",
    enrolledAt: monthsAgo(10, 5),
    status: "active",
    health: {
      weightKg: 80,
      heightCm: 179,
      conditions: [],
      signedAt: monthsAgo(10, 5),
      signedBy: "Julián Torres",
    },
    attachments: [
      {
        id: "doc_004",
        kind: "certificado",
        fileName: "apto-torres.pdf",
        sizeKb: 250,
        uploadedAt: monthsAgo(10, 5),
        status: "approved",
      },
    ],
    createdAt: `${monthsAgo(10, 5)}T18:20:00`,
  },
  {
    id: "cl_010",
    familyGroupId: "fam_gomez",
    branchId: "br_001",
    fullName: "Martina Gómez",
    email: "martina.gomez@email.com",
    dni: "43.210.987",
    phone: "+54 11 5555-1010",
    birthDate: "2001-06-15",
    planId: "pl_003",
    enrolledAt: monthsAgo(7, 18),
    status: "active",
    health: {
      weightKg: 55,
      heightCm: 160,
      conditions: ["lesion"],
      history: "Limitación en la flexión del hombro izquierdo.",
      signedAt: monthsAgo(7, 18),
      signedBy: "Martina Gómez",
    },
    createdAt: `${monthsAgo(7, 18)}T07:50:00`,
  },
  {
    id: "cl_011",
    branchId: "br_002",
    fullName: "Agustín Herrera",
    email: "agus.herrera@email.com",
    dni: "35.432.109",
    phone: "+54 11 5555-1111",
    birthDate: "1990-02-03",
    planId: "pl_001",
    enrolledAt: monthsAgo(12, 2),
    status: "active",
    health: {
      weightKg: 88,
      heightCm: 183,
      conditions: [],
      signedAt: monthsAgo(12, 2),
      signedBy: "Agustín Herrera",
    },
    createdAt: `${monthsAgo(12, 2)}T20:00:00`,
  },
  {
    id: "cl_012",
    branchId: "br_002",
    fullName: "Malena Acosta",
    email: "malena.acosta@email.com",
    dni: "44.567.890",
    phone: "+54 11 5555-1212",
    birthDate: "2002-10-21",
    planId: "pl_002",
    enrolledAt: daysAgo(9),
    status: "active",
    health: {
      weightKg: 57,
      heightCm: 158,
      conditions: [],
      signedAt: daysAgo(9),
      signedBy: "Malena Acosta",
    },
    attachments: [
      {
        id: "doc_005",
        kind: "certificado",
        fileName: "certificado-acosta.pdf",
        sizeKb: 520,
        uploadedAt: daysAgo(9),
        status: "pending",
        uploadedBy: "alumno",
      },
    ],
    createdAt: `${daysAgo(9)}T16:30:00`,
  },
  {
    id: "cl_013",
    branchId: "br_001",
    fullName: "Thiago Medina",
    email: "thiago.medina@email.com",
    dni: "45.678.901",
    phone: "+54 11 5555-1313",
    birthDate: "2003-03-09",
    planId: "pl_002",
    enrolledAt: daysAgo(2),
    status: "active",
    health: {
      weightKg: 70,
      heightCm: 172,
      conditions: [],
      signedAt: daysAgo(2),
      signedBy: "Thiago Medina",
    },
    createdAt: `${daysAgo(2)}T18:05:00`,
  },
  {
    id: "cl_014",
    branchId: "br_001",
    fullName: "Isabella Roldán",
    email: "isa.roldan@email.com",
    dni: "49.123.456",
    phone: "+54 11 5555-1414",
    birthDate: `${MINOR_BIRTH_YEAR}-03-10`,
    planId: "pl_003",
    enrolledAt: monthsAgo(4, 14),
    status: "active",
    guardian: {
      fullName: "Patricia Roldán",
      dni: "25.678.901",
      phone: "+54 11 5555-1499",
      relationship: "Madre",
    },
    health: {
      weightKg: 50,
      heightCm: 157,
      conditions: [],
      signedAt: monthsAgo(4, 14),
      signedBy: "Patricia Roldán (madre)",
    },
    attachments: [
      {
        id: "doc_006",
        kind: "autorizacion",
        fileName: "autorizacion-roldan.pdf",
        sizeKb: 180,
        uploadedAt: monthsAgo(4, 14),
        status: "approved",
      },
      {
        id: "doc_007",
        kind: "certificado",
        fileName: "apto-roldan.pdf",
        sizeKb: 330,
        uploadedAt: monthsAgo(4, 14),
        status: "approved",
      },
    ],
    createdAt: `${monthsAgo(4, 14)}T17:15:00`,
  },
  {
    id: "cl_015",
    branchId: "br_002",
    fullName: "Benjamín Paz",
    email: "benja.paz@email.com",
    dni: "38.901.234",
    phone: "+54 11 5555-1515",
    birthDate: "1995-07-07",
    planId: "pl_001",
    enrolledAt: monthsAgo(9, 25),
    status: "active",
    health: {
      weightKg: 76,
      heightCm: 177,
      conditions: [],
      signedAt: monthsAgo(9, 25),
      signedBy: "Benjamín Paz",
    },
    createdAt: `${monthsAgo(9, 25)}T09:30:00`,
  },
  {
    id: "cl_016",
    branchId: "br_002",
    fullName: "Emilia Arias",
    email: "emi.arias@email.com",
    dni: "40.987.654",
    phone: "+54 11 5555-1616",
    birthDate: "1998-11-30",
    planId: "pl_002",
    enrolledAt: monthsAgo(5, 12),
    status: "active",
    manualRestriction: {
      reason: "Tiene que presentar un nuevo apto físico (el anterior venció).",
      byUserId: "us_se_002",
      at: daysAgo(6),
    },
    health: {
      weightKg: 62,
      heightCm: 166,
      conditions: [],
      signedAt: monthsAgo(5, 12),
      signedBy: "Emilia Arias",
    },
    createdAt: `${monthsAgo(5, 12)}T10:10:00`,
  },
  {
    id: "cl_017",
    branchId: "br_001",
    fullName: "Santiago Maldonado",
    email: "santi.maldonado@email.com",
    dni: "36.543.210",
    phone: "+54 11 5555-1717",
    birthDate: "1992-12-24",
    planId: "pl_001",
    enrolledAt: monthsAgo(6, 7),
    status: "active",
    health: {
      weightKg: 82,
      heightCm: 180,
      conditions: [],
      signedAt: monthsAgo(6, 7),
      signedBy: "Santiago Maldonado",
    },
    createdAt: `${monthsAgo(6, 7)}T19:40:00`,
  },
  {
    id: "cl_018",
    branchId: "br_002",
    fullName: "Zoe Quiroga",
    email: "zoe.quiroga@email.com",
    dni: "42.876.543",
    phone: "+54 11 5555-1818",
    birthDate: "2000-04-04",
    planId: "pl_003",
    enrolledAt: monthsAgo(2, 16),
    status: "active",
    health: {
      weightKg: 59,
      heightCm: 163,
      conditions: [],
      signedAt: monthsAgo(2, 16),
      signedBy: "Zoe Quiroga",
    },
    createdAt: `${monthsAgo(2, 16)}T08:15:00`,
  },
];

/**
 * Completa quién cargó cada dato de la semilla: la inscripción y los documentos
 * revisados los registró la secretaría de la sede.
 */
export const clientsMock: Client[] = seedClients.map((client) => {
  const secretary = BRANCH_SECRETARY[client.branchId];
  return {
    ...client,
    createdBy: client.createdBy ?? secretary,
    attachments: client.attachments?.map((doc) =>
      doc.status === "approved"
        ? {
            ...doc,
            uploadedBy: doc.uploadedBy ?? secretary,
            reviewedBy: doc.reviewedBy ?? secretary,
            reviewedAt: doc.reviewedAt ?? doc.uploadedAt,
          }
        : doc,
    ),
  };
});

export function getClient(clientId?: string): Client | undefined {
  return clientsMock.find((c) => c.id === clientId);
}
