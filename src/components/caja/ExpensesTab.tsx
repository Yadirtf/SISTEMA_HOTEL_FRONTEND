"use client";

import { Box, Button, Flex, Text, Spinner, Input, Stack, Icon } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatCurrency, formatDate } from "@/lib/format";
import { useExpensesData } from "@/app/caja/hooks/useExpensesData";
import { useExpensesActions } from "@/app/caja/hooks/useExpensesActions";
import { ExpenseModal } from "./ExpenseModal";
import { useState, useMemo } from "react";
import type { CashTransaction } from "@/app/caja/types";

interface ExpensesTabProps {
  cashRegisterId: string | undefined;
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void;
  onExpenseRegistered?: () => Promise<void>;
}

export function ExpensesTab({ cashRegisterId, showNotification, onExpenseRegistered }: ExpensesTabProps) {
  const { colors } = useThemeMode();
  const { expenses, loading, reloadExpenses } = useExpensesData(cashRegisterId);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    isModalOpen,
    isSubmitting,
    formData,
    openModal,
    closeModal,
    handleFormChange,
    handleSubmit,
  } = useExpensesActions(cashRegisterId, showNotification, reloadExpenses, onExpenseRegistered);

  // Filtrar egresos por búsqueda
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const query = searchQuery.toLowerCase();
    return expenses.filter(
      (expense) =>
        expense.description.toLowerCase().includes(query) ||
        expense.notes?.toLowerCase().includes(query) ||
        formatCurrency(expense.amount).toLowerCase().includes(query)
    );
  }, [expenses, searchQuery]);

  // Calcular total de egresos
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  // Calcular total de egresos de hoy
  const todayExpenses = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filteredExpenses
      .filter((expense) => {
        const expenseDate = new Date(expense.transactionDate);
        expenseDate.setHours(0, 0, 0, 0);
        return expenseDate.getTime() === today.getTime();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      expense: "Gasto Operativo",
      refund: "Devolución",
      adjustment: "Ajuste",
      withdrawal: "Retiro",
      other: "Otro",
    };
    return labels[category] || category;
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} flexWrap="wrap" gap={4}>
        <Text fontSize="xl" fontWeight="bold" color={colors.gold}>
          Egresos
        </Text>
        <Button
          onClick={openModal}
          bg={colors.gold}
          color="white"
          _hover={{ bg: "#b8941f" }}
          disabled={!cashRegisterId}
        >
          <Flex align="center" gap={2}>
            <Icon as={FiPlus} />
            <Text>Registrar Egreso</Text>
          </Flex>
        </Button>
      </Flex>

      {/* Estadísticas */}
      <Flex gap={4} mb={6} flexWrap="wrap">
        <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} flex={1} minW="200px">
          <Text fontSize="sm" color={colors.subtext}>Egresos de Hoy</Text>
          <Text fontSize="2xl" fontWeight="bold" color="red.400">
            {formatCurrency(todayExpenses)}
          </Text>
        </Box>
        <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} flex={1} minW="200px">
          <Text fontSize="sm" color={colors.subtext}>Total Egresos</Text>
          <Text fontSize="2xl" fontWeight="bold" color="red.400">
            {formatCurrency(totalExpenses)}
          </Text>
        </Box>
        <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} flex={1} minW="200px">
          <Text fontSize="sm" color={colors.subtext}>Cantidad de Egresos</Text>
          <Text fontSize="2xl" fontWeight="bold" color={colors.text}>
            {filteredExpenses.length}
          </Text>
        </Box>
      </Flex>

      {/* Búsqueda */}
      <Box mb={4}>
        <Input
          placeholder="Buscar por descripción, notas o monto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg={colors.bg}
          borderColor={colors.border}
          color={colors.text}
          _hover={{ borderColor: colors.gold }}
          _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
        />
      </Box>

      {/* Lista de egresos */}
      {loading ? (
        <Flex justify="center" p={8}>
          <Spinner size="xl" color={colors.gold} />
        </Flex>
      ) : filteredExpenses.length === 0 ? (
        <Box textAlign="center" p={8} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
          <Text color={colors.subtext}>
            {searchQuery ? "No se encontraron egresos con ese criterio" : "No hay egresos registrados"}
          </Text>
        </Box>
      ) : (
        <Box overflowX="auto" bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Fecha</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Descripción</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Categoría</th>
                <th style={{ padding: "12px", textAlign: "right", color: colors.gold, fontWeight: "bold" }}>Monto</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Notas</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr
                  key={expense._id}
                  style={{
                    borderBottom: `1px solid ${colors.border}`,
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <td style={{ padding: "12px", color: colors.text, fontSize: "sm" }}>
                    {formatDate(expense.transactionDate)}
                  </td>
                  <td style={{ padding: "12px", color: colors.text, fontWeight: "medium" }}>
                    {expense.description}
                  </td>
                  <td style={{ padding: "12px", color: colors.subtext, fontSize: "sm" }}>
                    {getCategoryLabel(expense.transactionCategory)}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", color: "red.400", fontWeight: "bold" }}>
                    {formatCurrency(expense.amount)}
                  </td>
                  <td style={{ padding: "12px", color: colors.subtext, fontSize: "sm", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {expense.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      {/* Modal de registro */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        onFormChange={handleFormChange}
        isLoading={isSubmitting}
      />
    </Box>
  );
}

