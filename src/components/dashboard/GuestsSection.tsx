"use client";

import { Box, SimpleGrid, Heading } from "@chakra-ui/react";
import { FiUsers, FiUserCheck, FiUserX, FiShield, FiUserPlus } from "react-icons/fi";
import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { GuestStats } from "@/services/dashboard";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface GuestsSectionProps {
  stats: GuestStats;
}

const COLORS = ['#10b981', '#6b7280', '#ef4444', '#f59e0b'];

export function GuestsSection({ stats }: GuestsSectionProps) {
  const { colors } = useThemeMode();

  const statusData = [
    { name: "Activos", value: stats.activeGuests },
    { name: "Inactivos", value: stats.inactiveGuests },
    { name: "En lista negra", value: stats.blacklistedGuests },
  ].filter(item => item.value > 0);

  const distributionData = [
    { name: "Activos", value: stats.activeGuests },
    { name: "Inactivos", value: stats.inactiveGuests },
    { name: "Lista Negra", value: stats.blacklistedGuests },
  ];

  return (
    <Box>
      <Heading size="md" color={colors.text} mb={4}>
        Huéspedes
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} mb={6}>
        <StatCard
          title="Total Huéspedes"
          value={stats.totalGuests}
          icon={FiUsers}
        />
        <StatCard
          title="Activos"
          value={stats.activeGuests}
          icon={FiUserCheck}
          color="#10b981"
        />
        <StatCard
          title="Inactivos"
          value={stats.inactiveGuests}
          icon={FiUserX}
          color="#6b7280"
        />
        <StatCard
          title="En Lista Negra"
          value={stats.blacklistedGuests}
          icon={FiShield}
          color="#ef4444"
        />
        <StatCard
          title="Nuevos este Mes"
          value={stats.newGuestsThisMonth}
          icon={FiUserPlus}
          color="#3b82f6"
          subtitle="Registrados este mes"
        />
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        <ChartCard title="Distribución de Huéspedes">
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
        <ChartCard title="Estado de Huéspedes">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
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

