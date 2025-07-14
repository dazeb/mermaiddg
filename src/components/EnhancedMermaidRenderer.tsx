import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import mermaid from "mermaid";

interface EnhancedMermaidRendererProps {
  code: string;
  id: string;
  theme?: "default" | "dark" | "forest" | "neutral" | "base";
  onError?: (error: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function EnhancedMermaidRenderer({
  code,
  id,
  theme = "base",
  onError,
  className = "",
  style = {},
}: EnhancedMermaidRendererProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleError = useCallback(
    (error: string) => {
      console.error("Enhanced Mermaid rendering error:", error);
      setIsLoading(false);
      setHasError(true);
      onError?.(error);
    },
    [onError]
  );

  // Enhanced Mermaid configuration
  const mermaidConfig = useMemo(
    () => ({
      startOnLoad: false,
      theme,
      securityLevel: "loose" as const,
      fontFamily: "Inter, system-ui, sans-serif",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis" as const,
        padding: 20,
      },
      sequence: {
        useMaxWidth: true,
        wrap: true,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
      },
      gantt: {
        useMaxWidth: true,
        leftPadding: 75,
        gridLineStartPadding: 35,
        fontSize: 11,
        sectionFontSize: 24,
        numberSectionStyles: 4,
      },
      journey: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10,
        leftMargin: 150,
        width: 150,
        height: 50,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
      },
      timeline: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10,
        leftMargin: 150,
        width: 150,
        height: 50,
        padding: 5,
      },
      mindmap: {
        useMaxWidth: true,
        padding: 10,
        maxNodeSizeX: 200,
        maxNodeSizeY: 100,
      },
      gitGraph: {
        useMaxWidth: true,
        diagramPadding: 8,
        nodeLabel: {
          width: 75,
          height: 100,
          x: -25,
          y: -8,
        },
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

        // Node colors for different types
        fillType0: "#EBF8FF",
        fillType1: "#DBEAFE",
        fillType2: "#BFDBFE",
        fillType3: "#93C5FD",
        fillType4: "#60A5FA",
        fillType5: "#3B82F6",
        fillType6: "#2563EB",
        fillType7: "#1D4ED8",

        // Text colors
        textColor: "#1F2937",
        labelTextColor: "#374151",

        // Special elements
        errorBkgColor: "#FEF2F2",
        errorTextColor: "#DC2626",

        // Git graph colors
        git0: "#3B82F6",
        git1: "#10B981",
        git2: "#F59E0B",
        git3: "#EF4444",
        git4: "#8B5CF6",
        git5: "#F97316",
        git6: "#06B6D4",
        git7: "#84CC16",

        // Class diagram colors
        classText: "#1F2937",

        // State diagram colors
        labelColor: "#1F2937",

        // Pie chart colors
        pie1: "#3B82F6",
        pie2: "#10B981",
        pie3: "#F59E0B",
        pie4: "#EF4444",
        pie5: "#8B5CF6",
        pie6: "#F97316",
        pie7: "#06B6D4",
        pie8: "#84CC16",
        pie9: "#EC4899",
        pie10: "#6366F1",
        pie11: "#14B8A6",
        pie12: "#F97316",
      },
    }),
    [theme]
  );

  // Initialize and render mermaid diagram
  useEffect(() => {
    if (!containerRef.current || !code.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Initialize mermaid with enhanced configuration
    mermaid.initialize(mermaidConfig);

    const render = async () => {
      try {
        // Generate a unique ID for each render
        const uniqueId = `enhanced-mermaid-${id}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        const { svg } = await mermaid.render(uniqueId, code);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setIsLoading(false);
          setHasError(false);
        }
      } catch (error) {
        console.error("Enhanced Mermaid rendering error:", error);
        handleError(
          error instanceof Error ? error.message : "Rendering failed"
        );

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
  }, [code, id, mermaidConfig, handleError]);

  if (!code.trim()) {
    return (
      <div
        className={`flex items-center justify-center text-gray-400 ${className}`}
        style={{
          minHeight: "200px",
          border: "2px dashed #E5E7EB",
          borderRadius: "8px",
          ...style,
        }}
      >
        <div className="text-center">
          <svg
            className="mx-auto mb-3 opacity-50"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <p className="text-sm">Enter Mermaid code to see diagram</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        minHeight: "200px",
        ...style,
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium">Rendering diagram...</span>
          </div>
        </div>
      )}

      {hasError ? (
        <div className="flex items-center justify-center h-48 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg
                className="mx-auto"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Diagram rendering failed</p>
            <p className="text-red-500 text-sm mt-1">
              Please check your Mermaid syntax
            </p>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
