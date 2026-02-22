export interface McpTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(args: Record<string, unknown>): Promise<unknown>;
}

export interface McpServer {
  name: string;
  tools: McpTool[];
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface McpToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
