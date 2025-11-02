"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useThemeMode } from "@/components/theme/ThemeProvider";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationControlsProps) {
  const { colors } = useThemeMode();

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <Flex
      justify="space-between"
      align="center"
      wrap="wrap"
      gap={4}
      p={4}
      bg={colors.surface}
      borderTop="2px"
      borderColor={colors.border}
      borderRadius="0 0 lg lg"
    >
      <Text color={colors.subtext} fontSize="sm">
        Mostrando {startItem}-{endItem} de {totalItems} registros
      </Text>

      <Flex gap={2} align="center" wrap="wrap">
        <Button
          size="sm"
          variant="outline"
          borderColor={colors.border}
          color={colors.text}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          _hover={{ 
            bg: colors.bg, 
            borderColor: colors.gold,
            color: colors.gold 
          }}
          _disabled={{
            opacity: 0.5,
            cursor: "not-allowed",
          }}
          transition="all 0.2s"
        >
          ««
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          borderColor={colors.border}
          color={colors.text}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          _hover={{ 
            bg: colors.bg, 
            borderColor: colors.gold,
            color: colors.gold 
          }}
          _disabled={{
            opacity: 0.5,
            cursor: "not-allowed",
          }}
          transition="all 0.2s"
        >
          ‹
        </Button>

        <Flex gap={1} align="center">
          {getPageNumbers().map((page, idx) => {
            if (page === "...") {
              return (
                <Text key={`ellipsis-${idx}`} color={colors.subtext} px={2}>
                  ...
                </Text>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                size="sm"
                bg={isActive ? colors.gold : "transparent"}
                color={isActive ? colors.bg : colors.text}
                borderWidth="1px"
                borderColor={isActive ? colors.gold : colors.border}
                onClick={() => onPageChange(pageNum)}
                _hover={{
                  bg: isActive ? "#b8941f" : colors.bg,
                  borderColor: colors.gold,
                  color: isActive ? colors.bg : colors.gold,
                }}
                transition="all 0.2s"
                minW="40px"
                fontWeight={isActive ? "bold" : "normal"}
              >
                {pageNum}
              </Button>
            );
          })}
        </Flex>

        <Button
          size="sm"
          variant="outline"
          borderColor={colors.border}
          color={colors.text}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          _hover={{ 
            bg: colors.bg, 
            borderColor: colors.gold,
            color: colors.gold 
          }}
          _disabled={{
            opacity: 0.5,
            cursor: "not-allowed",
          }}
          transition="all 0.2s"
        >
          ›
        </Button>

        <Button
          size="sm"
          variant="outline"
          borderColor={colors.border}
          color={colors.text}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          _hover={{ 
            bg: colors.bg, 
            borderColor: colors.gold,
            color: colors.gold 
          }}
          _disabled={{
            opacity: 0.5,
            cursor: "not-allowed",
          }}
          transition="all 0.2s"
        >
          »»
        </Button>
      </Flex>
    </Flex>
  );
}

