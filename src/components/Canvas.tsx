import { useCallback, useEffect, useRef, useState } from "react";

import type { DiagramNode as DiagramNodeType, ViewportState } from "../types";
import { DiagramNode } from "./DiagramNode";

interface CanvasProps {
  nodes: DiagramNodeType[];
  onNodeUpdate: (id: string, updates: Partial<DiagramNodeType>) => void;
  onNodeDelete: (id: string) => void;
  onNodeAdd: (node: Omit<DiagramNodeType, "id">) => void;
  onNodeEdit?: (node: DiagramNodeType) => void;
  activeTool: string;
  currentUserId: string;
}

export function Canvas({
  nodes,
  onNodeUpdate,
  onNodeDelete,
  onNodeAdd,
  onNodeEdit,
  activeTool,
  currentUserId,
}: CanvasProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const [isPanning, setIsPanning] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{
    startX: number;
    startY: number;
    startViewportX: number;
    startViewportY: number;
  } | null>(null);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "add") {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
      const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;

      const newNode: Omit<DiagramNodeType, "id"> = {
        x,
        y,
        width: 400, // Increased from 300
        height: 300, // Increased from 200
        code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
        title: "New Diagram",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUserId,
      };

      onNodeAdd(newNode);
      return;
    }

    // Start panning
    if (activeTool === "select" || activeTool === "move") {
      setIsPanning(true);
      setSelectedNode(null);

      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startViewportX: viewport.x,
        startViewportY: viewport.y,
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!panRef.current) return;

        // Capture values locally to prevent race condition
        const startViewportX = panRef.current.startViewportX;
        const startViewportY = panRef.current.startViewportY;

        const deltaX = e.clientX - panRef.current.startX;
        const deltaY = e.clientY - panRef.current.startY;

        setViewport((prev) => ({
          ...prev,
          x: startViewportX + deltaX,
          y: startViewportY + deltaY,
        }));
      };

      const handleMouseUp = () => {
        setIsPanning(false);
        panRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = -e.deltaY * 0.001;
      const newZoom = Math.min(Math.max(viewport.zoom + delta, 0.1), 3);

      const zoomFactor = newZoom / viewport.zoom;

      setViewport((prev) => ({
        x: mouseX - (mouseX - prev.x) * zoomFactor,
        y: mouseY - (mouseY - prev.y) * zoomFactor,
        zoom: newZoom,
      }));
    },
    [viewport.zoom]
  );

  const handleNodeDuplicate = useCallback(
    (node: DiagramNodeType) => {
      const duplicatedNode: Omit<DiagramNodeType, "id"> = {
        ...node,
        x: node.x + 20,
        y: node.y + 20,
        title: `${node.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUserId,
      };
      onNodeAdd(duplicatedNode);
    },
    [onNodeAdd, currentUserId]
  );

  const zoomIn = () => {
    setViewport((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }));
  };

  const zoomOut = () => {
    setViewport((prev) => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.1) }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedNode) {
        onNodeDelete(selectedNode);
        setSelectedNode(null);
      }

      if (e.key === "Escape") {
        setSelectedNode(null);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "d" && selectedNode) {
        e.preventDefault();
        const nodeToClone = nodes.find((n) => n.id === selectedNode);
        if (nodeToClone) {
          handleNodeDuplicate(nodeToClone);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode, onNodeDelete, nodes, handleNodeDuplicate]);

  return {
    canvas: (
      <div
        ref={canvasRef}
        className={`
          w-full h-screen bg-gray-50 overflow-hidden relative
          ${
            activeTool === "add"
              ? "cursor-crosshair"
              : isPanning
              ? "cursor-grabbing"
              : "cursor-grab"
          }
        `}
        role="application"
        aria-label="Diagram canvas"
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
      >
        {/* Nodes */}
        <div
          className="absolute"
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px)`,
          }}
        >
          {nodes.map((node) => (
            <DiagramNode
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              onSelect={() => setSelectedNode(node.id)}
              onUpdate={(updates) => onNodeUpdate(node.id, updates)}
              onDelete={() => onNodeDelete(node.id)}
              onDuplicate={() => handleNodeDuplicate(node)}
              onEdit={onNodeEdit ? () => onNodeEdit(node) : undefined}
              zoom={viewport.zoom}
            />
          ))}
        </div>

        {/* User cursors would go here in a real implementation */}
      </div>
    ),
    zoomIn,
    zoomOut,
    zoom: viewport.zoom,
  };
}
