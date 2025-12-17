"use client";

import { Box, Button, Flex, Text, VStack, HStack, Badge, IconButton, Icon } from "@chakra-ui/react";
import { FiTrash2, FiX, FiLink } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { GraphRelationship, GraphNode, NodeType, RelationshipType } from "../../types";
import { formatPropertyValue, getPropertyLabel, getNodeLabel } from "../../utils/graphFormatters";

interface RelationshipInfoModalProps {
  isOpen: boolean;
  relationship: GraphRelationship | null;
  nodeMap: Map<string, GraphNode>;
  onClose: () => void;
  onDelete: (rel: GraphRelationship) => void;
}

export function RelationshipInfoModal({
  isOpen,
  relationship,
  nodeMap,
  onClose,
  onDelete,
}: RelationshipInfoModalProps) {
  const { colors } = useThemeMode();

  if (!isOpen || !relationship) return null;

  const fromNode = nodeMap.get(relationship.startNodeId);
  const toNode = nodeMap.get(relationship.endNodeId);
  
  const filteredProperties = Object.entries(relationship.properties).filter(([key]) => {
    const dateKeys = ['createdAt', 'updatedAt', 'completedAt', 'paidAt'];
    return !dateKeys.includes(key) && 
           !key.toLowerCase().includes('date') && 
           !key.toLowerCase().includes('at');
  });

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
        maxW="500px"
        maxH="90vh"
        display="flex"
        flexDirection="column"
        boxShadow={`0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px ${colors.border}`}
        onClick={(e) => e.stopPropagation()}
        m={{ base: 2, md: 0 }}
      >
        {/* Header - Fijo */}
        <Box
          p={{ base: 4, md: 6 }}
          borderBottom="2px"
          borderColor={colors.border}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexShrink={0}
        >
          <HStack>
            <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
              {relationship.type === RelationshipType.HAS_SERVICE
                ? "Tiene Servicio"
                : "Para Habitación"}
            </Badge>
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={colors.gold}>
              Relación
            </Text>
          </HStack>
          <HStack>
            <IconButton
              aria-label="Eliminar relación"
              size="sm"
              colorScheme="red"
              onClick={() => {
                onClose();
                onDelete(relationship);
              }}
            >
              <Icon as={FiTrash2} />
            </IconButton>
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
          </HStack>
        </Box>

        {/* Content - Con scroll */}
        <Box
          p={{ base: 4, md: 6 }}
          overflowY="auto"
          flex="1"
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: colors.bg,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: colors.border,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: colors.gold,
            },
          }}
        >
          <VStack align="stretch" gap={4}>
            {/* Nodo Origen */}
            <Box>
              <Text fontSize="xs" color={colors.subtext} mb={2}>
                Nodo Origen
              </Text>
              <Box p={3} bg={colors.bg} borderRadius="md" border="1px solid" borderColor={colors.border}>
                {fromNode ? (
                  <VStack align="start" gap={1}>
                    <HStack>
                      <Badge
                        colorScheme={
                          fromNode.labels[0] === NodeType.CLIENT
                            ? "blue"
                            : fromNode.labels[0] === NodeType.ROOM
                            ? "green"
                            : "red"
                        }
                        fontSize="xs"
                      >
                        {fromNode.labels[0]}
                      </Badge>
                      <Text fontSize="sm" fontWeight="semibold" color={colors.text}>
                        {getNodeLabel(fromNode, fromNode.labels[0])}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color={colors.subtext}>
                      ID: {relationship.startNodeId}
                    </Text>
                  </VStack>
                ) : (
                  <Text fontSize="sm" color={colors.subtext}>
                    ID: {relationship.startNodeId}
                  </Text>
                )}
              </Box>
            </Box>

            <Flex justify="center">
              <Icon as={FiLink} fontSize="2xl" color={colors.gold} />
            </Flex>

            {/* Nodo Destino */}
            <Box>
              <Text fontSize="xs" color={colors.subtext} mb={2}>
                Nodo Destino
              </Text>
              <Box p={3} bg={colors.bg} borderRadius="md" border="1px solid" borderColor={colors.border}>
                {toNode ? (
                  <VStack align="start" gap={1}>
                    <HStack>
                      <Badge
                        colorScheme={
                          toNode.labels[0] === NodeType.CLIENT
                            ? "blue"
                            : toNode.labels[0] === NodeType.ROOM
                            ? "green"
                            : "red"
                        }
                        fontSize="xs"
                      >
                        {toNode.labels[0]}
                      </Badge>
                      <Text fontSize="sm" fontWeight="semibold" color={colors.text}>
                        {getNodeLabel(toNode, toNode.labels[0])}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color={colors.subtext}>
                      ID: {relationship.endNodeId}
                    </Text>
                  </VStack>
                ) : (
                  <Text fontSize="sm" color={colors.subtext}>
                    ID: {relationship.endNodeId}
                  </Text>
                )}
              </Box>
            </Box>

            {/* Propiedades Adicionales */}
            {filteredProperties.length > 0 && (
              <>
                <Box h="1px" bg={colors.border} />
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={colors.text} mb={2}>
                    Propiedades Adicionales
                  </Text>
                  <VStack align="stretch" gap={2}>
                    {filteredProperties.map(([key, value]) => (
                      <Flex key={key} justify="space-between" align="start">
                        <Text fontSize="sm" color={colors.subtext}>
                          {getPropertyLabel(key)}:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium" color={colors.text}>
                          {formatPropertyValue(key, value)}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              </>
            )}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}

