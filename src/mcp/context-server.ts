import type { McpServer, McpTool, McpToolResult } from './types.js';
import { createLogger } from '../shared/logger.js';

const log = createLogger('mcp:context');

export interface ContextStats {
  totalTokens: number;
  cachedTokens: number;
  cacheHitRate: number;
  layerBreakdown: Record<string, number>;
  compactionCount: number;
}

export interface ContextLayer {
  name: string;
  tokens: number;
  priority: number;
  content: string;
}

export interface CompactionResult {
  originalTokens: number;
  compactedTokens: number;
  savings: number;
  layersCompacted: string[];
}

let contextState: {
  layers: ContextLayer[];
  cacheHits: number;
  cacheMisses: number;
  compactionCount: number;
} = {
  layers: [],
  cacheHits: 0,
  cacheMisses: 0,
  compactionCount: 0,
};

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function getStats(): ContextStats {
  const totalRequests = contextState.cacheHits + contextState.cacheMisses;
  const layerBreakdown: Record<string, number> = {};
  let totalTokens = 0;

  for (const layer of contextState.layers) {
    layerBreakdown[layer.name] = layer.tokens;
    totalTokens += layer.tokens;
  }

  return {
    totalTokens,
    cachedTokens: Math.round(totalTokens * (contextState.cacheHits / Math.max(totalRequests, 1))),
    cacheHitRate: totalRequests > 0 ? contextState.cacheHits / totalRequests : 0,
    layerBreakdown,
    compactionCount: contextState.compactionCount,
  };
}

function buildPrefix(agentType?: string): string {
  const sorted = [...contextState.layers].sort((a, b) => a.priority - b.priority);
  const sections: string[] = [];

  for (const layer of sorted) {
    if (agentType && layer.name === 'agent-specific' && !layer.content.includes(agentType)) {
      continue;
    }
    sections.push(`<!-- ${layer.name} (priority: ${layer.priority}) -->\n${layer.content}`);
  }

  contextState.cacheHits++;
  return sections.join('\n\n');
}

function optimizeContext(): { suggestions: string[]; currentTokens: number; targetTokens: number } {
  const stats = getStats();
  const suggestions: string[] = [];

  if (stats.cacheHitRate < 0.5) {
    suggestions.push('Cache hit rate is low. Consider stabilizing the context prefix to improve caching.');
  }

  const largeLayers = contextState.layers.filter((l) => l.tokens > 2000);
  for (const layer of largeLayers) {
    suggestions.push(`Layer "${layer.name}" uses ${layer.tokens} tokens. Consider compacting it.`);
  }

  if (contextState.layers.length > 8) {
    suggestions.push('Too many context layers. Consider merging related layers.');
  }

  if (stats.totalTokens > 30000) {
    suggestions.push('Total context exceeds 30k tokens. Compaction recommended.');
  }

  return {
    suggestions,
    currentTokens: stats.totalTokens,
    targetTokens: Math.min(stats.totalTokens, 20000),
  };
}

function compactContext(): CompactionResult {
  const originalTokens = contextState.layers.reduce((sum, l) => sum + l.tokens, 0);
  const layersCompacted: string[] = [];

  for (const layer of contextState.layers) {
    if (layer.tokens > 1500) {
      const lines = layer.content.split('\n');
      const trimmed = lines.slice(0, Math.ceil(lines.length * 0.6)).join('\n');
      layer.content = trimmed + '\n<!-- compacted -->';
      layer.tokens = estimateTokens(layer.content);
      layersCompacted.push(layer.name);
    }
  }

  contextState.compactionCount++;
  const compactedTokens = contextState.layers.reduce((sum, l) => sum + l.tokens, 0);

  return {
    originalTokens,
    compactedTokens,
    savings: originalTokens - compactedTokens,
    layersCompacted,
  };
}

const contextGetPrefixTool: McpTool = {
  name: 'context_get_prefix',
  description: 'Get the assembled context prefix for an agent, respecting cache-friendly ordering',
  parameters: {
    agentType: { type: 'string', description: 'Agent type to tailor prefix for (optional)', optional: true },
  },
  async execute(args): Promise<McpToolResult> {
    const { agentType } = args as { agentType?: string };
    const prefix = buildPrefix(agentType);
    return { success: true, data: { prefix, tokens: estimateTokens(prefix) } };
  },
};

const contextGetStatsTool: McpTool = {
  name: 'context_get_stats',
  description: 'Get context cache statistics including hit rate and layer breakdown',
  parameters: {},
  async execute(): Promise<McpToolResult> {
    return { success: true, data: getStats() };
  },
};

const contextOptimizeTool: McpTool = {
  name: 'context_optimize',
  description: 'Analyze context and return optimization suggestions',
  parameters: {},
  async execute(): Promise<McpToolResult> {
    return { success: true, data: optimizeContext() };
  },
};

const contextCompactTool: McpTool = {
  name: 'context_compact',
  description: 'Compact context layers to reduce token usage',
  parameters: {},
  async execute(): Promise<McpToolResult> {
    const result = compactContext();
    log.info(`Compacted context: saved ${result.savings} tokens across ${result.layersCompacted.length} layers`);
    return { success: true, data: result };
  },
};

export class ContextServer implements McpServer {
  name = 'context-server';
  tools: McpTool[] = [
    contextGetPrefixTool,
    contextGetStatsTool,
    contextOptimizeTool,
    contextCompactTool,
  ];

  addLayer(layer: ContextLayer): void {
    layer.tokens = estimateTokens(layer.content);
    const idx = contextState.layers.findIndex((l) => l.name === layer.name);
    if (idx >= 0) {
      contextState.layers[idx] = layer;
    } else {
      contextState.layers.push(layer);
    }
  }

  removeLayer(name: string): boolean {
    const idx = contextState.layers.findIndex((l) => l.name === name);
    if (idx >= 0) {
      contextState.layers.splice(idx, 1);
      return true;
    }
    return false;
  }

  resetState(): void {
    contextState = {
      layers: [],
      cacheHits: 0,
      cacheMisses: 0,
      compactionCount: 0,
    };
  }

  async start(): Promise<void> {
    log.info('Context MCP server started');
  }

  async stop(): Promise<void> {
    this.resetState();
    log.info('Context MCP server stopped');
  }
}

export function createContextServer(): ContextServer {
  return new ContextServer();
}
