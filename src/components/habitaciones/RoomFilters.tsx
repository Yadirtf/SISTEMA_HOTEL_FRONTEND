"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";

interface RoomFiltersProps {
  floorFilter: string;
  typeFilter: string;
  statusFilter: string;
  onFloorChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const typeToEs: Record<string, string> = { 
  single: "Individual", 
  double: "Doble", 
  suite: "Suite",
  all: "Todos los tipos"
};

export function RoomFilters({
  floorFilter,
  typeFilter,
  statusFilter,
  onFloorChange,
  onTypeChange,
  onStatusChange,
}: RoomFiltersProps) {
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
          Filtrar por Piso
        </Text>
        <select
          value={floorFilter}
          onChange={(e) => onFloorChange(e.target.value)}
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
            Todos los pisos
          </option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((floor) => (
            <option key={floor} value={floor.toString()} style={{ backgroundColor: colors.surface, color: colors.text }}>
              Piso {floor}
            </option>
          ))}
        </select>
      </Box>
      
      <Box w={{ base: "100%", md: "auto" }}>
        <Text color={colors.gold} mb={1} fontSize="sm" fontWeight="semibold">
          Filtrar por Tipo
        </Text>
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
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
            {typeToEs.all}
          </option>
          <option value="single" style={{ backgroundColor: colors.surface, color: colors.text }}>
            {typeToEs.single}
          </option>
          <option value="double" style={{ backgroundColor: colors.surface, color: colors.text }}>
            {typeToEs.double}
          </option>
          <option value="suite" style={{ backgroundColor: colors.surface, color: colors.text }}>
            {typeToEs.suite}
          </option>
        </select>
      </Box>

      <Box w={{ base: "100%", md: "auto" }}>
        <Text color={colors.gold} mb={1} fontSize="sm" fontWeight="semibold">
          Estado de Habitación
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
            Todas
          </option>
          <option value="active" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Activas
          </option>
          <option value="inactive" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Desactivadas
          </option>
        </select>
      </Box>
    </Flex>
  );
}

