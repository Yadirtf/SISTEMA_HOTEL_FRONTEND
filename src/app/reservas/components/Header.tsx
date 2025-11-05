"use client";

import { Box, Heading, Text } from "@chakra-ui/react";

export function Header({ title, subtitle, colors }: { title: string; subtitle?: string; colors: any }) {
  return (
    <Box
      bg={colors.surface}
      p={{ base: 4, md: 6 }}
      borderRadius="lg"
      borderWidth="2px"
      borderColor={colors.border}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
    >
      <Heading 
        size={{ base: "md", md: "lg" }}
        color={colors.gold}
        mb={2}
        fontSize={{ base: "xl", md: "2xl" }}
      >
        {title}
      </Heading>
      {subtitle && (
        <Text color={colors.subtext} fontSize={{ base: "sm", md: "md" }}>
          {subtitle}
        </Text>
      )}
    </Box>
  );
}


