export type BranchStatus = "active" | "inactive";

export interface Branch {
  id: string;
  code: string; // legible para humanos, ej: "CENTRO"
  name: string;
  status: BranchStatus;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  openingHours: {
    monToFri: string;
    saturday?: string;
    sunday?: string;
  };
}

export const branchesMock: Branch[] = [
  {
    id: "br_001",
    code: "CENTRO",
    name: "SquatGym Centro",
    status: "active",
    address: {
      street: "Av. Corrientes 1234",
      city: "CABA",
      province: "Buenos Aires",
      postalCode: "C1043",
    },
    contact: {
      phone: "+54 11 4321-0000",
      email: "centro@squatgym.com",
    },
    openingHours: {
      monToFri: "06:00 - 22:00",
      saturday: "08:00 - 18:00",
      sunday: "09:00 - 14:00",
    },
  },
  {
    id: "br_002",
    code: "NORTE",
    name: "SquatGym Zona Norte",
    status: "active",
    address: {
      street: "Hipólito Yrigoyen 987",
      city: "San Isidro",
      province: "Buenos Aires",
      postalCode: "B1642",
    },
    contact: {
      phone: "+54 11 4760-1111",
      email: "norte@squatgym.com",
    },
    openingHours: {
      monToFri: "07:00 - 23:00",
      saturday: "09:00 - 18:00",
    },
  },
  {
    id: "br_003",
    code: "SUR",
    name: "SquatGym Zona Sur",
    status: "inactive",
    address: {
      street: "Mitre 456",
      city: "Lanús",
      province: "Buenos Aires",
      postalCode: "B1824",
    },
    openingHours: {
      monToFri: "07:00 - 21:00",
      saturday: "09:00 - 17:00",
    },
  },
];

