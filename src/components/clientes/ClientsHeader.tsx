import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";

type ClientsHeaderProps = {
  statusFilter: string;
  clientTypeFilter: string;
  searchQuery: string;
  onStatusChange: (value: string) => void;
  onClientTypeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  loading: boolean;
  stats?: {
    totalClients: number;
    activeClients: number;
    companyClients: number;
  } | null;
};

export function ClientsHeader({
  statusFilter,
  clientTypeFilter,
  searchQuery,
  onStatusChange,
  onClientTypeChange,
  onSearchChange,
  onRefresh,
  onCreate,
  loading,
  stats,
}: ClientsHeaderProps) {
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
            placeholder="Buscar por documento, nombre, teléfono..."
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
              Todos los Estados
            </option>
            <option value="active" style={{ backgroundColor: colors.bg, color: colors.text }}>
              Activos ({stats?.activeClients || 0})
            </option>
            <option value="inactive" style={{ backgroundColor: colors.bg, color: colors.text }}>
              Inactivos
            </option>
            <option value="blacklisted" style={{ backgroundColor: colors.bg, color: colors.text }}>
              En Lista Negra
            </option>
          </select>
        </Box>

        {/* Filtro de Tipo de Cliente */}
        <Box minW={{ base: "100%", md: "180px" }}>
          <Text color={colors.gold} mb={1} fontSize="sm" fontWeight="semibold">
            Tipo
          </Text>
          <select
            value={clientTypeFilter}
            onChange={(e) => onClientTypeChange(e.target.value)}
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
              Todos los Tipos
            </option>
            <option value="company" style={{ backgroundColor: colors.bg, color: colors.text }}>
              Clientes de Empresa ({stats?.companyClients || 0})
            </option>
            <option value="regular" style={{ backgroundColor: colors.bg, color: colors.text }}>
              Clientes Regulares
            </option>
          </select>
        </Box>
      </Flex>

      <Flex 
        gap={3} 
        align="end" 
        direction={{ base: "column", md: "row" }}
        w={{ base: "100%", md: "auto" }}
      >
        <Button
          size={{ base: "md", md: "sm" }}
          onClick={onRefresh}
          disabled={loading}
          variant="outline"
          borderColor={colors.border}
          color={colors.subtext}
          bg="transparent"
          _hover={{ bg: colors.surface, borderColor: colors.gold, color: colors.gold }}
          transition="all 0.2s"
          w={{ base: "100%", md: "auto" }}
        >
          {loading ? "Cargando..." : "Refrescar"}
        </Button>
        <Button
          onClick={onCreate}
          bg={colors.gold}
          color={colors.bg}
          fontWeight="bold"
          size={{ base: "md", md: "md" }}
          _hover={{ 
            bg: "#b8941f",
            transform: "translateY(-2px)",
            boxShadow: `0 4px 12px ${colors.gold}40`
          }}
          transition="all 0.2s"
          boxShadow={`0 2px 8px ${colors.gold}50`}
          w={{ base: "100%", md: "auto" }}
        >
          Registrar Huésped
        </Button>
      </Flex>
    </Flex>
  );
}

