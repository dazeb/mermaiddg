import React, { useState, useId } from "react";
import {
  Code,
  Plus,
  X,
  FileText,
  Search,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  diagramTemplates,
  templateCategories,
  DiagramTemplate,
} from "../data/templates";
import { DiagramRenderer } from "./DiagramRenderer";
import { EnhancedMermaidRenderer } from "./EnhancedMermaidRenderer";
import {
  useMermaidTheme,
  QuickThemeSwitcher,
} from "../contexts/MermaidThemeContext";
import {
  generateWorkflowDiagram,
  WorkflowGenerationRequest,
} from "../services/openai";

interface CodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDiagram: (code: string, title: string) => void;
}

export function CodeEditor({
  isOpen,
  onClose,
  onCreateDiagram,
}: CodeEditorProps) {
  const [code, setCode] = useState(`graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`);
  const [title, setTitle] = useState("New Diagram");
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [aiDiagramType, setAiDiagramType] = useState<string>("auto");
  const [aiComplexity, setAiComplexity] = useState<string>("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const previewId = `preview-${useId().replace(/:/g, "-")}`;

  const filteredTemplates = diagramTemplates.filter((template) => {
    const matchesCategory =
      selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (template: DiagramTemplate) => {
    setCode(template.code);
    setTitle(template.name);
    setShowTemplates(false);
  };

  const handleAIGenerate = async () => {
    if (!aiDescription.trim()) {
      setAiError("Please enter a description for your workflow");
      return;
    }

    setIsGenerating(true);
    setAiError(null);

    try {
      const request: WorkflowGenerationRequest = {
        description: aiDescription,
        diagramType:
          aiDiagramType === "auto" ? undefined : (aiDiagramType as any),
        complexity: aiComplexity as any,
      };

      const result = await generateWorkflowDiagram(request);

      setCode(result.mermaidCode);
      setTitle(result.title);
      setShowAIGenerator(false);
      setAiDescription("");
    } catch (error) {
      setAiError(
        error instanceof Error ? error.message : "Failed to generate diagram"
      );
    } finally {
      setIsGenerating(false);
    }
  };

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
      setTitle("New Diagram");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleCreate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${
          showTemplates || showAIGenerator ? "max-w-7xl" : "max-w-4xl"
        } max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create Mermaid Diagram
              </h2>
              <p className="text-sm text-gray-500">
                Write your Mermaid code and create a new diagram
              </p>
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
          {/* AI Generator Panel */}
          {showAIGenerator && (
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                    AI Generator
                  </h3>
                  <button
                    onClick={() => setShowAIGenerator(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Description Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe your workflow
                    </label>
                    <textarea
                      value={aiDescription}
                      onChange={(e) => setAiDescription(e.target.value)}
                      placeholder="Describe the process or workflow you want to visualize. For example: 'A user registration process with email verification and approval workflow'"
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Diagram Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagram Type
                    </label>
                    <select
                      value={aiDiagramType}
                      onChange={(e) => setAiDiagramType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="auto">Auto-detect</option>
                      <option value="flowchart">Flowchart</option>
                      <option value="sequence">Sequence</option>
                      <option value="state">State</option>
                      <option value="class">Class</option>
                      <option value="gantt">Gantt</option>
                      <option value="er">Entity Relationship</option>
                    </select>
                  </div>

                  {/* Complexity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complexity
                    </label>
                    <select
                      value={aiComplexity}
                      onChange={(e) => setAiComplexity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="simple">Simple</option>
                      <option value="medium">Medium</option>
                      <option value="complex">Complex</option>
                    </select>
                  </div>

                  {/* Error Display */}
                  {aiError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{aiError}</p>
                    </div>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !aiDescription.trim()}
                    className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Diagram
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Templates Panel */}
          {showTemplates && (
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Templates</h3>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1">
                  {templateCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        selectedCategory === category
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {template.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {template.description}
                        </p>
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded mt-2">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 flex flex-col p-6 border-r border-gray-200">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Diagram Title
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAIGenerator(!showAIGenerator)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    <Sparkles size={14} />
                    <span>AI Generate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <FileText size={14} />
                    <span>Templates</span>
                  </button>
                </div>
              </div>
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
              <p className="text-xs text-gray-600 mb-2 font-medium">
                Keyboard Shortcuts:
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded">
                    Cmd/Ctrl + Enter
                  </kbd>{" "}
                  Create
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-white border rounded">
                    Esc
                  </kbd>{" "}
                  Cancel
                </span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Live Preview
              </h3>
              <QuickThemeSwitcher />
            </div>
            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
              <EnhancedMermaidRenderer
                code={code}
                id={previewId}
                className="w-full h-full p-4"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
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
