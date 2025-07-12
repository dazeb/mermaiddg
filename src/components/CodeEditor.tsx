import React, { useState } from 'react';
import { Code, Plus, X } from 'lucide-react';

interface CodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDiagram: (code: string, title: string) => void;
}

export function CodeEditor({ isOpen, onClose, onCreateDiagram }: CodeEditorProps) {
  const [code, setCode] = useState(`graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`);
  const [title, setTitle] = useState('New Diagram');

  const handleCreate = () => {
    if (code.trim() && title.trim()) {
      onCreateDiagram(code, title);
      onClose();
      // Reset for next use
      setCode(`graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`);
      setTitle('New Diagram');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleCreate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create Mermaid Diagram</h2>
              <p className="text-sm text-gray-500">Write your Mermaid code and create a new diagram</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className="flex-1 flex flex-col p-6 border-r border-gray-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagram Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter diagram title..."
              />
            </div>
            
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mermaid Code
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900"
                placeholder="Enter your Mermaid code here..."
                spellCheck={false}
              />
            </div>

            {/* Shortcuts */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2 font-medium">Keyboard Shortcuts:</p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span><kbd className="px-1.5 py-0.5 bg-white border rounded">Cmd/Ctrl + Enter</kbd> Create</span>
                <span><kbd className="px-1.5 py-0.5 bg-white border rounded">Esc</kbd> Cancel</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Live Preview</h3>
            <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-auto">
              {code.trim() ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Code size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Preview will appear here</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Diagram will render when added to canvas
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <p className="text-sm">Enter Mermaid code to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Need help? Check out the{' '}
            <a 
              href="https://mermaid.js.org/syntax/flowchart.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Mermaid documentation
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!code.trim() || !title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Create Diagram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}