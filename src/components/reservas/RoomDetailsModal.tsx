"use client";

import { Box, Button, Flex, Stack, Text, Heading } from "@chakra-ui/react";
import { formatPrice } from "@/lib/format";
import { useThemeMode } from "@/components/theme/ThemeProvider";

type RoomType = {
  _id: string;
  tipo: string;
  descripcion?: string;
  isActive?: boolean;
};

type Floor = {
  _id: string;
  numero: number;
  descripcion?: string;
  isActive?: boolean;
};

type Room = {
  _id: string;
  number: string;
  roomType: string | RoomType;
  pricePerNight: number;
  status: "available" | "occupied" | "maintenance" | "cleaning" | string;
  floor?: string | Floor;
  maxOccupancy?: number;
  description?: string;
  isActive: boolean;
};

type RoomDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  getRoomTypeName: (room: any) => string;
  getFloorNumber: (room: any) => number;
};

const statusToEs: Record<string, string> = {
  available: "Disponible",
  occupied: "Ocupada",
  maintenance: "Mantenimiento",
  cleaning: "Limpieza",
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "available":
      return "#22c55e";
    case "occupied":
      return "#ef4444";
    case "maintenance":
      return "#f59e0b";
    case "cleaning":
      return "#3b82f6";
    default:
      return "#6b7280";
  }
};

export function RoomDetailsModal({
  isOpen,
  onClose,
  room,
  getRoomTypeName,
  getFloorNumber,
}: RoomDetailsModalProps) {
  const { colors } = useThemeMode();

  if (!isOpen || !room) return null;

  const statusColor = getStatusColor(room.status);
  const floorNumber = getFloorNumber(room);
  const roomTypeName = getRoomTypeName(room);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.7)"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={onClose}
    >
      <Box
        bg={colors.surface}
        borderRadius="lg"
        borderWidth="2px"
        borderColor={colors.border}
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.5)"
        maxW="600px"
        w="100%"
        maxH="90vh"
        overflowY="auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <Flex
          justify="space-between"
          align="center"
          p={6}
          borderBottom="2px solid"
          borderColor={colors.border}
          bg={colors.bg}
        >
          <Flex align="center" gap={3}>
            <Box
              w={4}
              h={4}
              bg={statusColor}
              borderRadius="full"
              boxShadow={`0 0 8px ${statusColor}`}
            />
            <Heading size="lg" color={colors.gold}>
              Detalles Habitación #{room.number}
            </Heading>
          </Flex>
          <Button
            variant="ghost"
            onClick={onClose}
            color={colors.subtext}
            _hover={{ bg: colors.surface, color: colors.text }}
            fontSize="xl"
            p={2}
            minW="auto"
            h="auto"
          >
            ×
          </Button>
        </Flex>

        {/* Contenido */}
        <Stack gap={6} p={6}>
          {/* Estado */}
          <Box>
            <Text
              fontSize="xs"
              color={colors.subtext}
              mb={2}
              textTransform="uppercase"
              letterSpacing="0.5px"
              fontWeight="semibold"
            >
              Estado
            </Text>
            <Box
              display="inline-block"
              bg={statusColor}
              color="white"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              {statusToEs[room.status] || room.status}
            </Box>
          </Box>

          {/* Información principal */}
          <Stack gap={4}>
            <Flex gap={4} wrap="wrap">
              <Box flex="1" minW="200px">
                <Text
                  fontSize="xs"
                  color={colors.subtext}
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                  fontWeight="semibold"
                >
                  Tipo de Habitación
                </Text>
                <Text fontSize="lg" color={colors.gold} fontWeight="bold">
                  {roomTypeName}
                </Text>
              </Box>

              <Box flex="1" minW="200px">
                <Text
                  fontSize="xs"
                  color={colors.subtext}
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                  fontWeight="semibold"
                >
                  Piso
                </Text>
                <Text fontSize="lg" color={colors.text} fontWeight="semibold">
                  {floorNumber > 0 ? `Piso ${floorNumber}` : "No asignado"}
                </Text>
              </Box>
            </Flex>

            <Flex gap={4} wrap="wrap">
              <Box flex="1" minW="200px">
                <Text
                  fontSize="xs"
                  color={colors.subtext}
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                  fontWeight="semibold"
                >
                  Precio por Noche
                </Text>
                <Text fontSize="xl" color={colors.gold} fontWeight="bold">
                  ${formatPrice(room.pricePerNight)}
                </Text>
              </Box>

              {room.maxOccupancy && (
                <Box flex="1" minW="200px">
                  <Text
                    fontSize="xs"
                    color={colors.subtext}
                    mb={2}
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    fontWeight="semibold"
                  >
                    Capacidad Máxima
                  </Text>
                  <Text fontSize="lg" color={colors.text} fontWeight="semibold">
                    {room.maxOccupancy} persona{room.maxOccupancy > 1 ? "s" : ""}
                  </Text>
                </Box>
              )}
            </Flex>
          </Stack>

          {/* Descripción */}
          {room.description && (
            <Box>
              <Text
                fontSize="xs"
                color={colors.subtext}
                mb={2}
                textTransform="uppercase"
                letterSpacing="0.5px"
                fontWeight="semibold"
              >
                Descripción
              </Text>
              <Box
                bg={colors.bg}
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={colors.border}
              >
                <Text fontSize="sm" color={colors.text} lineHeight="1.6">
                  {room.description}
                </Text>
              </Box>
            </Box>
          )}

          {/* Botón de cierre */}
          <Flex justify="flex-end" mt={4}>
            <Button
              bg={colors.gold}
              color={colors.bg}
              fontWeight="bold"
              _hover={{ bg: "#b8941f", transform: "translateY(-2px)" }}
              onClick={onClose}
              boxShadow={`0 2px 8px ${colors.gold}50`}
            >
              Cerrar
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}

