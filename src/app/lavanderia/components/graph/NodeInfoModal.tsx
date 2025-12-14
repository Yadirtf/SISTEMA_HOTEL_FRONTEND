"use client";

import { Box, Button, Flex, Text, VStack, HStack, Badge, IconButton, Icon } from "@chakra-ui/react";
import { FiEdit, FiTrash2, FiX } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { GraphNode, GraphRelationship, GraphData, NodeType, RelationshipType } from "../../types";
import { formatPropertyValue, getPropertyLabel, getNodeLabel } from "../../utils/graphFormatters";

interface NodeInfoModalProps {
  isOpen: boolean;
  node: GraphNode | null;
  graphData: GraphData;
  nodeMap: Map<string, GraphNode>;
  onClose: () => void;
  onEdit: (node: GraphNode) => void;
  onDelete: (node: GraphNode) => void;
  onDeleteRelationship: (rel: GraphRelationship) => void;
}

export function NodeInfoModal({
  isOpen,
  node,
  graphData,
  nodeMap,
  onClose,
  onEdit,
  onDelete,
  onDeleteRelationship,
}: NodeInfoModalProps) {
  const { colors } = useThemeMode();

  if (!isOpen || !node) return null;

  const nodeType = node.labels[0];
  const nodeId = node.properties.id || node.id;
  const connectedRelationships = graphData.relationships.filter(
    (rel) => rel.startNodeId === nodeId || rel.endNodeId === nodeId
  );

  const getFilteredProperties = () => {
    const excludedKeys: string[] = [];
    // Solo excluir las propiedades que ya se muestran en la sección principal
    if (nodeType === NodeType.CLIENT) {
      excludedKeys.push("firstName", "lastName", "documentNumber");
    } else if (nodeType === NodeType.ROOM) {
      excludedKeys.push("number");
    } else if (nodeType === NodeType.LAUNDRY_SERVICE) {
      excludedKeys.push("serviceNumber", "status", "totalAmount");
    }
    // Filtrar propiedades vacías o nulas, pero mantener todas las demás
    return Object.entries(node.properties)
      .filter(([key]) => !excludedKeys.includes(key))
      .filter(([key, value]) => {
        // Incluir todas las propiedades excepto las vacías (pero incluir 0, false, etc.)
        return value !== null && value !== undefined && value !== "";
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
            <Badge
              colorScheme={
                nodeType === NodeType.CLIENT ? "blue" : nodeType === NodeType.ROOM ? "green" : "red"
              }
              fontSize="md"
              px={3}
              py={1}
            >
              {nodeType === NodeType.CLIENT
                ? "Cliente"
                : nodeType === NodeType.ROOM
                ? "Habitación"
                : "Servicio de Lavandería"}
            </Badge>
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={colors.gold}>
              {getNodeLabel(node, nodeType)}
            </Text>
          </HStack>
          <HStack>
            <IconButton
              icon={<FiEdit />}
              aria-label="Editar"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(node);
              }}
            />
            <IconButton
              icon={<FiTrash2 />}
              aria-label="Eliminar"
              size="sm"
              colorScheme="red"
              onClick={() => {
                onClose();
                onDelete(node);
              }}
            />
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
          <VStack align="stretch" spacing={4}>
            {/* Información principal según el tipo */}
            {nodeType === NodeType.CLIENT && (
              <>
                <Box>
                  <Text fontSize="xs" color={colors.subtext} mb={1}>
                    Nombre Completo
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color={colors.text}>
                    {node.properties.firstName || ""} {node.properties.lastName || ""}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color={colors.subtext} mb={1}>
                    Número de Documento
                  </Text>
                  <Text fontSize="md" color={colors.text}>
                    {node.properties.documentNumber || "N/A"}
                  </Text>
                </Box>
                {node.properties.createdAt && (
                  <Box>
                    <Text fontSize="xs" color={colors.subtext} mb={1}>
                      Fecha de Registro
                    </Text>
                    <Text fontSize="sm" color={colors.text}>
                      {formatPropertyValue("createdAt", node.properties.createdAt)}
                    </Text>
                  </Box>
                )}
              </>
            )}

            {nodeType === NodeType.ROOM && (
              <>
                <Box>
                  <Text fontSize="xs" color={colors.subtext} mb={1}>
                    Número de Habitación
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color={colors.text}>
                    {node.properties.number || "N/A"}
                  </Text>
                </Box>
                {node.properties.createdAt && (
                  <Box>
                    <Text fontSize="xs" color={colors.subtext} mb={1}>
                      Fecha de Registro
                    </Text>
                    <Text fontSize="sm" color={colors.text}>
                      {formatPropertyValue("createdAt", node.properties.createdAt)}
                    </Text>
                  </Box>
                )}
              </>
            )}

            {nodeType === NodeType.LAUNDRY_SERVICE && (
              <>
                <Box>
                  <Text fontSize="xs" color={colors.subtext} mb={1}>
                    Número de Servicio
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color={colors.text}>
                    {node.properties.serviceNumber || "N/A"}
                  </Text>
                </Box>
                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text fontSize="xs" color={colors.subtext} mb={1}>
                      Estado
                    </Text>
                    <Badge
                      colorScheme={
                        node.properties.status === "completed"
                          ? "green"
                          : node.properties.status === "cancelled"
                          ? "red"
                          : "orange"
                      }
                    >
                      {formatPropertyValue("status", node.properties.status)}
                    </Badge>
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="xs" color={colors.subtext} mb={1}>
                      Estado de Pago
                    </Text>
                    <Badge
                      colorScheme={
                        node.properties.paymentStatus === "paid"
                          ? "green"
                          : "orange"
                      }
                    >
                      {formatPropertyValue("paymentStatus", node.properties.paymentStatus)}
                    </Badge>
                  </Box>
                </HStack>
                <Box>
                  <Text fontSize="xs" color={colors.subtext} mb={1}>
                    Monto Total
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color={colors.text}>
                    {formatPropertyValue("totalAmount", node.properties.totalAmount)}
                  </Text>
                </Box>
                {node.properties.createdAt && (
                  <Box>
                    <Text fontSize="xs" color={colors.subtext} mb={1}>
                      Fecha de Creación
                    </Text>
                    <Text fontSize="sm" color={colors.text}>
                      {formatPropertyValue("createdAt", node.properties.createdAt)}
                    </Text>
                  </Box>
                )}
                {node.properties.completedAt && (
                  <Box>
                    <Text fontSize="xs" color={colors.subtext} mb={1}>
                      Fecha de Completado
                    </Text>
                    <Text fontSize="sm" color={colors.text}>
                      {formatPropertyValue("completedAt", node.properties.completedAt)}
                    </Text>
                  </Box>
                )}
                {node.properties.paidAt && (
                  <Box>
                    <Text fontSize="xs" color={colors.subtext} mb={1}>
                      Fecha de Pago
                    </Text>
                    <Text fontSize="sm" color={colors.text}>
                      {formatPropertyValue("paidAt", node.properties.paidAt)}
                    </Text>
                  </Box>
                )}
              </>
            )}

            <Box h="1px" bg={colors.border} />

            {/* Información adicional */}
            {getFilteredProperties().length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color={colors.text} mb={3}>
                  Información Detallada
                </Text>
                <VStack align="stretch" spacing={2}>
                  {getFilteredProperties().map(([key, value]) => (
                    <Flex
                      key={key}
                      justify="space-between"
                      align="start"
                      py={2}
                      borderBottom="1px"
                      borderColor={colors.border}
                    >
                      <Text fontSize="sm" color={colors.subtext} flex={1}>
                        {getPropertyLabel(key)}:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color={colors.text} flex={1} textAlign="right">
                        {formatPropertyValue(key, value)}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Relaciones conectadas */}
            {connectedRelationships.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color={colors.text} mb={3}>
                  Relaciones Conectadas
                </Text>
                <VStack align="stretch" spacing={2}>
                  {connectedRelationships.map((rel) => {
                    const fromNode = nodeMap.get(rel.startNodeId);
                    const toNode = nodeMap.get(rel.endNodeId);
                    const isFrom = rel.startNodeId === nodeId;

                    return (
                      <Box
                        key={rel.id}
                        p={3}
                        bg={colors.bg}
                        borderRadius="md"
                        border="1px solid"
                        borderColor={colors.border}
                      >
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1} flex={1}>
                            <Badge colorScheme="purple" fontSize="xs">
                              {rel.type === RelationshipType.HAS_SERVICE
                                ? "Tiene Servicio"
                                : "Para Habitación"}
                            </Badge>
                            <Text fontSize="xs" color={colors.subtext}>
                              {isFrom ? "→" : "←"}{" "}
                              {isFrom
                                ? getNodeLabel(toNode || {}, toNode?.labels[0] || "")
                                : getNodeLabel(fromNode || {}, fromNode?.labels[0] || "")}
                            </Text>
                          </VStack>
                          <IconButton
                            icon={<FiTrash2 />}
                            aria-label="Eliminar relación"
                            size="xs"
                            colorScheme="red"
                            onClick={() => {
                              onClose();
                              onDeleteRelationship(rel);
                            }}
                          />
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}

