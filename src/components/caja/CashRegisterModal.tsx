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
import type { CashRegisterFormData } from "@/app/caja/types";
import { formatNumberInput, parseFormattedNumber } from "@/lib/format";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/session";

type UsuarioListItem = {
  idUsuario: number;
  correo: string;
  rol: "Administrador" | "Recepcionista" | string;
  estado: "Activo" | "Inactivo" | string;
  createDate: string;
  persona: null | { nombre: string; apellido: string; telefono: string };
};

interface CashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  formData: CashRegisterFormData;
  onFormChange: (field: keyof CashRegisterFormData, value: any) => void;
  isLoading?: boolean;
}

export function CashRegisterModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  onFormChange,
  isLoading = false,
}: CashRegisterModalProps) {
  const { colors } = useThemeMode();
  const [receptionists, setReceptionists] = useState<UsuarioListItem[]>([]);
  const [loadingReceptionists, setLoadingReceptionists] = useState(false);
  const token = getToken();

  // Cargar recepcionistas cuando se abre el modal
  useEffect(() => {
    const loadReceptionists = async () => {
      if (isOpen && !isEditing) {
        setLoadingReceptionists(true);
        try {
          const resp = await apiGet<UsuarioListItem[]>(`/auth/usuarios`, token || undefined);
          if (resp.success && resp.data) {
            // Filtrar solo recepcionistas activos
            const activeReceptionists = resp.data.filter(
              (user) => user.rol === "Recepcionista" && user.estado === "Activo"
            );
            setReceptionists(activeReceptionists);
          }
        } catch (error) {
          console.error("Error al cargar recepcionistas:", error);
        } finally {
          setLoadingReceptionists(false);
        }
      }
    };
    loadReceptionists();
  }, [isOpen, isEditing, token]);
  
  if (!isOpen) return null;

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
    >
      <Box
        bg={colors.surface}
        borderColor={colors.border}
        borderWidth="2px"
        borderRadius="lg"
        p={6}
        maxW="600px"
        w="100%"
        maxH="90vh"
        overflowY="auto"
        boxShadow="0 8px 16px rgba(0, 0, 0, 0.5)"
      >
        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={colors.gold} mb={4}>
          {isEditing ? "Editar Caja" : "Abrir Caja"}
        </Text>

        <Stack gap={4}>
          <Box>
            <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
              Número de Caja *
            </Text>
            <Input
              value={formData.registerNumber}
              onChange={(e) => onFormChange("registerNumber", e.target.value.toUpperCase())}
              placeholder="Ej: CAJA-001"
              bg={colors.bg}
              color={colors.text}
              borderColor={colors.border}
              _hover={{ borderColor: colors.gold }}
              _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
              disabled={isLoading || isEditing}
            />
          </Box>

          <Box>
            <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
              Recepcionista *
            </Text>
            <select
              value={formData.userId || ""}
              onChange={(e) => onFormChange("userId", parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                backgroundColor: colors.bg,
                color: colors.text,
                borderRadius: '6px',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                fontSize: '14px',
                cursor: (isLoading || isEditing || loadingReceptionists) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || isEditing || loadingReceptionists) ? 0.6 : 1,
              }}
              disabled={isLoading || isEditing || loadingReceptionists}
            >
              <option value="">
                {loadingReceptionists ? "Cargando recepcionistas..." : "Seleccione un recepcionista"}
              </option>
              {receptionists.map((receptionist) => (
                <option key={receptionist.idUsuario} value={receptionist.idUsuario}>
                  {receptionist.persona
                    ? `${receptionist.persona.nombre} ${receptionist.persona.apellido} (${receptionist.correo})`
                    : receptionist.correo}
                </option>
              ))}
            </select>
            {receptionists.length === 0 && !loadingReceptionists && (
              <Text color={colors.subtext} fontSize="xs" mt={1}>
                No hay recepcionistas activos disponibles
              </Text>
            )}
          </Box>

          <Box>
            <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
              Monto Inicial *
            </Text>
            <Input
              type="text"
              value={formData.initialAmount ? formatNumberInput(formData.initialAmount.toString()) : ""}
              onChange={(e) => {
                const formatted = formatNumberInput(e.target.value);
                const parsed = parseFormattedNumber(formatted);
                onFormChange("initialAmount", parsed);
              }}
              placeholder="0"
              bg={colors.bg}
              color={colors.text}
              borderColor={colors.border}
              _hover={{ borderColor: colors.gold }}
              _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
              disabled={isLoading || isEditing}
            />
          </Box>

          <Box>
            <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
              Notas
            </Text>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => onFormChange("notes", e.target.value)}
              placeholder="Notas adicionales..."
              bg={colors.bg}
              color={colors.text}
              borderColor={colors.border}
              _hover={{ borderColor: colors.gold }}
              _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
              disabled={isLoading}
              rows={3}
            />
          </Box>

          <Flex gap={3} justify="flex-end" pt={4} borderTop="2px" borderColor={colors.border}>
            <Button
              onClick={onClose}
              bg={colors.border}
              color={colors.text}
              _hover={{ bg: colors.subtext }}
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
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : (isEditing ? "Actualizar" : "Abrir Caja")}
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}

