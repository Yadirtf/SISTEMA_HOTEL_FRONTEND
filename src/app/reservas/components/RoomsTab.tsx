"use client";

import { Box, Stack, Text, Flex } from "@chakra-ui/react";
import { useCallback } from "react";
import { formatPrice } from "@/lib/format";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { Header } from "./Header";
import { FloorSection } from "./FloorSection";
import { statusToEs, getStatusColor } from "../lib/status";
import type { Room, Floor } from "../types";

interface RoomsTabProps {
  rooms: Room[];
  floors: Floor[];
  loading: boolean;
  roomsByFloor: Record<number, Room[]>;
  sortedFloors: number[];
  colors: any;
  onSeeDetails: (room: Room) => void;
  onSeeReservationDetails: (room: Room) => void;
  onPrimaryAction: (room: Room) => void;
  isSubmitting: boolean;
  loadRooms: () => Promise<void>;
}

export function RoomsTab({
  rooms,
  floors,
  loading,
  roomsByFloor,
  sortedFloors,
  colors,
  onSeeDetails,
  onSeeReservationDetails,
  onPrimaryAction,
  isSubmitting,
  loadRooms,
}: RoomsTabProps) {
  const getRoomTypeName = useCallback((room: Room): string => {
    return typeof room.roomType === "object" && room.roomType ? (room.roomType as any).tipo : "Tipo desconocido";
  }, []);

  const getFloorNumber = useCallback((room: Room): number => {
    if (!room.floor) return 0;
    if (typeof room.floor === "object" && (room.floor as any).numero) return (room.floor as any).numero;
    const f = floors.find(f => f._id === room.floor);
    return f?.numero || 0;
  }, [floors]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Text color={colors.text}>Cargando habitaciones...</Text>
      </Flex>
    );
  }

  return (
    <Stack gap={6}>
      {/* Encabezado */}
      <Header title="Habitaciones del Hotel" subtitle="Selecciona una habitación para realizar una reserva" colors={colors} />

      {/* Habitaciones agrupadas por piso */}
      {sortedFloors.length === 0 ? (
        <Box
          bg={colors.surface}
          p={8}
          borderRadius="lg"
          borderWidth="2px"
          borderColor={colors.border}
          textAlign="center"
        >
          <Text color={colors.subtext} fontSize="lg">
            No hay habitaciones disponibles
          </Text>
        </Box>
      ) : (
        <Stack gap={8}>
          {sortedFloors.map((floorNum) => (
            <FloorSection
              key={floorNum}
              floorNum={floorNum}
              rooms={roomsByFloor[floorNum]}
              colors={colors}
              statusToEs={statusToEs}
              getStatusColor={(s) => getStatusColor(s, colors.subtext)}
              formatPrice={(n) => formatPrice(n)}
              onSeeDetails={onSeeDetails}
              onSeeReservationDetails={onSeeReservationDetails}
              onPrimaryAction={onPrimaryAction}
              primaryEnabled={(room) => {
                // El botón solo está habilitado para habitaciones disponibles o en limpieza
                // Las habitaciones ocupadas no deben mostrar el botón de acción (se liberan desde facturación)
                return room.status === "available" || room.status === "cleaning";
              }}
              isBusy={isSubmitting}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

