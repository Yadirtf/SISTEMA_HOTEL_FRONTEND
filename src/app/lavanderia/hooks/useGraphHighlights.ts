import { useState, useRef, useCallback } from "react";
import { GraphRelationship } from "../types";

interface UseGraphHighlightsReturn {
  highlightNodes: Set<string>;
  highlightLinks: Set<string>;
  handleNodeHover: (nodeId: string | null) => void;
  clearHighlights: () => void;
  setHighlightsForNode: (nodeId: string, relationships: GraphRelationship[]) => void;
  setHighlightsForLink: (linkId: string, startNodeId: string, endNodeId: string) => void;
}

export function useGraphHighlights(relationships: GraphRelationship[]): UseGraphHighlightsReturn {
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastHoveredNodeRef = useRef<string | null>(null);
  const highlightNodesRef = useRef<Set<string>>(new Set());
  const highlightLinksRef = useRef<Set<string>>(new Set());
  
  const updateHighlights = useCallback((nodeId: string | null) => {
    if (nodeId === lastHoveredNodeRef.current) {
      return;
    }
    
    lastHoveredNodeRef.current = nodeId;
    
    if (nodeId) {
      const newHighlightNodes = new Set([nodeId]);
      const newHighlightLinks = new Set(
        relationships
          .filter((rel) => rel.startNodeId === nodeId || rel.endNodeId === nodeId)
          .map((rel) => rel.id)
      );
      
      const nodesChanged = 
        newHighlightNodes.size !== highlightNodesRef.current.size ||
        Array.from(newHighlightNodes).some(id => !highlightNodesRef.current.has(id));
      const linksChanged =
        newHighlightLinks.size !== highlightLinksRef.current.size ||
        Array.from(newHighlightLinks).some(id => !highlightLinksRef.current.has(id));
      
      if (nodesChanged || linksChanged) {
        highlightNodesRef.current = newHighlightNodes;
        highlightLinksRef.current = newHighlightLinks;
        setHighlightNodes(newHighlightNodes);
        setHighlightLinks(newHighlightLinks);
      }
    } else {
      if (highlightNodesRef.current.size > 0 || highlightLinksRef.current.size > 0) {
        highlightNodesRef.current = new Set();
        highlightLinksRef.current = new Set();
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
      }
    }
  }, [relationships]);
  
  const handleNodeHover = useCallback((nodeId: string | null) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      updateHighlights(nodeId);
    }, 100);
  }, [updateHighlights]);

  const clearHighlights = useCallback(() => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    lastHoveredNodeRef.current = null;
  }, []);

  const setHighlightsForNode = useCallback((nodeId: string, relationships: GraphRelationship[]) => {
    setHighlightNodes(new Set([nodeId]));
    setHighlightLinks(
      new Set(
        relationships
          .filter((rel) => rel.startNodeId === nodeId || rel.endNodeId === nodeId)
          .map((rel) => rel.id)
      )
    );
  }, []);

  const setHighlightsForLink = useCallback((linkId: string, startNodeId: string, endNodeId: string) => {
    setHighlightLinks(new Set([linkId]));
    setHighlightNodes(new Set([startNodeId, endNodeId]));
  }, []);

  return {
    highlightNodes,
    highlightLinks,
    handleNodeHover,
    clearHighlights,
    setHighlightsForNode,
    setHighlightsForLink,
  };
}

