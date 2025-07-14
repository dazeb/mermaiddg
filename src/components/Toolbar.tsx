import React from "react";
import {
  MousePointer2,
  Plus,
  Move,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Download,
  Users,
  Settings,
  Code,
  Workflow,
} from "lucide-react";
import { Tool } from "../types";

interface ToolbarProps {
  activeTool: string;
  onToolChange: (toolId: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExport: () => void;
  onOpenCodeEditor: () => void;

  userCount: number;
  zoom: number;
}

const tools: Tool[] = [
  { id: "select", name: "Select", icon: "MousePointer2", shortcut: "V" },
  { id: "add", name: "Add Diagram", icon: "Plus", shortcut: "A" },
  { id: "move", name: "Move", icon: "Move", shortcut: "M" },
  { id: "copy", name: "Duplicate", icon: "Copy", shortcut: "D" },
  { id: "delete", name: "Delete", icon: "Trash2", shortcut: "Del" },
];

const iconComponents = {
  MousePointer2,
  Plus,
  Move,
  Copy,
  Trash2,
};

export function Toolbar({
  activeTool,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onExport,
  onOpenCodeEditor,
  userCount,
  zoom,
}: ToolbarProps) {
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg px-2 py-2">
        <div className="flex items-center space-x-1">
          {/* Main Tools */}
          <div className="flex items-center space-x-1 pr-3 border-r border-gray-200">
            {tools.map((tool) => {
              const IconComponent =
                iconComponents[tool.icon as keyof typeof iconComponents];
              return (
                <button
                  key={tool.id}
                  onClick={() => onToolChange(tool.id)}
                  className={`
                    p-2 rounded-lg transition-all duration-200 group relative
                    ${
                      activeTool === tool.id
                        ? "bg-blue-100 text-blue-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                  title={`${tool.name} (${tool.shortcut})`}
                >
                  <IconComponent size={18} />

                  {/* Tooltip */}
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {tool.name} ({tool.shortcut})
                  </div>
                </button>
              );
            })}
          </div>

          {/* Editors */}
          <div className="flex items-center space-x-1 pr-3 border-r border-gray-200">
            <button
              onClick={onOpenCodeEditor}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group relative"
              title="Code Editor (C)"
            >
              <Code size={18} />

              {/* Tooltip */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Code Editor (C)
              </div>
            </button>
          </div>
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 px-3 border-r border-gray-200">
            <button
              onClick={onZoomOut}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>

            <span className="text-sm text-gray-500 min-w-[4rem] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={onZoomIn}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 pl-3">
            <button
              onClick={onExport}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              title="Export"
            >
              <Download size={18} />
            </button>

            <div className="flex items-center space-x-2 px-2 py-1 bg-green-50 rounded-lg">
              <Users size={16} className="text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                {userCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
