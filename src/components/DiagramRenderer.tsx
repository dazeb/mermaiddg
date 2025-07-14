import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface DiagramRendererProps {
  code: string;
  id: string;
  onError?: (error: string) => void;
}

export function DiagramRenderer({ code, id, onError }: DiagramRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !code.trim()) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      securityLevel: "loose",
      fontFamily: "Inter, system-ui, sans-serif",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
      },
      sequence: {
        useMaxWidth: true,
        wrap: true,
        width: 150,
      },
      gantt: {
        useMaxWidth: true,
        leftPadding: 75,
        gridLineStartPadding: 35,
      },
      themeVariables: {
        // Primary colors
        primaryColor: "#3B82F6",
        primaryTextColor: "#1F2937",
        primaryBorderColor: "#E5E7EB",

        // Secondary colors
        secondaryColor: "#F3F4F6",
        tertiaryColor: "#FFFFFF",

        // Background colors
        background: "#FFFFFF",
        mainBkg: "#FFFFFF",
        secondBkg: "#F8FAFC",

        // Line and border colors
        lineColor: "#6B7280",
        border1: "#E5E7EB",
        border2: "#D1D5DB",

        // Node colors
        fillType0: "#EBF8FF",
        fillType1: "#DBEAFE",
        fillType2: "#BFDBFE",
        fillType3: "#93C5FD",

        // Text colors
        textColor: "#1F2937",
        labelTextColor: "#374151",

        // Special elements
        errorBkgColor: "#FEF2F2",
        errorTextColor: "#DC2626",

        // Git graph colors (for git diagrams)
        git0: "#3B82F6",
        git1: "#10B981",
        git2: "#F59E0B",
        git3: "#EF4444",
        git4: "#8B5CF6",
        git5: "#F97316",
        git6: "#06B6D4",
        git7: "#84CC16",
      },
    });

    const render = async () => {
      try {
        // Generate a unique ID for each render to avoid conflicts in React StrictMode
        const uniqueId = `mermaid-${id}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, code);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        onError?.(error instanceof Error ? error.message : "Rendering failed");
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 200px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
              <p style="color: #dc2626; font-size: 14px;">Diagram rendering failed</p>
            </div>
          `;
        }
      }
    };

    render();
  }, [code, id, onError]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}
