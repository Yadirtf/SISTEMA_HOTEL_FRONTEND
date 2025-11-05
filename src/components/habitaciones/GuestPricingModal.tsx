"use client";

import { Box, Button, Flex, Input, Stack, Text, Heading } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice } from "@/lib/format";
import { apiPatch } from "@/lib/api";
import { getToken } from "@/lib/session";

type GuestPricing = Record<number, number>;

type PricingRow = {
  id: string;
  guestCount: number;
  price: number;
};

type GuestPricingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  roomTypeId: string;
  roomTypeName: string;
  currentPricing?: GuestPricing;
  onSuccess: () => void;
};

export function GuestPricingModal({
  isOpen,
  onClose,
  roomTypeId,
  roomTypeName,
  currentPricing,
  onSuccess,
}: GuestPricingModalProps) {
  const { colors } = useThemeMode();
  const token = getToken() || undefined;
  const [rows, setRows] = useState<PricingRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextId, setNextId] = useState(0);

  // Convertir currentPricing a filas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (currentPricing && Object.keys(currentPricing).length > 0) {
        const initialRows: PricingRow[] = Object.entries(currentPricing)
          .map(([guestCount, price], index) => ({
            id: `row-${index}`,
            guestCount: Number(guestCount),
            price: Number(price),
          }))
          .sort((a, b) => a.guestCount - b.guestCount);
        setRows(initialRows);
        const maxGuestCount = initialRows.length > 0 ? Math.max(...initialRows.map(r => r.guestCount)) : 0;
        setNextId(maxGuestCount + 1);
      } else {
        // Si no hay precios, comenzar con una fila vacía
        setRows([{ id: "row-0", guestCount: 1, price: 0 }]);
        setNextId(1);
      }
    }
  }, [isOpen, currentPricing]);

  if (!isOpen) return null;

  const handleGuestCountChange = (id: string, value: string) => {
    const numValue = value.replace(/[^0-9]/g, "");
    const guestCount = numValue ? parseInt(numValue) : 0;
    
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, guestCount: guestCount > 0 ? guestCount : 1 } : row
      )
    );
  };

  const handlePriceChange = (id: string, value: string) => {
    const numValue = value.replace(/[^0-9]/g, "");
    const price = numValue ? parseFloat(numValue) : 0;
    
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, price } : row))
    );
  };

  const handleAddRow = () => {
    const maxGuestCount = rows.length > 0 ? Math.max(...rows.map(r => r.guestCount)) : 0;
    const newGuestCount = maxGuestCount + 1;
    const timestamp = Date.now();
    const newId = `row-${timestamp}-${nextId}`;
    setRows([...rows, { id: newId, guestCount: newGuestCount, price: 0 }]);
    setNextId(nextId + 1);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validar filas
      const validRows = rows.filter(row => row.guestCount > 0 && row.price > 0);
      
      if (validRows.length === 0) {
        setError("Debe configurar al menos un precio para 1 o más huéspedes");
        setIsSubmitting(false);
        return;
      }

      // Validar que no haya duplicados de número de huéspedes
      const guestCounts = validRows.map(row => row.guestCount);
      const duplicates = guestCounts.filter((count, index) => guestCounts.indexOf(count) !== index);
      if (duplicates.length > 0) {
        setError(`Hay números de huéspedes duplicados: ${[...new Set(duplicates)].join(", ")}`);
        setIsSubmitting(false);
        return;
      }

      // Construir el objeto de precios
      const pricingToSend: GuestPricing = {};
      validRows.forEach(row => {
        pricingToSend[row.guestCount] = row.price;
      });

      const response = await apiPatch(
        `/rooms/types/${roomTypeId}/pricing`,
        { guestPricing: pricingToSend },
        token
      );

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || "Error al actualizar los precios");
      }
    } catch (err: any) {
      console.error("Error al actualizar precios:", err);
      setError(err?.response?.data?.message || err?.message || "Error desconocido al actualizar los precios");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = () => {
    setRows([{ id: "row-0", guestCount: 1, price: 0 }]);
    setNextId(1);
  };

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
          <Heading size="lg" color={colors.gold}>
            Configurar Precios por Huéspedes
          </Heading>
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
        <Stack gap={4} p={6}>
          <Box>
            <Text fontSize="sm" color={colors.subtext} mb={2}>
              Tipo de Habitación:
            </Text>
            <Text fontSize="lg" fontWeight="bold" color={colors.text}>
              {roomTypeName}
            </Text>
            <Text fontSize="xs" color={colors.subtext} mt={2}>
              Configure los precios por noche según el número de huéspedes. Agregue tantas filas como necesite.
            </Text>
          </Box>

          {error && (
            <Box
              bg="#dc2626"
              color="white"
              p={3}
              borderRadius="md"
              fontSize="sm"
            >
              {error}
            </Box>
          )}

          {/* Tabla de precios */}
          <Box
            bg={colors.bg}
            borderRadius="md"
            borderWidth="1px"
            borderColor={colors.border}
            overflow="hidden"
          >
            <Stack gap={0}>
              {/* Encabezado */}
              <Flex
                bg={colors.gold}
                color={colors.bg}
                p={3}
                fontWeight="bold"
                fontSize="sm"
                textTransform="uppercase"
                letterSpacing="0.5px"
                gap={2}
              >
                <Box flex="0.4" textAlign="center">
                  Cantidad
                </Box>
                <Box flex="0.1"></Box>
                <Box flex="0.4" textAlign="center">
                  Precio (COP)
                </Box>
                <Box flex="0.1"></Box>
              </Flex>

              {/* Filas de precios dinámicas */}
              {rows.map((row, index) => (
                <Flex
                  key={row.id}
                  p={3}
                  borderTopWidth="1px"
                  borderTopColor={colors.border}
                  _hover={{ bg: colors.surface }}
                  transition="background-color 0.2s"
                  align="center"
                  gap={2}
                >
                  <Box flex="0.4">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={row.guestCount || ""}
                      onChange={(e) => handleGuestCountChange(row.id, e.target.value)}
                      bg={colors.surface}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      placeholder="Cantidad"
                      textAlign="center"
                    />
                  </Box>
                  <Box flex="0.1" textAlign="center">
                    <Text color={colors.subtext} fontSize="sm">
                      {row.guestCount === 1 ? "huésped" : "huéspedes"}
                    </Text>
                  </Box>
                  <Box flex="0.4">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={row.price > 0 ? formatPrice(row.price) : ""}
                      onChange={(e) => {
                        const numValue = e.target.value.replace(/[^0-9]/g, "");
                        handlePriceChange(row.id, numValue);
                      }}
                      bg={colors.surface}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      placeholder="Precio"
                      textAlign="center"
                    />
                  </Box>
                  <Box flex="0.1">
                    {rows.length > 1 && (
                      <Button
                        aria-label="Eliminar fila"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveRow(row.id)}
                        color={colors.subtext}
                        _hover={{ color: "#dc2626", bg: colors.surface }}
                        p={2}
                        minW="auto"
                        h="auto"
                      >
                        🗑️
                      </Button>
                    )}
                  </Box>
                </Flex>
              ))}
              
              {/* Botón para agregar nueva fila */}
              <Flex
                p={3}
                borderTopWidth="1px"
                borderTopColor={colors.border}
                justify="center"
              >
                <Button
                  size="sm"
                  variant="outline"
                  borderColor={colors.gold}
                  color={colors.gold}
                  onClick={handleAddRow}
                  _hover={{ bg: colors.gold, color: colors.bg }}
                >
                  + Agregar Fila
                </Button>
              </Flex>
            </Stack>
          </Box>

          {/* Información */}
          <Box
            bg={colors.bg}
            p={3}
            borderRadius="md"
            borderWidth="1px"
            borderColor={colors.border}
          >
            <Text fontSize="xs" color={colors.subtext}>
              💡 <strong>Nota:</strong> Puede agregar tantas filas como necesite. Si no configura un precio para un número específico de huéspedes, 
              el sistema usará el precio más cercano disponible (menor o igual). Si no hay precios configurados, 
              se usará el precio base de la habitación.
            </Text>
          </Box>

          {/* Botones */}
          <Flex gap={3} justify="flex-end" mt={4}>
            <Button
              type="button"
              variant="outline"
              borderColor={colors.border}
              color={colors.text}
              onClick={handleClearAll}
              _hover={{ bg: colors.surface, borderColor: colors.gold, color: colors.gold }}
              disabled={isSubmitting}
            >
              Limpiar Todo
            </Button>
            <Button
              type="button"
              variant="outline"
              borderColor={colors.border}
              color={colors.text}
              onClick={onClose}
              _hover={{ bg: colors.surface, borderColor: colors.gold, color: colors.gold }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              bg={colors.gold}
              color={colors.bg}
              fontWeight="bold"
              _hover={{ bg: "#b8941f", transform: "translateY(-2px)" }}
              disabled={isSubmitting}
              boxShadow={`0 2px 8px ${colors.gold}50`}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Guardando..." : "Guardar Precios"}
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}

