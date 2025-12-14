"use client";

import { Box, Button, Flex, Text, VStack, Input } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { CreateRelationshipFormData, RelationshipType, NodeType } from "../../types";

interface CreateRelationshipModalProps {
  isOpen: boolean;
  formData: CreateRelationshipFormData;
  onClose: () => void;
  onChange: (data: Partial<CreateRelationshipFormData>) => void;
  onSubmit: () => void;
}

export function CreateRelationshipModal({
  isOpen,
  formData,
  onClose,
  onChange,
  onSubmit,
}: CreateRelationshipModalProps) {
  const { colors } = useThemeMode();

  if (!isOpen) return null;

  const selectStyle = {
    width: '100%',
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: '6px',
    padding: '8px 12px',
    border: `2px solid ${colors.border}`,
    fontSize: '14px',
    cursor: 'pointer',
  };

  const handleTypeChange = (newType: RelationshipType) => {
    onChange({
      type: newType,
      fromNodeType: newType === RelationshipType.HAS_SERVICE ? NodeType.CLIENT : NodeType.LAUNDRY_SERVICE,
      toNodeType: newType === RelationshipType.HAS_SERVICE ? NodeType.LAUNDRY_SERVICE : NodeType.ROOM,
    });
  };

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
            Crear Nueva Relación
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
            <Box>
              <Text color={colors.text} mb={2} fontWeight="semibold">
                Tipo de Relación
              </Text>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value as RelationshipType)}
                style={selectStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.gold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.gold;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.gold}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value={RelationshipType.HAS_SERVICE} style={{ backgroundColor: colors.surface, color: colors.text }}>
                  HAS_SERVICE (Cliente → Servicio)
                </option>
                <option value={RelationshipType.FOR_ROOM} style={{ backgroundColor: colors.surface, color: colors.text }}>
                  FOR_ROOM (Servicio → Habitación)
                </option>
              </select>
            </Box>

            <Box>
              <Text color={colors.text} mb={2} fontWeight="semibold">
                Nodo Origen (ID)
              </Text>
              <Input
                value={formData.fromNodeId}
                onChange={(e) => onChange({ fromNodeId: e.target.value })}
                placeholder="ID del nodo origen"
                bg={colors.bg}
                borderColor={colors.border}
                color={colors.text}
              />
              <Text fontSize="xs" color={colors.subtext} mt={1}>
                Tipo: {formData.fromNodeType}
              </Text>
            </Box>

            <Box>
              <Text color={colors.text} mb={2} fontWeight="semibold">
                Nodo Destino (ID)
              </Text>
              <Input
                value={formData.toNodeId}
                onChange={(e) => onChange({ toNodeId: e.target.value })}
                placeholder="ID del nodo destino"
                bg={colors.bg}
                borderColor={colors.border}
                color={colors.text}
              />
              <Text fontSize="xs" color={colors.subtext} mt={1}>
                Tipo: {formData.toNodeType}
              </Text>
            </Box>

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
                bg="green.500"
                color="white"
                _hover={{ bg: "green.600" }}
              >
                Crear
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}

