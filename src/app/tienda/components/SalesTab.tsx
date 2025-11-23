"use client";

import { Box, Button, Flex, Text, Spinner, Badge, Icon } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice } from "@/lib/format";
import { useSalesData } from "../hooks/useSalesData";
import { useSalesActions } from "../hooks/useSalesActions";
import { SaleModal } from "./SaleModal";
import { PaymentModal } from "./PaymentModal";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/common/PaginationControls";

interface SalesTabProps {
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void;
}

export function SalesTab({ showNotification }: SalesTabProps) {
  const { colors } = useThemeMode();
  const { sales, stats, loading, loadSales } = useSalesData();

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedSales,
    itemsPerPage,
    totalItems
  } = usePagination(sales, 13);

  const {
    isModalOpen,
    isPaymentModalOpen,
    isSubmitting,
    items,
    selectedReservationId,
    isCreditSale,
    saleTotal,
    setSelectedReservationId,
    setIsCreditSale,
    openModal,
    closeModal,
    addItem,
    removeItem,
    updateItemQuantity,
    handleSubmit,
    handleConfirmPayment,
    closePaymentModal,
  } = useSalesActions(showNotification, loadSales);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
        <Text fontSize="xl" fontWeight="bold" color={colors.gold}>
          Ventas
        </Text>
        <Button onClick={openModal} bg={colors.gold} color="white" _hover={{ bg: "#b8941f" }}>
          <Flex align="center" gap={2}>
            <Icon as={FiPlus} />
            <Text>Nueva Venta</Text>
          </Flex>
        </Button>
      </Flex>

      {stats && (
        <Flex gap={4} mb={6} flexWrap="wrap">
          <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} flex={1} minW="200px">
            <Text fontSize="sm" color={colors.subtext}>Ventas de Hoy (Netas)</Text>
            <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>${formatPrice(stats.todaySales || 0)}</Text>
            {stats.todayReturns !== undefined && stats.todayReturns > 0 && (
              <Text fontSize="xs" color="red.500" mt={1}>
                -${formatPrice(stats.todayReturns)} en devoluciones
              </Text>
            )}
          </Box>
          <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} flex={1} minW="200px">
            <Text fontSize="sm" color={colors.subtext}>Ganancia de Hoy (Neta)</Text>
            <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>${formatPrice(stats.todayProfit || 0)}</Text>
          </Box>
          <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} flex={1} minW="200px">
            <Text fontSize="sm" color={colors.subtext}>Total Ventas (Netas)</Text>
            <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>${formatPrice(stats.totalSales || 0)}</Text>
            {stats.totalReturns !== undefined && stats.totalReturns > 0 && (
              <Text fontSize="xs" color="red.500" mt={1}>
                -${formatPrice(stats.totalReturns)} en devoluciones
              </Text>
            )}
          </Box>
          <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} flex={1} minW="200px">
            <Text fontSize="sm" color={colors.subtext}>Total Ganancia (Neta)</Text>
            <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>${formatPrice(stats.totalProfit || 0)}</Text>
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
        <Box>
          <Box overflowX="auto" bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} mb={4}>
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
                {paginatedSales.map((sale) => (
                  <tr key={sale._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: "12px", color: colors.text }}>
                      {new Date(sale.saleDate).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true, // Formato de 12 horas con AM/PM
                      })}
                    </td>
                    <td style={{ padding: "12px", color: colors.text }}>{sale.items.length} producto(s)</td>
                    <td style={{ padding: "12px", color: colors.text }}>${formatPrice(sale.total)}</td>
                    <td style={{ padding: "12px", color: colors.text }}>
                      <Badge colorScheme="green">${formatPrice(sale.totalProfit)}</Badge>
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

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
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

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        onConfirm={handleConfirmPayment}
        total={saleTotal}
        isLoading={isSubmitting}
      />
    </Box>
  );
}

