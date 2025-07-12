import React, { useState, useEffect } from "react";
import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { Sidebar } from "./components/Sidebar";
import { CodeEditor } from "./components/CodeEditor";
import { ExportModal } from "./components/ExportModal";
import { DiagramEditDialog } from "./components/DiagramEditDialog";
import { DiagramNode } from "./types";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [activeTool, setActiveTool] = useState("select");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDiagram, setEditingDiagram] = useState<DiagramNode | null>(
    null
  );
  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load nodes from localStorage on mount
  useEffect(() => {
    const savedNodes = localStorage.getItem("mermaid-diagrams");
    if (savedNodes) {
      try {
        const parsedNodes = JSON.parse(savedNodes);
        setNodes(parsedNodes);
      } catch (error) {
        console.error("Failed to load saved diagrams:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save nodes to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("mermaid-diagrams", JSON.stringify(nodes));
    }
  }, [nodes, isLoaded]);

  const handleToolChange = (toolId: string) => {
    setActiveTool(toolId);
  };

  const handleNodeAdd = (nodeData: Omit<DiagramNode, "id">) => {
    const newNode: DiagramNode = {
      ...nodeData,
      id: uuidv4(),
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleCreateFromCode = (code: string, title: string) => {
    const nodeData: Omit<DiagramNode, "id"> = {
      x: Math.random() * 400 + 100, // Random position
      y: Math.random() * 300 + 100,
      width: 500, // Increased for better diagram visibility
      height: 400, // Increased for better diagram visibility
      code,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "local-user",
    };

    handleNodeAdd(nodeData);
  };

  const handleNodeUpdate = (id: string, updates: Partial<DiagramNode>) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? { ...node, ...updates, updatedAt: new Date().toISOString() }
          : node
      )
    );
  };

  const handleNodeDelete = (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleDiagramEdit = (diagram: DiagramNode) => {
    setEditingDiagram(diagram);
    setIsEditDialogOpen(true);
  };

  const handleDiagramSave = (updatedDiagram: DiagramNode) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === updatedDiagram.id ? updatedDiagram : node
      )
    );
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingDiagram(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key.toLowerCase()) {
        case "v":
          setActiveTool("select");
          break;
        case "a":
          setActiveTool("add");
          break;
        case "m":
          setActiveTool("move");
          break;
        case "d":
          setActiveTool("copy");
          break;
        case "c":
          setIsCodeEditorOpen(true);
          break;
        case "escape":
          setIsCodeEditorOpen(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const canvasData = Canvas({
    nodes,
    onNodeUpdate: handleNodeUpdate,
    onNodeDelete: handleNodeDelete,
    onNodeAdd: handleNodeAdd,
    onNodeEdit: handleDiagramEdit,
    activeTool,
    currentUserId: "local-user",
  });

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Canvas */}
      {canvasData.canvas}

      {/* Toolbar */}
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onZoomIn={canvasData.zoomIn}
        onZoomOut={canvasData.zoomOut}
        onExport={handleExport}
        onOpenCodeEditor={() => setIsCodeEditorOpen(true)}
        userCount={1}
        zoom={canvasData.zoom}
      />

      {/* Sidebar */}
      <Sidebar
        nodes={nodes}
        onNodeSelect={handleNodeSelect}
        onNodeDelete={handleNodeDelete}
        onNodeEdit={handleDiagramEdit}
        selectedNodeId={selectedNodeId}
        onExport={handleExport}
        onCreateDiagram={handleCreateFromCode}
      />

      {/* Code Editor */}
      <CodeEditor
        isOpen={isCodeEditorOpen}
        onClose={() => setIsCodeEditorOpen(false)}
        onCreateDiagram={handleCreateFromCode}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        diagrams={nodes}
      />

      {/* Diagram Edit Dialog */}
      <DiagramEditDialog
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        diagram={editingDiagram}
        onSave={handleDiagramSave}
      />
    </div>
  );
}

export default App;
