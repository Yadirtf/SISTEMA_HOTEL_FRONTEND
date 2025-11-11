"use client";

import { Box, Flex, Text, Input, Spinner, Stack, Button } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useHistoryData } from "../hooks/useHistoryData";
import { formatPrice } from "@/lib/format";
import { getToken } from "@/lib/session";
import { useState } from "react";
import { InvoiceModal } from "./InvoiceModal";
import { getBillingDetails, type BillingDetails as BillingDetailsType } from "../services/billing";

export function HistoryTab() {
  const { colors } = useThemeMode();
  const token = getToken() || undefined;
  const [showFilters, setShowFilters] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [billingDetails, setBillingDetails] = useState<BillingDetailsType | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const {
    reservations,
    loading,
    searchQuery,
    setSearchQuery,
    roomFilter,
    setRoomFilter,
    professionFilter,
    setProfessionFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    minAmountFilter,
    setMinAmountFilter,
    maxAmountFilter,
    setMaxAmountFilter,
    uniqueRooms,
    uniqueProfessions,
    hasActiveFilters,
    clearFilters,
  } = useHistoryData(token);

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

  // Función para cargar y mostrar la factura
  const handleViewInvoice = async (reservationId: string) => {
    if (!reservationId) return;
    
    setLoadingInvoice(true);
    try {
      const currentToken = token || getToken() || undefined;
      if (!currentToken) {
        console.error("No hay token disponible");
        return;
      }

      const resp = await getBillingDetails(reservationId, currentToken);
      if (resp.success && resp.data) {
        setBillingDetails(resp.data);
        setIsInvoiceModalOpen(true);
      } else {
        console.error("Error al cargar detalles de facturación:", resp.message);
      }
    } catch (error) {
      console.error("Error al cargar la factura:", error);
    } finally {
      setLoadingInvoice(false);
    }
  };

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" color={colors.gold} mb={6}>
        Historial de Alquileres
      </Text>

      {/* Barra de búsqueda y filtros */}
      <Box mb={6}>
        <Flex gap={3} mb={3} flexWrap="wrap" align="center">
          <Input
            placeholder="Buscar por nombre, habitación o profesión..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={colors.bg}
            borderColor={colors.border}
            color={colors.text}
            _hover={{ borderColor: colors.gold }}
            _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
            flex={{ base: "1 1 100%", md: "1 1 auto" }}
            minW={{ base: "100%", md: "250px" }}
          />
          <Button
            onClick={() => setShowFilters(!showFilters)}
            bg={showFilters ? colors.gold : colors.surface}
            color={showFilters ? colors.bg : colors.text}
            borderWidth="2px"
            borderColor={colors.border}
            _hover={{
              bg: showFilters ? "#b8941f" : colors.bg,
              borderColor: colors.gold,
            }}
            fontSize="sm"
            px={4}
          >
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            {hasActiveFilters && (
              <Box
                as="span"
                ml={2}
                bg={colors.gold}
                color={colors.bg}
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="xs"
                fontWeight="bold"
              >
                {hasActiveFilters ? "•" : ""}
              </Box>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              color={colors.subtext}
              fontSize="sm"
              _hover={{ color: colors.text }}
            >
              Limpiar Filtros
            </Button>
          )}
        </Flex>

        {/* Panel de filtros avanzados */}
        {showFilters && (
          <Box
            bg={colors.surface}
            p={4}
            borderRadius="lg"
            borderWidth="2px"
            borderColor={colors.border}
            mb={4}
          >
            <Text fontSize="sm" fontWeight="bold" color={colors.gold} mb={4}>
              Filtros Avanzados
            </Text>
            <Stack gap={4}>
              {/* Fila 1: Habitación y Profesión */}
              <Flex gap={3} flexWrap="wrap">
                <Box flex={{ base: "1 1 100%", md: "1 1 auto" }} minW={{ base: "100%", md: "200px" }}>
                  <Text fontSize="xs" color={colors.subtext} mb={1}>
                    Habitación
                  </Text>
                  <Input
                    placeholder="Buscar habitación..."
                    value={roomFilter}
                    onChange={(e) => setRoomFilter(e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    list="rooms-list"
                  />
                  <datalist id="rooms-list">
                    {uniqueRooms.map((room) => (
                      <option key={room} value={room} />
                    ))}
                  </datalist>
                </Box>
                <Box flex={{ base: "1 1 100%", md: "1 1 auto" }} minW={{ base: "100%", md: "200px" }}>
                  <Text fontSize="xs" color={colors.subtext} mb={1}>
                    Profesión
                  </Text>
                  <Input
                    placeholder="Buscar profesión..."
                    value={professionFilter}
                    onChange={(e) => setProfessionFilter(e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    list="professions-list"
                  />
                  <datalist id="professions-list">
                    {uniqueProfessions.map((profession) => (
                      <option key={profession} value={profession} />
                    ))}
                  </datalist>
                </Box>
              </Flex>

              {/* Fila 2: Rango de Fechas */}
              <Flex gap={3} flexWrap="wrap">
                <Box flex={{ base: "1 1 100%", md: "1 1 auto" }} minW={{ base: "100%", md: "200px" }}>
                  <Text fontSize="xs" color={colors.subtext} mb={1}>
                    Fecha Desde
                  </Text>
                  <Input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  />
                </Box>
                <Box flex={{ base: "1 1 100%", md: "1 1 auto" }} minW={{ base: "100%", md: "200px" }}>
                  <Text fontSize="xs" color={colors.subtext} mb={1}>
                    Fecha Hasta
                  </Text>
                  <Input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  />
                </Box>
              </Flex>

              {/* Fila 3: Rango de Monto */}
              <Flex gap={3} flexWrap="wrap">
                <Box flex={{ base: "1 1 100%", md: "1 1 auto" }} minW={{ base: "100%", md: "200px" }}>
                  <Text fontSize="xs" color={colors.subtext} mb={1}>
                    Monto Mínimo
                  </Text>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minAmountFilter}
                    onChange={(e) => setMinAmountFilter(e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  />
                </Box>
                <Box flex={{ base: "1 1 100%", md: "1 1 auto" }} minW={{ base: "100%", md: "200px" }}>
                  <Text fontSize="xs" color={colors.subtext} mb={1}>
                    Monto Máximo
                  </Text>
                  <Input
                    type="number"
                    placeholder="Sin límite"
                    value={maxAmountFilter}
                    onChange={(e) => setMaxAmountFilter(e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  />
                </Box>
              </Flex>
            </Stack>
          </Box>
        )}
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
            {hasActiveFilters ? "No se encontraron resultados con los filtros aplicados" : "No hay historial de alquileres"}
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
                    borderRight="1px solid"
                    borderColor={colors.border}
                  >
                    Total Pagado
                  </Box>
                  <Box
                    as="th"
                    textAlign="center"
                    p={4}
                    color={colors.gold}
                    fontSize="sm"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Acción
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
                        borderRight="1px solid"
                        borderColor={colors.border}
                      >
                        ${formatPrice(roomTotal)}
                      </Box>
                      <Box
                        as="td"
                        p={4}
                        textAlign="center"
                      >
                        <Button
                          size="sm"
                          bg={colors.gold}
                          color={colors.bg}
                          fontWeight="bold"
                          _hover={{ bg: "#b8941f" }}
                          onClick={() => handleViewInvoice(reservation._id)}
                          disabled={loadingInvoice}
                          isLoading={loadingInvoice}
                        >
                          Ver Factura
                        </Button>
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
                    <Button
                      size="sm"
                      w="100%"
                      mt={3}
                      bg={colors.gold}
                      color={colors.bg}
                      fontWeight="bold"
                      _hover={{ bg: "#b8941f" }}
                      onClick={() => handleViewInvoice(reservation._id)}
                      disabled={loadingInvoice}
                      isLoading={loadingInvoice}
                    >
                      Ver Factura
                    </Button>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </>
      )}

      {/* Modal de factura */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setBillingDetails(null);
        }}
        billingDetails={billingDetails}
      />
    </Box>
  );
}

