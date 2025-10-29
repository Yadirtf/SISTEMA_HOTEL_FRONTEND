"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function HabitacionesPage() {
  return (
    <DashboardShell title="Habitaciones">
      <Box>
        <Heading size="md" color="white">Habitaciones</Heading>
        <Text color="gray.300">Aquí podrás gestionar las habitaciones.</Text>
      </Box>
    </DashboardShell>
  );
}


