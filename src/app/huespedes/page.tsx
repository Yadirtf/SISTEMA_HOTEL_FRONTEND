"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function HuespedesPage() {
  return (
    <DashboardShell title="Huéspedes">
      <Box>
        <Heading size="md" color="white">Huéspedes</Heading>
        <Text color="gray.300">Aquí podrás gestionar los huéspedes.</Text>
      </Box>
    </DashboardShell>
  );
}


