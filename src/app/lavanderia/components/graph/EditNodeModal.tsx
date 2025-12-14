"use client";

import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { CreateGraphNodeFormData } from "../../types";
import { NodeFormFields } from "./NodeFormFields";

interface EditNodeModalProps {
  isOpen: boolean;
  formData: CreateGraphNodeFormData;
  onClose: () => void;
  onChange: (data: Partial<CreateGraphNodeFormData>) => void;
  onSubmit: () => void;
}

export function EditNodeModal({
  isOpen,
  formData,
  onClose,
  onChange,
  onSubmit,
}: EditNodeModalProps) {
  const { colors } = useThemeMode();

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(0, 0, 0, 0.8)"
      backdropFilter="blur(3px)"
      onClick={onClose}
    >
      <Box
        bg={colors.surface}
        color={colors.text}
        borderRadius="lg"
        w={{ base: "95%", md: "90%" }}
        maxW="600px"
        boxShadow={`0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px ${colors.border}`}
        onClick={(e) => e.stopPropagation()}
        m={{ base: 2, md: 0 }}
      >
        <Box
          p={{ base: 4, md: 6 }}
          borderBottom="2px"
          borderColor={colors.border}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={colors.gold}>
            Editar Nodo
          </Text>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            color={colors.subtext}
            _hover={{ bg: colors.bg, color: colors.gold }}
            minW="auto"
            w="32px"
            h="32px"
            p={0}
          >
            <Icon as={FiX} fontSize="xl" />
          </Button>
        </Box>

        <Box p={{ base: 4, md: 6 }}>
          <VStack spacing={4} align="stretch">
            <NodeFormFields formData={formData} onChange={onChange} showIdField={false} />

            <Flex gap={3} justify="flex-end" pt={2}>
              <Button
                onClick={onClose}
                variant="ghost"
                color={colors.subtext}
                _hover={{ bg: colors.bg, color: colors.text }}
              >
                Cancelar
              </Button>
              <Button
                onClick={onSubmit}
                bg={colors.gold}
                color="white"
                _hover={{ bg: "#b8941f" }}
              >
                Guardar
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}

