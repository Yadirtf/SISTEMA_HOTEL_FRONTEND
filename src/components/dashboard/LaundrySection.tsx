"use client";

import { Box, SimpleGrid, Heading } from "@chakra-ui/react";
import { FiDroplet, FiClock, FiCheckCircle, FiX, FiDollarSign } from "react-icons/fi";
import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { LaundryStats } from "@/services/dashboard";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface LaundrySectionProps {
  stats: LaundryStats;
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

export function LaundrySection({ stats }: LaundrySectionProps) {
  const { colors } = useThemeMode();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const statusData = [
    { name: "Pendientes", value: stats.pendingServices },
    { name: "Completados", value: stats.completedServices },
    { name: "Cancelados", value: stats.cancelledServices },
  ].filter(item => item.value > 0);

  const comparisonData = [
    { name: "Total", Servicios: stats.totalServices, Ingresos: stats.totalRevenue },
    { name: "Hoy", Servicios: stats.todayServices, Ingresos: stats.todayRevenue },
  ];

  return (
    <Box>
      <Heading size="md" color={colors.text} mb={4}>
        Lavandería
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} mb={6}>
        <StatCard
          title="Total Servicios"
          value={stats.totalServices}
          icon={FiDroplet}
        />
        <StatCard
          title="Pendientes"
          value={stats.pendingServices}
          icon={FiClock}
          color="#3b82f6"
        />
        <StatCard
          title="Completados"
          value={stats.completedServices}
          icon={FiCheckCircle}
          color="#10b981"
        />
        <StatCard
          title="Cancelados"
          value={stats.cancelledServices}
          icon={FiX}
          color="#ef4444"
        />
        <StatCard
          title="Ingresos Totales"
          value={formatCurrency(stats.totalRevenue)}
          icon={FiDollarSign}
          color="#d4af37"
        />
        <StatCard
          title="Servicios Hoy"
          value={stats.todayServices}
          icon={FiDroplet}
          color="#3b82f6"
        />
        <StatCard
          title="Ingresos Hoy"
          value={formatCurrency(stats.todayRevenue)}
          icon={FiDollarSign}
          color="#10b981"
        />
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        <ChartCard title="Servicios por Estado">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Comparación Total vs Hoy">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="name" stroke={colors.text} />
              <YAxis yAxisId="left" stroke={colors.text} />
              <YAxis yAxisId="right" orientation="right" stroke={colors.text} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
                formatter={(value, name) => {
                  const numericValue = Number(value ?? 0);
                  if (name === "Ingresos") {
                    return formatCurrency(numericValue);
                  }
                  return numericValue;
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="Servicios" fill={colors.gold} />
              <Bar yAxisId="right" dataKey="Ingresos" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </SimpleGrid>
    </Box>
  );
}

