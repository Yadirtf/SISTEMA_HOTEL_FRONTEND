"use client";

import {
  Button,
  Flex,
  Stack,
  Input,
  Textarea,
  Text,
  Box,
} from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";

export type RoomFormData = {
  number: string;
  type: "single" | "double" | "suite";
  pricePerNight: number;
  floor: number;
  maxOccupancy: number;
  description: string;
  status: "available" | "occupied" | "maintenance" | "cleaning";
};

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  formData: RoomFormData;
  onFormChange: (field: keyof RoomFormData, value: any) => void;
  isLoading?: boolean;
}

const typeToEs: Record<string, string> = {
  single: "Individual",
  double: "Doble",
  suite: "Suite",
};

const statusToEs: Record<string, string> = {
  available: "Disponible",
  occupied: "Ocupada",
  maintenance: "Mantenimiento",
  cleaning: "Limpieza",
};

export function RoomModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  onFormChange,
  isLoading = false,
}: RoomModalProps) {
  const { colors } = useThemeMode();
  
  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(0, 0, 0, 0.8)"
      backdropFilter="blur(3px)"
      onClick={onClose}
    >
      <Box
        bg={colors.surface}
        color={colors.text}
        borderRadius="lg"
        w="90%"
        maxW="600px"
        maxH="90vh"
        overflowY="auto"
        boxShadow={`0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px ${colors.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box
          p={6}
          borderBottom="2px"
          borderColor={colors.border}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bg={colors.bg}
        >
          <Text fontSize="xl" fontWeight="bold" color={colors.gold}>
            {isEditing ? "Editar Habitación" : "Registrar Habitación"}
          </Text>
          <Button
            variant="ghost"
            onClick={onClose}
            color={colors.subtext}
            _hover={{ color: colors.gold, bg: colors.surface }}
            size="sm"
            minW="auto"
            h="auto"
            p={2}
            transition="all 0.2s"
          >
            ×
          </Button>
        </Box>

        {/* Body */}
        <Box p={6}>
          <Stack gap={5}>
            <Flex gap={4} flexWrap="wrap">
              <Box flex="1" minW="200px">
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Número de Habitación *
                </Text>
                <Input
                  value={formData.number}
                  onChange={(e) => onFormChange("number", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Ej: 101"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>

              <Box flex="1" minW="200px">
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Tipo de Habitación *
                </Text>
                <select
                  value={formData.type}
                  onChange={(e) => onFormChange("type", e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: colors.bg,
                    color: colors.text,
                    borderRadius: "6px",
                    padding: "8px 12px",
                    border: `1px solid ${colors.border}`,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.gold;
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.gold}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="single" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    {typeToEs.single}
                  </option>
                  <option value="double" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    {typeToEs.double}
                  </option>
                  <option value="suite" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    {typeToEs.suite}
                  </option>
                </select>
              </Box>
            </Flex>

            <Flex gap={4} flexWrap="wrap">
              <Box flex="1" minW="200px">
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Precio por Noche *
                </Text>
                <Input
                  type="number"
                  value={formData.pricePerNight || ""}
                  onChange={(e) => onFormChange("pricePerNight", Number(e.target.value))}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>

              <Box flex="1" minW="200px">
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Piso *
                </Text>
                <Input
                  type="number"
                  value={formData.floor || ""}
                  onChange={(e) => onFormChange("floor", Number(e.target.value))}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="1"
                  min="1"
                  max="20"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>

              <Box flex="1" minW="200px">
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Capacidad Máxima *
                </Text>
                <Input
                  type="number"
                  value={formData.maxOccupancy || ""}
                  onChange={(e) => onFormChange("maxOccupancy", Number(e.target.value))}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="1"
                  min="1"
                  max="6"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>

              <Box flex="1" minW="200px">
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Estado *
                </Text>
                <select
                  value={formData.status}
                  onChange={(e) => onFormChange("status", e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: colors.bg,
                    color: colors.text,
                    borderRadius: "6px",
                    padding: "8px 12px",
                    border: `1px solid ${colors.border}`,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.gold;
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.gold}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="available" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    {statusToEs.available}
                  </option>
                  <option value="occupied" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    {statusToEs.occupied}
                  </option>
                  <option value="maintenance" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    {statusToEs.maintenance}
                  </option>
                  <option value="cleaning" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    {statusToEs.cleaning}
                  </option>
                </select>
              </Box>
            </Flex>

            <Box>
              <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                Descripción
              </Text>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => onFormChange("description", e.target.value)}
                bg={colors.bg}
                color={colors.text}
                borderColor={colors.border}
                placeholder="Ingrese una descripción de la habitación..."
                rows={4}
                resize="vertical"
                _hover={{ borderColor: colors.gold }}
                _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                _placeholder={{ color: colors.subtext }}
              />
            </Box>

            <Flex gap={3} justify="flex-end" pt={2}>
              <Button
                variant="outline"
                onClick={onClose}
                borderColor={colors.border}
                color={colors.subtext}
                _hover={{ bg: colors.surface, borderColor: colors.gold, color: colors.gold }}
                transition="all 0.2s"
              >
                Cancelar
              </Button>
              <Button
                bg={colors.gold}
                color={colors.bg}
                onClick={onSubmit}
                disabled={isLoading}
                _hover={{ 
                  bg: "#b8941f",
                  transform: "translateY(-2px)",
                  boxShadow: `0 4px 12px ${colors.gold}40`
                }}
                _disabled={{
                  opacity: 0.6,
                  cursor: "not-allowed",
                }}
                transition="all 0.2s"
                fontWeight="bold"
                boxShadow={`0 2px 8px ${colors.gold}50`}
              >
                {isLoading ? (isEditing ? "Actualizando..." : "Registrando...") : (isEditing ? "Actualizar" : "Registrar")}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
