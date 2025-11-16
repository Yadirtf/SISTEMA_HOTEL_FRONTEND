"use client";

import { Box } from "@chakra-ui/react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MyCashRegisterCard } from "@/components/caja/MyCashRegisterCard";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MiCajaPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo recepcionistas pueden acceder a esta página
    if (user && isAdmin) {
      router.replace("/caja");
    }
  }, [user, isAdmin, router]);

  return (
    <DashboardShell title="Mi Caja">
      <Box>
        <MyCashRegisterCard />
      </Box>
    </DashboardShell>
  );
}

