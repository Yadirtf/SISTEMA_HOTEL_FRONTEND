"use client";

import { Box, Button, Flex, Text, Spinner, Input } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice, formatDate } from "@/lib/format";
import { useReturnsData } from "../hooks/useReturnsData";
import { useReturnsActions } from "../hooks/useReturnsActions";
import { useSalesData } from "../hooks/useSalesData";
import { ReturnModal } from "./ReturnModal";
import { useState, useMemo } from "react";

interface ReturnsTabProps {
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void;
}

export function ReturnsTab({ showNotification }: ReturnsTabProps) {
  const { colors } = useThemeMode();
  const { returns, loading, loadReturns } = useReturnsData();
  const { loadStats: reloadSalesStats } = useSalesData();
  const [productNameFilter, setProductNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const {
    isModalOpen,
    isSubmitting,
    selectedSaleId,
    selectedSale,
    items,
    reason,
    notes,
    refundMethodId,
    availableSales,
    loadingSales,
    setSelectedSaleId,
    setReason,
    setNotes,
    setRefundMethodId,
    addItem,
    removeItem,
    updateItemQuantity,
    openModal,
    closeModal,
    handleSubmit,
  } = useReturnsActions(showNotification, loadReturns, reloadSalesStats);

  // Filtrar devoluciones y expandir items
  const filteredReturns = useMemo(() => {
    let filtered = returns;

    // Filtrar por nombre de producto
    if (productNameFilter.trim()) {
      const searchTerm = productNameFilter.toLowerCase().trim();
      filtered = filtered.filter(returnDoc =>
        returnDoc.items.some(item =>
          item.productName.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Filtrar por fecha
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);

      filtered = filtered.filter(returnDoc => {
        const returnDate = new Date(returnDoc.returnDate);
        returnDate.setHours(0, 0, 0, 0);
        return returnDate >= filterDate && returnDate < nextDay;
      });
    }

    // Expandir items: crear una fila por cada item de devolución
    const expandedReturns: Array<{
      returnId: string;
      item: {
        product: string;
        productName: string;
        barcode: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      };
      returnDate: Date;
      reason?: string;
      total: number; // Total de la devolución completa
    }> = [];

    filtered.forEach(returnDoc => {
      returnDoc.items.forEach(item => {
        expandedReturns.push({
          returnId: returnDoc._id || "",
          item,
          returnDate: returnDoc.returnDate,
          reason: returnDoc.reason,
          total: returnDoc.total,
        });
      });
    });

    return expandedReturns;
  }, [returns, productNameFilter, dateFilter]);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
        <Text fontSize="xl" fontWeight="bold" color={colors.gold}>
          Devoluciones
        </Text>
        <Button onClick={openModal} bg={colors.gold} color="white" _hover={{ bg: "#b8941f" }}>
          + Nueva Devolución
        </Button>
      </Flex>

      {/* Filtros */}
      <Flex gap={4} mb={4} flexWrap="wrap">
        <Box flex="1" minW="200px">
          <Text fontSize="sm" color={colors.subtext} mb={2}>
            Buscar por nombre de producto:
          </Text>
          <Input
            placeholder="Nombre del producto..."
            value={productNameFilter}
            onChange={(e) => setProductNameFilter(e.target.value)}
            bg={colors.bg}
            borderColor={colors.border}
            color={colors.text}
            _hover={{ borderColor: colors.gold }}
            _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
          />
        </Box>
        <Box flex="1" minW="200px">
          <Text fontSize="sm" color={colors.subtext} mb={2}>
            Filtrar por fecha:
          </Text>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            bg={colors.bg}
            borderColor={colors.border}
            color={colors.text}
            _hover={{ borderColor: colors.gold }}
            _focus={{ borderColor: colors.gold, boxShadow: `0 0 0 1px ${colors.gold}` }}
          />
        </Box>
        {(productNameFilter || dateFilter) && (
          <Flex align="flex-end">
            <Button
              onClick={() => {
                setProductNameFilter("");
                setDateFilter("");
              }}
              variant="ghost"
              color={colors.subtext}
              _hover={{ bg: colors.bg, color: colors.gold }}
              size="sm"
            >
              Limpiar filtros
            </Button>
          </Flex>
        )}
      </Flex>

      {loading ? (
        <Flex justify="center" p={8}>
          <Spinner size="xl" color={colors.gold} />
        </Flex>
      ) : filteredReturns.length === 0 ? (
        <Box textAlign="center" p={8} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
          <Text color={colors.subtext}>
            {returns.length === 0
              ? "No hay devoluciones registradas"
              : "No se encontraron devoluciones con los filtros aplicados"}
          </Text>
        </Box>
      ) : (
        <Box overflowX="auto" bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Fecha</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Producto</th>
                <th style={{ padding: "12px", textAlign: "center", color: colors.gold, fontWeight: "bold" }}>Cantidad</th>
                <th style={{ padding: "12px", textAlign: "right", color: colors.gold, fontWeight: "bold" }}>Total</th>
                <th style={{ padding: "12px", textAlign: "left", color: colors.gold, fontWeight: "bold" }}>Razón</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((expandedReturn, index) => (
                <tr key={`${expandedReturn.returnId}-${index}`} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: "12px", color: colors.text }}>
                    {formatDate(expandedReturn.returnDate)}
                  </td>
                  <td style={{ padding: "12px", color: colors.text }}>
                    <Text fontWeight="semibold">{expandedReturn.item.productName}</Text>
                    <Text fontSize="xs" color={colors.subtext}>
                      {expandedReturn.item.barcode}
                    </Text>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center", color: colors.text }}>
                    {expandedReturn.item.quantity}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", color: "red.500", fontWeight: "bold" }}>
                    -${formatPrice(expandedReturn.item.subtotal)}
                  </td>
                  <td style={{ padding: "12px", color: colors.text }}>
                    {expandedReturn.reason || "Sin razón especificada"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      <ReturnModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        selectedSaleId={selectedSaleId}
        selectedSale={selectedSale}
        items={items}
        reason={reason}
        notes={notes}
        refundMethodId={refundMethodId}
        availableSales={availableSales}
        loadingSales={loadingSales}
        setSelectedSaleId={setSelectedSaleId}
        setReason={setReason}
        setNotes={setNotes}
        setRefundMethodId={setRefundMethodId}
        addItem={addItem}
        removeItem={removeItem}
        updateItemQuantity={updateItemQuantity}
        isLoading={isSubmitting}
      />
    </Box>
  );
}

