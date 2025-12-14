"use client";

import { useMemo } from "react";
import { Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { GraphData, GraphNode, GraphRelationship, NodeType, RelationshipType } from "../../types";
import { getNodeLabel } from "../../utils/graphFormatters";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface GraphCanvasProps {
  graphData: GraphData;
  nodeMap: Map<string, GraphNode>;
  highlightNodes: Set<string>;
  highlightLinks: Set<string>;
  colors: any;
  onNodeClick: (nodeId: string) => void;
  onLinkClick: (linkId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  onBackgroundClick: () => void;
}

export function GraphCanvas({
  graphData,
  nodeMap,
  highlightNodes,
  highlightLinks,
  colors,
  onNodeClick,
  onLinkClick,
  onNodeHover,
  onBackgroundClick,
}: GraphCanvasProps) {
  const graphNodes = useMemo(() => {
    return graphData.nodes.map((node) => ({
      id: node.properties.id || node.id,
      label: node.labels[0],
      ...node.properties,
      nodeColor: node.labels[0] === NodeType.CLIENT ? "#4A90E2" : 
                 node.labels[0] === NodeType.ROOM ? "#50C878" : 
                 "#FF6B6B",
    }));
  }, [graphData.nodes]);

  const graphLinks = useMemo(() => {
    return graphData.relationships.map((rel) => ({
      id: rel.id,
      source: rel.startNodeId,
      target: rel.endNodeId,
      label: rel.type,
    }));
  }, [graphData.relationships]);

  if (typeof window === "undefined") {
    return null;
  }

  return (
    <Box
      border="1px solid"
      borderColor={colors.border}
      borderRadius="md"
      overflow="hidden"
      h="600px"
      bg={colors.background}
    >
      <ForceGraph2D
        graphData={{ nodes: graphNodes, links: graphLinks }}
        nodeLabel={(node: any) => {
          const fullNode = nodeMap.get(node.id);
          return fullNode ? getNodeLabel(fullNode, fullNode.labels[0]) : node.id;
        }}
        nodeColor={(node: any) => {
          const nodeId = node.id;
          if (highlightNodes.has(nodeId)) return colors.gold;
          return node.nodeColor || colors.subtext;
        }}
        linkLabel={(link: any) => {
          const relType = link.label || "";
          if (relType === RelationshipType.HAS_SERVICE) {
            return "Tiene Servicio";
          } else if (relType === RelationshipType.FOR_ROOM) {
            return "Para Habitación";
          }
          return relType;
        }}
        linkColor={(link: any) => {
          if (highlightLinks.has(link.id)) return colors.gold;
          const relType = link.label || "";
          if (relType === RelationshipType.HAS_SERVICE) {
            return "#4A90E2";
          } else if (relType === RelationshipType.FOR_ROOM) {
            return "#50C878";
          }
          return colors.border;
        }}
        linkWidth={(link: any) => (highlightLinks.has(link.id) ? 4 : 2)}
        linkCurvature={0.25}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={(link: any) => {
          const relType = link.label || "";
          if (relType === RelationshipType.HAS_SERVICE) {
            return "#4A90E2";
          } else if (relType === RelationshipType.FOR_ROOM) {
            return "#50C878";
          }
          return colors.border;
        }}
        nodeVal={(node: any) => 10}
        onNodeClick={(node: any) => {
          if (node && node.id) {
            onNodeClick(String(node.id));
          }
        }}
        onLinkClick={(link: any) => {
          if (link && link.id) {
            onLinkClick(String(link.id));
          }
        }}
        onNodeHover={(node: any) => {
          if (node && node.id) {
            onNodeHover(node.id);
          } else {
            onNodeHover(null);
          }
        }}
        onBackgroundClick={onBackgroundClick}
        cooldownTicks={100}
        onEngineStop={() => {}}
        enablePanInteraction={true}
        enableZoomInteraction={true}
        enableNodeDrag={true}
        d3AlphaDecay={0.0228}
        d3VelocityDecay={0.4}
        warmupTicks={0}
        minZoom={0.1}
        maxZoom={4}
        nodeRelSize={6}
      />
    </Box>
  );
}

