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
        const { svg } = await mermaid.render(`mermaid-${id}`, code);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;

          // Ensure the SVG is properly sized and visible
          const svgElement = containerRef.current.querySelector("svg");
          if (svgElement) {
            svgElement.style.maxWidth = "100%";
            svgElement.style.height = "auto";
            svgElement.style.display = "block";
            svgElement.style.margin = "0 auto";

            // Remove any fixed width/height that might make it too small
            svgElement.removeAttribute("width");
            svgElement.removeAttribute("height");

            // Set viewBox if not present to ensure proper scaling
            if (!svgElement.getAttribute("viewBox")) {
              const bbox = svgElement.getBBox();
              svgElement.setAttribute(
                "viewBox",
                `0 0 ${bbox.width} ${bbox.height}`
              );
            }
          }
        }
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        onError?.(error instanceof Error ? error.message : "Rendering failed");
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="flex items-center justify-center h-32 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-600 text-sm">Diagram rendering failed</p>
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
      className="diagram-container select-none w-full min-h-[200px]"
      style={{
        fontSize: "14px",
        overflow: "visible", // Allow content to expand beyond container
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "200px",
        width: "100%",
      }}
    />
  );
}
