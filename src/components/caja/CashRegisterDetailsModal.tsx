"use client";

import {
  Button,
  Flex,
  Stack,
  Text,
  Box,
  Heading,
  Badge,
} from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { CashRegister, CashRegisterStats, CashRegisterAudit } from "@/app/caja/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { useState, useEffect } from "react";
import { getCashRegisterAudits, getCashRegisterStats } from "@/services/cash-registers";
import { getToken } from "@/lib/session";
import { apiGet } from "@/lib/api";

type UsuarioListItem = {
  idUsuario: number;
  correo: string;
  persona: null | { nombre: string; apellido: string; telefono: string };
};

type CashRegisterDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cashRegister: CashRegister | null;
};

export function CashRegisterDetailsModal({
  isOpen,
  onClose,
  cashRegister,
}: CashRegisterDetailsModalProps) {
  const { colors } = useThemeMode();
  const token = getToken() || undefined;
  const [stats, setStats] = useState<CashRegisterStats | null>(null);
  const [audits, setAudits] = useState<CashRegisterAudit[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingAudits, setLoadingAudits] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(0); // 0 = Información, 1 = Estadísticas, 2 = Historial

  useEffect(() => {
    if (isOpen && cashRegister) {
      loadStats();
      loadAudits();
      loadUserName();
    } else {
      // Limpiar datos cuando se cierra el modal
      setStats(null);
      setAudits([]);
      setUserName("");
      setActiveTab(0);
    }
  }, [isOpen, cashRegister]);

  const loadStats = async () => {
    if (!cashRegister) return;
    setLoadingStats(true);
    try {
      const resp = await getCashRegisterStats(cashRegister._id, token);
      if (resp.success && resp.data) {
        setStats(resp.data);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadAudits = async () => {
    if (!cashRegister) return;
    setLoadingAudits(true);
    try {
      const resp = await getCashRegisterAudits(cashRegister._id, token);
      if (resp.success && resp.data) {
        console.log("[CashRegisterDetailsModal] Audits cargados:", resp.data.length);
        setAudits(resp.data);
      } else {
        console.warn("[CashRegisterDetailsModal] No se pudieron cargar audits:", resp.message);
        setAudits([]);
      }
    } catch (error) {
      console.error("[CashRegisterDetailsModal] Error al cargar historial:", error);
      setAudits([]);
    } finally {
      setLoadingAudits(false);
    }
  };

  const loadUserName = async () => {
    if (!cashRegister) return;
    try {
      const resp = await apiGet<UsuarioListItem[]>(`/auth/usuarios`, token);
      if (resp.success && resp.data) {
        const user = resp.data.find(u => u.idUsuario === cashRegister.userId);
        if (user) {
          setUserName(
            user.persona
              ? `${user.persona.nombre} ${user.persona.apellido}`
              : user.correo
          );
        } else {
          setUserName(`Usuario #${cashRegister.userId}`);
        }
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      setUserName(`Usuario #${cashRegister.userId}`);
    }
  };

  if (!isOpen || !cashRegister) return null;

  const statusColors: Record<string, { bg: string; color: string }> = {
    open: { bg: "green.500", color: "white" },
    closed: { bg: "gray.500", color: "white" },
    suspended: { bg: "orange.500", color: "white" },
  };

  const statusColor = statusColors[cashRegister.status] || statusColors.closed;

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
      onClick={onClose}
    >
      <Box
        bg={colors.surface}
        borderColor={colors.border}
        borderWidth="2px"
        borderRadius="lg"
        p={6}
        maxW="900px"
        w="100%"
        maxH="90vh"
        overflowY="auto"
        boxShadow="0 8px 16px rgba(0, 0, 0, 0.5)"
        onClick={(e) => e.stopPropagation()}
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Heading fontSize="xl" fontWeight="bold" color={colors.gold}>
            Detalles de Caja: {cashRegister.registerNumber}
          </Heading>
          <Button onClick={onClose} variant="ghost" size="sm" color={colors.subtext}>
            ×
          </Button>
        </Flex>

        {/* Pestañas */}
        <Box mb={6}>
          <Flex
            gap={0}
            borderBottom="2px solid"
            borderColor={colors.border}
            flexWrap="wrap"
          >
            {[
              { id: 0, label: "Información" },
              { id: 1, label: "Estadísticas" },
              { id: 2, label: "Historial de Cierres" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                borderRadius={0}
                borderBottom={activeTab === tab.id ? "3px solid" : "none"}
                borderBottomColor={activeTab === tab.id ? colors.gold : "transparent"}
                color={activeTab === tab.id ? colors.gold : colors.subtext}
                fontWeight={activeTab === tab.id ? "bold" : "normal"}
                onClick={() => setActiveTab(tab.id)}
                _hover={{
                  bg: colors.surface,
                  color: colors.gold,
                }}
                px={6}
                py={4}
              >
                {tab.label}
              </Button>
            ))}
          </Flex>
        </Box>

        {/* Contenido de las pestañas */}
        {activeTab === 0 && (
          <Box>
              <Stack gap={4} mt={4}>
                <Box p={4} bg={colors.bg} borderRadius="md" borderWidth="1px" borderColor={colors.border}>
                  <Stack gap={3}>
                    <Flex justify="space-between" align="center">
                      <Text color={colors.subtext} fontSize="sm">Estado:</Text>
                      <Badge bg={statusColor.bg} color={statusColor.color} px={3} py={1} borderRadius="md">
                        {cashRegister.status === "open" ? "Abierta" : 
                         cashRegister.status === "closed" ? "Cerrada" : "Suspendida"}
                      </Badge>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Text color={colors.subtext} fontSize="sm">Recepcionista:</Text>
                      <Text color={colors.text} fontSize="sm" fontWeight="semibold">
                        {userName || `Usuario #${cashRegister.userId}`}
                      </Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Text color={colors.subtext} fontSize="sm">Monto Inicial:</Text>
                      <Text color={colors.text} fontSize="sm" fontWeight="semibold">
                        {formatCurrency(cashRegister.initialAmount)}
                      </Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Text color={colors.subtext} fontSize="sm">Saldo Actual:</Text>
                      <Text color={colors.gold} fontSize="lg" fontWeight="bold">
                        {formatCurrency(cashRegister.currentBalance)}
                      </Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Text color={colors.subtext} fontSize="sm">Fecha de Apertura:</Text>
                      <Text color={colors.text} fontSize="sm">
                        {formatDate(cashRegister.openedAt)}
                      </Text>
                    </Flex>
                    {cashRegister.closedAt && (
                      <Flex justify="space-between" align="center">
                        <Text color={colors.subtext} fontSize="sm">Fecha de Cierre:</Text>
                        <Text color={colors.text} fontSize="sm">
                          {formatDate(cashRegister.closedAt)}
                        </Text>
                      </Flex>
                    )}
                    {cashRegister.notes && (
                      <Box>
                        <Text color={colors.subtext} fontSize="sm" mb={1}>Notas:</Text>
                        <Text color={colors.text} fontSize="sm">{cashRegister.notes}</Text>
                      </Box>
                    )}
                    {cashRegister.closingNotes && (
                      <Box>
                        <Text color={colors.subtext} fontSize="sm" mb={1}>Notas de Cierre:</Text>
                        <Text color={colors.text} fontSize="sm">{cashRegister.closingNotes}</Text>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Stack>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
              <Stack gap={4} mt={4}>
                {loadingStats ? (
                  <Text color={colors.subtext} textAlign="center" py={8}>
                    Cargando estadísticas...
                  </Text>
                ) : stats ? (
                  <>
                    <Box p={4} bg={colors.bg} borderRadius="md" borderWidth="1px" borderColor={colors.border}>
                      <Stack gap={3}>
                        <Flex justify="space-between" align="center">
                          <Text color={colors.subtext} fontSize="sm">Total Ingresos:</Text>
                          <Text color="green.400" fontSize="lg" fontWeight="bold">
                            +{formatCurrency(stats.totalIncome)}
                          </Text>
                        </Flex>
                        <Flex justify="space-between" align="center">
                          <Text color={colors.subtext} fontSize="sm">Total Egresos:</Text>
                          <Text color="red.400" fontSize="lg" fontWeight="bold">
                            -{formatCurrency(stats.totalExpense)}
                          </Text>
                        </Flex>
                        <Box borderTop="1px solid" borderColor={colors.border} pt={3} mt={2}>
                          <Flex justify="space-between" align="center">
                            <Text color={colors.subtext} fontSize="sm">Saldo Esperado:</Text>
                            <Text color={colors.gold} fontSize="xl" fontWeight="bold">
                              {formatCurrency(cashRegister.currentBalance)}
                            </Text>
                          </Flex>
                        </Box>
                        <Flex justify="space-between" align="center">
                          <Text color={colors.subtext} fontSize="sm">Total Transacciones:</Text>
                          <Text color={colors.text} fontSize="md" fontWeight="semibold">
                            {stats.transactionCount}
                          </Text>
                        </Flex>
                      </Stack>
                    </Box>

                    {/* Reporte de Operaciones */}
                    {stats.operationsReport && (
                      <Box p={4} bg={colors.bg} borderRadius="md" borderWidth="1px" borderColor={colors.border}>
                        <Text color={colors.gold} fontSize="md" fontWeight="bold" mb={3}>
                          Reporte de Operaciones
                        </Text>
                        <Stack gap={3}>
                          {stats.operationsReport.totalSales > 0 && (
                            <Flex justify="space-between" align="center">
                              <Text color={colors.subtext} fontSize="sm">Ventas:</Text>
                              <Text color={colors.text} fontSize="sm" fontWeight="semibold">
                                {stats.operationsReport.totalSales} venta(s) - {formatCurrency(stats.operationsReport.totalSalesAmount || 0)}
                              </Text>
                            </Flex>
                          )}
                          {stats.operationsReport.totalReservations > 0 && (
                            <Flex justify="space-between" align="center">
                              <Text color={colors.subtext} fontSize="sm">Alquileres:</Text>
                              <Text color={colors.text} fontSize="sm" fontWeight="semibold">
                                {stats.operationsReport.totalReservations} alquiler(es) - {formatCurrency(stats.operationsReport.totalReservationsAmount || 0)}
                              </Text>
                            </Flex>
                          )}
                          <Box borderTop="1px solid" borderColor={colors.border} pt={3} mt={2}>
                            {stats.operationsReport.totalCashIncome > 0 && (
                              <Flex justify="space-between" align="center" mb={2}>
                                <Text color={colors.text} fontSize="sm" fontWeight="bold">Total Efectivo:</Text>
                                <Text color="green.500" fontSize="md" fontWeight="bold">
                                  {formatCurrency(stats.operationsReport.totalCashIncome)}
                                </Text>
                              </Flex>
                            )}
                            {stats.operationsReport.totalCardIncome > 0 && (
                              <Flex justify="space-between" align="center" mb={2}>
                                <Text color={colors.text} fontSize="sm" fontWeight="bold">Total Tarjeta:</Text>
                                <Text color="blue.500" fontSize="md" fontWeight="bold">
                                  {formatCurrency(stats.operationsReport.totalCardIncome)}
                                </Text>
                              </Flex>
                            )}
                            {stats.operationsReport.totalTransferIncome > 0 && (
                              <Flex justify="space-between" align="center" mb={2}>
                                <Text color={colors.text} fontSize="sm" fontWeight="bold">Total Transferencia:</Text>
                                <Text color="purple.500" fontSize="md" fontWeight="bold">
                                  {formatCurrency(stats.operationsReport.totalTransferIncome)}
                                </Text>
                              </Flex>
                            )}
                            {((stats.operationsReport.totalCashIncome || 0) + 
                              (stats.operationsReport.totalCardIncome || 0) + 
                              (stats.operationsReport.totalTransferIncome || 0)) > 0 && (
                              <Box borderTop="1px solid" borderColor={colors.border} pt={3} mt={2}>
                                <Flex justify="space-between" align="center">
                                  <Text color={colors.text} fontSize="md" fontWeight="bold">Total General:</Text>
                                  <Text color={colors.gold} fontSize="lg" fontWeight="bold">
                                    {formatCurrency(
                                      (stats.operationsReport.totalCashIncome || 0) +
                                      (stats.operationsReport.totalCardIncome || 0) +
                                      (stats.operationsReport.totalTransferIncome || 0)
                                    )}
                                  </Text>
                                </Flex>
                              </Box>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    )}
                  </>
                ) : (
                  <Text color={colors.subtext} textAlign="center" py={8}>
                    No hay estadísticas disponibles
                  </Text>
                )}
              </Stack>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
              <Stack gap={4} mt={4}>
                {loadingAudits ? (
                  <Text color={colors.subtext} textAlign="center" py={8}>
                    Cargando historial...
                  </Text>
                ) : audits.length > 0 ? (
                  <Box overflowX="auto">
                    <Box as="table" w="100%" style={{ borderCollapse: "collapse" }}>
                      <Box as="thead">
                        <Box as="tr" borderBottom="2px" borderColor={colors.border}>
                          {["Fecha", "Saldo Esperado", "Saldo Real", "Diferencia", "Notas"].map((header) => (
                            <Box
                              key={header}
                              as="th"
                              textAlign="left"
                              p={3}
                              color={colors.gold}
                              fontSize="sm"
                              fontWeight="bold"
                            >
                              {header}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      <Box as="tbody">
                        {audits.map((audit) => (
                          <Box
                            key={audit._id}
                            as="tr"
                            borderBottom="1px"
                            borderColor={colors.border}
                            _hover={{ bg: colors.bg }}
                          >
                            <Box as="td" p={3} color={colors.text} fontSize="sm">
                              {formatDate(audit.countedAt)}
                            </Box>
                            <Box as="td" p={3} color={colors.text} fontSize="sm">
                              {formatCurrency(audit.expectedBalance)}
                            </Box>
                            <Box as="td" p={3} color={colors.text} fontSize="sm" fontWeight="semibold">
                              {formatCurrency(audit.actualBalance)}
                            </Box>
                            <Box as="td" p={3}>
                              <Text
                                color={audit.difference === 0 ? "green.400" : audit.difference > 0 ? "orange.400" : "red.400"}
                                fontSize="sm"
                                fontWeight="bold"
                              >
                                {audit.difference === 0
                                  ? "✓ Correcto"
                                  : audit.difference > 0
                                  ? `+${formatCurrency(audit.difference)}`
                                  : formatCurrency(audit.difference)}
                              </Text>
                            </Box>
                            <Box as="td" p={3} color={colors.subtext} fontSize="sm">
                              {audit.notes || "-"}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Text color={colors.subtext} textAlign="center" py={8}>
                    No hay historial de cierres disponible
                  </Text>
                )}
              </Stack>
          </Box>
        )}

        <Flex gap={3} justify="flex-end" pt={6} borderTop="2px" borderColor={colors.border} mt={6}>
          <Button
            onClick={onClose}
            bg={colors.gold}
            color={colors.bg}
            fontWeight="bold"
            _hover={{ bg: "#b8941f" }}
          >
            Cerrar
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

