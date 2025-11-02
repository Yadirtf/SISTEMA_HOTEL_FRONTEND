"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";

interface UserFiltersProps {
  rolFilter: string;
  estadoFilter: string;
  onRolChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
}

export function UserFilters({
  rolFilter,
  estadoFilter,
  onRolChange,
  onEstadoChange,
}: UserFiltersProps) {
  const { colors } = useThemeMode();
  
  return (
    <Flex 
      gap={4} 
      align="end" 
      flexWrap="wrap"
      direction={{ base: "column", md: "row" }}
      w={{ base: "100%", md: "auto" }}
    >
      <Box w={{ base: "100%", md: "auto" }}>
        <Text color={colors.gold} mb={1} fontSize="sm" fontWeight="semibold">
          Filtrar por Rol
        </Text>
        <select
          value={rolFilter}
          onChange={(e) => onRolChange(e.target.value)}
          style={{
            width: '100%',
            minWidth: '180px',
            backgroundColor: colors.surface,
            color: colors.text,
            borderRadius: '6px',
            padding: '8px',
            border: `1px solid ${colors.border}`,
            fontSize: '14px',
            cursor: 'pointer',
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
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="all" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Todos los roles
          </option>
          <option value="Administrador" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Administrador
          </option>
          <option value="Recepcionista" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Recepcionista
          </option>
        </select>
      </Box>
      
      <Box w={{ base: "100%", md: "auto" }}>
        <Text color={colors.gold} mb={1} fontSize="sm" fontWeight="semibold">
          Filtrar por Estado
        </Text>
        <select
          value={estadoFilter}
          onChange={(e) => onEstadoChange(e.target.value)}
          style={{
            width: '100%',
            minWidth: '180px',
            backgroundColor: colors.surface,
            color: colors.text,
            borderRadius: '6px',
            padding: '8px',
            border: `1px solid ${colors.border}`,
            fontSize: '14px',
            cursor: 'pointer',
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
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="all" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Todos los estados
          </option>
          <option value="Activo" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Activo
          </option>
          <option value="Inactivo" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Inactivo
          </option>
        </select>
      </Box>
    </Flex>
  );
}

