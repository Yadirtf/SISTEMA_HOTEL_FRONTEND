import { useEffect, useState } from "react";
import { getCompanies, getCompanyStats } from "@/services/companies";
import { Company, CompanyStats } from "../types";

type CompanyFilters = {
  status?: string;
  search?: string;
};

export function useCompaniesData(token: string | undefined, filters: CompanyFilters) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const resp = await getCompanies(filters, token);
      if (resp.success && resp.data) {
        setCompanies(resp.data);
      }
    } catch (error: any) {
      console.error("Error al cargar empresas:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const resp = await getCompanyStats(token);
      if (resp.success && resp.data) {
        setStats(resp.data);
      }
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  useEffect(() => {
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.search]);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    companies,
    stats,
    loading,
    loadCompanies,
    loadStats,
  };
}

