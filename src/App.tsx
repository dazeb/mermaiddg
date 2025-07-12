import React, { useState, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { CodeEditor } from './components/CodeEditor';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { useSupabase } from './hooks/useSupabase';
import { DiagramNode } from './types';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [activeTool, setActiveTool] = useState('select');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const workspaceId = 'default-workspace'; // In a real app, this would be dynamic
  
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
    signOut,
    updateUserName,
    isOfflineMode 
  } = useSupabase(workspaceId);

  const handleToolChange = (toolId: string) => {
    setActiveTool(toolId);
  };

  const handleNodeAdd = async (nodeData: Omit<DiagramNode, 'id'>) => {
    if (!currentUser) return;
    
    await addNode(nodeData);
  };

  const handleCreateFromCode = async (code: string, title: string) => {
    if (!currentUser) return;
    
    const nodeData: Omit<DiagramNode, 'id'> = {
      x: Math.random() * 400 + 100, // Random position
      y: Math.random() * 300 + 100,
      width: 400,
      height: 300,
      code,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: currentUser.id,
    };
    
    await addNode(nodeData);
  };

  const handleUpgradeAccount = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    await signUp(email, password, name);
    if (!authState.error) {
      handleAuthSuccess();
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
    if (!authState.error) {
      handleAuthSuccess();
    }
  };
  
  const handleNodeUpdate = async (id: string, updates: Partial<DiagramNode>) => {
    await updateNode(id, { ...updates, updatedAt: new Date().toISOString() });
  };

  const handleNodeDelete = async (id: string) => {
    await deleteNode(id);
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleExport = () => {
    // In a real app, this would export the workspace
    const dataStr = JSON.stringify({ nodes, users }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mermaid-workspace-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 'a':
          setActiveTool('add');
          break;
        case 'm':
          setActiveTool('move');
          break;
        case 'd':
          setActiveTool('copy');
          break;
        case 'c':
          setIsCodeEditorOpen(true);
          break;
        case 'escape':
          setIsCodeEditorOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const canvasData = Canvas({
    nodes,
    onNodeUpdate: handleNodeUpdate,
    onNodeDelete: handleNodeDelete,
    onNodeAdd: handleNodeAdd,
    activeTool,
    currentUserId: currentUser?.id || '',
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* User Profile */}
      <div className="fixed top-6 right-6 z-50">
        {currentUser && (
          <UserProfile
            user={currentUser}
            onSignOut={signOut}
            onUpgradeAccount={handleUpgradeAccount}
            onUpdateName={updateUserName}
          />
        )}
      </div>

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
      
      {/* Sidebar */}
      <Sidebar
        nodes={nodes}
        users={users}
        onNodeSelect={handleNodeSelect}
        onNodeDelete={handleNodeDelete}
        selectedNodeId={selectedNodeId}
        onExport={handleExport}
      />
      
      {/* Code Editor */}
      <CodeEditor
        isOpen={isCodeEditorOpen}
        onClose={() => setIsCodeEditorOpen(false)}
        onCreateDiagram={handleCreateFromCode}
      />
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
        isLoading={authState.isLoading}
        error={authState.error}
        guestName={currentUser?.name || ''}
      />
      
      {/* Connection status */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOfflineMode ? 'bg-orange-500' : 'bg-green-500 animate-pulse'}`}></div>
            <span className="text-sm text-gray-600">
              {isOfflineMode ? 'Offline Mode' : 'Connected'}
              {currentUser?.isGuest && ' • Guest'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;