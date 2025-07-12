import React, { useState } from 'react';
import { X, Download, FileImage, FileText, Share2, Copy, Check } from 'lucide-react';
import { DiagramNode } from '../types/DiagramNode';
import mermaid from 'mermaid';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagrams: DiagramNode[];
}

type ExportFormat = 'png' | 'svg' | 'pdf' | 'json' | 'mermaid';

interface ExportOption {
  format: ExportFormat;
  name: string;
  description: string;
  icon: React.ReactNode;
  fileExtension: string;
}

const exportOptions: ExportOption[] = [
  {
    format: 'png',
    name: 'PNG Image',
    description: 'High-quality raster image for presentations',
    icon: <FileImage className="w-5 h-5" />,
    fileExtension: 'png'
  },
  {
    format: 'svg',
    name: 'SVG Vector',
    description: 'Scalable vector graphics for web use',
    icon: <FileImage className="w-5 h-5" />,
    fileExtension: 'svg'
  },
  {
    format: 'pdf',
    name: 'PDF Document',
    description: 'Portable document format for sharing',
    icon: <FileText className="w-5 h-5" />,
    fileExtension: 'pdf'
  },
  {
    format: 'json',
    name: 'JSON Data',
    description: 'Complete workspace data for backup',
    icon: <FileText className="w-5 h-5" />,
    fileExtension: 'json'
  },
  {
    format: 'mermaid',
    name: 'Mermaid Code',
    description: 'Raw Mermaid syntax for external use',
    icon: <FileText className="w-5 h-5" />,
    fileExtension: 'mmd'
  }
];

export function ExportModal({ isOpen, onClose, diagrams }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [selectedDiagrams, setSelectedDiagrams] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDiagramToggle = (diagramId: string) => {
    setSelectedDiagrams(prev => 
      prev.includes(diagramId) 
        ? prev.filter(id => id !== diagramId)
        : [...prev, diagramId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDiagrams(diagrams.map(d => d.id));
  };

  const handleSelectNone = () => {
    setSelectedDiagrams([]);
  };

  const exportAsPNG = async (diagram: DiagramNode): Promise<Blob> => {
    const { svg } = await mermaid.render(`export-${diagram.id}`, diagram.code);
    
    // Create canvas and convert SVG to PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create PNG'));
        }, 'image/png');
      };
      
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    });
  };

  const exportAsSVG = async (diagram: DiagramNode): Promise<Blob> => {
    const { svg } = await mermaid.render(`export-${diagram.id}`, diagram.code);
    return new Blob([svg], { type: 'image/svg+xml' });
  };

  const exportAsJSON = (): Blob => {
    const selectedData = diagrams.filter(d => selectedDiagrams.includes(d.id));
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      diagrams: selectedData
    };
    return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  };

  const exportAsMermaid = (): Blob => {
    const selectedData = diagrams.filter(d => selectedDiagrams.includes(d.id));
    const mermaidContent = selectedData.map(diagram => 
      `%% ${diagram.title}\n${diagram.code}\n\n`
    ).join('');
    return new Blob([mermaidContent], { type: 'text/plain' });
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (selectedDiagrams.length === 0) return;
    
    setIsExporting(true);
    
    try {
      const selectedData = diagrams.filter(d => selectedDiagrams.includes(d.id));
      const option = exportOptions.find(opt => opt.format === selectedFormat)!;
      
      if (selectedFormat === 'json') {
        const blob = exportAsJSON();
        downloadFile(blob, `mermaid-diagrams.${option.fileExtension}`);
      } else if (selectedFormat === 'mermaid') {
        const blob = exportAsMermaid();
        downloadFile(blob, `mermaid-diagrams.${option.fileExtension}`);
      } else {
        // Export individual diagrams for image formats
        for (const diagram of selectedData) {
          let blob: Blob;
          
          if (selectedFormat === 'png') {
            blob = await exportAsPNG(diagram);
          } else if (selectedFormat === 'svg') {
            blob = await exportAsSVG(diagram);
          } else {
            continue; // Skip unsupported formats for now
          }
          
          const filename = `${diagram.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${option.fileExtension}`;
          downloadFile(blob, filename);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateShareUrl = () => {
    const selectedData = diagrams.filter(d => selectedDiagrams.includes(d.id));
    const shareData = {
      diagrams: selectedData.map(d => ({ title: d.title, code: d.code }))
    };
    const encoded = btoa(JSON.stringify(shareData));
    const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    setShareUrl(url);
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Export Diagrams</h2>
            <p className="text-sm text-gray-500 mt-1">Choose format and diagrams to export</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Export Format Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Export Format</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exportOptions.map((option) => (
                <button
                  key={option.format}
                  onClick={() => setSelectedFormat(option.format)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    selectedFormat === option.format
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`${selectedFormat === option.format ? 'text-blue-600' : 'text-gray-400'}`}>
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">{option.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Diagram Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Select Diagrams</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Select All
                </button>
                <button
                  onClick={handleSelectNone}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Select None
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {diagrams.map((diagram) => (
                <label
                  key={diagram.id}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDiagrams.includes(diagram.id)}
                    onChange={() => handleDiagramToggle(diagram.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{diagram.title}</h4>
                    <p className="text-xs text-gray-500">{diagram.code.split('\n')[0]}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Share URL Generation */}
          {selectedDiagrams.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Share Link</h3>
                <button
                  onClick={generateShareUrl}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Share2 size={12} />
                  <span>Generate</span>
                </button>
              </div>
              
              {shareUrl && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded bg-white"
                  />
                  <button
                    onClick={copyShareUrl}
                    className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center space-x-1"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            {selectedDiagrams.length} diagram{selectedDiagrams.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={selectedDiagrams.length === 0 || isExporting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Download size={16} />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
