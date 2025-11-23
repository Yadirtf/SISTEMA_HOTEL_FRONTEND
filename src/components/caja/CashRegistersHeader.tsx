import { Box, Button, Flex, Input, Icon, Text } from "@chakra-ui/react";
import { FiRefreshCw, FiPlus } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { StatusSelect } from "@/components/common/StatusSelect";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/session";

type UsuarioListItem = {
  idUsuario: number;
  correo: string;
  rol: "Administrador" | "Recepcionista" | string;
  estado: "Activo" | "Inactivo" | string;
  persona: null | { nombre: string; apellido: string; telefono: string };
};

type CashRegistersHeaderProps = {
  statusFilter: string;
  searchQuery: string;
  userIdFilter: string;
  startDateFilter: string;
  endDateFilter: string;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onUserIdChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onRefresh: () => void;
  onCreate?: () => void;
  loading: boolean;
};

export function CashRegistersHeader({
  statusFilter,
  searchQuery,
  userIdFilter,
  startDateFilter,
  endDateFilter,
  onStatusChange,
  onSearchChange,
  onUserIdChange,
  onStartDateChange,
  onEndDateChange,
  onRefresh,
  onCreate,
  loading,
}: CashRegistersHeaderProps) {
  const { colors } = useThemeMode();
  const [receptionists, setReceptionists] = useState<UsuarioListItem[]>([]);
  const [loadingReceptionists, setLoadingReceptionists] = useState(false);
  const token = getToken();

  useEffect(() => {
    const loadReceptionists = async () => {
      setLoadingReceptionists(true);
      try {
        const resp = await apiGet<UsuarioListItem[]>(`/auth/usuarios`, token || undefined);
        if (resp.success && resp.data) {
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
    };
    loadReceptionists();
  }, [token]);

  return (
    <Flex
      direction="column"
      gap={4}
      p={{ base: 3, md: 5 }}
      bg={colors.surface}
      borderRadius="lg"
      borderWidth="2px"
      borderColor={colors.border}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
    >
      {/* Primera fila: Búsqueda y Estado */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        w="100%"
      >
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

        <Box minW={{ base: "100%", md: "200px" }}>
          <select
            value={userIdFilter}
            onChange={(e) => onUserIdChange(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: colors.bg,
              color: colors.text,
              borderRadius: '6px',
              padding: '8px 12px',
              border: `1px solid ${colors.border}`,
              fontSize: '14px',
              cursor: loadingReceptionists ? 'not-allowed' : 'pointer',
              opacity: loadingReceptionists ? 0.6 : 1,
            }}
            disabled={loadingReceptionists}
          >
            <option value="all">
              {loadingReceptionists ? "Cargando..." : "Todos los recepcionistas"}
            </option>
            {receptionists.map((receptionist) => (
              <option key={receptionist.idUsuario} value={receptionist.idUsuario.toString()}>
                {receptionist.persona
                  ? `${receptionist.persona.nombre} ${receptionist.persona.apellido}`
                  : receptionist.correo}
              </option>
            ))}
          </select>
        </Box>
      </Flex>

      {/* Segunda fila: Filtros de fecha */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        w="100%"
      >
        <Box flex="1" minW={{ base: "100%", md: "200px" }}>
          <Input
            type="date"
            placeholder="Fecha inicio"
            value={startDateFilter}
            onChange={(e) => onStartDateChange(e.target.value)}
            bg={colors.bg}
            color={colors.text}
            borderColor={colors.border}
            _hover={{ borderColor: colors.gold }}
            _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
            fontSize="sm"
          />
        </Box>

        <Box flex="1" minW={{ base: "100%", md: "200px" }}>
          <Input
            type="date"
            placeholder="Fecha fin"
            value={endDateFilter}
            onChange={(e) => onEndDateChange(e.target.value)}
            bg={colors.bg}
            color={colors.text}
            borderColor={colors.border}
            _hover={{ borderColor: colors.gold }}
            _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
            fontSize="sm"
          />
        </Box>

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
            <Flex align="center" gap={2}>
              <Icon as={FiRefreshCw} />
              <Text>{loading ? "Cargando..." : "Refrescar"}</Text>
            </Flex>
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
              <Flex align="center" gap={2}>
                <Icon as={FiPlus} />
                <Text>Crear Caja</Text>
              </Flex>
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
