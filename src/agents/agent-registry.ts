import { AgentType, type AgentConfig } from './types.js';
import { loadConfig } from '../shared/config.js';

const AGENT_DEFINITIONS: Record<AgentType, { description: string; capabilities: string[] }> = {
  [AgentType.Architect]: {
    description: 'Designs system architecture and high-level technical decisions',
    capabilities: ['system-design', 'api-design', 'tech-stack', 'architecture-review'],
  },
  [AgentType.Planner]: {
    description: 'Breaks down complex tasks into ordered subtasks with dependencies',
    capabilities: ['task-decomposition', 'dependency-analysis', 'estimation', 'prioritization'],
  },
  [AgentType.Executor]: {
    description: 'Implements code changes and executes development tasks',
    capabilities: ['code-generation', 'file-editing', 'refactoring', 'implementation'],
  },
  [AgentType.Reviewer]: {
    description: 'Reviews code for quality, correctness, and best practices',
    capabilities: ['code-review', 'bug-detection', 'style-check', 'security-audit'],
  },
  [AgentType.Debugger]: {
    description: 'Investigates and resolves bugs and runtime errors',
    capabilities: ['error-analysis', 'stack-trace', 'root-cause', 'fix-suggestion'],
  },
  [AgentType.Researcher]: {
    description: 'Explores codebases, documentation, and external resources',
    capabilities: ['code-search', 'documentation', 'dependency-analysis', 'exploration'],
  },
  [AgentType.Quick]: {
    description: 'Handles simple, fast tasks like formatting or small edits',
    capabilities: ['quick-edit', 'formatting', 'renaming', 'simple-query'],
  },
};

export function getAgentConfig(type: AgentType): AgentConfig {
  const config = loadConfig();
  const definition = AGENT_DEFINITIONS[type];
  const agentModel = config.agents[type]?.model ?? 'gemini-3.1-flash';

  return {
    type,
    model: agentModel,
    description: definition.description,
    capabilities: definition.capabilities,
  };
}

export function getAllAgentConfigs(): AgentConfig[] {
  return Object.values(AgentType).map(getAgentConfig);
}
