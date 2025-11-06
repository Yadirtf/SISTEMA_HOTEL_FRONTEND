"use client";

import { Box, Button, Flex, Text, Spinner, Badge } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { useSalesData } from "../hooks/useSalesData";
import { useSalesActions } from "../hooks/useSalesActions";
import { SaleModal } from "./SaleModal";

interface SalesTabProps {
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void;
}

export function SalesTab({ showNotification }: SalesTabProps) {
  const { colors } = useThemeMode();
  const { sales, stats, loading, loadSales } = useSalesData();

  const {
    isModalOpen,
    isSubmitting,
    items,
    selectedReservationId,
    isCreditSale,
    setSelectedReservationId,
    setIsCreditSale,
    openModal,
    closeModal,
    addItem,
    removeItem,
    updateItemQuantity,
    handleSubmit,
  } = useSalesActions(showNotification, loadSales);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
        <Text fontSize="xl" fontWeight="bold" color={colors.gold}>
          Ventas
        </Text>
        <Button onClick={openModal} bg={colors.gold} color="white" _hover={{ bg: "#b8941f" }}>
          + Nueva Venta
        </Button>
      </Flex>

      {stats && (
        <Flex gap={4} mb={6} flexWrap="wrap">
          <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} flex={1} minW="200px">
            <Text fontSize="sm" color={colors.subtext}>Ventas de Hoy</Text>
            <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>${stats.todaySales?.toLocaleString() || 0}</Text>
          </Box>
          <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} flex={1} minW="200px">
            <Text fontSize="sm" color={colors.subtext}>Ganancia de Hoy</Text>
            <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>${stats.todayProfit?.toLocaleString() || 0}</Text>
          </Box>
          <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} flex={1} minW="200px">
            <Text fontSize="sm" color={colors.subtext}>Total Ventas</Text>
            <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>${stats.totalSales?.toLocaleString() || 0}</Text>
          </Box>
          <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} flex={1} minW="200px">
            <Text fontSize="sm" color={colors.subtext}>Total Ganancia</Text>
            <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>${stats.totalProfit?.toLocaleString() || 0}</Text>
          </Box>
        </Flex>
      )}

      {loading ? (
        <Flex justify="center" p={8}>
          <Spinner size="xl" color={colors.gold} />
        </Flex>
      ) : sales.length === 0 ? (
        <Box textAlign="center" p={8} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
          <Text color={colors.subtext}>No hay ventas registradas</Text>
        </Box>
      ) : (
        <Box overflowX="auto" bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Fecha</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Productos</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Total</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Ganancia</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: "12px", color: colors.text }}>
                    {new Date(sale.saleDate).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={{ padding: "12px", color: colors.text }}>{sale.items.length} producto(s)</td>
                  <td style={{ padding: "12px", color: colors.text }}>${sale.total.toLocaleString()}</td>
                  <td style={{ padding: "12px", color: colors.text }}>
                    <Badge colorScheme="green">${sale.totalProfit.toLocaleString()}</Badge>
                  </td>
                  <td style={{ padding: "12px", color: colors.text }}>
                    <Badge colorScheme={(sale.paymentStatus || 'paid') === 'paid' ? 'green' : 'orange'}>
                      {(sale.paymentStatus || 'paid') === 'paid' ? 'Pagado' : 'Fiado'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      <SaleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        items={items}
        addItem={addItem}
        removeItem={removeItem}
        updateItemQuantity={updateItemQuantity}
        selectedReservationId={selectedReservationId}
        isCreditSale={isCreditSale}
        setSelectedReservationId={setSelectedReservationId}
        setIsCreditSale={setIsCreditSale}
        isLoading={isSubmitting}
      />
    </Box>
  );
}

