"use client";

import { useMemo, useEffect, useRef } from "react";
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
  const graphRef = useRef<any>(null);

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

  // Agregar estilos CSS para el cursor pointer y encontrar el canvas
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const findAndStyleCanvas = () => {
      // Buscar el canvas dentro del contenedor específico
      const container = document.getElementById("graph-canvas-container");
      if (container) {
        const canvas = container.querySelector("canvas");
        if (canvas) {
          canvas.style.cursor = "pointer";
          // Agregar listener para cambiar cursor dinámicamente
          const handleMouseMove = (e: MouseEvent) => {
            // El cursor se manejará por los eventos onNodeHover y onLinkHover
            // pero establecemos pointer por defecto
            canvas.style.cursor = "pointer";
          };
          canvas.addEventListener("mousemove", handleMouseMove);
          return () => {
            canvas.removeEventListener("mousemove", handleMouseMove);
          };
        }
      }
      return undefined;
    };

    // Intentar encontrar el canvas después de que se renderice
    const timeout = setTimeout(() => {
      findAndStyleCanvas();
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [graphNodes, graphLinks]);

  if (typeof window === "undefined") {
    return null;
  }

  return (
    <Box
      border="1px solid"
      borderColor={colors.border}
      borderRadius="md"
      overflow="hidden"
      h="700px"
      bg={colors.background}
      position="relative"
      id="graph-canvas-container"
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={{ nodes: graphNodes, links: graphLinks }}
        nodeLabel={(node: any) => {
          const fullNode = nodeMap.get(node.id);
          return fullNode ? getNodeLabel(fullNode, fullNode.labels[0]) : node.id;
        }}
        nodeColor={(node: any) => {
          const nodeId = node.id;
          if (highlightNodes.has(nodeId)) return colors.gold;
          const nodeType = nodeMap.get(nodeId)?.labels[0];
          // Colores más vibrantes y definidos
          if (nodeType === NodeType.CLIENT) return "#4A90E2";
          if (nodeType === NodeType.ROOM) return "#50C878";
          if (nodeType === NodeType.LAUNDRY_SERVICE) return "#FF6B6B";
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
        linkWidth={(link: any) => (highlightLinks.has(link.id) ? 5 : 3)}
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
        nodeVal={(node: any) => 8}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const fullNode = nodeMap.get(node.id);
          if (!fullNode) return;

          // Validar que las coordenadas del nodo sean válidas
          if (node.x == null || node.y == null || !isFinite(node.x) || !isFinite(node.y)) {
            return;
          }

          const nodeType = fullNode.labels[0];
          const nodeId = node.id;
          const isHighlighted = highlightNodes.has(nodeId);
          
          // Dibujar círculo del nodo con sombra y borde (más pequeño)
          const nodeRadius = 12;
          const shadowOffset = 2 / globalScale;
          
          // Sombra del círculo
          ctx.beginPath();
          ctx.arc(node.x + shadowOffset, node.y + shadowOffset, nodeRadius, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
          ctx.fill();
          
          // Círculo principal con gradiente
          const nodeColor = nodeType === NodeType.CLIENT ? "#4A90E2" : 
                           nodeType === NodeType.ROOM ? "#50C878" : 
                           "#FF6B6B";
          const highlightColor = colors.gold;
          
          // Gradiente para el círculo
          const gradient = ctx.createRadialGradient(
            node.x - nodeRadius * 0.3, 
            node.y - nodeRadius * 0.3, 
            0,
            node.x, 
            node.y, 
            nodeRadius
          );
          gradient.addColorStop(0, isHighlighted ? highlightColor : `${nodeColor}CC`);
          gradient.addColorStop(1, isHighlighted ? highlightColor : `${nodeColor}FF`);
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Borde del círculo
          ctx.strokeStyle = isHighlighted ? highlightColor : "#FFFFFF";
          ctx.lineWidth = isHighlighted ? 3 / globalScale : 2 / globalScale;
          ctx.stroke();
          
          // Información del nodo
          let label = "";
          let subLabel = "";

          // Determinar qué información mostrar según el tipo de nodo
          if (nodeType === NodeType.CLIENT) {
            const firstName = fullNode.properties?.firstName || "";
            const lastName = fullNode.properties?.lastName || "";
            const fullName = `${firstName} ${lastName}`.trim();
            label = fullName || fullNode.properties?.documentNumber || "Cliente";
            subLabel = fullNode.properties?.documentNumber ? `Doc: ${fullNode.properties.documentNumber}` : `ID: ${node.id.substring(0, 8)}...`;
          } else if (nodeType === NodeType.ROOM) {
            label = `Hab. ${fullNode.properties?.number || node.id.substring(0, 8)}`;
            subLabel = `ID: ${node.id.substring(0, 8)}...`;
          } else if (nodeType === NodeType.LAUNDRY_SERVICE) {
            label = fullNode.properties?.serviceNumber || `Serv. ${node.id.substring(0, 8)}`;
            const status = fullNode.properties?.status || "N/A";
            subLabel = `Estado: ${status}`;
          } else {
            label = node.id.substring(0, 12);
          }

          // Configurar el estilo del texto (más pequeño)
          const fontSize = Math.max(8, 11 / globalScale);
          ctx.font = `bold ${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          // Medir el ancho del texto para el fondo
          const textMetrics = ctx.measureText(label);
          const textWidth = textMetrics.width;
          const padding = 6 / globalScale;
          const textHeight = fontSize;
          
          // Texto sin fondo - usar color oscuro con borde blanco para legibilidad
          const textColor = nodeType === NodeType.CLIENT ? "#1a365d" : 
                          nodeType === NodeType.ROOM ? "#22543d" : 
                          "#742a2a";
          const textStrokeColor = "#FFFFFF";
          
          // Dibujar el texto principal con borde blanco para legibilidad
          const labelY = node.y + nodeRadius + 10 / globalScale;
          ctx.strokeStyle = textStrokeColor;
          ctx.lineWidth = 2.5 / globalScale;
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.strokeText(label, node.x, labelY);
          ctx.fillStyle = textColor;
          ctx.fillText(label, node.x, labelY);

          // Dibujar el subtítulo si existe y el zoom es suficiente (más pequeño)
          if (subLabel && globalScale > 0.4) {
            const subFontSize = Math.max(7, 9 / globalScale);
            ctx.font = `${subFontSize}px Sans-Serif`;
            const subLabelY = labelY + 10 / globalScale;
            ctx.strokeStyle = textStrokeColor;
            ctx.lineWidth = 2 / globalScale;
            ctx.strokeText(subLabel, node.x, subLabelY);
            ctx.fillStyle = textColor;
            ctx.fillText(subLabel, node.x, subLabelY);
          }
        }}
        onNodeClick={(node: any) => {
          if (node && node.id) {
            console.log("Node clicked:", node.id, node);
            console.log("NodeMap keys:", Array.from(nodeMap.keys()));
            console.log("Looking for node:", String(node.id));
            onNodeClick(String(node.id));
          }
        }}
        onLinkClick={(link: any) => {
          if (link && link.id) {
            console.log("Link clicked:", link.id, link);
            console.log("RelationshipMap keys:", Array.from(graphData.relationships.map(r => r.id)));
            console.log("Looking for link:", String(link.id));
            onLinkClick(String(link.id));
          }
        }}
        onNodeHover={(node: any) => {
          if (node && node.id) {
            onNodeHover(node.id);
            // Cambiar cursor cuando se pasa sobre un nodo
            if (typeof window !== "undefined") {
              const container = document.getElementById("graph-canvas-container");
              const canvas = container?.querySelector("canvas");
              if (canvas) {
                canvas.style.cursor = "pointer";
              }
            }
            // NO reiniciar la simulación en hover para evitar movimiento constante
          } else {
            onNodeHover(null);
            // Restaurar cursor cuando se sale del nodo
            if (typeof window !== "undefined") {
              const container = document.getElementById("graph-canvas-container");
              const canvas = container?.querySelector("canvas");
              if (canvas) {
                canvas.style.cursor = "default";
              }
            }
          }
        }}
        onLinkHover={(link: any) => {
          // Cambiar cursor cuando se pasa sobre un link
          if (typeof window !== "undefined") {
            const container = document.getElementById("graph-canvas-container");
            const canvas = container?.querySelector("canvas");
            if (canvas) {
              canvas.style.cursor = link ? "pointer" : "default";
            }
          }
        }}
        onBackgroundClick={onBackgroundClick}
        cooldownTicks={50}
        onEngineStop={() => {
          // La simulación se detiene automáticamente cuando alpha llega a 0
        }}
        enablePanInteraction={true}
        enableZoomInteraction={true}
        enableNodeDrag={true}
        d3AlphaDecay={0.15}
        d3VelocityDecay={0.7}
        warmupTicks={15}
        minZoom={0.1}
        maxZoom={4}
        nodeRelSize={4}
        d3Force={(d3: any, simulation: any) => {
          // Fuerza de repulsión fuerte pero estable (reducida para evitar movimiento constante)
          d3.force('charge', d3.forceManyBody().strength(-3000));
          
          // Fuerza de enlace con distancia dinámica basada en el número de conexiones
          const links = simulation.links();
          d3.force('link', d3.forceLink(links)
            .id((d: any) => d.id)
            .distance((link: any) => {
              // Calcular el número de conexiones del nodo fuente y destino
              const sourceConnections = links.filter((l: any) => 
                (l.source === link.source || l.target === link.source) && l !== link
              ).length;
              const targetConnections = links.filter((l: any) => 
                (l.source === link.target || l.target === link.target) && l !== link
              ).length;
              
              // Distancia base grande, aumentada si hay muchas conexiones
              const baseDistance = 350;
              const connectionMultiplier = Math.max(sourceConnections, targetConnections) * 40;
              return baseDistance + connectionMultiplier;
            })
            .strength(0.2)
          );
          
          // Fuerza de colisión para evitar que los nodos se superpongan (reducida para estabilidad)
          d3.force('collision', d3.forceCollide()
            .radius((node: any) => {
              // Radio de colisión basado en el tamaño del nodo + padding para separación
              // 12 (radio del nodo) + 35 (padding) + 25 (espacio para etiqueta) = 72
              return 72;
            })
            .strength(0.9)
          );
          
          // Fuerza centrífuga para distribuir mejor los nodos
          d3.force('center', d3.forceCenter());
        }}
      />
    </Box>
  );
}
