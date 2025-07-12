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
      theme: "default",
      securityLevel: "loose",
      fontFamily: "Inter, system-ui, sans-serif",
      themeVariables: {
        primaryColor: "#3B82F6",
        primaryTextColor: "#1F2937",
        primaryBorderColor: "#E5E7EB",
        lineColor: "#6B7280",
        secondaryColor: "#F3F4F6",
        tertiaryColor: "#FFFFFF",
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
