import { Node, Edge, Position } from "@xyflow/react";

export interface MermaidNode {
	id: string;
	label: string;
	type:
		| "rectangle"
		| "circle"
		| "diamond"
		| "rounded"
		| "stadium"
		| "subroutine"
		| "cylinder"
		| "cloud";
	style?: string;
}

export interface MermaidEdge {
	source: string;
	target: string;
	label?: string;
	type?: "arrow" | "dotted" | "thick";
}

export interface MermaidGraph {
	nodes: MermaidNode[];
	edges: MermaidEdge[];
	direction: "TB" | "TD" | "BT" | "RL" | "LR";
}

// Enhanced Mermaid parser for flowcharts
export function parseMermaidFlowchart(mermaidCode: string): MermaidGraph {
	const lines = mermaidCode
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("%%"));

	const edges: MermaidEdge[] = [];
	let direction: "TB" | "TD" | "BT" | "RL" | "LR" = "TB";

	// Extract direction
	const directionMatch = mermaidCode.match(/graph\s+(TB|TD|BT|RL|LR)/i);
	if (directionMatch) {
		direction = directionMatch[1].toUpperCase() as any;
	}

	const nodeMap = new Map<string, MermaidNode>();

	// Helper function to extract node info from a node reference
	function extractNodeInfo(nodeRef: string): {
		id: string;
		label: string;
		type: string;
	} {
		// Rectangle nodes: A[Label]
		const rectMatch = nodeRef.match(/^(\w+)\[([^\]]+)\]$/);
		if (rectMatch) {
			return { id: rectMatch[1], label: rectMatch[2], type: "rectangle" };
		}

		// Diamond nodes: A{Label}
		const diamondMatch = nodeRef.match(/^(\w+)\{([^}]+)\}$/);
		if (diamondMatch) {
			return { id: diamondMatch[1], label: diamondMatch[2], type: "diamond" };
		}

		// Rounded nodes: A(Label)
		const roundedMatch = nodeRef.match(/^(\w+)\(([^)]+)\)$/);
		if (roundedMatch) {
			return { id: roundedMatch[1], label: roundedMatch[2], type: "rounded" };
		}

		// Circle nodes: A((Label))
		const circleMatch = nodeRef.match(/^(\w+)\(\(([^)]+)\)\)$/);
		if (circleMatch) {
			return { id: circleMatch[1], label: circleMatch[2], type: "circle" };
		}

		// Plain node reference: A
		const plainMatch = nodeRef.match(/^(\w+)$/);
		if (plainMatch) {
			return { id: plainMatch[1], label: plainMatch[1], type: "rectangle" };
		}

		// Fallback
		return { id: nodeRef, label: nodeRef, type: "rectangle" };
	}

	// Helper function to add node to map
	function addNode(nodeInfo: { id: string; label: string; type: string }) {
		if (!nodeMap.has(nodeInfo.id)) {
			nodeMap.set(nodeInfo.id, nodeInfo);
		}
	}

	for (const line of lines) {
		if (line.startsWith("graph")) continue;

		// Parse edges with labels: A -->|Label| B or A[Start] -->|Yes| B{Decision}
		const edgeWithLabelMatch = line.match(/^(.+?)\s*-->\s*\|([^|]+)\|\s*(.+)$/);
		if (edgeWithLabelMatch) {
			const [, sourceRef, label, targetRef] = edgeWithLabelMatch;

			const sourceInfo = extractNodeInfo(sourceRef.trim());
			const targetInfo = extractNodeInfo(targetRef.trim());

			addNode(sourceInfo);
			addNode(targetInfo);

			edges.push({
				source: sourceInfo.id,
				target: targetInfo.id,
				label: label.trim(),
			});
			continue;
		}

		// Parse simple edges: A --> B or A[Start] --> B{Decision}
		const edgeMatch = line.match(/^(.+?)\s*-->\s*(.+)$/);
		if (edgeMatch) {
			const [, sourceRef, targetRef] = edgeMatch;

			const sourceInfo = extractNodeInfo(sourceRef.trim());
			const targetInfo = extractNodeInfo(targetRef.trim());

			addNode(sourceInfo);
			addNode(targetInfo);

			edges.push({
				source: sourceInfo.id,
				target: targetInfo.id,
			});
			continue;
		}

		// Parse standalone node definitions
		const standaloneNodeMatch = line.match(
			/^(\w+)(\[([^\]]+)\]|\{([^}]+)\}|\(([^)]+)\)|\(\(([^)]+)\)\))$/,
		);
		if (standaloneNodeMatch) {
			const nodeInfo = extractNodeInfo(line);
			addNode(nodeInfo);
			continue;
		}
	}

	return {
		nodes: Array.from(nodeMap.values()),
		edges,
		direction,
	};
}

// Convert Mermaid graph to React Flow format
export function convertToReactFlow(mermaidGraph: MermaidGraph): {
	nodes: Node[];
	edges: Edge[];
} {
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
				mermaidType: mermaidNode.type,
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
		type: "smoothstep",
		animated: false,
	}));

	return { nodes, edges };
}

function getReactFlowNodeType(mermaidType: string): string {
	switch (mermaidType) {
		case "diamond":
			return "diamond";
		case "circle":
			return "circle";
		case "rounded":
			return "rounded";
		default:
			return "default";
	}
}

function getSourcePosition(direction: string): Position {
	switch (direction) {
		case "LR":
			return Position.Right;
		case "RL":
			return Position.Left;
		case "BT":
			return Position.Top;
		default:
			return Position.Bottom;
	}
}

function getTargetPosition(direction: string): Position {
	switch (direction) {
		case "LR":
			return Position.Left;
		case "RL":
			return Position.Right;
		case "BT":
			return Position.Bottom;
		default:
			return Position.Top;
	}
}

// Simple layout algorithm
function calculateLayout(
	nodes: MermaidNode[],
	edges: MermaidEdge[],
	direction: string,
): Record<string, { x: number; y: number }> {
	const positions: Record<string, { x: number; y: number }> = {};

	// Build adjacency list
	const adjacencyList: Record<string, string[]> = {};
	const inDegree: Record<string, number> = {};

	nodes.forEach((node) => {
		adjacencyList[node.id] = [];
		inDegree[node.id] = 0;
	});

	edges.forEach((edge) => {
		adjacencyList[edge.source].push(edge.target);
		inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
	});

	// Topological sort for layering
	const layers: string[][] = [];
	const queue: string[] = [];

	// Find nodes with no incoming edges
	Object.keys(inDegree).forEach((nodeId) => {
		if (inDegree[nodeId] === 0) {
			queue.push(nodeId);
		}
	});

	while (queue.length > 0) {
		const currentLayer: string[] = [...queue];
		layers.push(currentLayer);
		queue.length = 0;

		currentLayer.forEach((nodeId) => {
			adjacencyList[nodeId].forEach((neighbor) => {
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
			const layerOffset = ((layer.length - 1) * nodeSpacing) / 2;

			if (direction === "LR" || direction === "RL") {
				positions[nodeId] = {
					x: layerIndex * layerSpacing,
					y: nodeIndex * nodeSpacing - layerOffset,
				};
			} else {
				positions[nodeId] = {
					x: nodeIndex * nodeSpacing - layerOffset,
					y: layerIndex * layerSpacing,
				};
			}
		});
	});

	return positions;
}
