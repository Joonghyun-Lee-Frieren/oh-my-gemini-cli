import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getPackageVersion } from '../shared/config.js';
import { createContextServer } from './context-server.js';
import { createMemoryServer } from './memory-server.js';
import { createOrchestratorServer } from './orchestrator-server.js';
import { createStateServer } from './state-server.js';
import type { McpServer, McpTool } from './types.js';

type OmgServerName = 'state' | 'memory' | 'context' | 'orchestrator';

interface RegisteredServer {
  serverId: `omg_${OmgServerName}`;
  instance: McpServer;
}

function toJsonSchema(tool: McpTool): { type: 'object'; properties: Record<string, unknown>; required: string[] } {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [paramName, rawMeta] of Object.entries(tool.parameters ?? {})) {
    const meta = (rawMeta ?? {}) as Record<string, unknown>;
    const optional = Boolean(meta.optional);
    properties[paramName] = {
      type: typeof meta.type === 'string' ? meta.type : 'string',
      description: typeof meta.description === 'string' ? meta.description : '',
    };
    if (!optional) required.push(paramName);
  }

  return { type: 'object', properties, required };
}

function selectServers(target?: string): RegisteredServer[] {
  const all: RegisteredServer[] = [
    { serverId: 'omg_state', instance: createStateServer() },
    { serverId: 'omg_memory', instance: createMemoryServer() },
    { serverId: 'omg_context', instance: createContextServer() },
    { serverId: 'omg_orchestrator', instance: createOrchestratorServer() },
  ];

  if (!target || target === 'all') return all;

  const normalized = target.replace(/^omg[_-]/, '').toLowerCase();
  const selected = all.find((s) => s.serverId === (`omg_${normalized}` as RegisteredServer['serverId']));
  if (!selected) {
    throw new Error(`Unknown MCP server "${target}". Use one of: state, memory, context, orchestrator, all`);
  }
  return [selected];
}

export async function runMcpServer(targetServer?: string): Promise<void> {
  const selected = selectServers(targetServer);
  const tools = selected.flatMap((s) => s.instance.tools);
  const toolByName = new Map<string, McpTool>();
  for (const tool of tools) toolByName.set(tool.name, tool);

  const server = new Server(
    {
      name: 'oh-my-gemini-cli',
      version: getPackageVersion(),
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: toJsonSchema(tool),
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const tool = toolByName.get(toolName);
    if (!tool) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Unknown tool: ${toolName}` }],
      };
    }

    try {
      const raw = await tool.execute((request.params.arguments ?? {}) as Record<string, unknown>);
      const result = raw as { success?: boolean; data?: unknown; error?: string };
      if (result?.success === false) {
        return {
          isError: true,
          content: [{ type: 'text', text: result.error ?? 'Tool execution failed' }],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result?.data ?? raw ?? {}, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [{ type: 'text', text: message }],
      };
    }
  });

  for (const item of selected) {
    await item.instance.start();
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
