import React, { useState, useRef } from "react";
import { DiagramRenderer } from "./DiagramRenderer";
import { DiagramNode as DiagramNodeType } from "../types";
import { Move, Edit3, Trash2, Copy, AlertTriangle } from "lucide-react";

interface DiagramNodeProps {
  node: DiagramNodeType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<DiagramNodeType>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  zoom: number;
}

export function DiagramNode({
  node,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  zoom,
}: DiagramNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editCode, setEditCode] = useState(node.code);
  const [editTitle, setEditTitle] = useState(node.title);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    nodeX: number;
    nodeY: number;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.target !== e.currentTarget &&
      !e.currentTarget.contains(e.target as Node)
    )
      return;

    onSelect();
    setIsDragging(true);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      const deltaX = (e.clientX - dragRef.current.startX) / zoom;
      const deltaY = (e.clientY - dragRef.current.startY) / zoom;

      onUpdate({
        x: dragRef.current.nodeX + deltaX,
        y: dragRef.current.nodeY + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleSaveEdit = () => {
    onUpdate({
      code: editCode,
      title: editTitle,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditCode(node.code);
    setEditTitle(node.title);
    setIsEditing(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  return (
    <>
      <div
        className={`
          absolute transition-all duration-200 cursor-pointer
          ${isDragging ? "cursor-grabbing" : "cursor-grab"}
          ${isSelected ? "ring-2 ring-blue-500 ring-opacity-50" : ""}
          ${showDeleteConfirm ? "ring-2 ring-red-500 ring-opacity-50" : ""}
        `}
        style={{
          left: node.x,
          top: node.y,
          minWidth: node.width,
          minHeight: node.height,
          maxWidth: "900px", // Allow expansion up to 900px
          width: "auto", // Allow natural width expansion
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-t-lg">
          <h3 className="font-medium text-gray-900 text-sm truncate flex-1">
            {node.title}
          </h3>

          {isSelected && !showDeleteConfirm && (
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1.5 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Edit (E)"
              >
                <Edit3 size={14} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="p-1.5 rounded text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                title="Duplicate (Cmd/Ctrl + D)"
              >
                <Copy size={14} />
              </button>

              <button
                onClick={handleDeleteClick}
                className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete (Delete/Backspace)"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="flex items-center space-x-2 ml-2">
              <div className="flex items-center space-x-1 text-red-600">
                <AlertTriangle size={14} />
                <span className="text-xs font-medium">Delete?</span>
              </div>
              <button
                onClick={handleConfirmDelete}
                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={handleCancelDelete}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
              >
                No
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`${isEditing ? "p-4" : "p-2"}`}>
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Diagram title"
              />

              <textarea
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter Mermaid code..."
              />

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="min-h-[200px] w-full overflow-visible bg-white/90 backdrop-blur-sm rounded-b-lg p-4">
              <DiagramRenderer code={node.code} id={node.id} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
