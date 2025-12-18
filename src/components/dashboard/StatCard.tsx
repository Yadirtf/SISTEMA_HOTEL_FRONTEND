"use client";

import { Box, Text, Flex, Icon } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { useThemeMode } from "@/components/theme/ThemeProvider";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: IconType;
  color?: string;
  subtitle?: string;
}

export function StatCard({ title, value, icon: IconComponent, color, subtitle }: StatCardProps) {
  const { colors } = useThemeMode();
  const displayColor = color || colors.gold;

  return (
    <Box
      bg={colors.surface}
      borderWidth="1px"
      borderColor={colors.border}
      borderRadius="lg"
      p={4}
      _hover={{ borderColor: displayColor, transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="start" mb={2}>
        <Text color={colors.subtext} fontSize="sm" fontWeight="medium">
          {title}
        </Text>
        {IconComponent && (
          <Icon as={IconComponent} color={displayColor} boxSize={5} />
        )}
      </Flex>
      <Text color={colors.text} fontSize="2xl" fontWeight="bold" mb={subtitle ? 1 : 0}>
        {value}
      </Text>
      {subtitle && (
        <Text color={colors.subtext} fontSize="xs">
          {subtitle}
        </Text>
      )}
    </Box>
  );
}

