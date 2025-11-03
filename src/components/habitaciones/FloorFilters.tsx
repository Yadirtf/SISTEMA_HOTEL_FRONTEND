"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";

interface FloorFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function FloorFilters({
  statusFilter,
  onStatusChange,
}: FloorFiltersProps) {
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
          Estado de Piso
        </Text>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
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
            Todos
          </option>
          <option value="active" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Activos
          </option>
          <option value="inactive" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Desactivados
          </option>
        </select>
      </Box>
    </Flex>
  );
}

