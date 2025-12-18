"use client";

import { Box, SimpleGrid, Heading } from "@chakra-ui/react";
import { FiDollarSign, FiTrendingDown, FiTrendingUp, FiCreditCard, FiArrowRightLeft } from "react-icons/fi";
import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { CashStats } from "@/services/dashboard";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface CashSectionProps {
  stats: CashStats;
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

export function CashSection({ stats }: CashSectionProps) {
  const { colors } = useThemeMode();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const incomeExpenseData = [
    { name: "Ingresos", value: stats.totalIncome },
    { name: "Egresos", value: stats.totalExpense },
  ];

  const incomeByCategory = Object.entries(stats.incomeByCategory || {})
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0)
    .slice(0, 5);

  const expenseByCategory = Object.entries(stats.expenseByCategory || {})
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0)
    .slice(0, 5);

  const paymentMethodData = Object.entries(stats.incomeByPaymentMethod || {})
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0);

  return (
    <Box>
      <Heading size="md" color={colors.text} mb={4}>
        Caja
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} mb={6}>
        <StatCard
          title="Total Ingresos"
          value={formatCurrency(stats.totalIncome)}
          icon={FiTrendingUp}
          color="#10b981"
        />
        <StatCard
          title="Total Egresos"
          value={formatCurrency(stats.totalExpense)}
          icon={FiTrendingDown}
          color="#ef4444"
        />
        <StatCard
          title="Saldo Neto"
          value={formatCurrency(stats.netAmount)}
          icon={FiDollarSign}
          color={stats.netAmount >= 0 ? "#10b981" : "#ef4444"}
        />
        <StatCard
          title="Total Transacciones"
          value={stats.transactionCount}
          icon={FiArrowRightLeft}
        />
        <StatCard
          title="Ingresos en Efectivo"
          value={formatCurrency(stats.totalCashIncome)}
          icon={FiDollarSign}
          color="#10b981"
        />
        <StatCard
          title="Ingresos por Transferencia"
          value={formatCurrency(stats.totalTransferIncome)}
          icon={FiCreditCard}
          color="#3b82f6"
        />
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, lg: 1 }} gap={4} mb={4}>
        <ChartCard title="Ingresos vs Egresos">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={incomeExpenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {incomeExpenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </SimpleGrid>
      {(incomeByCategory.length > 0 || expenseByCategory.length > 0) && (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
          {incomeByCategory.length > 0 && (
            <ChartCard title="Ingresos por Categoría">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis type="number" stroke={colors.text} />
                  <YAxis dataKey="name" type="category" stroke={colors.text} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
          {expenseByCategory.length > 0 && (
            <ChartCard title="Egresos por Categoría">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis type="number" stroke={colors.text} />
                  <YAxis dataKey="name" type="category" stroke={colors.text} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </SimpleGrid>
      )}
    </Box>
  );
}

