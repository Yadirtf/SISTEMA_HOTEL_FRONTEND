import { Box, Button, Flex, Input } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { StatusSelect } from "@/components/common/StatusSelect";

type CashRegistersHeaderProps = {
  statusFilter: string;
  searchQuery: string;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onCreate?: () => void; // Opcional: solo admin puede crear
  loading: boolean;
};

export function CashRegistersHeader({
  statusFilter,
  searchQuery,
  onStatusChange,
  onSearchChange,
  onRefresh,
  onCreate,
  loading,
}: CashRegistersHeaderProps) {
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
            placeholder="Buscar por número de caja, usuario..."
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
          <StatusSelect
            value={statusFilter}
            onChange={onStatusChange}
            label="Estado"
            options={[
              { value: "all", label: "Todas" },
              { value: "open", label: "Abiertas" },
              { value: "closed", label: "Cerradas" },
              { value: "suspended", label: "Suspendidas" },
            ]}
          />
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
        {onCreate && (
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
            Abrir Caja
          </Button>
        )}
      </Flex>
    </Flex>
  );
}

