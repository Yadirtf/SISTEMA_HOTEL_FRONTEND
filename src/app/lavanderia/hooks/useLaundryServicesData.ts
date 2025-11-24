import { useEffect, useState, useCallback } from "react";
import { getLaundryServices } from "@/services/laundry-services";
import { getToken } from "@/lib/session";
import type { LaundryService } from "../types";

export function useLaundryServicesData(filters?: {
  clientId?: string;
  roomId?: string;
  roomNumber?: string;
  status?: string;
}) {
  const [services, setServices] = useState<LaundryService[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = useCallback(async () => {
    const token = getToken() || undefined;
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const resp = await getLaundryServices(filters, token);
      if (resp.success && resp.data) {
        setServices(resp.data);
      }
    } catch (error) {
      console.error('[useLaundryServicesData] Error al cargar servicios:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return { services, loading, loadServices };
}

