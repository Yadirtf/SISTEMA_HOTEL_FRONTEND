"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Box, Spinner, Text, VStack, Button, Flex, Icon } from "@chakra-ui/react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { ReservationsSection } from "@/components/dashboard/ReservationsSection";
import { GuestsSection } from "@/components/dashboard/GuestsSection";
import { StoreSection } from "@/components/dashboard/StoreSection";
import { CashSection } from "@/components/dashboard/CashSection";
import { LaundrySection } from "@/components/dashboard/LaundrySection";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { FiRefreshCw } from "react-icons/fi";

export default function PanelPage() {
  const { stats, loading, error, refetch } = useDashboardStats();
  const { colors } = useThemeMode();

  if (loading) {
    return (
      <DashboardShell title="Panel de gestión">
        <Box>
          <Flex justify="center" align="center" minH="400px">
            <VStack gap={4}>
              <Spinner size="xl" color={colors.gold} />
              <Text color={colors.text}>Cargando estadísticas...</Text>
            </VStack>
          </Flex>
        </Box>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell title="Panel de gestión">
        <Box>
          <Flex justify="center" align="center" minH="400px">
            <VStack gap={4}>
              <Text color={colors.text} fontSize="lg">
                Error al cargar estadísticas
              </Text>
              <Text color={colors.subtext}>{error}</Text>
              <Button
                onClick={refetch}
                colorScheme="yellow"
                variant="outline"
              >
                <Flex align="center" gap={2}>
                  <Icon as={FiRefreshCw} />
                  <Text>Reintentar</Text>
                </Flex>
              </Button>
            </VStack>
          </Flex>
        </Box>
      </DashboardShell>
    );
  }

  if (!stats) {
    return (
      <DashboardShell title="Panel de gestión">
        <Box>
          <Text color={colors.text}>No hay datos disponibles</Text>
        </Box>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Panel de gestión">
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Text color={colors.text} fontSize="lg" fontWeight="semibold">
            Dashboard General
          </Text>
          <Button
            onClick={refetch}
            size="sm"
            variant="outline"
            colorScheme="yellow"
          >
            <Flex align="center" gap={2}>
              <Icon as={FiRefreshCw} />
              <Text>Actualizar</Text>
            </Flex>
          </Button>
        </Flex>
        <VStack gap={8} align="stretch">
          <ReservationsSection stats={stats.reservations} />
          <Box borderTop="1px solid" borderColor={colors.border} pt={8} />
          <GuestsSection stats={stats.guests} />
          <Box borderTop="1px solid" borderColor={colors.border} pt={8} />
          <StoreSection stats={stats.store} />
          <Box borderTop="1px solid" borderColor={colors.border} pt={8} />
          <CashSection stats={stats.cash} />
          <Box borderTop="1px solid" borderColor={colors.border} pt={8} />
          <LaundrySection stats={stats.laundry} />
        </VStack>
      </Box>
    </DashboardShell>
  );
}


