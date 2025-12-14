"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  HStack,
  IconButton,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import { FiPlus, FiRefreshCw, FiLink } from "react-icons/fi";
import { useThemeMode } from "@/components/theme/ThemeProvider";
import { GraphNode, GraphRelationship, NodeType, RelationshipType } from "../types";
import { useGraphData } from "../hooks/useGraphData";
import { useGraphNodes } from "../hooks/useGraphNodes";
import { useGraphRelationships } from "../hooks/useGraphRelationships";
import { useGraphHighlights } from "../hooks/useGraphHighlights";
import { NodeInfoModal } from "./graph/NodeInfoModal";
import { RelationshipInfoModal } from "./graph/RelationshipInfoModal";
import { CreateNodeModal } from "./graph/CreateNodeModal";
import { EditNodeModal } from "./graph/EditNodeModal";
import { CreateRelationshipModal } from "./graph/CreateRelationshipModal";
import { GraphCanvas } from "./graph/GraphCanvas";

interface GraphViewTabProps {
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void;
}

export function GraphViewTab({ showNotification }: GraphViewTabProps) {
  const { colors } = useThemeMode();
  
  // Estados de modales
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [isEditNodeModalOpen, setIsEditNodeModalOpen] = useState(false);
  const [isNodeInfoModalOpen, setIsNodeInfoModalOpen] = useState(false);
  const [isRelationshipInfoModalOpen, setIsRelationshipInfoModalOpen] = useState(false);
  
  // Estados de selección
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<GraphRelationship | null>(null);

  // Hooks de datos y lógica
  const { graphData, loading, nodeMap, relationshipMap, fetchGraphData } = useGraphData(showNotification);
  const {
    nodeFormData,
    setNodeFormData,
    handleCreateNode,
    handleUpdateNode,
    handleDeleteNode,
    openEditNodeModal,
  } = useGraphNodes(showNotification, fetchGraphData);
  
  const {
    relationshipFormData,
    setRelationshipFormData,
    handleCreateRelationship,
    handleDeleteRelationship,
  } = useGraphRelationships(showNotification, fetchGraphData);

  const {
    highlightNodes,
    highlightLinks,
    handleNodeHover,
    clearHighlights,
    setHighlightsForNode,
    setHighlightsForLink,
  } = useGraphHighlights(graphData.relationships);

  // Handlers de eventos del grafo
  const handleNodeClick = useCallback((nodeId: string) => {
    const node = nodeMap.get(nodeId);
    if (!node) {
      console.warn("Node not found in map:", nodeId);
      return;
    }
    
    setSelectedNode(node);
    setSelectedRelationship(null);
    setIsNodeInfoModalOpen(true);
    setHighlightsForNode(nodeId, graphData.relationships);
  }, [nodeMap, graphData.relationships, setHighlightsForNode]);

  const handleLinkClick = useCallback((linkId: string) => {
    const rel = relationshipMap.get(linkId);
    if (!rel) {
      console.warn("Relationship not found in map:", linkId);
      return;
    }
    
    setSelectedRelationship(rel);
    setSelectedNode(null);
    setIsRelationshipInfoModalOpen(true);
    setHighlightsForLink(linkId, rel.startNodeId, rel.endNodeId);
  }, [relationshipMap, setHighlightsForLink]);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedRelationship(null);
    setIsNodeInfoModalOpen(false);
    setIsRelationshipInfoModalOpen(false);
    clearHighlights();
  }, [clearHighlights]);

  const handleEditNode = useCallback((node: GraphNode) => {
    openEditNodeModal(node);
    setIsEditNodeModalOpen(true);
  }, [openEditNodeModal]);

  const handleUpdateNodeSubmit = useCallback(async () => {
    if (selectedNode) {
      await handleUpdateNode(selectedNode);
      setIsEditNodeModalOpen(false);
    }
  }, [selectedNode, handleUpdateNode]);

  return (
    <Box>
      {/* Header con acciones */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold" color={colors.text}>
          Vista Relacional - Neo4j
        </Text>
        <HStack>
          <Button
            onClick={() => setIsNodeModalOpen(true)}
            colorScheme="blue"
            size="sm"
          >
            <Flex align="center" gap={2}>
              <Icon as={FiPlus} />
              <Text>Crear Nodo</Text>
            </Flex>
          </Button>
          <Button
            onClick={() => setIsRelationshipModalOpen(true)}
            colorScheme="green"
            size="sm"
          >
            <Flex align="center" gap={2}>
              <Icon as={FiLink} />
              <Text>Crear Relación</Text>
            </Flex>
          </Button>
          <IconButton
            aria-label="Refrescar"
            onClick={fetchGraphData}
            size="sm"
          >
            <Icon as={FiRefreshCw} />
          </IconButton>
        </HStack>
      </Flex>

      {/* Contenido principal */}
      {loading ? (
        <Flex justify="center" align="center" h="600px">
          <Spinner size="xl" color={colors.gold} />
        </Flex>
      ) : graphData.nodes.length === 0 ? (
        <Box
          border="1px solid"
          borderColor={colors.border}
          borderRadius="md"
          h="600px"
          bg={colors.bg}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <VStack gap={4}>
            <Text fontSize="lg" color={colors.subtext} textAlign="center">
              No hay nodos en el grafo
            </Text>
            <Text fontSize="sm" color={colors.subtext} textAlign="center" maxW="400px">
              Crea tu primer nodo haciendo clic en "Crear Nodo" para comenzar a visualizar las relaciones en Neo4j.
            </Text>
            <Button
              onClick={() => setIsNodeModalOpen(true)}
              colorScheme="blue"
            >
              <Flex align="center" gap={2}>
                <Icon as={FiPlus} />
                <Text>Crear Primer Nodo</Text>
              </Flex>
            </Button>
          </VStack>
        </Box>
      ) : (
        <GraphCanvas
          graphData={graphData}
          nodeMap={nodeMap}
          highlightNodes={highlightNodes}
          highlightLinks={highlightLinks}
          colors={colors}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          onNodeHover={handleNodeHover}
          onBackgroundClick={handleBackgroundClick}
        />
      )}

      {/* Modales */}
      <NodeInfoModal
        isOpen={isNodeInfoModalOpen}
        node={selectedNode}
        graphData={graphData}
        nodeMap={nodeMap}
        onClose={() => setIsNodeInfoModalOpen(false)}
        onEdit={handleEditNode}
        onDelete={handleDeleteNode}
        onDeleteRelationship={handleDeleteRelationship}
      />

      <RelationshipInfoModal
        isOpen={isRelationshipInfoModalOpen}
        relationship={selectedRelationship}
        nodeMap={nodeMap}
        onClose={() => setIsRelationshipInfoModalOpen(false)}
        onDelete={handleDeleteRelationship}
      />

      <CreateNodeModal
        isOpen={isNodeModalOpen}
        formData={nodeFormData}
        onClose={() => {
          setIsNodeModalOpen(false);
          setNodeFormData({ type: NodeType.CLIENT, id: "" });
        }}
        onChange={(data) => setNodeFormData({ ...nodeFormData, ...data })}
        onSubmit={async () => {
          await handleCreateNode();
          setIsNodeModalOpen(false);
        }}
      />

      <EditNodeModal
        isOpen={isEditNodeModalOpen}
        formData={nodeFormData}
        onClose={() => setIsEditNodeModalOpen(false)}
        onChange={(data) => setNodeFormData({ ...nodeFormData, ...data })}
        onSubmit={handleUpdateNodeSubmit}
      />

      <CreateRelationshipModal
        isOpen={isRelationshipModalOpen}
        formData={relationshipFormData}
        onClose={() => {
          setIsRelationshipModalOpen(false);
          setRelationshipFormData({
            type: RelationshipType.HAS_SERVICE,
            fromNodeId: "",
            fromNodeType: NodeType.CLIENT,
            toNodeId: "",
            toNodeType: NodeType.LAUNDRY_SERVICE,
          });
        }}
        onChange={(data) => setRelationshipFormData({ ...relationshipFormData, ...data })}
        onSubmit={async () => {
          await handleCreateRelationship();
          setIsRelationshipModalOpen(false);
        }}
      />
    </Box>
  );
}
