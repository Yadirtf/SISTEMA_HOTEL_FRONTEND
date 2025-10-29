"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function PanelPage() {
  return (
    <DashboardShell title="Panel de gestión">
      <Box>
        <Heading size="md" color="white">Bienvenido</Heading>
        <Text color="gray.300">Selecciona una sección en la barra lateral.</Text>
      </Box>
    </DashboardShell>
  );
}


