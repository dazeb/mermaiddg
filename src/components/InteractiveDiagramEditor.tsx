import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Code, Download, Upload, Zap, RotateCcw } from 'lucide-react';
import { nodeTypes } from './ReactFlowNodes';
import { parseMermaidFlowchart, convertToReactFlow } from '../services/mermaidToReactFlow';

interface InteractiveDiagramEditorProps {
  initialMermaidCode?: string;
  onMermaidChange?: (mermaidCode: string) => void;
  onClose?: () => void;
}

export function InteractiveDiagramEditor({
  initialMermaidCode = '',
  onMermaidChange,
  onClose,
}: InteractiveDiagramEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mermaidCode, setMermaidCode] = useState(initialMermaidCode);
  const [showCode, setShowCode] = useState(false);

  // Convert Mermaid to React Flow on mount and when mermaidCode changes
  useEffect(() => {
    if (mermaidCode.trim()) {
      try {
        const mermaidGraph = parseMermaidFlowchart(mermaidCode);
        const { nodes: flowNodes, edges: flowEdges } = convertToReactFlow(mermaidGraph);
        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (error) {
        console.error('Error parsing Mermaid code:', error);
      }
    }
  }, [mermaidCode, setNodes, setEdges]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Convert React Flow back to Mermaid
  const convertToMermaid = useCallback(() => {
    let mermaidOutput = 'graph TD;\n';
    
    // Add node definitions
    nodes.forEach((node) => {
      const nodeType = node.data.mermaidType || 'rectangle';
      let nodeDefinition = '';
      
      switch (nodeType) {
        case 'diamond':
          nodeDefinition = `${node.id}{${node.data.label}}`;
          break;
        case 'circle':
          nodeDefinition = `${node.id}((${node.data.label}))`;
          break;
        case 'rounded':
          nodeDefinition = `${node.id}(${node.data.label})`;
          break;
        default:
          nodeDefinition = `${node.id}[${node.data.label}]`;
      }
      
      mermaidOutput += `    ${nodeDefinition};\n`;
    });
    
    // Add edges
    edges.forEach((edge) => {
      if (edge.label) {
        mermaidOutput += `    ${edge.source} -->|${edge.label}| ${edge.target};\n`;
      } else {
        mermaidOutput += `    ${edge.source} --> ${edge.target};\n`;
      }
    });
    
    return mermaidOutput;
  }, [nodes, edges]);

  // Handle export to Mermaid
  const handleExportMermaid = useCallback(() => {
    const newMermaidCode = convertToMermaid();
    setMermaidCode(newMermaidCode);
    onMermaidChange?.(newMermaidCode);
  }, [convertToMermaid, onMermaidChange]);

  // Handle import from Mermaid
  const handleImportMermaid = useCallback(() => {
    if (mermaidCode.trim()) {
      try {
        const mermaidGraph = parseMermaidFlowchart(mermaidCode);
        const { nodes: flowNodes, edges: flowEdges } = convertToReactFlow(mermaidGraph);
        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (error) {
        console.error('Error importing Mermaid code:', error);
        alert('Error parsing Mermaid code. Please check the syntax.');
      }
    }
  }, [mermaidCode, setNodes, setEdges]);

  // Reset diagram
  const handleReset = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setMermaidCode('');
  }, [setNodes, setEdges]);

  // Handle node label editing
  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const newLabel = prompt('Enter new label:', node.data.label);
      if (newLabel !== null) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, label: newLabel } }
              : n
          )
        );
      }
    },
    [setNodes]
  );

  return (
    <div className="w-full h-full bg-gray-50 relative">
      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
        
        {/* Control Panel */}
        <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-3 space-y-2">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <Code size={16} />
              <span>{showCode ? 'Hide Code' : 'Show Code'}</span>
            </button>
            
            <button
              onClick={handleExportMermaid}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            
            <button
              onClick={handleImportMermaid}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
            >
              <Upload size={16} />
              <span>Import</span>
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                <span>Close</span>
              </button>
            )}
          </div>
        </Panel>
      </ReactFlow>

      {/* Code Panel */}
      {showCode && (
        <div className="absolute top-4 left-4 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Mermaid Code</h3>
          </div>
          <div className="p-4">
            <textarea
              value={mermaidCode}
              onChange={(e) => setMermaidCode(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter Mermaid code here..."
            />
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleImportMermaid}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Zap size={14} />
                <span>Apply</span>
              </button>
              <button
                onClick={() => setShowCode(false)}
                className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-sm">
        <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Drag nodes to reposition</li>
          <li>• Double-click nodes to edit labels</li>
          <li>• Drag from handles to create connections</li>
          <li>• Use controls to zoom and pan</li>
          <li>• Export to get Mermaid code</li>
        </ul>
      </div>
    </div>
  );
}
