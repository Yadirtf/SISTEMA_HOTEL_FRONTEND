import { useState, useCallback } from "react";
import { apiPost, apiDelete } from "@/lib/api";
import { getToken } from "@/lib/session";
import { GraphRelationship, CreateRelationshipFormData, RelationshipType, NodeType } from "../types";

interface UseGraphRelationshipsReturn {
  relationshipFormData: CreateRelationshipFormData;
  setRelationshipFormData: React.Dispatch<React.SetStateAction<CreateRelationshipFormData>>;
  handleCreateRelationship: () => Promise<void>;
  handleDeleteRelationship: (rel: GraphRelationship) => Promise<void>;
  refreshGraph: () => void;
}

export function useGraphRelationships(
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void,
  refreshGraph: () => void
): UseGraphRelationshipsReturn {
  const [relationshipFormData, setRelationshipFormData] = useState<CreateRelationshipFormData>({
    type: RelationshipType.HAS_SERVICE,
    fromNodeId: "",
    fromNodeType: NodeType.CLIENT,
    toNodeId: "",
    toNodeType: NodeType.LAUNDRY_SERVICE,
  });

  const handleCreateRelationship = useCallback(async () => {
    try {
      const token = getToken() || undefined;
      const result = await apiPost<GraphRelationship, CreateRelationshipFormData>(
        "/laundry/graph/relationships",
        {
          type: relationshipFormData.type,
          fromNodeId: relationshipFormData.fromNodeId,
          fromNodeType: relationshipFormData.fromNodeType,
          toNodeId: relationshipFormData.toNodeId,
          toNodeType: relationshipFormData.toNodeType,
        },
        token
      );

      if (!result.success) {
        throw new Error(result.message || "Error al crear la relación");
      }

      showNotification("success", "Relación creada", "La relación se creó exitosamente");
      setRelationshipFormData({
        type: RelationshipType.HAS_SERVICE,
        fromNodeId: "",
        fromNodeType: NodeType.CLIENT,
        toNodeId: "",
        toNodeType: NodeType.LAUNDRY_SERVICE,
      });
      refreshGraph();
    } catch (error: any) {
      showNotification("error", "Error", error.message || "No se pudo crear la relación");
    }
  }, [relationshipFormData, showNotification, refreshGraph]);

  const handleDeleteRelationship = useCallback(async (rel: GraphRelationship) => {
    if (!confirm(`¿Estás seguro de eliminar esta relación?`)) return;

    try {
      const token = getToken() || undefined;
      const result = await apiDelete<any>(`/laundry/graph/relationships/${rel.id}`, token);

      if (!result.success) {
        throw new Error(result.message || "Error al eliminar la relación");
      }

      showNotification("success", "Relación eliminada", "La relación se eliminó exitosamente");
      refreshGraph();
    } catch (error: any) {
      showNotification("error", "Error", error.message || "No se pudo eliminar la relación");
    }
  }, [showNotification, refreshGraph]);

  return {
    relationshipFormData,
    setRelationshipFormData,
    handleCreateRelationship,
    handleDeleteRelationship,
    refreshGraph,
  };
}

