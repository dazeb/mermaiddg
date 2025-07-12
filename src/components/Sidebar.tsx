import React, { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Download,
  Settings,
  Trash2,
  AlertTriangle,
  Code,
  Play,
  Edit3,
} from "lucide-react";
import { DiagramNode } from "../types";

interface SidebarProps {
  nodes: DiagramNode[];
  onNodeSelect: (nodeId: string) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeEdit?: (node: DiagramNode) => void;
  selectedNodeId: string | null;
  onExport: () => void;
  onCreateDiagram: (code: string, title: string) => void;
}

export function Sidebar({
  nodes,
  onNodeSelect,
  onNodeDelete,
  onNodeEdit,
  selectedNodeId,
  onExport,
  onCreateDiagram,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"diagrams" | "code">("diagrams");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Code editor state
  const [codeTitle, setCodeTitle] = useState("New Diagram");
  const [codeContent, setCodeContent] = useState(`graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`);

  if (isCollapsed) {
    return (
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
        >
          <PanelLeftOpen size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed left-6 top-6 bottom-6 w-80 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Workspace</h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "diagrams" as const, icon: FileText, label: "Diagrams" },
          { id: "code" as const, icon: Code, label: "Code" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-all duration-200
              ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "diagrams" && (
          <div className="p-4 space-y-3">
            {nodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No diagrams yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click the + tool to add one
                </p>
              </div>
            ) : (
              nodes.map((node) => (
                <div
                  key={node.id}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200 group
                    ${
                      selectedNodeId === node.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                    ${
                      deleteConfirmId === node.id
                        ? "ring-2 ring-red-500 ring-opacity-50"
                        : ""
                    }
                  `}
                >
                  {deleteConfirmId === node.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle size={16} />
                        <span className="text-sm font-medium">
                          Delete "{node.title}"?
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            onNodeDelete(node.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={() => onNodeSelect(node.id)}
                        className="cursor-pointer"
                      >
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {node.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Updated{" "}
                          {new Date(node.updatedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {node.code.split("\n")[0]}
                        </p>
                      </div>

                      <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                        {onNodeEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNodeEdit(node);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit diagram"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(node.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete diagram"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "code" && (
          <div className="p-4 space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Diagram Title
              </label>
              <input
                type="text"
                value={codeTitle}
                onChange={(e) => setCodeTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter diagram title..."
              />
            </div>

            {/* Code Editor */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Mermaid Code
              </label>
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900"
                placeholder="Enter your Mermaid code here..."
                spellCheck={false}
              />
            </div>

            {/* Create Button */}
            <button
              onClick={() => {
                if (codeContent.trim() && codeTitle.trim()) {
                  onCreateDiagram(codeContent, codeTitle);
                  // Reset form
                  setCodeTitle("New Diagram");
                  setCodeContent(`graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`);
                }
              }}
              disabled={!codeContent.trim() || !codeTitle.trim()}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <Play size={16} />
              <span>Create Diagram</span>
            </button>

            {/* Help Text */}
            <div className="text-xs text-gray-500">
              Need help? Check out the{" "}
              <a
                href="https://mermaid.js.org/syntax/flowchart.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Mermaid documentation
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <button
          onClick={onExport}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          <span>Export Workspace</span>
        </button>

        <button className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
