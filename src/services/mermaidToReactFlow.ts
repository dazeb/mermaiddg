import { Node, Edge, Position } from '@xyflow/react';

export interface MermaidNode {
  id: string;
  label: string;
  type: 'rectangle' | 'circle' | 'diamond' | 'rounded' | 'stadium' | 'subroutine' | 'cylinder' | 'cloud';
  style?: string;
}

export interface MermaidEdge {
  source: string;
  target: string;
  label?: string;
  type?: 'arrow' | 'dotted' | 'thick';
}

export interface MermaidGraph {
  nodes: MermaidNode[];
  edges: MermaidEdge[];
  direction: 'TB' | 'TD' | 'BT' | 'RL' | 'LR';
}

// Simple Mermaid parser for basic flowcharts
export function parseMermaidFlowchart(mermaidCode: string): MermaidGraph {
  const lines = mermaidCode.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'));
  
  const nodes: MermaidNode[] = [];
  const edges: MermaidEdge[] = [];
  let direction: 'TB' | 'TD' | 'BT' | 'RL' | 'LR' = 'TB';

  // Extract direction
  const directionMatch = mermaidCode.match(/graph\s+(TB|TD|BT|RL|LR)/i);
  if (directionMatch) {
    direction = directionMatch[1].toUpperCase() as any;
  }

  const nodeMap = new Map<string, MermaidNode>();

  for (const line of lines) {
    if (line.startsWith('graph')) continue;

    // Parse edges with labels
    const edgeWithLabelMatch = line.match(/(\w+)\s*-->\s*\|([^|]+)\|\s*(\w+)/);
    if (edgeWithLabelMatch) {
      const [, source, label, target] = edgeWithLabelMatch;
      edges.push({ source, target, label: label.trim() });
      continue;
    }

    // Parse simple edges
    const edgeMatch = line.match(/(\w+)\s*-->\s*(\w+)/);
    if (edgeMatch) {
      const [, source, target] = edgeMatch;
      edges.push({ source, target });
      continue;
    }

    // Parse conditional edges
    const conditionalMatch = line.match(/(\w+)\s*-->\s*\|([^|]+)\|\s*(\w+)/);
    if (conditionalMatch) {
      const [, source, label, target] = conditionalMatch;
      edges.push({ source, target, label: label.trim() });
      continue;
    }

    // Parse node definitions
    const nodeMatch = line.match(/(\w+)\[([^\]]+)\]/);
    if (nodeMatch) {
      const [, id, label] = nodeMatch;
      nodeMap.set(id, { id, label, type: 'rectangle' });
      continue;
    }

    // Parse diamond nodes (decisions)
    const diamondMatch = line.match(/(\w+)\{([^}]+)\}/);
    if (diamondMatch) {
      const [, id, label] = diamondMatch;
      nodeMap.set(id, { id, label, type: 'diamond' });
      continue;
    }

    // Parse rounded nodes
    const roundedMatch = line.match(/(\w+)\(([^)]+)\)/);
    if (roundedMatch) {
      const [, id, label] = roundedMatch;
      nodeMap.set(id, { id, label, type: 'rounded' });
      continue;
    }

    // Parse circle nodes
    const circleMatch = line.match(/(\w+)\(\(([^)]+)\)\)/);
    if (circleMatch) {
      const [, id, label] = circleMatch;
      nodeMap.set(id, { id, label, type: 'circle' });
      continue;
    }
  }

  // Add nodes from edges if not explicitly defined
  for (const edge of edges) {
    if (!nodeMap.has(edge.source)) {
      nodeMap.set(edge.source, { id: edge.source, label: edge.source, type: 'rectangle' });
    }
    if (!nodeMap.has(edge.target)) {
      nodeMap.set(edge.target, { id: edge.target, label: edge.target, type: 'rectangle' });
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
    direction
  };
}

// Convert Mermaid graph to React Flow format
export function convertToReactFlow(mermaidGraph: MermaidGraph): { nodes: Node[], edges: Edge[] } {
  const { nodes: mermaidNodes, edges: mermaidEdges, direction } = mermaidGraph;

  // Calculate layout positions
  const positions = calculateLayout(mermaidNodes, mermaidEdges, direction);

  // Convert nodes
  const nodes: Node[] = mermaidNodes.map((mermaidNode, index) => {
    const position = positions[mermaidNode.id] || { x: index * 200, y: 0 };
    
    return {
      id: mermaidNode.id,
      type: getReactFlowNodeType(mermaidNode.type),
      position,
      data: { 
        label: mermaidNode.label,
        mermaidType: mermaidNode.type
      },
      sourcePosition: getSourcePosition(direction),
      targetPosition: getTargetPosition(direction),
    };
  });

  // Convert edges
  const edges: Edge[] = mermaidEdges.map((mermaidEdge, index) => ({
    id: `edge-${index}`,
    source: mermaidEdge.source,
    target: mermaidEdge.target,
    label: mermaidEdge.label,
    type: 'smoothstep',
    animated: false,
  }));

  return { nodes, edges };
}

function getReactFlowNodeType(mermaidType: string): string {
  switch (mermaidType) {
    case 'diamond':
      return 'diamond';
    case 'circle':
      return 'circle';
    case 'rounded':
      return 'rounded';
    default:
      return 'default';
  }
}

function getSourcePosition(direction: string): Position {
  switch (direction) {
    case 'LR': return Position.Right;
    case 'RL': return Position.Left;
    case 'BT': return Position.Top;
    default: return Position.Bottom;
  }
}

function getTargetPosition(direction: string): Position {
  switch (direction) {
    case 'LR': return Position.Left;
    case 'RL': return Position.Right;
    case 'BT': return Position.Bottom;
    default: return Position.Top;
  }
}

// Simple layout algorithm
function calculateLayout(
  nodes: MermaidNode[], 
  edges: MermaidEdge[], 
  direction: string
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  
  // Build adjacency list
  const adjacencyList: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  
  nodes.forEach(node => {
    adjacencyList[node.id] = [];
    inDegree[node.id] = 0;
  });
  
  edges.forEach(edge => {
    adjacencyList[edge.source].push(edge.target);
    inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
  });
  
  // Topological sort for layering
  const layers: string[][] = [];
  const queue: string[] = [];
  
  // Find nodes with no incoming edges
  Object.keys(inDegree).forEach(nodeId => {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId);
    }
  });
  
  while (queue.length > 0) {
    const currentLayer: string[] = [...queue];
    layers.push(currentLayer);
    queue.length = 0;
    
    currentLayer.forEach(nodeId => {
      adjacencyList[nodeId].forEach(neighbor => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      });
    });
  }
  
  // Position nodes based on layers
  const nodeSpacing = 200;
  const layerSpacing = 150;
  
  layers.forEach((layer, layerIndex) => {
    layer.forEach((nodeId, nodeIndex) => {
      const layerOffset = (layer.length - 1) * nodeSpacing / 2;
      
      if (direction === 'LR' || direction === 'RL') {
        positions[nodeId] = {
          x: layerIndex * layerSpacing,
          y: nodeIndex * nodeSpacing - layerOffset
        };
      } else {
        positions[nodeId] = {
          x: nodeIndex * nodeSpacing - layerOffset,
          y: layerIndex * layerSpacing
        };
      }
    });
  });
  
  return positions;
}
