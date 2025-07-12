import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

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
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      themeVariables: {
        primaryColor: '#3B82F6',
        primaryTextColor: '#1F2937',
        primaryBorderColor: '#E5E7EB',
        lineColor: '#6B7280',
        secondaryColor: '#F3F4F6',
        tertiaryColor: '#FFFFFF',
      },
    });

    const render = async () => {
      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, code);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        onError?.(error instanceof Error ? error.message : 'Rendering failed');
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
      className="diagram-container select-none"
      style={{ fontSize: '14px' }}
    />
  );
}