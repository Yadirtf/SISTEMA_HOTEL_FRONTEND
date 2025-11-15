export type ClientStatus = "active" | "inactive" | "blacklisted";

export type Client = {
  _id: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  origin?: string;
  profession?: string;
  firstVisit?: string;
  lastVisit?: string;
  totalVisits: number;
  status: ClientStatus;
  notes?: string;
  isCompanyClient: boolean;
  companyName?: string;
  companyContact?: string;
  companyPhone?: string;
  companyEmail?: string;
  contractNumber?: string;
  companyNotes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ClientFormData = {
  documentNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  origin?: string;
  profession?: string;
  notes?: string;
  isCompanyClient?: boolean;
  companyName?: string;
  companyContact?: string;
  companyPhone?: string;
  companyEmail?: string;
  contractNumber?: string;
  companyNotes?: string;
};

export type ClientStats = {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  blacklistedClients: number;
  companyClients: number;
  regularClients: number;
  newClientsThisMonth: number;
};

