"use client";

import {
  Button,
  Flex,
  Stack,
  Input,
  Textarea,
  Text,
  Box,
  Icon,
} from "@chakra-ui/react";
import { FiX, FiXCircle, FiCheckCircle } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import type { CompanyFormData } from "@/app/huespedes/types";

export type { CompanyFormData };

interface CompaniesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  formData: CompanyFormData;
  onFormChange: (field: keyof CompanyFormData, value: any) => void;
  isLoading?: boolean;
}

export function CompaniesModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  onFormChange,
  isLoading = false,
}: CompaniesModalProps) {
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
            {isEditing ? "Editar Empresa" : "Registrar Empresa"}
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
            <Icon as={FiX} fontSize="xl" />
          </Button>
        </Box>

        {/* Body */}
        <Box p={{ base: 4, md: 6 }}>
          <Stack gap={5}>
            {/* Información Básica */}
            <Text fontSize="md" fontWeight="bold" color={colors.gold} mb={2}>
              Información de la Empresa
            </Text>

            <Flex gap={4} flexWrap="wrap">
              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Nombre de la Empresa *
                </Text>
                <Input
                  value={formData.name}
                  onChange={(e) => onFormChange("name", e.target.value)}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Nombre de la empresa"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>

              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  NIT *
                </Text>
                <Input
                  value={formData.nit}
                  onChange={(e) => onFormChange("nit", e.target.value.toUpperCase())}
                  bg={colors.bg}
                  color={colors.text}
                  borderColor={colors.border}
                  placeholder="Ej: 900123456-1"
                  _hover={{ borderColor: colors.gold }}
                  _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                  _placeholder={{ color: colors.subtext }}
                />
              </Box>
            </Flex>

            <Box>
              <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                Dirección
              </Text>
              <Input
                value={formData.address || ""}
                onChange={(e) => onFormChange("address", e.target.value)}
                bg={colors.bg}
                color={colors.text}
                borderColor={colors.border}
                placeholder="Dirección de la empresa"
                _hover={{ borderColor: colors.gold }}
                _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
                _placeholder={{ color: colors.subtext }}
              />
            </Box>

            <Flex gap={4} flexWrap="wrap">
              <Box flex="1" minW={{ base: "100%", md: "200px" }}>
                <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
                  Contacto
                </Text>
                <Input
                  value={formData.contact || ""}
                  onChange={(e) => onFormChange("contact", e.target.value)}
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
                  Teléfono
                </Text>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => onFormChange("phone", e.target.value)}
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
                Email
              </Text>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => onFormChange("email", e.target.value)}
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
                Notas
              </Text>
              <Textarea
                value={formData.notes || ""}
                onChange={(e) => onFormChange("notes", e.target.value)}
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
                <Flex align="center" gap={2}>
                  <Icon as={FiXCircle} />
                  <Text>Cancelar</Text>
                </Flex>
              </Button>
              <Button
                onClick={onSubmit}
                bg={colors.gold}
                color={colors.bg}
                fontWeight="bold"
                _hover={{ bg: "#b8941f", transform: "translateY(-2px)" }}
                disabled={isLoading}
              >
                <Flex align="center" gap={2}>
                  <Icon as={FiCheckCircle} />
                  <Text>{isLoading ? (isEditing ? "Actualizando..." : "Registrando...") : (isEditing ? "Actualizar" : "Registrar")}</Text>
                </Flex>
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

