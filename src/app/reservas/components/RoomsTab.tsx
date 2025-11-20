"use client";

import { Box, Stack, Text, Flex, Input, Icon } from "@chakra-ui/react";
import { useCallback, useState, useMemo } from "react";
import { formatPrice } from "@/lib/format";
import { FloorSection } from "./FloorSection";
import { statusToEs, getStatusColor } from "../lib/status";
import type { Room, Floor } from "../types";
import { FiSearch, FiInbox } from "react-icons/fi";

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
  const [searchQuery, setSearchQuery] = useState("");

  const getRoomTypeName = useCallback((room: Room): string => {
    return typeof room.roomType === "object" && room.roomType ? (room.roomType as any).tipo : "Tipo desconocido";
  }, []);

  const getFloorNumber = useCallback((room: Room): number => {
    if (!room.floor) return 0;
    if (typeof room.floor === "object" && (room.floor as any).numero) return (room.floor as any).numero;
    const f = floors.find(f => f._id === room.floor);
    return f?.numero || 0;
  }, [floors]);

  // Filtrar habitaciones según la búsqueda
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    
    const query = searchQuery.toLowerCase().trim();
    return rooms.filter((room) => {
      const roomNumber = room.number?.toLowerCase() || "";
      const roomType = getRoomTypeName(room).toLowerCase();
      const status = statusToEs[room.status]?.toLowerCase() || room.status?.toLowerCase() || "";
      const price = formatPrice(room.pricePerNight || 0).toLowerCase();
      
      return (
        roomNumber.includes(query) ||
        roomType.includes(query) ||
        status.includes(query) ||
        price.includes(query)
      );
    });
  }, [rooms, searchQuery, getRoomTypeName]);

  // Agrupar habitaciones filtradas por piso
  const filteredRoomsByFloor = useMemo(() => {
    const grouped: Record<number, Room[]> = {};
    filteredRooms.forEach((room) => {
      const floorNum = getFloorNumber(room);
      if (!grouped[floorNum]) {
        grouped[floorNum] = [];
      }
      grouped[floorNum].push(room);
    });
    return grouped;
  }, [filteredRooms, getFloorNumber]);

  // Obtener pisos ordenados de las habitaciones filtradas
  const filteredSortedFloors = useMemo(() => {
    return Object.keys(filteredRoomsByFloor)
      .map(Number)
      .sort((a, b) => a - b);
  }, [filteredRoomsByFloor]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Text color={colors.text}>Cargando habitaciones...</Text>
      </Flex>
    );
  }

  return (
    <Stack gap={6}>
      {/* Filtro de búsqueda rápida */}
      <Box position="relative">
        <Icon
          as={FiSearch}
          color={colors.subtext}
          fontSize="lg"
          position="absolute"
          left={3}
          top="50%"
          transform="translateY(-50%)"
          pointerEvents="none"
        />
        <Input
          placeholder="Buscar habitación por número, tipo, estado o precio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg={colors.bg}
          borderColor={colors.border}
          color={colors.text}
          _hover={{ borderColor: colors.gold }}
          _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
          size="md"
          pl={10}
        />
      </Box>

      {/* Habitaciones agrupadas por piso */}
      {filteredSortedFloors.length === 0 ? (
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
            {searchQuery.trim() ? "No se encontraron habitaciones con ese criterio de búsqueda" : "No hay habitaciones disponibles"}
          </Text>
        </Flex>
      ) : (
        <Stack gap={8}>
          {filteredSortedFloors.map((floorNum) => (
            <FloorSection
              key={floorNum}
              floorNum={floorNum}
              rooms={filteredRoomsByFloor[floorNum]}
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

