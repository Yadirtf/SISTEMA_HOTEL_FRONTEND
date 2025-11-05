"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";

type NoticeType = "success" | "error" | "info";

export function InlineNotice({
  type,
  title,
  description,
  onClose,
  colors,
}: {
  type: NoticeType;
  title: string;
  description?: string;
  onClose: () => void;
  colors: any;
}) {
  const bg = type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : colors.gold;
  const shadow = type === "success" ? "#16a34a40" : type === "error" ? "#dc262640" : `${colors.gold}40`;
  const border = type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#b8941f";

  return (
    <Box
      position="fixed"
      top={{ base: "10px", md: "20px" }}
      right={{ base: "10px", md: "20px" }}
      left={{ base: "10px", md: "auto" }}
      zIndex={2000}
      maxW={{ base: "calc(100% - 20px)", md: "400px" }}
      w={{ base: "auto", md: "400px" }}
      p={4}
      borderRadius="md"
      bg={bg}
      color="white"
      boxShadow={`0 4px 12px ${shadow}`}
      borderLeft="4px solid"
      borderLeftColor={border}
    >
      <Flex justify="space-between" align="start" gap={3}>
        <Box flex="1">
          <Text fontWeight="bold" fontSize="md" mb={description ? 1 : 0}>
            {title}
          </Text>
          {description && (
            <Text fontSize="sm" opacity={0.9}>
              {description}
            </Text>
          )}
        </Box>
        <Button
          size="xs"
          variant="ghost"
          onClick={onClose}
          color="white"
          _hover={{ bg: "rgba(255,255,255,0.2)" }}
          p={1}
          minW="auto"
          h="auto"
        >
          ×
        </Button>
      </Flex>
    </Box>
  );
}


