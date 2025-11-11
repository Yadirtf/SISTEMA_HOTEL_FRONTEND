"use client";

import { Box, Flex, Text, Input, Spinner, Stack } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useHistoryData } from "../hooks/useHistoryData";
import { formatPrice } from "@/lib/format";
import { getToken } from "@/lib/session";

export function HistoryTab() {
  const { colors } = useThemeMode();
  const token = getToken() || undefined;
  const { reservations, loading, searchQuery, setSearchQuery } = useHistoryData(token);

  // Función para calcular el número de noches según la regla del hotel:
  // Si alguien llega el día X a cualquier hora, la salida es al mediodía del día siguiente (X+1)
  // Cada noche es desde el día de entrada hasta el mediodía del día siguiente
  const calculateNights = (checkInTime: Date | string, checkOutTime?: Date | string): number => {
    if (!checkOutTime) return 0;
    
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);
    
    // Obtener solo la fecha (sin hora) para ambos
    // Esto es importante porque la regla del hotel es:
    // - Entrada cualquier hora del día X → Salida al mediodía del día X+1
    // - La diferencia en días representa el número de noches
    const checkInDate = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
    const checkOutDate = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
    
    // Calcular diferencia en días
    // Ejemplo: Entrada 10/11, Salida 12/11 → 12 - 10 = 2 noches
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // Asegurar que siempre sea al menos 1 noche si hay checkOutTime
    return Math.max(1, diffDays);
  };

  // Función para obtener el nombre del cliente
  const getGuestName = (guest: any): string => {
    if (typeof guest === "object" && guest) {
      return `${guest.firstName || ""} ${guest.lastName || ""}`.trim();
    }
    return "N/A";
  };

  // Función para obtener la profesión
  const getProfession = (guest: any): string => {
    if (typeof guest === "object" && guest && guest.profession) {
      return guest.profession;
    }
    return "-";
  };

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" color={colors.gold} mb={6}>
        Historial de Alquileres
      </Text>

      {/* Barra de búsqueda */}
      <Box mb={6}>
        <Input
          placeholder="Buscar por nombre, habitación o profesión..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg={colors.bg}
          borderColor={colors.border}
          color={colors.text}
          _hover={{ borderColor: colors.gold }}
          _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
          maxW={{ base: "100%", md: "400px" }}
          w="100%"
        />
      </Box>

      {/* Tabla */}
      {loading ? (
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color={colors.gold} />
        </Flex>
      ) : reservations.length === 0 ? (
        <Box
          bg={colors.surface}
          p={8}
          borderRadius="lg"
          borderWidth="2px"
          borderColor={colors.border}
          textAlign="center"
        >
          <Text color={colors.subtext} fontSize="lg">
            {searchQuery ? "No se encontraron resultados" : "No hay historial de alquileres"}
          </Text>
        </Box>
      ) : (
        <>
          {/* Vista de tabla para desktop */}
          <Box
            display={{ base: "none", lg: "block" }}
            bg={colors.surface}
            borderRadius="lg"
            borderWidth="2px"
            borderColor={colors.border}
            overflowX="auto"
          >
            <Box as="table" w="100%" style={{ borderCollapse: "collapse" }}>
              <Box as="thead">
                <Box as="tr" bg={colors.bg} borderBottom="2px solid" borderColor={colors.border}>
                  <Box
                    as="th"
                    textAlign="left"
                    p={4}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    borderRight="1px solid"
                    borderColor={colors.border}
                  >
                    Nombre del Cliente
                  </Box>
                  <Box
                    as="th"
                    textAlign="left"
                    p={4}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    borderRight="1px solid"
                    borderColor={colors.border}
                  >
                    Número de Habitación
                  </Box>
                  <Box
                    as="th"
                    textAlign="left"
                    p={4}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    borderRight="1px solid"
                    borderColor={colors.border}
                  >
                    Profesión
                  </Box>
                  <Box
                    as="th"
                    textAlign="right"
                    p={4}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    borderRight="1px solid"
                    borderColor={colors.border}
                  >
                    Total Noches
                  </Box>
                  <Box
                    as="th"
                    textAlign="right"
                    p={4}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Total Pagado
                  </Box>
                </Box>
              </Box>
              <Box as="tbody">
                {reservations.map((reservation) => {
                  const guest = typeof reservation.guest === "object" ? reservation.guest : null;
                  const nights = calculateNights(reservation.checkInTime, reservation.checkOutTime);
                  // Calcular el total pagado solo de la habitación (roomPrice * noches)
                  // No incluir productos fiados ni cargos adicionales
                  const roomTotal = (reservation.roomPrice || 0) * nights;
                  
                  return (
                    <Box
                      as="tr"
                      key={reservation._id}
                      _hover={{ bg: colors.bg }}
                      borderBottom="1px solid"
                      borderColor={colors.border}
                    >
                      <Box
                        as="td"
                        p={4}
                        color={colors.text}
                        borderRight="1px solid"
                        borderColor={colors.border}
                      >
                        {getGuestName(guest)}
                      </Box>
                      <Box
                        as="td"
                        p={4}
                        color={colors.text}
                        fontWeight="semibold"
                        borderRight="1px solid"
                        borderColor={colors.border}
                      >
                        {reservation.roomNumber}
                      </Box>
                      <Box
                        as="td"
                        p={4}
                        color={colors.text}
                        borderRight="1px solid"
                        borderColor={colors.border}
                      >
                        {getProfession(guest)}
                      </Box>
                      <Box
                        as="td"
                        p={4}
                        color={colors.text}
                        textAlign="right"
                        borderRight="1px solid"
                        borderColor={colors.border}
                      >
                        {nights}
                      </Box>
                      <Box
                        as="td"
                        p={4}
                        color={colors.gold}
                        fontWeight="bold"
                        textAlign="right"
                      >
                        ${formatPrice(roomTotal)}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Vista de tarjetas para móvil/tablet */}
          <Box display={{ base: "block", lg: "none" }}>
            <Stack gap={4}>
              {reservations.map((reservation) => {
                const guest = typeof reservation.guest === "object" ? reservation.guest : null;
                const nights = calculateNights(reservation.checkInTime, reservation.checkOutTime);
                // Calcular el total pagado solo de la habitación (roomPrice * noches)
                // No incluir productos fiados ni cargos adicionales
                const roomTotal = (reservation.roomPrice || 0) * nights;
                
                return (
                  <Box
                    key={reservation._id}
                    bg={colors.surface}
                    p={4}
                    borderRadius="lg"
                    borderWidth="2px"
                    borderColor={colors.border}
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.2)"
                  >
                    <Flex justify="space-between" align="start" mb={3} flexWrap="wrap" gap={2}>
                      <Box flex="1" minW="200px">
                        <Text fontSize="lg" fontWeight="bold" color={colors.gold} mb={1}>
                          {getGuestName(guest)}
                        </Text>
                        <Text fontSize="sm" color={colors.subtext}>
                          Habitación {reservation.roomNumber}
                        </Text>
                      </Box>
                      <Box textAlign="right">
                        <Text fontSize="xl" fontWeight="bold" color={colors.gold}>
                          ${formatPrice(roomTotal)}
                        </Text>
                        <Text fontSize="xs" color={colors.subtext}>
                          Total pagado
                        </Text>
                      </Box>
                    </Flex>
                    
                    <Flex gap={4} flexWrap="wrap" mt={3} pt={3} borderTop="1px solid" borderColor={colors.border}>
                      <Box>
                        <Text fontSize="xs" color={colors.subtext} mb={0.5}>
                          Profesión
                        </Text>
                        <Text fontSize="sm" color={colors.text} fontWeight="medium">
                          {getProfession(guest)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={colors.subtext} mb={0.5}>
                          Total Noches
                        </Text>
                        <Text fontSize="sm" color={colors.text} fontWeight="medium">
                          {nights} {nights === 1 ? "noche" : "noches"}
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}

