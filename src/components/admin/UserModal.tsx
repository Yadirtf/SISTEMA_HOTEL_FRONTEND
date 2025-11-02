"use client";

import {
  Button,
  Flex,
  Stack,
  Input,
  Text,
  Box,
} from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";

export type UserFormData = {
  correo: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rol: "Administrador" | "Recepcionista";
  estado: "Activo" | "Inactivo";
};

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: UserFormData;
  onFormChange: (field: keyof UserFormData, value: any) => void;
  isLoading?: boolean;
}

export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  isLoading = false,
}: UserModalProps) {
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
        w={{ base: "95%", md: "90%" }}
        maxW="600px"
        maxH="90vh"
        overflowY="auto"
        boxShadow={`0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px ${colors.border}`}
        onClick={(e) => e.stopPropagation()}
        m={{ base: 2, md: 0 }}
      >
        {/* Header */}
        <Box
          p={{ base: 4, md: 6 }}
          borderBottom="2px"
          borderColor={colors.border}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bg={colors.bg}
          flexWrap="wrap"
          gap={2}
        >
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={colors.gold}>
            Crear Usuario
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
        <Box p={{ base: 4, md: 6 }}>
          <Stack gap={5}>
            <Flex gap={4} flexWrap="wrap">
              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Nombre *
                </Text>
                <Input
                  value={formData.nombre}
                  onChange={(e) => onFormChange("nombre", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Ej: Juan"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>

              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Apellido *
                </Text>
                <Input
                  value={formData.apellido}
                  onChange={(e) => onFormChange("apellido", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Ej: Pérez"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>
            </Flex>

            <Flex gap={4} flexWrap="wrap">
              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Correo Electrónico *
                </Text>
                <Input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => onFormChange("correo", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Ej: usuario@hotel.com"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>

              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Teléfono *
                </Text>
                <Input
                  value={formData.telefono}
                  onChange={(e) => onFormChange("telefono", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Ej: 3001234567"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>
            </Flex>

            <Box>
              <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                Contraseña *
              </Text>
              <Input
                type="password"
                value={formData.contrasena}
                onChange={(e) => onFormChange("contrasena", e.target.value)}
                bg={colors.bg}
                color={colors.text}
                borderColor={colors.border}
                placeholder="Mínimo 6 caracteres"
                _hover={{ borderColor: colors.gold }}
                _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                _placeholder={{ color: colors.subtext }}
              />
            </Box>

            <Flex gap={4} flexWrap="wrap">
              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Rol *
                </Text>
                <select
                  value={formData.rol}
                  onChange={(e) => onFormChange("rol", e.target.value)}
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
                  <option value="Recepcionista" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    Recepcionista
                  </option>
                  <option value="Administrador" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    Administrador
                  </option>
                </select>
              </Box>

              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Estado *
                </Text>
                <select
                  value={formData.estado}
                  onChange={(e) => onFormChange("estado", e.target.value)}
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
                  <option value="Activo" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    Activo
                  </option>
                  <option value="Inactivo" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    Inactivo
                  </option>
                </select>
              </Box>
            </Flex>

            <Flex gap={3} justify="flex-end" pt={2} direction={{ base: "column", md: "row" }}>
              <Button
                variant="outline"
                onClick={onClose}
                borderColor={colors.border}
                color={colors.subtext}
                _hover={{ bg: colors.surface, borderColor: colors.gold, color: colors.gold }}
                transition="all 0.2s"
                w={{ base: "100%", md: "auto" }}
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
                w={{ base: "100%", md: "auto" }}
              >
                {isLoading ? "Creando..." : "Crear Usuario"}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

