"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function ReservasPage() {
  return (
    <DashboardShell title="Reservas">
      <Box>
        <Heading size="md" color="white">Reservas</Heading>
        <Text color="gray.300">Aquí podrás gestionar las reservas.</Text>
      </Box>
    </DashboardShell>
  );
}


