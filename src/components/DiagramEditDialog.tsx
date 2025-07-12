import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Code } from 'lucide-react';
import { DiagramNode } from '../types';
import { DiagramRenderer } from './DiagramRenderer';

interface DiagramEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: DiagramNode | null;
  onSave: (updatedDiagram: DiagramNode) => void;
}

export function DiagramEditDialog({ isOpen, onClose, diagram, onSave }: DiagramEditDialogProps) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (diagram) {
      setTitle(diagram.title);
      setCode(diagram.code);
      setHasChanges(false);
    }
  }, [diagram]);

  useEffect(() => {
    if (diagram) {
      const titleChanged = title !== diagram.title;
      const codeChanged = code !== diagram.code;
      setHasChanges(titleChanged || codeChanged);
    }
  }, [title, code, diagram]);

  if (!isOpen || !diagram) return null;

  const handleSave = () => {
    if (!diagram) return;
    
    const updatedDiagram: DiagramNode = {
      ...diagram,
      title: title.trim() || 'Untitled Diagram',
      code: code.trim(),
      updatedAt: new Date().toISOString(),
    };
    
    onSave(updatedDiagram);
    setHasChanges(false);
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmDiscard = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!confirmDiscard) return;
    }
    
    // Reset to original values
    if (diagram) {
      setTitle(diagram.title);
      setCode(diagram.code);
      setHasChanges(false);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onKeyDown={handleKeyDown}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Code className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Diagram</h2>
              <p className="text-sm text-gray-500 mt-1">Modify your Mermaid diagram code and preview changes</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Editor Panel */}
          <div className="flex-1 flex flex-col p-6 border-r border-gray-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagram Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter diagram title..."
              />
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mermaid Code
                </label>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Eye size={14} />
                  <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                </button>
              </div>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter your Mermaid code here..."
                style={{ minHeight: '300px' }}
              />
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">
                <strong>Keyboard Shortcuts:</strong>
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <span className="font-mono bg-gray-200 px-1 rounded">Ctrl/Cmd + Enter</span> Save
                </div>
                <div>
                  <span className="font-mono bg-gray-200 px-1 rounded">Esc</span> Cancel
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="flex-1 flex flex-col p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Live Preview</h3>
              <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white overflow-auto">
                {code.trim() ? (
                  <div className="w-full h-full">
                    <DiagramRenderer code={code} id={`edit-preview-${diagram.id}`} />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Code size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Enter Mermaid code to see preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {hasChanges ? (
              <span className="text-orange-600">You have unsaved changes</span>
            ) : (
              <span>No changes made</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
