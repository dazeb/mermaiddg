import { lazy, Suspense, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Canvas } from "./components/Canvas";
import { Sidebar } from "./components/Sidebar";
import { Toolbar } from "./components/Toolbar";
import { UserProfile } from "./components/UserProfile";
import { useSupabase } from "./hooks/useSupabase";
import type { DiagramNode } from "./types";

// Lazy load components that are only used in modals
const CodeEditor = lazy(() =>
  import("./components/CodeEditor").then((module) => ({
    default: module.CodeEditor,
  }))
);
const ExportModal = lazy(() =>
  import("./components/ExportModal").then((module) => ({
    default: module.ExportModal,
  }))
);
const DiagramEditDialog = lazy(() =>
  import("./components/DiagramEditDialog").then((module) => ({
    default: module.DiagramEditDialog,
  }))
);
const AuthModal = lazy(() =>
  import("./components/AuthModal").then((module) => ({
    default: module.AuthModal,
  }))
);
const Settings = lazy(() =>
  import("./components/Settings").then((module) => ({
    default: module.Settings,
  }))
);
const AuthCallback = lazy(() =>
  import("./components/AuthCallback").then((module) => ({
    default: module.AuthCallback,
  }))
);

function App() {
  const [activeTool, setActiveTool] = useState("select");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingDiagram, setEditingDiagram] = useState<DiagramNode | null>(
    null
  );

  // Check if we're on the auth callback route
  const isAuthCallback = window.location.pathname === "/auth/callback";

  // Use Supabase hook for multi-user functionality
  const workspaceId = "default-workspace"; // For now, use a single workspace
  const {
    nodes,
    users,
    currentUser,
    authState,
    addNode,
    updateNode,
    deleteNode,
    signUp,
    signIn,
    signInWithGitHub,
    signOut,
    updateUserName,
    isOfflineMode,
  } = useSupabase(workspaceId);

  // Authentication handlers
  const handleUpgradeAccount = () => {
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleUpdateUser = (updates: { name?: string; email?: string }) => {
    if (updates.name && updates.name !== currentUser?.name) {
      updateUserName(updates.name);
    }
  };

  // Settings handlers
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleExportData = () => {
    const dataToExport = {
      nodes,
      user: currentUser,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mermaid-diagrams-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.nodes && Array.isArray(data.nodes)) {
          // Import nodes one by one
          data.nodes.forEach((node: DiagramNode) => {
            addNode({
              ...node,
              id: uuidv4(), // Generate new IDs to avoid conflicts
              userId: currentUser?.id || "local-user",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          });
        }
      } catch (error) {
        console.error("Failed to import data:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    // Delete all nodes
    nodes.forEach((node) => {
      deleteNode(node.id);
    });
  };

  const handleAuthComplete = () => {
    // Redirect to homepage
    window.location.href = "/";
  };

  const handleToolChange = (toolId: string) => {
    setActiveTool(toolId);
  };

  const handleNodeAdd = (nodeData: Omit<DiagramNode, "id">) => {
    addNode(nodeData);
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
      userId: currentUser?.id || "local-user",
    };

    handleNodeAdd(nodeData);
  };

  const handleNodeUpdate = (id: string, updates: Partial<DiagramNode>) => {
    updateNode(id, { ...updates, updatedAt: new Date().toISOString() });
  };

  const handleNodeDelete = (id: string) => {
    deleteNode(id);
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
    onOpenCodeEditor: () => setIsCodeEditorOpen(true),
    activeTool,
    currentUserId: currentUser?.id || "local-user",
  });

  // Render auth callback if we're on that route
  if (isAuthCallback) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AuthCallback onAuthComplete={handleAuthComplete} />
      </Suspense>
    );
  }

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
        userCount={users.length}
        zoom={canvasData.zoom}
      />

      {/* User Profile */}
      {currentUser && (
        <div className="absolute top-4 right-4 z-30">
          <UserProfile
            user={currentUser}
            onSignOut={handleSignOut}
            onUpgradeAccount={handleUpgradeAccount}
            onUpdateName={updateUserName}
            onOpenSettings={handleOpenSettings}
          />
        </div>
      )}

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
      {isCodeEditorOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <CodeEditor
            isOpen={isCodeEditorOpen}
            onClose={() => setIsCodeEditorOpen(false)}
            onCreateDiagram={handleCreateFromCode}
          />
        </Suspense>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            diagrams={nodes}
          />
        </Suspense>
      )}

      {/* Diagram Edit Dialog */}
      {isEditDialogOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <DiagramEditDialog
            isOpen={isEditDialogOpen}
            onClose={handleEditDialogClose}
            diagram={editingDiagram}
            onSave={handleDiagramSave}
          />
        </Suspense>
      )}

      {/* Authentication Modal */}
      {isAuthModalOpen && currentUser && (
        <Suspense fallback={<div>Loading...</div>}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSignUp={signUp}
            onSignIn={signIn}
            onSignInWithGitHub={signInWithGitHub}
            isLoading={authState.isLoading}
            error={authState.error}
            guestName={currentUser.name}
          />
        </Suspense>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && currentUser && (
        <Suspense fallback={<div>Loading...</div>}>
          <Settings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onSignOut={handleSignOut}
            onUpgradeAccount={handleUpgradeAccount}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onClearData={handleClearData}
            isOfflineMode={isOfflineMode}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
