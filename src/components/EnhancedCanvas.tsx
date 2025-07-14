import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Edit3, Trash2, Copy, Plus } from "lucide-react";
import { nodeTypes } from "./ReactFlowNodes";
import {
  parseMermaidFlowchart,
  convertToReactFlow,
} from "../services/mermaidToReactFlow";
import type { DiagramNode as DiagramNodeType } from "../types";

interface EnhancedCanvasProps {
  nodes: DiagramNodeType[];
  onNodeUpdate: (id: string, updates: Partial<DiagramNodeType>) => void;
  onNodeDelete: (id: string) => void;
  onNodeAdd: (node: Omit<DiagramNodeType, "id">) => void;
  onNodeEdit?: (node: DiagramNodeType) => void;
  onOpenCodeEditor?: () => void;
  activeTool: string;
  currentUserId: string;
}

export function EnhancedCanvas({
  nodes: diagramNodes,
  onNodeUpdate,
  onNodeDelete,
  onNodeAdd,
  onNodeEdit,
  onOpenCodeEditor,
  activeTool,
  currentUserId,
}: EnhancedCanvasProps) {
  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState([]);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState([]);
  const [selectedDiagramNode, setSelectedDiagramNode] = useState<string | null>(
    null
  );
  const [expandedDiagramId, setExpandedDiagramId] = useState<string | null>(
    null
  );
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCode, setEditCode] = useState("");
  const [zoom, setZoom] = useState(1);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.1));
  }, []);

  // Convert diagram nodes to React Flow format
  useEffect(() => {
    if (diagramNodes.length === 0) {
      setReactFlowNodes([]);
      setReactFlowEdges([]);
      return;
    }

    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    // Only expand the most recent diagram into individual nodes
    // All others are rendered as single diagram nodes
    const mostRecentDiagram = diagramNodes[diagramNodes.length - 1];

    diagramNodes.forEach((diagramNode, index) => {
      // Only parse the most recent diagram into individual nodes
      if (
        diagramNode.id === mostRecentDiagram?.id &&
        diagramNodes.length === 1
      ) {
        try {
          const mermaidGraph = parseMermaidFlowchart(diagramNode.code);
          const { nodes: parsedNodes, edges: parsedEdges } =
            convertToReactFlow(mermaidGraph);

          // Center the diagram in the viewport
          const centerX = 400;
          const centerY = 300;

          const offsetNodes = parsedNodes.map((node) => ({
            ...node,
            id: `${diagramNode.id}-${node.id}`,
            position: {
              x: centerX + node.position.x,
              y: centerY + node.position.y,
            },
            data: {
              ...node.data,
              diagramId: diagramNode.id,
              diagramTitle: diagramNode.title,
            },
          }));

          const offsetEdges = parsedEdges.map((edge) => ({
            ...edge,
            id: `${diagramNode.id}-${edge.id}`,
            source: `${diagramNode.id}-${edge.source}`,
            target: `${diagramNode.id}-${edge.target}`,
          }));

          flowNodes.push(...offsetNodes);
          flowEdges.push(...offsetEdges);
        } catch (error) {
          console.error("Failed to parse Mermaid diagram:", error);
          // Fall back to single node
          flowNodes.push({
            id: diagramNode.id,
            type: "default",
            position: { x: diagramNode.x, y: diagramNode.y },
            data: {
              label: diagramNode.title,
              diagramId: diagramNode.id,
              diagramTitle: diagramNode.title,
              isFullDiagram: true,
            },
          });
        }
      } else {
        // Render as a single diagram node
        flowNodes.push({
          id: diagramNode.id,
          type: "default",
          position: { x: diagramNode.x, y: diagramNode.y },
          data: {
            label: diagramNode.title,
            diagramId: diagramNode.id,
            diagramTitle: diagramNode.title,
            isFullDiagram: true,
          },
        });
      }
    });

    setReactFlowNodes(flowNodes);
    setReactFlowEdges(flowEdges);
  }, [diagramNodes, setReactFlowNodes, setReactFlowEdges]);

  // Handle new connections between nodes
  const onConnect = useCallback(
    (params: Connection) => setReactFlowEdges((eds) => addEdge(params, eds)),
    [setReactFlowEdges]
  );

  // Handle node double-click for editing
  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const diagramId = node.data.diagramId;
      const diagramNode = diagramNodes.find((n) => n.id === diagramId);

      if (diagramNode) {
        setEditingNode(diagramId);
        setEditTitle(diagramNode.title);
        setEditCode(diagramNode.code);
      }
    },
    [diagramNodes]
  );

  // Handle node position changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      // Update diagram node positions
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          const node = reactFlowNodes.find((n) => n.id === change.id);
          if (node?.data.diagramId) {
            onNodeUpdate(node.data.diagramId, {
              x: change.position.x,
              y: change.position.y,
            });
          }
        }
      });
    },
    [onNodesChange, reactFlowNodes, onNodeUpdate]
  );

  // Handle saving edited node
  const handleSaveEdit = useCallback(() => {
    if (editingNode) {
      onNodeUpdate(editingNode, {
        title: editTitle,
        code: editCode,
      });
      setEditingNode(null);
      setEditTitle("");
      setEditCode("");
    }
  }, [editingNode, editTitle, editCode, onNodeUpdate]);

  // Handle canceling edit
  const handleCancelEdit = useCallback(() => {
    setEditingNode(null);
    setEditTitle("");
    setEditCode("");
  }, []);

  // Handle node deletion
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      const node = reactFlowNodes.find((n) => n.id === nodeId);
      if (node?.data.diagramId) {
        onNodeDelete(node.data.diagramId);
      }
    },
    [reactFlowNodes, onNodeDelete]
  );

  // Handle node duplication
  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      const node = reactFlowNodes.find((n) => n.id === nodeId);
      if (node?.data.diagramId) {
        const diagramNode = diagramNodes.find(
          (n) => n.id === node.data.diagramId
        );
        if (diagramNode) {
          onNodeAdd({
            title: `${diagramNode.title} (Copy)`,
            code: diagramNode.code,
            x: diagramNode.x + 50,
            y: diagramNode.y + 50,
            width: diagramNode.width,
            height: diagramNode.height,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: currentUserId,
          });
        }
      }
    },
    [reactFlowNodes, diagramNodes, onNodeAdd, currentUserId]
  );

  // Custom node context menu
  const nodeContextMenu = useMemo(() => {
    if (!selectedDiagramNode) return null;

    return (
      <Panel
        position="top-right"
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-2"
        style={{ zIndex: 9999 }}
      >
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => {
              const diagramNode = diagramNodes.find(
                (n) => n.id === selectedDiagramNode
              );
              if (diagramNode && onNodeEdit) {
                onNodeEdit(diagramNode);
              }
            }}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <Edit3 size={16} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => handleDuplicateNode(selectedDiagramNode)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <Copy size={16} />
            <span>Duplicate</span>
          </button>
          <button
            onClick={() => handleDeleteNode(selectedDiagramNode)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </Panel>
    );
  }, [
    selectedDiagramNode,
    diagramNodes,
    onNodeEdit,
    handleDuplicateNode,
    handleDeleteNode,
  ]);

  return {
    canvas: (
      <div className="w-full h-full relative">
        {/* Empty State Instructions */}
        {diagramNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
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
                  Enhanced Interactive Canvas
                </h3>
                <p className="text-gray-600 mb-6">
                  Create and edit diagrams with advanced node control and visual
                  editing.
                </p>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Create Diagrams
                    </h4>
                    <p className="text-sm text-gray-600">
                      Click <strong>Add Diagram (A)</strong> or use the Code
                      Editor to create your first diagram
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Interactive Editing
                    </h4>
                    <p className="text-sm text-gray-600">
                      Drag nodes to reposition, double-click to edit, and
                      connect nodes visually
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Advanced Controls
                    </h4>
                    <p className="text-sm text-gray-600">
                      Use zoom, pan, minimap, and context menus for precise
                      diagram control
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  💡 <strong>Tip:</strong> Right-click nodes for context menu,
                  drag to connect, double-click to edit
                </p>
              </div>
            </div>
          </div>
        )}

        {/* React Flow Canvas */}
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeClick={(event, node) =>
            setSelectedDiagramNode(node.data.diagramId)
          }
          onPaneClick={() => setSelectedDiagramNode(null)}
          nodeTypes={nodeTypes}
          fitView={diagramNodes.length > 0}
          attributionPosition="bottom-left"
          className="bg-gray-50"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
          <MiniMap />
          {nodeContextMenu}
        </ReactFlow>

        {/* Edit Dialog */}
        {editingNode && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Diagram
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mermaid Code
                  </label>
                  <textarea
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    ),
    zoomIn,
    zoomOut,
    zoom,
  };
}
