import { useState, useCallback } from "react";
import { apiPost, apiPut, apiDelete } from "@/lib/api";
import { getToken } from "@/lib/session";
import { GraphNode, CreateGraphNodeFormData, NodeType } from "../types";

interface UseGraphNodesReturn {
  nodeFormData: CreateGraphNodeFormData;
  setNodeFormData: React.Dispatch<React.SetStateAction<CreateGraphNodeFormData>>;
  handleCreateNode: () => Promise<void>;
  handleUpdateNode: (node: GraphNode) => Promise<void>;
  handleDeleteNode: (node: GraphNode) => Promise<void>;
  openEditNodeModal: (node: GraphNode) => void;
  refreshGraph: () => void;
}

export function useGraphNodes(
  showNotification: (type: "success" | "error" | "info", title: string, description?: string) => void,
  refreshGraph: () => void
): UseGraphNodesReturn {
  const [nodeFormData, setNodeFormData] = useState<CreateGraphNodeFormData>({
    type: NodeType.CLIENT,
    id: "",
  });

  const handleCreateNode = useCallback(async () => {
    try {
      const token = getToken();
      const result = await apiPost<GraphNode, CreateGraphNodeFormData>("/laundry/graph/nodes", nodeFormData, token);

      if (!result.success) {
        throw new Error(result.message || "Error al crear el nodo");
      }

      showNotification("success", "Nodo creado", "El nodo se creó exitosamente");
      setNodeFormData({ type: NodeType.CLIENT, id: "" });
      refreshGraph();
    } catch (error: any) {
      showNotification("error", "Error", error.message || "No se pudo crear el nodo");
    }
  }, [nodeFormData, showNotification, refreshGraph]);

  const handleUpdateNode = useCallback(async (selectedNode: GraphNode) => {
    try {
      const updateData: any = {};
      if (selectedNode.labels.includes(NodeType.CLIENT)) {
        if (nodeFormData.documentNumber) updateData.documentNumber = nodeFormData.documentNumber;
        if (nodeFormData.firstName) updateData.firstName = nodeFormData.firstName;
        if (nodeFormData.lastName) updateData.lastName = nodeFormData.lastName;
      } else if (selectedNode.labels.includes(NodeType.ROOM)) {
        if (nodeFormData.number) updateData.number = nodeFormData.number;
      } else if (selectedNode.labels.includes(NodeType.LAUNDRY_SERVICE)) {
        if (nodeFormData.serviceNumber) updateData.serviceNumber = nodeFormData.serviceNumber;
        if (nodeFormData.status) updateData.status = nodeFormData.status;
        if (nodeFormData.totalAmount) updateData.totalAmount = nodeFormData.totalAmount;
      }

      const token = getToken();
      const result = await apiPut<GraphNode, any>(
        `/laundry/graph/nodes/${selectedNode.labels[0]}/${selectedNode.properties.id}`,
        updateData,
        token
      );

      if (!result.success) {
        throw new Error(result.message || "Error al actualizar el nodo");
      }

      showNotification("success", "Nodo actualizado", "El nodo se actualizó exitosamente");
      refreshGraph();
    } catch (error: any) {
      showNotification("error", "Error", error.message || "No se pudo actualizar el nodo");
    }
  }, [nodeFormData, showNotification, refreshGraph]);

  const handleDeleteNode = useCallback(async (node: GraphNode) => {
    if (!confirm(`¿Estás seguro de eliminar este nodo?`)) return;

    try {
      const token = getToken();
      const result = await apiDelete<any>(
        `/laundry/graph/nodes/${node.labels[0]}/${node.properties.id}`,
        token
      );

      if (!result.success) {
        throw new Error(result.message || "Error al eliminar el nodo");
      }

      showNotification("success", "Nodo eliminado", "El nodo se eliminó exitosamente");
      refreshGraph();
    } catch (error: any) {
      showNotification("error", "Error", error.message || "No se pudo eliminar el nodo");
    }
  }, [showNotification, refreshGraph]);

  const openEditNodeModal = useCallback((node: GraphNode) => {
    setNodeFormData({
      type: node.labels[0] as NodeType,
      id: node.properties.id,
      documentNumber: node.properties.documentNumber,
      firstName: node.properties.firstName,
      lastName: node.properties.lastName,
      number: node.properties.number,
      serviceNumber: node.properties.serviceNumber,
      status: node.properties.status,
      totalAmount: node.properties.totalAmount,
      userId: node.properties.userId,
    });
  }, []);

  return {
    nodeFormData,
    setNodeFormData,
    handleCreateNode,
    handleUpdateNode,
    handleDeleteNode,
    openEditNodeModal,
    refreshGraph,
  };
}

