"use client";

import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import type { Room } from "@/app/reservas/types";

export function RoomCard({
  room,
  statusText,
  statusColor,
  colors,
  priceFormatter,
  onSeeDetails,
  onSeeReservationDetails,
  onPrimaryAction,
  primaryEnabled,
  isBusy,
}: {
  room: Room;
  statusText: string;
  statusColor: string;
  colors: any;
  priceFormatter: (n: number) => string;
  onSeeDetails: (room: Room) => void;
  onSeeReservationDetails: (room: Room) => void;
  onPrimaryAction: (room: Room) => void;
  primaryEnabled: boolean;
  isBusy: boolean;
}) {
  return (
    <Box
      bg={colors.surface}
      p={{ base: 4, md: 5 }}
      borderRadius="lg"
      borderWidth="2px"
      borderColor={colors.border}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
      transition="all 0.3s"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: `0 8px 16px ${colors.gold}40, 0 0 0 2px ${colors.gold}`,
        borderColor: colors.gold,
      }}
      cursor="pointer"
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" top={0} left={0} right={0} height="4px" bg={statusColor} />

      <Flex justify="space-between" align="start" mb={3}>
        <Box
          bg={statusColor}
          color="white"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="bold"
          textTransform="uppercase"
          letterSpacing="0.5px"
        >
          {statusText}
        </Box>
        <Flex align="center" gap={2}>
          <Text fontSize={{ base: "xs", md: "sm" }} color={colors.subtext} fontWeight="medium">
            #{room.number}
          </Text>
          {/* Mostrar botón de detalles solo cuando la habitación está ocupada (no en limpieza) */}
          {room.status === "occupied" && (
            <Button
              variant="ghost"
              size="xs"
              p={1}
              minW="auto"
              h="auto"
              onClick={(e) => {
                e.stopPropagation();
                onSeeDetails(room);
              }}
              color={colors.subtext}
              _hover={{ color: colors.gold, bg: colors.bg, transform: "scale(1.1)" }}
              transition="all 0.2s"
              title="Ver detalles de la habitación"
            >
              👁️
            </Button>
          )}
        </Flex>
      </Flex>

      <Stack gap={3}>
        <Box>
          <Text fontSize="xs" color={colors.subtext} mb={1} textTransform="uppercase" letterSpacing="0.5px" fontWeight="semibold">
            Tipo
          </Text>
          <Text fontSize={{ base: "md", md: "lg" }} color={colors.gold} fontWeight="bold">
            {typeof room.roomType === "object" && room.roomType ? (room.roomType as any).tipo : "Tipo desconocido"}
          </Text>
        </Box>
        <Box>
          <Text fontSize="xs" color={colors.subtext} mb={1} textTransform="uppercase" letterSpacing="0.5px" fontWeight="semibold">
            Precio/Noche
          </Text>
          <Text fontSize={{ base: "lg", md: "xl" }} color={colors.text} fontWeight="bold">
            ${priceFormatter(room.pricePerNight)}
          </Text>
        </Box>
        {room.maxOccupancy && (
          <Box>
            <Text fontSize="xs" color={colors.subtext} mb={1} textTransform="uppercase" letterSpacing="0.5px" fontWeight="semibold">
              Capacidad
            </Text>
            <Flex align="center" gap={2}>
              <Text fontSize={{ base: "md", md: "lg" }} color={colors.text} fontWeight="semibold">
                {room.maxOccupancy}
              </Text>
              <Text fontSize="sm" color={colors.subtext}>
                persona{room.maxOccupancy > 1 ? "s" : ""}
              </Text>
            </Flex>
          </Box>
        )}
      </Stack>

      <Box mt={4} pt={3} borderTop="1px solid" borderColor={colors.border}>
        <Flex gap={2} justify="space-between">
          {/* Mostrar botón de detalles solo cuando la habitación está ocupada (no en limpieza) */}
          {room.status === "occupied" && (
            <Button
              size="sm"
              variant="outline"
              borderColor={colors.border}
              color={colors.text}
              onClick={(e) => {
                e.stopPropagation();
                onSeeReservationDetails(room);
              }}
              _hover={{ bg: colors.bg, borderColor: colors.gold, color: colors.gold }}
              transition="all 0.2s"
              flex={1}
              disabled={isBusy}
            >
              Detalles
            </Button>
          )}
          {/* Solo mostrar el botón de acción primaria si la habitación NO está ocupada */}
          {/* Las habitaciones ocupadas se liberan desde el apartado de facturación */}
          {room.status !== "occupied" && (
            <Button
              size="sm"
              bg={primaryEnabled ? colors.gold : colors.subtext}
              color={colors.bg}
              fontWeight="bold"
              onClick={(e) => {
                e.stopPropagation();
                onPrimaryAction(room);
              }}
              _hover={{
                bg: primaryEnabled ? "#b8941f" : colors.subtext,
                transform: primaryEnabled ? "translateY(-2px)" : undefined,
                boxShadow: primaryEnabled ? `0 4px 12px ${colors.gold}40` : undefined,
              }}
              disabled={!primaryEnabled || isBusy}
              transition="all 0.2s"
              flex={1}
              boxShadow={primaryEnabled ? `0 2px 8px ${colors.gold}50` : undefined}
              opacity={primaryEnabled ? 1 : 0.5}
              cursor={primaryEnabled ? "pointer" : "not-allowed"}
            >
              {room.status === "available" ? "Ocupar" : "F. limpieza"}
            </Button>
          )}
        </Flex>
      </Box>
    </Box>
  );
}


