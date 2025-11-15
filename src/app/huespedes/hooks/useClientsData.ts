import { useEffect, useState } from "react";
import { getClients, getClientStats } from "@/services/clients";
import { Client, ClientStats } from "../types";

type ClientFilters = {
  status?: string;
  isCompanyClient?: boolean;
  search?: string;
};

export function useClientsData(token: string | undefined, filters: ClientFilters) {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    try {
      const resp = await getClients(filters, token);
      if (resp.success && resp.data) {
        console.log("Clientes cargados - Total:", resp.data.length);
        resp.data.forEach((c, index) => {
          console.log(`Cliente ${index + 1}:`, {
            _id: c._id,
            _id_type: typeof c._id,
            _id_length: c._id?.length,
            documentNumber: c.documentNumber,
            name: `${c.firstName} ${c.lastName}`
          });
        });
        setClients(resp.data);
      }
    } catch (error: any) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const resp = await getClientStats(token);
      if (resp.success && resp.data) {
        setStats(resp.data);
      }
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.isCompanyClient, filters.search]);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    clients,
    stats,
    loading,
    loadClients,
    loadStats,
  };
}

