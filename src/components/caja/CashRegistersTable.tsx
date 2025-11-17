import { Box, Heading, Text, Badge, Button, Flex } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { CashRegister } from "../../app/caja/types";
import { formatDate, formatCurrency } from "@/lib/format";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/session";

type UsuarioListItem = {
  idUsuario: number;
  correo: string;
  persona: null | { nombre: string; apellido: string; telefono: string };
};

type CashRegistersTableProps = {
  cashRegisters: CashRegister[];
  loading: boolean;
  hasFilters: boolean;
  filteredCount: number;
  totalCount: number;
  onClose: (cashRegister: CashRegister) => void;
  onOpen?: (cashRegister: CashRegister) => void; // Opcional: solo admin
  onSuspend?: (cashRegister: CashRegister) => void; // Opcional: solo admin
  onResume?: (cashRegister: CashRegister) => void; // Opcional: solo admin
  onViewStats: (cashRegister: CashRegister) => void;
  currentUserId?: number; // ID del usuario actual
  isAdmin?: boolean; // Si es administrador
};

const statusColors: Record<string, { bg: string; color: string }> = {
  open: { bg: "green.500", color: "white" },
  closed: { bg: "gray.500", color: "white" },
  suspended: { bg: "orange.500", color: "white" },
};

export function CashRegistersTable({
  cashRegisters,
  loading,
  hasFilters,
  filteredCount,
  totalCount,
  onClose,
  onOpen,
  onSuspend,
  onResume,
  onViewStats,
  currentUserId,
  isAdmin = false,
}: CashRegistersTableProps) {
  const { colors } = useThemeMode();
  const [userNames, setUserNames] = useState<Record<number, string>>({});
  const token = getToken();

  useEffect(() => {
    const loadUserNames = async () => {
      try {
        const resp = await apiGet<UsuarioListItem[]>(`/auth/usuarios`, token || undefined);
        if (resp.success && resp.data) {
          const namesMap: Record<number, string> = {};
          resp.data.forEach((user) => {
            namesMap[user.idUsuario] = user.persona
              ? `${user.persona.nombre} ${user.persona.apellido}`
              : user.correo;
          });
          setUserNames(namesMap);
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };
    loadUserNames();
  }, [token]);

  if (loading) {
    return (
      <Box
        bg={colors.surface}
        borderColor={colors.border}
        borderWidth="2px"
        borderRadius="lg"
        p={8}
        textAlign="center"
      >
        <Text color={colors.subtext}>Cargando cajas...</Text>
      </Box>
    );
  }

  if (cashRegisters.length === 0) {
    return (
      <Box
        bg={colors.surface}
        borderColor={colors.border}
        borderWidth="2px"
        borderRadius="lg"
        p={8}
        textAlign="center"
      >
        <Text color={colors.subtext}>No se encontraron cajas</Text>
      </Box>
    );
  }


  return (
    <Box
      bg={colors.surface}
      borderColor={colors.border}
      borderWidth="2px"
      borderRadius="lg"
      p={{ base: 3, md: 5 }}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
    >
      <Heading 
        size={{ base: "sm", md: "md" }}
        color={colors.gold} 
        mb={4}
        borderBottom="2px solid"
        borderBottomColor={colors.border}
        pb={3}
        fontSize={{ base: "lg", md: "xl" }}
      >
        Listado de Cajas
        {hasFilters && (
          <Text as="span" color={colors.subtext} fontSize={{ base: "xs", md: "sm" }} fontWeight="normal" ml={2}>
            ({filteredCount} de {totalCount})
          </Text>
        )}
      </Heading>

      <Box overflowX="auto" display={{ base: "none", lg: "block" }}>
        <Box as="table" w="100%" style={{ borderCollapse: "collapse" }}>
          <Box as="thead">
            <Box as="tr" borderBottom="2px" borderColor={colors.border}>
              {["Número", "Usuario", "Monto Inicial", "Saldo Actual", "Estado", "Apertura", "Cierre", "Acciones"].map((header) => (
                <Box
                  key={header}
                  as="th"
                  textAlign="left"
                  p={3}
                  color={colors.gold}
                  fontSize="sm"
                  fontWeight="bold"
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                >
                  {header}
                </Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {cashRegisters.map((cashRegister) => (
              <Box
                key={cashRegister._id}
                as="tr"
                borderBottom="1px"
                borderColor={colors.border}
                _hover={{ bg: colors.bg }}
                transition="background 0.2s"
              >
                <Box as="td" p={3} color={colors.text} fontSize="sm" fontWeight="semibold">
                  {cashRegister.registerNumber}
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {userNames[cashRegister.userId] || `Usuario #${cashRegister.userId}`}
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {formatCurrency(cashRegister.initialAmount)}
                </Box>
                <Box as="td" p={3} color={colors.gold} fontSize="sm" fontWeight="bold">
                  {formatCurrency(cashRegister.currentBalance)}
                </Box>
                <Box as="td" p={3}>
                  <Badge
                    bg={statusColors[cashRegister.status]?.bg || "gray.500"}
                    color={statusColors[cashRegister.status]?.color || "white"}
                  >
                    {cashRegister.status === "open" ? "Abierta" : 
                     cashRegister.status === "closed" ? "Cerrada" : "Suspendida"}
                  </Badge>
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {formatDate(cashRegister.openedAt)}
                </Box>
                <Box as="td" p={3} color={colors.text} fontSize="sm">
                  {formatDate(cashRegister.closedAt)}
                </Box>
                <Box as="td" p={3}>
                  <Flex gap={2} wrap="wrap">
                    {cashRegister.status === "open" && (
                      <>
                        <Button
                          size="xs"
                          bg={colors.gold}
                          color={colors.bg}
                          onClick={() => onViewStats(cashRegister)}
                          _hover={{ 
                            bg: "#b8941f",
                            transform: "scale(1.05)"
                          }}
                          transition="all 0.2s"
                          fontWeight="semibold"
                        >
                          Estadísticas
                        </Button>
                        {/* Recepcionista solo puede cerrar su propia caja, admin puede cerrar cualquier caja */}
                        {(isAdmin || cashRegister.userId === currentUserId) && (
                          <Button
                            size="xs"
                            bg="blue.500"
                            color="white"
                            onClick={() => onClose(cashRegister)}
                            _hover={{ 
                              bg: "blue.600",
                              transform: "scale(1.05)"
                            }}
                            transition="all 0.2s"
                            fontWeight="semibold"
                          >
                            Cerrar
                          </Button>
                        )}
                        {/* Solo admin puede suspender */}
                        {isAdmin && onSuspend && (
                          <Button
                            size="xs"
                            variant="outline"
                            borderColor="orange.500"
                            color="orange.400"
                            onClick={() => onSuspend(cashRegister)}
                            _hover={{
                              borderColor: "orange.300",
                              color: "orange.300",
                              bg: "transparent"
                            }}
                            transition="all 0.2s"
                          >
                            Suspender
                          </Button>
                        )}
                      </>
                    )}
                    {cashRegister.status === "suspended" && isAdmin && onResume && (
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor="green.500"
                        color="green.400"
                        onClick={() => onResume(cashRegister)}
                        _hover={{
                          borderColor: "green.300",
                          color: "green.300",
                          bg: "transparent"
                        }}
                        transition="all 0.2s"
                      >
                        Reanudar
                      </Button>
                    )}
                    {cashRegister.status === "closed" && (
                      <>
                        {isAdmin && onOpen && (
                          <Button
                            size="xs"
                            bg="green.500"
                            color="white"
                            onClick={() => onOpen(cashRegister)}
                            _hover={{ 
                              bg: "green.600",
                              transform: "scale(1.05)"
                            }}
                            transition="all 0.2s"
                            fontWeight="semibold"
                          >
                            Abrir Caja
                          </Button>
                        )}
                        <Button
                          size="xs"
                          bg={colors.gold}
                          color={colors.bg}
                          onClick={() => onViewStats(cashRegister)}
                          _hover={{ 
                            bg: "#b8941f",
                            transform: "scale(1.05)"
                          }}
                          transition="all 0.2s"
                          fontWeight="semibold"
                        >
                          Ver Detalles
                        </Button>
                      </>
                    )}
                  </Flex>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Vista móvil */}
      <Box display={{ base: "block", lg: "none" }}>
        <Box as="div" display="flex" flexDirection="column" gap={4}>
          {cashRegisters.map((cashRegister) => (
            <Box
              key={cashRegister._id}
              p={4}
              bg={colors.bg}
              borderRadius="md"
              borderWidth="1px"
              borderColor={colors.border}
            >
              <Flex justify="space-between" align="start" mb={2}>
                <Box>
                  <Text fontWeight="bold" color={colors.text} fontSize="md">
                    {cashRegister.registerNumber}
                  </Text>
                  <Text color={colors.subtext} fontSize="sm">
                    {userNames[cashRegister.userId] || `Usuario #${cashRegister.userId}`}
                  </Text>
                </Box>
                <Badge
                  bg={statusColors[cashRegister.status]?.bg || "gray.500"}
                  color={statusColors[cashRegister.status]?.color || "white"}
                >
                  {cashRegister.status === "open" ? "Abierta" : 
                   cashRegister.status === "closed" ? "Cerrada" : "Suspendida"}
                </Badge>
              </Flex>
              <Text color={colors.subtext} fontSize="sm" mb={2}>
                Monto Inicial: {formatCurrency(cashRegister.initialAmount)}
              </Text>
              <Text color={colors.gold} fontSize="sm" fontWeight="bold" mb={2}>
                Saldo Actual: {formatCurrency(cashRegister.currentBalance)}
              </Text>
              <Text color={colors.subtext} fontSize="xs" mb={3}>
                Apertura: {formatDate(cashRegister.openedAt)}
                {cashRegister.closedAt && ` • Cierre: ${formatDate(cashRegister.closedAt)}`}
              </Text>
              <Flex gap={2} wrap="wrap">
                {cashRegister.status === "open" && (
                  <>
                    <Button
                      size="xs"
                      bg={colors.gold}
                      color={colors.bg}
                      onClick={() => onViewStats(cashRegister)}
                      flex="1"
                      minW="100px"
                    >
                      Estadísticas
                    </Button>
                    {/* Recepcionista solo puede cerrar su propia caja, admin puede cerrar cualquier caja */}
                    {(isAdmin || cashRegister.userId === currentUserId) && (
                      <Button
                        size="xs"
                        bg="blue.500"
                        color="white"
                        onClick={() => onClose(cashRegister)}
                        flex="1"
                        minW="100px"
                      >
                        Cerrar
                      </Button>
                    )}
                    {/* Solo admin puede suspender */}
                    {isAdmin && onSuspend && (
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor="orange.500"
                        color="orange.400"
                        onClick={() => onSuspend(cashRegister)}
                        flex="1"
                        minW="100px"
                      >
                        Suspender
                      </Button>
                    )}
                  </>
                )}
                {cashRegister.status === "suspended" && isAdmin && onResume && (
                  <Button
                    size="xs"
                    variant="outline"
                    borderColor="green.500"
                    color="green.400"
                    onClick={() => onResume(cashRegister)}
                    flex="1"
                  >
                    Reanudar
                  </Button>
                )}
                {cashRegister.status === "closed" && (
                  <>
                    {isAdmin && onOpen && (
                      <Button
                        size="xs"
                        bg="green.500"
                        color="white"
                        onClick={() => onOpen(cashRegister)}
                        flex="1"
                        minW="100px"
                      >
                        Abrir Caja
                      </Button>
                    )}
                    <Button
                      size="xs"
                      bg={colors.gold}
                      color={colors.bg}
                      onClick={() => onViewStats(cashRegister)}
                      flex="1"
                    >
                      Ver Detalles
                    </Button>
                  </>
                )}
              </Flex>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

