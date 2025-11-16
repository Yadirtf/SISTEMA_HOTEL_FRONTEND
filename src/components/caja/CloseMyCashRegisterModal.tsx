"use client";

import {
  Button,
  Flex,
  Stack,
  Input,
  Textarea,
  Text,
  Box,
  Heading,
} from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useState, useEffect } from "react";
import { CashRegister } from "@/app/caja/types";
import { formatCurrency } from "@/lib/format";
import { getCashRegisterStats, getMyCashRegisterOperationsReport } from "@/services/cash-registers";
import { getToken } from "@/lib/session";

interface CloseMyCashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    actualBalance: number;
    closingNotes?: string;
    operationsReport?: {
      totalSales?: number;
      totalSalesAmount?: number;
      totalReservations?: number;
      totalReservationsAmount?: number;
      totalCashIncome?: number;
      totalCardIncome?: number;
      totalTransferIncome?: number;
      totalCashExpense?: number; // Egresos en efectivo (cambios dados, retiros, etc.)
    };
  }) => void;
  cashRegister: CashRegister;
}

export function CloseMyCashRegisterModal({
  isOpen,
  onClose,
  onSubmit,
  cashRegister,
}: CloseMyCashRegisterModalProps) {
  const { colors } = useThemeMode();
  const token = getToken() || undefined;
  const [actualBalance, setActualBalance] = useState<string>("");
  const [closingNotes, setClosingNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [expectedBalance, setExpectedBalance] = useState<number>(0);
  const [operationsReport, setOperationsReport] = useState<{
    totalSales?: number;
    totalSalesAmount?: number;
    totalReservations?: number;
    totalReservationsAmount?: number;
    totalCashIncome?: number;
    totalCardIncome?: number;
    totalTransferIncome?: number;
    totalCashExpense?: number; // Egresos en efectivo (cambios dados, retiros, etc.)
  } | null>(null);

  useEffect(() => {
    if (isOpen && cashRegister.status === "open") {
      loadStats();
    }
  }, [isOpen, cashRegister._id]);

  const loadStats = async () => {
    if (!token) return;
    
    setLoadingStats(true);
    try {
      // Obtener estadísticas y reporte de operaciones en paralelo
      const [statsResp, reportResp] = await Promise.all([
        getCashRegisterStats(cashRegister._id, token),
        getMyCashRegisterOperationsReport(token)
      ]);
      
      if (statsResp.success && statsResp.data) {
        // El saldo esperado debe ser solo el efectivo físico
        // El currentBalance solo se actualiza con transacciones en efectivo
        // Por lo tanto, usamos el currentBalance directamente
        const expected = cashRegister.currentBalance;
        setExpectedBalance(expected);
      }
      
      if (reportResp.success && reportResp.data) {
        // Usar el reporte de operaciones del backend
        setOperationsReport(reportResp.data);
      } else if (statsResp.success && statsResp.data) {
        // Fallback: usar estadísticas si el reporte falla
        setOperationsReport({
          totalSales: 0,
          totalReservations: 0,
          totalCashIncome: statsResp.data.totalIncome,
          totalCardIncome: 0,
          totalTransferIncome: 0,
        });
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      setExpectedBalance(cashRegister.currentBalance);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const actual = parseFloat(actualBalance);
    if (isNaN(actual) || actual < 0) {
      alert("El saldo físico contado debe ser un número válido mayor o igual a 0");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        actualBalance: actual,
        closingNotes: closingNotes || undefined,
        operationsReport: operationsReport || undefined,
      });
      setActualBalance("");
      setClosingNotes("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const difference = actualBalance ? parseFloat(actualBalance) - expectedBalance : 0;

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
        <Heading fontSize="xl" fontWeight="bold" color={colors.gold} mb={4}>
          Cerrar Caja: {cashRegister.registerNumber}
        </Heading>

        <Stack gap={4}>
          {/* Resumen de operaciones */}
          {loadingStats ? (
            <Text color={colors.subtext}>Cargando estadísticas...</Text>
          ) : (
            <Box
              bg={colors.bg}
              p={4}
              borderRadius="md"
              borderWidth="1px"
              borderColor={colors.border}
            >
              <Text color={colors.gold} fontWeight="bold" mb={3}>
                Resumen del Día
              </Text>
              <Stack gap={2}>
                <Flex justify="space-between">
                  <Text color={colors.subtext} fontSize="sm">
                    Monto Inicial:
                  </Text>
                  <Text color={colors.text} fontSize="sm" fontWeight="semibold">
                    {formatCurrency(cashRegister.initialAmount)}
                  </Text>
                </Flex>
                {operationsReport && (
                  <>
                    {operationsReport.totalCashIncome !== undefined && operationsReport.totalCashIncome > 0 && (
                      <Flex justify="space-between">
                        <Text color={colors.subtext} fontSize="sm">
                          + Ingresos Efectivo:
                        </Text>
                        <Text color="green.500" fontSize="sm" fontWeight="semibold">
                          {formatCurrency(operationsReport.totalCashIncome)}
                        </Text>
                      </Flex>
                    )}
                    {operationsReport.totalCashExpense !== undefined && operationsReport.totalCashExpense > 0 && (
                      <Flex justify="space-between">
                        <Text color={colors.subtext} fontSize="sm">
                          - Egresos Efectivo:
                        </Text>
                        <Text color="red.500" fontSize="sm" fontWeight="semibold">
                          {formatCurrency(operationsReport.totalCashExpense)}
                        </Text>
                      </Flex>
                    )}
                    <Box borderTop="1px solid" borderColor={colors.border} pt={1} mt={1} />
                  </>
                )}
                <Flex justify="space-between">
                  <Text color={colors.subtext} fontSize="sm" fontWeight="bold">
                    Saldo Esperado (Efectivo):
                  </Text>
                  <Text color={colors.gold} fontWeight="bold" fontSize="md">
                    {formatCurrency(expectedBalance)}
                  </Text>
                </Flex>
                {operationsReport && (
                  <>
                    <Box borderTop="1px solid" borderColor={colors.border} pt={2} mt={2} />
                    <Text color={colors.subtext} fontSize="xs" mb={2} fontWeight="semibold">
                      Operaciones Registradas:
                    </Text>
                    
                    {/* Ventas */}
                    {operationsReport.totalSales !== undefined && operationsReport.totalSales > 0 && (
                      <Box mb={2} pl={4}>
                        <Flex justify="space-between" mb={1}>
                          <Text color={colors.text} fontSize="xs">
                            Ventas:
                          </Text>
                          <Text color={colors.gold} fontSize="xs" fontWeight="semibold">
                            {operationsReport.totalSales} venta(s)
                          </Text>
                        </Flex>
                        {operationsReport.totalSalesAmount !== undefined && operationsReport.totalSalesAmount > 0 && (
                          <Flex justify="space-between">
                            <Text color={colors.subtext} fontSize="xs" pl={2}>
                              Monto Total:
                            </Text>
                            <Text color={colors.gold} fontSize="sm" fontWeight="bold">
                              {formatCurrency(operationsReport.totalSalesAmount)}
                            </Text>
                          </Flex>
                        )}
                      </Box>
                    )}
                    
                    {/* Alquileres */}
                    {operationsReport.totalReservations !== undefined && operationsReport.totalReservations > 0 && (
                      <Box mb={2} pl={4}>
                        <Flex justify="space-between" mb={1}>
                          <Text color={colors.text} fontSize="xs">
                            Alquileres:
                          </Text>
                          <Text color={colors.gold} fontSize="xs" fontWeight="semibold">
                            {operationsReport.totalReservations} alquiler(es)
                          </Text>
                        </Flex>
                        {operationsReport.totalReservationsAmount !== undefined && operationsReport.totalReservationsAmount > 0 && (
                          <Flex justify="space-between">
                            <Text color={colors.subtext} fontSize="xs" pl={2}>
                              Monto Total:
                            </Text>
                            <Text color={colors.gold} fontSize="sm" fontWeight="bold">
                              {formatCurrency(operationsReport.totalReservationsAmount)}
                            </Text>
                          </Flex>
                        )}
                      </Box>
                    )}
                    
                    {/* Totales por Método de Pago */}
                    <Box borderTop="1px solid" borderColor={colors.border} pt={2} mt={2} mb={2}>
                      <Text color={colors.subtext} fontSize="xs" mb={2} fontWeight="semibold">
                        Totales por Método de Pago:
                      </Text>
                      
                      {/* Total Efectivo */}
                      {operationsReport.totalCashIncome !== undefined && operationsReport.totalCashIncome > 0 && (
                        <Flex justify="space-between" pl={4} mb={2}>
                          <Text color={colors.text} fontSize="sm" fontWeight="bold">
                            Total Efectivo:
                          </Text>
                          <Text color="green.500" fontSize="md" fontWeight="bold">
                            {formatCurrency(operationsReport.totalCashIncome)}
                          </Text>
                        </Flex>
                      )}
                      
                      {/* Total Tarjeta */}
                      {operationsReport.totalCardIncome !== undefined && operationsReport.totalCardIncome > 0 && (
                        <Flex justify="space-between" pl={4} mb={2}>
                          <Text color={colors.text} fontSize="sm" fontWeight="bold">
                            Total Tarjeta:
                          </Text>
                          <Text color="blue.500" fontSize="md" fontWeight="bold">
                            {formatCurrency(operationsReport.totalCardIncome)}
                          </Text>
                        </Flex>
                      )}
                      
                      {/* Total Transferencia */}
                      {operationsReport.totalTransferIncome !== undefined && operationsReport.totalTransferIncome > 0 && (
                        <Flex justify="space-between" pl={4} mb={2}>
                          <Text color={colors.text} fontSize="sm" fontWeight="bold">
                            Total Transferencia:
                          </Text>
                          <Text color="purple.500" fontSize="md" fontWeight="bold">
                            {formatCurrency(operationsReport.totalTransferIncome)}
                          </Text>
                        </Flex>
                      )}
                      
                      {/* Egresos en Efectivo (cambios dados) */}
                      {operationsReport.totalCashExpense !== undefined && operationsReport.totalCashExpense > 0 && (
                        <Box borderTop="1px solid" borderColor={colors.border} pt={2} mt={2}>
                          <Text color={colors.subtext} fontSize="xs" mb={2} fontWeight="semibold">
                            Egresos en Efectivo:
                          </Text>
                          <Flex justify="space-between" pl={4}>
                            <Text color={colors.text} fontSize="sm" fontWeight="bold">
                              Cambios Dados / Retiros:
                            </Text>
                            <Text color="red.500" fontSize="md" fontWeight="bold">
                              {formatCurrency(operationsReport.totalCashExpense)}
                            </Text>
                          </Flex>
                        </Box>
                      )}
                      
                      {/* Total General (suma de todos los métodos de ingreso) */}
                      {((operationsReport.totalCashIncome !== undefined && operationsReport.totalCashIncome > 0) ||
                        (operationsReport.totalCardIncome !== undefined && operationsReport.totalCardIncome > 0) ||
                        (operationsReport.totalTransferIncome !== undefined && operationsReport.totalTransferIncome > 0)) && (
                        <Box borderTop="1px solid" borderColor={colors.border} pt={2} mt={2}>
                          <Flex justify="space-between">
                            <Text color={colors.text} fontSize="sm" fontWeight="bold">
                              Total General (Ingresos):
                            </Text>
                            <Text color={colors.gold} fontSize="lg" fontWeight="bold">
                              {formatCurrency(
                                (operationsReport.totalCashIncome || 0) +
                                (operationsReport.totalCardIncome || 0) +
                                (operationsReport.totalTransferIncome || 0)
                              )}
                            </Text>
                          </Flex>
                        </Box>
                      )}
                    </Box>
                    
                    {(!operationsReport.totalSales || operationsReport.totalSales === 0) && 
                     (!operationsReport.totalReservations || operationsReport.totalReservations === 0) && (
                      <Text color={colors.subtext} fontSize="xs" pl={4} fontStyle="italic" mt={2}>
                        No hay operaciones registradas
                      </Text>
                    )}
                  </>
                )}
              </Stack>
            </Box>
          )}

          <Box borderTop="1px solid" borderColor={colors.border} pt={4} />

          {/* Saldo físico contado */}
          <Box>
            <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
              Saldo Físico Contado (Solo Efectivo) *
            </Text>
            <Text color={colors.subtext} fontSize="xs" mb={2} fontStyle="italic">
              Ingrese únicamente el monto en efectivo que hay físicamente en la caja. 
              No incluya pagos con tarjeta o transferencia.
            </Text>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={actualBalance}
              onChange={(e) => setActualBalance(e.target.value)}
              placeholder="0.00"
              bg={colors.bg}
              color={colors.text}
              borderColor={colors.border}
              _hover={{ borderColor: colors.gold }}
              _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
              disabled={isSubmitting}
            />
            {actualBalance && !isNaN(parseFloat(actualBalance)) && (
              <Text
                color={difference === 0 ? "green.400" : difference > 0 ? "orange.400" : "red.400"}
                fontSize="xs"
                mt={1}
              >
                {difference === 0
                  ? "✓ Saldo correcto"
                  : difference > 0
                  ? `Sobrante: ${formatCurrency(difference)}`
                  : `Faltante: ${formatCurrency(Math.abs(difference))}`}
              </Text>
            )}
          </Box>

          {/* Notas de cierre */}
          <Box>
            <Text color={colors.gold} mb={2} fontSize="sm" fontWeight="semibold">
              Notas de Cierre (Opcional)
            </Text>
            <Textarea
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              placeholder="Observaciones sobre el cierre..."
              bg={colors.bg}
              color={colors.text}
              borderColor={colors.border}
              _hover={{ borderColor: colors.gold }}
              _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
              disabled={isSubmitting}
              rows={3}
            />
          </Box>

          <Flex gap={3} justify="flex-end" pt={4} borderTop="2px" borderColor={colors.border}>
            <Button
              onClick={onClose}
              bg={colors.border}
              color={colors.text}
              _hover={{ bg: colors.subtext }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              bg="blue.500"
              color="white"
              fontWeight="bold"
              _hover={{ bg: "blue.600" }}
              disabled={isSubmitting || !actualBalance}
            >
              {isSubmitting ? "Cerrando..." : "Cerrar Caja"}
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}

