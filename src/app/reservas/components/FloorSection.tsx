"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import type { Room } from "@/app/reservas/types";
import { RoomCard } from "./RoomCard";

export function FloorSection({
  floorNum,
  rooms,
  colors,
  statusToEs,
  getStatusColor,
  formatPrice,
  onSeeDetails,
  onSeeReservationDetails,
  onPrimaryAction,
  primaryEnabled,
  isBusy,
}: {
  floorNum: number;
  rooms: Room[];
  colors: any;
  statusToEs: Record<string, string>;
  getStatusColor: (s: string) => string;
  formatPrice: (n: number) => string;
  onSeeDetails: (room: Room) => void;
  onSeeReservationDetails: (room: Room) => void;
  onPrimaryAction: (room: Room) => void;
  primaryEnabled: (room: Room) => boolean;
  isBusy: boolean;
}) {
  return (
    <Box>
      <Flex align="center" gap={3} mb={4} pb={3} borderBottom="2px solid" borderColor={colors.border}>
        <Box
          bg={colors.gold}
          color={colors.bg}
          px={4}
          py={2}
          borderRadius="full"
          fontWeight="bold"
          fontSize={{ base: "md", md: "lg" }}
          boxShadow={`0 2px 8px ${colors.gold}50`}
        >
          Piso {floorNum}
        </Box>
        <Text color={colors.subtext} fontSize={{ base: "sm", md: "md" }}>
          {rooms.length} habitación{rooms.length !== 1 ? "es" : ""}
        </Text>
      </Flex>

      <Box
        display="grid"
        gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)", xl: "repeat(5, 1fr)" }}
        gap={4}
      >
        {rooms.map((room) => (
          <RoomCard
            key={room._id}
            room={room}
            statusText={statusToEs[room.status] || room.status}
            statusColor={getStatusColor(room.status)}
            colors={colors}
            priceFormatter={formatPrice}
            onSeeDetails={onSeeDetails}
            onSeeReservationDetails={onSeeReservationDetails}
            onPrimaryAction={onPrimaryAction}
            primaryEnabled={primaryEnabled(room)}
            isBusy={isBusy}
          />
        ))}
      </Box>
    </Box>
  );
}


