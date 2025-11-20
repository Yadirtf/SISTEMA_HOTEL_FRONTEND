"use client";

import { Box, Text, Input, Flex, Badge, Spinner, Icon } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice } from "@/lib/format";
import type { Reservation } from "../types";
import { FiSearch, FiFilter, FiInbox, FiHome, FiUser, FiCalendar } from "react-icons/fi";

interface BillingListProps {
  reservations: Reservation[];
  loading: boolean;
  selectedReservationId: string | null;
  onSelectReservation: (reservation: Reservation) => void;
  filter: 'all' | 'active' | 'overdue';
  onFilterChange: (filter: 'all' | 'active' | 'overdue') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function BillingList({
  reservations,
  loading,
  selectedReservationId,
  onSelectReservation,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: BillingListProps) {
  const { colors } = useThemeMode();

  const isOverdue = (reservation: Reservation): boolean => {
    if (!reservation.checkOutTime) return false;
    const checkout = new Date(reservation.checkOutTime);
    return checkout <= new Date();
  };

  const getGuestName = (reservation: Reservation): string => {
    if (typeof reservation.guest === 'object' && reservation.guest) {
      return `${reservation.guest.firstName || ''} ${reservation.guest.lastName || ''}`.trim() || reservation.documentNumber;
    }
    return reservation.documentNumber || 'N/A';
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color={colors.gold} />
      </Flex>
    );
  }

  return (
    <Box>
      {/* Filtros y búsqueda */}
      <Box mb={4}>
        <Flex gap={3} mb={3} flexWrap="wrap">
          <Flex align="center" gap={2} flex={1} minW="200px">
            <Icon as={FiFilter} color={colors.subtext} />
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as 'all' | 'active' | 'overdue')}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                color: colors.text,
                borderRadius: '6px',
                padding: '8px 12px',
                border: `2px solid ${colors.border}`,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="all" style={{ backgroundColor: colors.surface, color: colors.text }}>Todas</option>
              <option value="active" style={{ backgroundColor: colors.surface, color: colors.text }}>Activas</option>
              <option value="overdue" style={{ backgroundColor: colors.surface, color: colors.text }}>Vencidas</option>
            </select>
          </Flex>
          
          <Box flex={2} minW="200px" position="relative">
            <Icon
              as={FiSearch}
              color={colors.subtext}
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              pointerEvents="none"
            />
            <Input
              placeholder="Buscar por número de habitación..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              bg={colors.surface}
              borderColor={colors.border}
              color={colors.text}
              pl={10}
            />
          </Box>
        </Flex>
      </Box>

      {/* Lista de reservas */}
      {reservations.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          bg={colors.surface}
          p={8}
          borderRadius="lg"
          borderWidth="2px"
          borderColor={colors.border}
          textAlign="center"
          gap={3}
        >
          <Icon as={FiInbox} color={colors.subtext} fontSize="4xl" />
          <Text color={colors.subtext} fontSize="lg">
            No hay reservas para mostrar
          </Text>
        </Flex>
      ) : (
        <Box
          maxH="calc(100vh - 300px)"
          overflowY="auto"
          pr={2}
        >
          <Flex direction="column" gap={3}>
            {reservations.map((reservation) => {
              const overdue = isOverdue(reservation);
              const isSelected = selectedReservationId === reservation._id;
              const guestName = getGuestName(reservation);
              
              return (
                <Box
                  key={reservation._id}
                  onClick={() => onSelectReservation(reservation)}
                  bg={isSelected ? colors.gold : colors.surface}
                  color={isSelected ? colors.bg : colors.text}
                  p={4}
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor={isSelected ? colors.gold : colors.border}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: colors.gold,
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px ${colors.gold}30`,
                  }}
                >
                  <Flex justify="space-between" align="start" mb={2}>
                    <Box>
                      <Flex align="center" gap={2} mb={1}>
                        <Icon as={FiHome} />
                        <Text fontWeight="bold" fontSize="lg">
                          Habitación {reservation.roomNumber}
                        </Text>
                      </Flex>
                      <Flex align="center" gap={2} fontSize="sm" opacity={0.8}>
                        <Icon as={FiUser} />
                        <Text>{guestName}</Text>
                      </Flex>
                    </Box>
                    <Badge
                      colorScheme={overdue ? "red" : "green"}
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {overdue ? "Vencida" : "Activa"}
                    </Badge>
                  </Flex>
                  
                  <Flex justify="space-between" align="center" mt={3}>
                    <Flex align="center" gap={1} fontSize="xs" opacity={0.7}>
                      <Icon as={FiCalendar} />
                      <Text>
                        {reservation.checkInTime 
                          ? new Date(reservation.checkInTime).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: 'short',
                            })
                          : 'N/A'}
                      </Text>
                    </Flex>
                    <Text fontWeight="bold" fontSize="md">
                      ${formatPrice(reservation.totalPrice || 0)}
                    </Text>
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        </Box>
      )}
    </Box>
  );
}

