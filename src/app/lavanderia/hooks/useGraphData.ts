import { useState, useEffect, useCallback, useMemo } from "react";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/session";
import { GraphData, GraphNode, GraphRelationship } from "../types";

interface UseGraphDataReturn {
  graphData: GraphData;
  loading: boolean;
  nodeMap: Map<string, GraphNode>;
  relationshipMap: Map<string, GraphRelationship>;
  fetchGraphData: () => Promise<void>;
}

export function useGraphData(
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void
): UseGraphDataReturn {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], relationships: [] });
  const [loading, setLoading] = useState(true);

  const fetchGraphData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken() || undefined;
      const result = await apiGet<GraphData>("/laundry/graph", token);

      if (!result.success) {
        throw new Error(result.message || "Error al obtener el grafo");
      }

      setGraphData(result.data || { nodes: [], relationships: [] });
    } catch (error: any) {
      console.error("Error fetching graph data:", error);
      const errorMessage = error.message || "No se pudo cargar el grafo. Verifica que Neo4j esté conectado.";
      showNotification("error", "Error", errorMessage);
      setGraphData({ nodes: [], relationships: [] });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Mapa de nodos para búsquedas rápidas
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    graphData.nodes.forEach(node => {
      const nodeId = node.properties.id || node.id;
      map.set(nodeId, node);
    });
    return map;
  }, [graphData.nodes]);

  // Mapa de relaciones para búsquedas rápidas
  const relationshipMap = useMemo(() => {
    const map = new Map<string, GraphRelationship>();
    graphData.relationships.forEach(rel => {
      map.set(rel.id, rel);
    });
    return map;
  }, [graphData.relationships]);

  return {
    graphData,
    loading,
    nodeMap,
    relationshipMap,
    fetchGraphData,
  };
}

