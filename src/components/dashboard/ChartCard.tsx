"use client";

import { Box, Text, Heading } from "@chakra-ui/react";
import { ReactNode } from "react";
import { useThemeMode } from "@/components/theme/ThemeProvider";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  height?: number | string;
}

export function ChartCard({ title, children, height = 300 }: ChartCardProps) {
  const { colors } = useThemeMode();

  return (
    <Box
      bg={colors.surface}
      borderWidth="1px"
      borderColor={colors.border}
      borderRadius="lg"
      p={4}
    >
      <Heading size="sm" color={colors.text} mb={4}>
        {title}
      </Heading>
      <Box height={height} width="100%">
        {children}
      </Box>
    </Box>
  );
}

