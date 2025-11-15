export type ClientStatus = "active" | "inactive" | "blacklisted";
export type CompanyStatus = "active" | "inactive";

export type Company = {
  _id: string;
  name: string;
  nit: string;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
  contractNumber?: string;
  notes?: string;
  status: CompanyStatus;
  createdAt?: string;
  updatedAt?: string;
};

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
  company?: Company | null;
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
  companyId?: string;
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

export type CompanyFormData = {
  name: string;
  nit: string;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
  contractNumber?: string;
  notes?: string;
};

export type CompanyStats = {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  companiesWithClients: number;
  totalClientsInCompanies: number;
};

