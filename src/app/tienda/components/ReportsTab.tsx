"use client";

import { useState, useEffect } from "react";
import { Box, Button, Flex, Text, Spinner, SimpleGrid, Badge } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { formatPrice } from "@/lib/format";
import { useSalesData } from "../hooks/useSalesData";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/common/PaginationControls";

interface ReportsTabProps {
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void;
}

export function ReportsTab({ showNotification }: ReportsTabProps) {
  const { colors } = useThemeMode();
  const [period, setPeriod] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const { report, loading, loadReport } = useSalesData();

  const handlePeriodChange = async (newPeriod: "weekly" | "biweekly" | "monthly") => {
    setPeriod(newPeriod);
    await loadReport(newPeriod);
  };

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedProducts,
    itemsPerPage,
    totalItems
  } = usePagination(report?.topProducts || [], 13);

  useEffect(() => {
    if (!report && !loading) {
      loadReport(period);
    }
  }, [report, loading, period, loadReport]);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
        <Text fontSize="xl" fontWeight="bold" color={colors.gold}>
          Reportes
        </Text>
        <select
          value={period}
          onChange={(e) => handlePeriodChange(e.target.value as "weekly" | "biweekly" | "monthly")}
          style={{
            width: '200px',
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
          <option value="weekly" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Semanal
          </option>
          <option value="biweekly" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Quincenal
          </option>
          <option value="monthly" style={{ backgroundColor: colors.surface, color: colors.text }}>
            Mensual
          </option>
        </select>
      </Flex>

      {loading ? (
        <Flex justify="center" p={8}>
          <Spinner size="xl" color={colors.gold} />
        </Flex>
      ) : !report ? (
        <Box textAlign="center" p={8} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
          <Text color={colors.subtext}>No hay datos para mostrar</Text>
        </Box>
      ) : (
        <Box>
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={6}>
            <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
              <Text fontSize="sm" color={colors.subtext}>Total Ventas (Netas)</Text>
              <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>${formatPrice(report.totalSales)}</Text>
              <Text fontSize="xs" color={colors.subtext} mt={1} fontStyle="italic">
                Después de devoluciones
              </Text>
            </Box>
            <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
              <Text fontSize="sm" color={colors.subtext}>Total Ganancia (Neta)</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">${formatPrice(report.totalProfit)}</Text>
              <Text fontSize="xs" color={colors.subtext} mt={1} fontStyle="italic">
                Después de devoluciones
              </Text>
            </Box>
            <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
              <Text fontSize="sm" color={colors.subtext}>Cantidad Ventas (Netas)</Text>
              <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>{report.salesCount}</Text>
              <Text fontSize="xs" color={colors.subtext} mt={1} fontStyle="italic">
                Ventas con items no devueltos
              </Text>
            </Box>
            <Box p={4} bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border}>
              <Text fontSize="sm" color={colors.subtext}>Items Vendidos (Netos)</Text>
              <Text fontSize="2xl" fontWeight="bold" color={colors.gold}>{report.itemsSold}</Text>
              <Text fontSize="xs" color={colors.subtext} mt={1} fontStyle="italic">
                Items vendidos - items devueltos
              </Text>
            </Box>
          </SimpleGrid>

          {report.topProducts.length > 0 && (
            <Box mb={6}>
              <Text fontSize="lg" fontWeight="bold" color={colors.text} mb={4}>
                Top Productos Vendidos
              </Text>
              <Box overflowX="auto" bg={colors.surface} borderRadius="lg" borderWidth="2px" borderColor={colors.border} mb={4}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                      <th style={{ padding: "12px", textAlign: "left", color: colors.gold }}>Producto</th>
                      <th style={{ padding: "12px", textAlign: "center", color: colors.gold }}>Cantidad</th>
                      <th style={{ padding: "12px", textAlign: "right", color: colors.gold }}>Ventas</th>
                      <th style={{ padding: "12px", textAlign: "right", color: colors.gold }}>Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((product, idx) => (
                      <tr key={product.productId} style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td style={{ padding: "12px", color: colors.text }}>
                          <Text fontWeight="bold">{product.productName}</Text>
                          <Text fontSize="sm" color={colors.subtext}>{product.barcode}</Text>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center", color: colors.text }}>
                          <Badge>{product.quantity}</Badge>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", color: colors.text }}>
                          <Text>{`$${formatPrice(product.totalSales)}`}</Text>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", color: colors.text }}>
                          <Badge colorScheme="green">{`$${formatPrice(product.totalProfit)}`}</Badge>
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
        </Box>
      )}
    </Box>
  );
}

