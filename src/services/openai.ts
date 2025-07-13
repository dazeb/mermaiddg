import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
	dangerouslyAllowBrowser: true,
});

export interface WorkflowGenerationRequest {
	description: string;
	diagramType?: "flowchart" | "sequence" | "state" | "class" | "gantt" | "er";
	complexity?: "simple" | "medium" | "complex";
}

export interface WorkflowGenerationResponse {
	mermaidCode: string;
	title: string;
	explanation: string;
}

const SYSTEM_PROMPT = `You are an expert at creating Mermaid diagrams from natural language descriptions. Your task is to convert user descriptions into valid Mermaid diagram code.

Guidelines:
1. Always respond with valid Mermaid syntax
2. Choose the most appropriate diagram type based on the description
3. Use clear, descriptive node labels
4. Include decision points where logical
5. Keep diagrams clean and readable
6. Use appropriate Mermaid syntax for the chosen diagram type

Supported diagram types:
- Flowchart (graph): For processes, workflows, decision trees
- Sequence: For interactions between entities over time
- State: For state machines and lifecycle diagrams
- Class: For object-oriented designs and relationships
- Gantt: For project timelines and schedules
- ER: For database entity relationships

Response format:
Please provide your response with the Mermaid code in a code block like this:

\`\`\`mermaid
[your mermaid code here]
\`\`\`

Title: [descriptive title for the diagram]

Explanation: [brief explanation of the diagram structure]`;

export async function generateWorkflowDiagram(
	request: WorkflowGenerationRequest,
): Promise<WorkflowGenerationResponse> {
	try {
		const userPrompt = `
Create a Mermaid diagram for the following description:

Description: ${request.description}

${request.diagramType ? `Preferred diagram type: ${request.diagramType}` : "Choose the most appropriate diagram type"}
${request.complexity ? `Complexity level: ${request.complexity}` : ""}

Please generate a clear, well-structured Mermaid diagram that accurately represents this workflow or process.
`;

		const completion = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: userPrompt },
			],
			temperature: 0.7,
			max_tokens: 1500,
		});

		const response = completion.choices[0]?.message?.content;
		if (!response) {
			throw new Error("No response from OpenAI");
		}

		// Try to parse as JSON first, if that fails, extract manually
		try {
			const parsed = JSON.parse(response) as WorkflowGenerationResponse;
			if (parsed.mermaidCode && parsed.title) {
				return parsed;
			}
		} catch (e) {
			// JSON parsing failed, extract manually
		}

		// Manual extraction from text response
		const mermaidCodeMatch = response.match(/```(?:mermaid)?\s*([\s\S]*?)```/);
		const titleMatch =
			response.match(/title["\s]*:?\s*["']?([^"'\n]+)["']?/i) ||
			response.match(/^#\s*(.+)$/m) ||
			response.match(/diagram["\s]*:?\s*["']?([^"'\n]+)["']?/i);

		if (!mermaidCodeMatch) {
			throw new Error("Could not extract Mermaid code from response");
		}

		const mermaidCode = mermaidCodeMatch[1].trim();
		const title = titleMatch ? titleMatch[1].trim() : "AI Generated Diagram";
		const explanation = "AI generated diagram based on your description";

		return {
			mermaidCode,
			title,
			explanation,
		};
	} catch (error) {
		console.error("Error generating workflow diagram:", error);
		throw new Error(
			error instanceof Error
				? `Failed to generate diagram: ${error.message}`
				: "Failed to generate diagram",
		);
	}
}

// Test function to validate OpenAI connection
export async function testOpenAIConnection(): Promise<boolean> {
	try {
		const completion = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [{ role: "user", content: "Hello" }],
			max_tokens: 5,
		});
		return !!completion.choices[0]?.message?.content;
	} catch (error) {
		console.error("OpenAI connection test failed:", error);
		return false;
	}
}
