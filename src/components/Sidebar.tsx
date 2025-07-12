import React, { useState } from 'react';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  FileText, 
  Users, 
  History,
  Download,
  Upload,
  Settings,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { DiagramNode, User } from '../types';

interface SidebarProps {
  nodes: DiagramNode[];
  users: User[];
  onNodeSelect: (nodeId: string) => void;
  onNodeDelete: (nodeId: string) => void;
  selectedNodeId: string | null;
  onExport: () => void;
}

export function Sidebar({ nodes, users, onNodeSelect, onNodeDelete, selectedNodeId, onExport }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagrams' | 'users' | 'history'>('diagrams');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
          { id: 'diagrams' as const, icon: FileText, label: 'Diagrams' },
          { id: 'users' as const, icon: Users, label: 'Users' },
          { id: 'history' as const, icon: History, label: 'History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-all duration-200
              ${activeTab === tab.id 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
        {activeTab === 'diagrams' && (
          <div className="p-4 space-y-3">
            {nodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No diagrams yet</p>
                <p className="text-xs text-gray-400 mt-1">Click the + tool to add one</p>
              </div>
            ) : (
              nodes.map((node) => (
                <div
                  key={node.id}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200 group
                    ${selectedNodeId === node.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${deleteConfirmId === node.id ? 'ring-2 ring-red-500 ring-opacity-50' : ''}
                  `}
                >
                  {deleteConfirmId === node.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle size={16} />
                        <span className="text-sm font-medium">Delete "{node.title}"?</span>
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
                        <h4 className="font-medium text-gray-900 text-sm truncate">{node.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Updated {new Date(node.updatedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {node.code.split('\n')[0]}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

        {activeTab === 'users' && (
          <div className="p-4 space-y-3">
            <div className="text-sm text-gray-600 mb-4">
              {users.length} user{users.length !== 1 ? 's' : ''} online
            </div>
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    Active {new Date(user.lastSeen).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4">
            <div className="text-center py-8 text-gray-500">
              <History size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Version history</p>
              <p className="text-xs text-gray-400 mt-1">Coming soon</p>
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