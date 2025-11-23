import { Box, Button, Flex, Input, Text, Icon } from "@chakra-ui/react";
import { FiSearch, FiRefreshCw, FiBriefcase } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";

type CompaniesHeaderProps = {
  statusFilter: string;
  searchQuery: string;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  loading: boolean;
  stats?: {
    totalCompanies: number;
    activeCompanies: number;
  } | null;
};

export function CompaniesHeader({
  statusFilter,
  searchQuery,
  onStatusChange,
  onSearchChange,
  onRefresh,
  onCreate,
  loading,
  stats,
}: CompaniesHeaderProps) {
  const { colors } = useThemeMode();

  return (
    <Flex
      justify="space-between"
      align={{ base: "stretch", md: "end" }}
      direction={{ base: "column", md: "row" }}
      gap={4}
      p={{ base: 3, md: 5 }}
      bg={colors.surface}
      borderRadius="lg"
      borderWidth="2px"
      borderColor={colors.border}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        flex="1"
        w={{ base: "100%", md: "auto" }}
      >
        {/* Búsqueda */}
        <Box flex="1" minW={{ base: "100%", md: "250px" }}>
          <Input
            placeholder="Buscar por nombre, NIT, contacto..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            bg={colors.bg}
            color={colors.text}
            borderColor={colors.border}
            _hover={{ borderColor: colors.gold }}
            _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
            _placeholder={{ color: colors.subtext }}
          />
        </Box>

        {/* Filtro de Estado */}
        <Box minW={{ base: "100%", md: "150px" }}>
          <Text color={colors.gold} mb={1} fontSize="sm" fontWeight="semibold">
            Estado
          </Text>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: colors.bg,
              color: colors.text,
              borderRadius: '6px',
              padding: '8px 12px',
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
            <option value="all" style={{ backgroundColor: colors.bg, color: colors.text }}>
              Todas ({stats?.totalCompanies || 0})
            </option>
            <option value="active" style={{ backgroundColor: colors.bg, color: colors.text }}>
              Activas ({stats?.activeCompanies || 0})
            </option>
            <option value="inactive" style={{ backgroundColor: colors.bg, color: colors.text }}>
              Inactivas
            </option>
          </select>
        </Box>
      </Flex>

      {/* Acciones */}
      <Flex gap={2} align={{ base: "stretch", md: "end" }}>
        <Button
          onClick={onRefresh}
          variant="outline"
          borderColor={colors.border}
          color={colors.subtext}
          _hover={{ borderColor: colors.gold, color: colors.gold }}
          disabled={loading}
          minW={{ base: "100%", md: "auto" }}
        >
          <Flex align="center" gap={2}>
            <Icon as={FiRefreshCw} />
            <Text>Actualizar</Text>
          </Flex>
        </Button>
        <Button
          onClick={onCreate}
          bg={colors.gold}
          color={colors.bg}
          fontWeight="bold"
          _hover={{ bg: "#b8941f", transform: "translateY(-2px)" }}
          minW={{ base: "100%", md: "auto" }}
        >
          <Flex align="center" gap={2}>
            <Icon as={FiBriefcase} />
            <Text>Registrar Empresa</Text>
          </Flex>
        </Button>
      </Flex>
    </Flex>
  );
}

