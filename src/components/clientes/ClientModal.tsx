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
import type { ClientFormData } from "@/app/huespedes/types";

export type { ClientFormData };

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  formData: ClientFormData;
  onFormChange: (field: keyof ClientFormData, value: any) => void;
  isLoading?: boolean;
}

export function ClientModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  onFormChange,
  isLoading = false,
}: ClientModalProps) {
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
        maxW="700px"
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
            {isEditing ? "Editar Huésped" : "Registrar Huésped"}
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
            {/* Información Básica */}
            <Text fontSize="md" fontWeight="bold" color={colors.gold} mb={2}>
              Información Personal
            </Text>

            <Flex gap={4} flexWrap="wrap">
              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Número de Documento *
                </Text>
                <Input
                  value={formData.documentNumber}
                  onChange={(e) => onFormChange("documentNumber", e.target.value.toUpperCase())}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Ej: 1234567890"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                  disabled={isEditing}
                />
              </Box>
            </Flex>

            <Flex gap={4} flexWrap="wrap">
              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Nombre *
                </Text>
                <Input
                  value={formData.firstName}
                  onChange={(e) => onFormChange("firstName", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Nombre"
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
                  value={formData.lastName}
                  onChange={(e) => onFormChange("lastName", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Apellido"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>
            </Flex>

            <Flex gap={4} flexWrap="wrap">
              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Teléfono *
                </Text>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => onFormChange("phoneNumber", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Ej: 3001234567"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>

              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Email
                </Text>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => onFormChange("email", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="correo@ejemplo.com"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>
            </Flex>

            <Flex gap={4} flexWrap="wrap">
              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Origen
                </Text>
                <Input
                  value={formData.origin || ""}
                  onChange={(e) => onFormChange("origin", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Ciudad/País"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>

              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Profesión
                </Text>
                <Input
                  value={formData.profession || ""}
                  onChange={(e) => onFormChange("profession", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Profesión"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>
            </Flex>

            <Box>
              <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                Notas
              </Text>
              <Textarea
                value={formData.notes || ""}
                onChange={(e) => onFormChange("notes", e.target.value)}
                bg={colors.bg}
                color={colors.text}
                borderColor={colors.border}
                placeholder="Notas adicionales sobre el cliente..."
                _hover={{ borderColor: colors.gold }}
                _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                _placeholder={{ color: colors.subtext }}
                rows={3}
              />
            </Box>

            <Box borderTop="1px" borderColor={colors.border} pt={4} />

            {/* Información de Empresa */}
            <Box>
              <Flex gap={2} align="center">
                <input
                  type="checkbox"
                  checked={formData.isCompanyClient || false}
                  onChange={(e) => onFormChange("isCompanyClient", e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: colors.gold,
                  }}
                />
                <Text color={colors.gold} fontWeight="bold" fontSize="md">
                  Cliente de Empresa
                </Text>
              </Flex>
            </Box>

            {formData.isCompanyClient && (
              <Stack gap={4} pl={4} borderLeft="2px" borderColor={colors.gold}>
                <Text fontSize="md" fontWeight="bold" color={colors.gold} mb={2}>
                  Información de Empresa
                </Text>

                <Box>
                  <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                    Nombre de la Empresa *
                  </Text>
                  <Input
                    value={formData.companyName || ""}
                    onChange={(e) => onFormChange("companyName", e.target.value)}
                    bg={colors.bg}
                    color={colors.text}
                    borderColor={colors.border}
                    placeholder="Nombre de la empresa"
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    _placeholder={{ color: colors.subtext }}
                  />
                </Box>

                <Flex gap={4} flexWrap="wrap">
                  <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                    <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                      Contacto en la Empresa
                    </Text>
                    <Input
                      value={formData.companyContact || ""}
                      onChange={(e) => onFormChange("companyContact", e.target.value)}
                      bg={colors.bg}
                      color={colors.text}
                      borderColor={colors.border}
                      placeholder="Nombre del contacto"
                      _hover={{ borderColor: colors.gold }}
                      _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                      _placeholder={{ color: colors.subtext }}
                    />
                  </Box>

                  <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                    <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                      Teléfono de la Empresa
                    </Text>
                    <Input
                      value={formData.companyPhone || ""}
                      onChange={(e) => onFormChange("companyPhone", e.target.value)}
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
                    Email de la Empresa
                  </Text>
                  <Input
                    type="email"
                    value={formData.companyEmail || ""}
                    onChange={(e) => onFormChange("companyEmail", e.target.value)}
                    bg={colors.bg}
                    color={colors.text}
                    borderColor={colors.border}
                    placeholder="empresa@ejemplo.com"
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    _placeholder={{ color: colors.subtext }}
                  />
                </Box>

                <Box>
                  <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                    Número de Contrato
                  </Text>
                  <Input
                    value={formData.contractNumber || ""}
                    onChange={(e) => onFormChange("contractNumber", e.target.value)}
                    bg={colors.bg}
                    color={colors.text}
                    borderColor={colors.border}
                    placeholder="Número de contrato"
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    _placeholder={{ color: colors.subtext }}
                  />
                </Box>

                <Box>
                  <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                    Notas de la Empresa
                  </Text>
                  <Textarea
                    value={formData.companyNotes || ""}
                    onChange={(e) => onFormChange("companyNotes", e.target.value)}
                    bg={colors.bg}
                    color={colors.text}
                    borderColor={colors.border}
                    placeholder="Notas adicionales sobre la empresa..."
                    _hover={{ borderColor: colors.gold }}
                    _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                    _placeholder={{ color: colors.subtext }}
                    rows={3}
                  />
                </Box>
              </Stack>
            )}

            {/* Footer */}
            <Flex gap={3} justify="flex-end" pt={4} borderTop="2px" borderColor={colors.border}>
              <Button
                onClick={onClose}
                variant="outline"
                borderColor={colors.border}
                color={colors.subtext}
                _hover={{ borderColor: colors.gold, color: colors.gold }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={onSubmit}
                bg={colors.gold}
                color={colors.bg}
                fontWeight="bold"
                _hover={{ bg: "#b8941f", transform: "translateY(-2px)" }}
                isLoading={isLoading}
                loadingText={isEditing ? "Actualizando..." : "Registrando..."}
              >
                {isEditing ? "Actualizar" : "Registrar"}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

