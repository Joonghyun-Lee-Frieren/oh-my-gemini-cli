import { AgentType } from '../agents/types.js';

export type PricingTier = 'free' | 'standard' | 'premium';
export type ConnectionType = 'native' | 'oauth' | 'api_key';

export interface ModelCapabilities {
  reasoning: boolean;
  codeGeneration: boolean;
  planning: boolean;
  fastExecution: boolean;
  multimodal: boolean;
}

export interface ModelDefinition {
  name: string;
  provider: string;
  contextWindow: number;
  maxOutputTokens: number;
  pricingTier: PricingTier;
  connectionType: ConnectionType;
  capabilities: ModelCapabilities;
  isExternal: boolean;
}

const BUILT_IN_MODELS: ModelDefinition[] = [
  {
    name: 'gemini-3.1-pro',
    provider: 'google',
    contextWindow: 2_000_000,
    maxOutputTokens: 65_536,
    pricingTier: 'standard',
    connectionType: 'native',
    capabilities: {
      reasoning: true,
      codeGeneration: true,
      planning: true,
      fastExecution: false,
      multimodal: true,
    },
    isExternal: false,
  },
  {
    name: 'gemini-3.1-flash',
    provider: 'google',
    contextWindow: 1_000_000,
    maxOutputTokens: 65_536,
    pricingTier: 'free',
    connectionType: 'native',
    capabilities: {
      reasoning: false,
      codeGeneration: true,
      planning: false,
      fastExecution: true,
      multimodal: true,
    },
    isExternal: false,
  },
];

const EXTERNAL_MODELS: ModelDefinition[] = [
  {
    name: 'claude-sonnet',
    provider: 'anthropic',
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    pricingTier: 'premium',
    connectionType: 'oauth',
    capabilities: {
      reasoning: true,
      codeGeneration: true,
      planning: true,
      fastExecution: false,
      multimodal: true,
    },
    isExternal: true,
  },
  {
    name: 'gpt-4o',
    provider: 'openai',
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    pricingTier: 'premium',
    connectionType: 'api_key',
    capabilities: {
      reasoning: true,
      codeGeneration: true,
      planning: true,
      fastExecution: false,
      multimodal: true,
    },
    isExternal: true,
  },
];

const AGENT_MODEL_MAP: Record<AgentType, string> = {
  [AgentType.Planner]: 'gemini-3.1-pro',
  [AgentType.Architect]: 'gemini-3.1-pro',
  [AgentType.Reviewer]: 'gemini-3.1-pro',
  [AgentType.Debugger]: 'gemini-3.1-pro',
  [AgentType.Researcher]: 'gemini-3.1-pro',
  [AgentType.Executor]: 'gemini-3.1-flash',
  [AgentType.Quick]: 'gemini-3.1-flash',
};

class ModelRegistry {
  private models: Map<string, ModelDefinition> = new Map();

  constructor() {
    for (const model of [...BUILT_IN_MODELS, ...EXTERNAL_MODELS]) {
      this.models.set(model.name, model);
    }
  }

  getModel(name: string): ModelDefinition | undefined {
    return this.models.get(name);
  }

  listModels(): ModelDefinition[] {
    return [...this.models.values()];
  }

  listBuiltIn(): ModelDefinition[] {
    return [...this.models.values()].filter((m) => !m.isExternal);
  }

  listExternal(): ModelDefinition[] {
    return [...this.models.values()].filter((m) => m.isExternal);
  }

  getModelForAgentType(type: AgentType): ModelDefinition | undefined {
    const name = AGENT_MODEL_MAP[type];
    return name ? this.models.get(name) : undefined;
  }

  registerModel(model: ModelDefinition): void {
    this.models.set(model.name, model);
  }

  unregisterModel(name: string): boolean {
    return this.models.delete(name);
  }
}

export const modelRegistry = new ModelRegistry();
export type { ModelRegistry };
