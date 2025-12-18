"use client";

import { Box, SimpleGrid, Heading } from "@chakra-ui/react";
import { FiShoppingBag, FiDollarSign, FiTrendingUp, FiPackage, FiRefreshCw } from "react-icons/fi";
import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { StoreStats } from "@/services/dashboard";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

interface StoreSectionProps {
  stats: StoreStats;
}

export function StoreSection({ stats }: StoreSectionProps) {
  const { colors } = useThemeMode();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const comparisonData = [
    {
      name: "Total",
      Ventas: stats.totalSales,
      Ganancia: stats.totalProfit,
    },
    {
      name: "Hoy",
      Ventas: stats.todaySales,
      Ganancia: stats.todayProfit,
    },
  ];

  const salesData = [
    { name: "Total", value: stats.totalSales },
    { name: "Hoy", value: stats.todaySales },
  ];

  return (
    <Box>
      <Heading size="md" color={colors.text} mb={4}>
        Tienda
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} mb={6}>
        <StatCard
          title="Total Ventas"
          value={formatCurrency(stats.totalSales)}
          icon={FiShoppingBag}
        />
        <StatCard
          title="Ganancia Total"
          value={formatCurrency(stats.totalProfit)}
          icon={FiDollarSign}
          color="#10b981"
        />
        <StatCard
          title="Número de Ventas"
          value={stats.salesCount}
          icon={FiPackage}
        />
        <StatCard
          title="Venta Promedio"
          value={formatCurrency(stats.averageSale)}
          icon={FiTrendingUp}
          color="#3b82f6"
        />
        <StatCard
          title="Ventas Hoy"
          value={formatCurrency(stats.todaySales)}
          icon={FiShoppingBag}
          color="#d4af37"
          subtitle={`${stats.todayCount} venta(s)`}
        />
        <StatCard
          title="Ganancia Hoy"
          value={formatCurrency(stats.todayProfit)}
          icon={FiDollarSign}
          color="#10b981"
        />
        {stats.totalReturns !== undefined && (
          <StatCard
            title="Devoluciones Totales"
            value={stats.totalReturns}
            icon={FiRefreshCw}
            color="#ef4444"
          />
        )}
        {stats.todayReturns !== undefined && (
          <StatCard
            title="Devoluciones Hoy"
            value={stats.todayReturns}
            icon={FiRefreshCw}
            color="#f59e0b"
          />
        )}
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        <ChartCard title="Ventas vs Ganancia">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="name" stroke={colors.text} />
              <YAxis stroke={colors.text} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="Ventas" fill={colors.gold} />
              <Bar dataKey="Ganancia" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Comparación Total vs Hoy">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="name" stroke={colors.text} />
              <YAxis stroke={colors.text} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Line type="monotone" dataKey="value" stroke={colors.gold} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </SimpleGrid>
    </Box>
  );
}

