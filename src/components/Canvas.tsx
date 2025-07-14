import { useCallback, useEffect, useRef, useState } from "react";

import type { DiagramNode as DiagramNodeType, ViewportState } from "../types";
import { DiagramNode } from "./DiagramNode";

interface CanvasProps {
  nodes: DiagramNodeType[];
  onNodeUpdate: (id: string, updates: Partial<DiagramNodeType>) => void;
  onNodeDelete: (id: string) => void;
  onNodeAdd: (node: Omit<DiagramNodeType, "id">) => void;
  onNodeEdit?: (node: DiagramNodeType) => void;
  onOpenCodeEditor?: () => void;
  activeTool: string;
  currentUserId: string;
}

export function Canvas({
  nodes,
  onNodeUpdate,
  onNodeDelete,
  onNodeAdd,
  onNodeEdit,
  onOpenCodeEditor,
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
      // Open the code editor modal instead of directly creating a diagram
      if (onOpenCodeEditor) {
        onOpenCodeEditor();
      }
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
        {/* Empty State Instructions */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Mermaid Diagram Generator
                </h3>
                <p className="text-gray-600 mb-6">
                  Create beautiful diagrams with ease. Get started by adding
                  your first diagram.
                </p>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Create with Code Editor
                    </h4>
                    <p className="text-sm text-gray-600">
                      Click the <strong>Code Editor (C)</strong> button to write
                      Mermaid code and create diagrams
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Use AI Generator
                    </h4>
                    <p className="text-sm text-gray-600">
                      Try the <strong>AI Generate</strong> feature to create
                      diagrams from natural language descriptions
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Interactive Editing
                    </h4>
                    <p className="text-sm text-gray-600">
                      Use the <strong>Interactive Editor (I)</strong> to
                      visually edit diagrams with drag & drop
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  💡 <strong>Tip:</strong> Use keyboard shortcuts - (C) for Code
                  Editor, (A) to Add diagrams, (I) for Interactive Editor
                </p>
              </div>
            </div>
          </div>
        )}

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
