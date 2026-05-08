export type ClientStatus = "enabled" | "debtor" | "inactive";

export interface ClientMembership {
  planId: string;
  startDate: string; // ISO
  endDate?: string; // ISO
  status: "active" | "expired" | "cancelled";
}

export interface Client {
  id: string;
  branchId: string; // sucursal principal
  fullName: string;
  email: string;
  dni: string;
  phone?: string;
  status: ClientStatus;
  membership?: ClientMembership;
  lastAccessAt?: string; // ISO
  createdAt: string; // ISO
}

export const clientsMock: Client[] = [
  {
    id: "cl_001",
    branchId: "br_001",
    fullName: "Martín Rodríguez",
    email: "martin.r@email.com",
    dni: "34.567.890",
    phone: "+54 11 5555-0101",
    status: "enabled",
    membership: {
      planId: "pl_001",
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      status: "active",
    },
    lastAccessAt: "2026-05-07T11:30:00.000Z",
    createdAt: "2026-02-12T14:20:00.000Z",
  },
  {
    id: "cl_002",
    branchId: "br_002",
    fullName: "Laura Gómez",
    email: "laura.g@email.com",
    dni: "38.123.456",
    phone: "+54 11 5555-0202",
    status: "debtor",
    membership: {
      planId: "pl_002",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      status: "expired",
    },
    lastAccessAt: "2026-05-04T16:10:00.000Z",
    createdAt: "2025-11-20T09:05:00.000Z",
  },
  {
    id: "cl_003",
    branchId: "br_001",
    fullName: "Carlos Silva",
    email: "carlos.s@email.com",
    dni: "32.987.654",
    status: "enabled",
    membership: {
      planId: "pl_003",
      startDate: "2026-04-15",
      endDate: "2026-05-14",
      status: "active",
    },
    lastAccessAt: "2026-05-06T22:15:00.000Z",
    createdAt: "2026-01-03T12:00:00.000Z",
  },
  {
    id: "cl_004",
    branchId: "br_003",
    fullName: "Ana Pérez",
    email: "ana.p@email.com",
    dni: "40.111.222",
    status: "inactive",
    createdAt: "2025-07-08T10:30:00.000Z",
  },
];

