"use client";

import { Box, Button, Flex, Stack, Text, Input, Textarea, Heading } from "@chakra-ui/react";
import { useState } from "react";
import { useThemeMode } from "@/components/theme/ThemeProvider";

export type ReservationFormData = {
  documentNumber: string;
  guestFirstName: string;
  guestLastName: string;
  phoneNumber: string;
  email: string;
  origin: string;
  profession: string;
  checkInTime: string;
  checkOutTime: string;
  snackConsumption: string;
  numberOfGuests: string;
  specialRequests: string;
  notes: string;
  paymentMethod: "cash" | "card" | "transfer" | "pending";
};

type ReservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReservationFormData) => void;
  roomNumber: string;
  roomPrice: number;
  isLoading?: boolean;
};

export function ReservationModal({
  isOpen,
  onClose,
  onSubmit,
  roomNumber,
  roomPrice,
  isLoading = false,
}: ReservationModalProps) {
  const { colors } = useThemeMode();
  const [formData, setFormData] = useState<ReservationFormData>({
    documentNumber: "",
    guestFirstName: "",
    guestLastName: "",
    phoneNumber: "",
    email: "",
    origin: "",
    profession: "",
    checkInTime: "",
    checkOutTime: "",
    snackConsumption: "0",
    numberOfGuests: "1",
    specialRequests: "",
    notes: "",
    paymentMethod: "pending",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof ReservationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Establecer fecha mínima como hoy
  const today = new Date().toISOString().split("T")[0];

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
            Ocupar Habitación #{roomNumber}
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

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Stack gap={4} p={6}>
            {/* Información del huésped */}
            <Box>
              <Text
                fontSize="md"
                fontWeight="bold"
                color={colors.gold}
                mb={3}
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Información del Huésped
              </Text>
              <Stack gap={3}>
                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Número de Documento *
                  </Text>
                  <Input
                    required
                    value={formData.documentNumber}
                    onChange={(e) => handleChange("documentNumber", e.target.value.toUpperCase())}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    placeholder="CC123456789"
                    maxLength={20}
                  />
                </Box>

                <Flex gap={3}>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Nombre *
                    </Text>
                    <Input
                      required
                      value={formData.guestFirstName}
                      onChange={(e) => handleChange("guestFirstName", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      placeholder="Juan"
                    />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Apellido *
                    </Text>
                    <Input
                      required
                      value={formData.guestLastName}
                      onChange={(e) => handleChange("guestLastName", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      placeholder="Pérez"
                    />
                  </Box>
                </Flex>

                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Teléfono *
                  </Text>
                  <Input
                    required
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    placeholder="+57 300 1234567"
                  />
                </Box>

                <Flex gap={3}>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Email
                    </Text>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      placeholder="correo@ejemplo.com"
                    />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Origen
                    </Text>
                    <Input
                      value={formData.origin}
                      onChange={(e) => handleChange("origin", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      placeholder="Ciudad, País"
                    />
                  </Box>
                </Flex>

                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Profesión
                  </Text>
                  <Input
                    value={formData.profession}
                    onChange={(e) => handleChange("profession", e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    placeholder="Ingeniero"
                  />
                </Box>
              </Stack>
            </Box>

            {/* Información de la reserva */}
            <Box>
              <Text
                fontSize="md"
                fontWeight="bold"
                color={colors.gold}
                mb={3}
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Información de la Reserva
              </Text>
              <Stack gap={3}>
                <Flex gap={3}>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Fecha de Entrada *
                    </Text>
                    <Input
                      required
                      type="datetime-local"
                      value={formData.checkInTime}
                      onChange={(e) => handleChange("checkInTime", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      min={today}
                    />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Fecha de Salida
                    </Text>
                    <Input
                      type="datetime-local"
                      value={formData.checkOutTime}
                      onChange={(e) => handleChange("checkOutTime", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      min={formData.checkInTime || today}
                    />
                  </Box>
                </Flex>

                <Flex gap={3}>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Número de Huéspedes
                    </Text>
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      value={formData.numberOfGuests}
                      onChange={(e) => handleChange("numberOfGuests", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" color={colors.subtext} mb={1}>
                      Consumo de Snacks (COP)
                    </Text>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.snackConsumption}
                      onChange={(e) => handleChange("snackConsumption", e.target.value)}
                      bg={colors.bg}
                      borderColor={colors.border}
                      color={colors.text}
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    />
                  </Box>
                </Flex>

                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Método de Pago
                  </Text>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleChange("paymentMethod", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "6px",
                      color: colors.text,
                      fontSize: "14px",
                    }}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                  </select>
                </Box>

                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Solicitudes Especiales
                  </Text>
                  <Textarea
                    value={formData.specialRequests}
                    onChange={(e) => handleChange("specialRequests", e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    placeholder="Ej: Cama extra, cuna, etc."
                    maxLength={500}
                    rows={3}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" color={colors.subtext} mb={1}>
                    Notas
                  </Text>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    bg={colors.bg}
                    borderColor={colors.border}
                    color={colors.text}
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    placeholder="Notas adicionales..."
                    maxLength={500}
                    rows={3}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Precio */}
            <Box
              bg={colors.bg}
              p={4}
              borderRadius="md"
              borderWidth="1px"
              borderColor={colors.border}
            >
              <Flex justify="space-between" align="center">
                <Text fontSize="md" fontWeight="bold" color={colors.text}>
                  Precio por Noche:
                </Text>
                <Text fontSize="xl" fontWeight="bold" color={colors.gold}>
                  ${roomPrice.toFixed(2)}
                </Text>
              </Flex>
            </Box>

            {/* Botones */}
            <Flex gap={3} justify="flex-end" mt={4}>
              <Button
                type="button"
                variant="outline"
                borderColor={colors.border}
                color={colors.text}
                onClick={onClose}
                _hover={{ bg: colors.surface, borderColor: colors.gold, color: colors.gold }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                bg={colors.gold}
                color={colors.bg}
                fontWeight="bold"
                _hover={{ bg: "#b8941f", transform: "translateY(-2px)" }}
                disabled={isLoading}
                boxShadow={`0 2px 8px ${colors.gold}50`}
              >
                {isLoading ? "Guardando..." : "Confirmar Reserva"}
              </Button>
            </Flex>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}

