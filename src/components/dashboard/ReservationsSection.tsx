"use client";

import { Box, SimpleGrid, Heading, Text, Flex } from "@chakra-ui/react";
import { FiCalendar, FiCheckCircle, FiUsers, FiDollarSign, FiClock, FiX } from "react-icons/fi";
import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { ReservationStats } from "@/services/dashboard";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { GenerateReservationsReportButton } from "./GenerateReservationsReportButton";

interface ReservationsSectionProps {
  stats: ReservationStats;
}

const COLORS = ['#d4af37', '#10b981', '#3b82f6', '#ef4444', '#f59e0b'];

export function ReservationsSection({ stats }: ReservationsSectionProps) {
  const { colors } = useThemeMode();

  const statusData = [
    { name: "Confirmadas", value: stats.confirmedReservations },
    { name: "Check-in", value: stats.checkedInReservations },
    { name: "Check-out", value: stats.checkedOutReservations },
    { name: "Canceladas", value: stats.cancelledReservations },
  ].filter(item => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color={colors.text}>
          Reservas
        </Heading>
        <GenerateReservationsReportButton />
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} mb={6}>
        <StatCard
          title="Total Reservas"
          value={stats.totalReservations}
          icon={FiCalendar}
        />
        <StatCard
          title="Confirmadas"
          value={stats.confirmedReservations}
          icon={FiCheckCircle}
          color="#3b82f6"
        />
        <StatCard
          title="En Check-in"
          value={stats.checkedInReservations}
          icon={FiUsers}
          color="#10b981"
        />
        <StatCard
          title="Completadas"
          value={stats.checkedOutReservations}
          icon={FiCheckCircle}
          color="#10b981"
        />
        <StatCard
          title="Canceladas"
          value={stats.cancelledReservations}
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
          title="Duración Promedio"
          value={`${stats.averageStayDuration.toFixed(1)} días`}
          icon={FiClock}
          subtitle="Estadía promedio"
        />
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        <ChartCard title="Reservas por Estado">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
        <ChartCard title="Distribución de Reservas">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="name" stroke={colors.text} />
              <YAxis stroke={colors.text} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              />
              <Bar dataKey="value" fill={colors.gold} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </SimpleGrid>
    </Box>
  );
}

