import type { McpServer, McpTool, McpToolResult } from './types.js';
import { createLogger } from '../shared/logger.js';
import { modelRegistry } from '../orchestrator/model-registry.js';
import { AgentType } from '../agents/types.js';

const log = createLogger('mcp:orchestrator');

export interface PlanRequest {
  task: string;
  context?: string;
  constraints?: string[];
}

export interface ExecuteRequest {
  subtask: string;
  plan?: string;
  files?: string[];
}

export interface DelegateRequest {
  task: string;
  taskType: 'planning' | 'execution' | 'review' | 'research' | 'debug';
  context?: string;
}

interface OrchestratorResult {
  model: string;
  provider: string;
  action: string;
  input: unknown;
  timestamp: number;
}

function resolveModelForTaskType(taskType: DelegateRequest['taskType']): string {
  const typeMap: Record<string, AgentType> = {
    planning: AgentType.Planner,
    execution: AgentType.Executor,
    review: AgentType.Reviewer,
    research: AgentType.Researcher,
    debug: AgentType.Debugger,
  };

  const agentType = typeMap[taskType];
  if (!agentType) return 'gemini-3.1-flash';

  const model = modelRegistry.getModelForAgentType(agentType);
  return model?.name ?? 'gemini-3.1-flash';
}

const orchestratorPlanTool: McpTool = {
  name: 'orchestrator_plan',
  description: 'Route a planning task to Gemini 3.1 Pro for deep reasoning and structured plan generation',
  parameters: {
    task: { type: 'string', description: 'Task description to plan' },
    context: { type: 'string', description: 'Additional context (optional)', optional: true },
    constraints: { type: 'array', description: 'Planning constraints (optional)', optional: true },
  },
  async execute(args): Promise<McpToolResult> {
    const { task, context, constraints } = args as PlanRequest;
    const model = modelRegistry.getModel('gemini-3.1-pro');

    if (!model) {
      return { success: false, error: 'gemini-3.1-pro model not found in registry' };
    }

    const result: OrchestratorResult = {
      model: model.name,
      provider: model.provider,
      action: 'plan',
      input: { task, context, constraints },
      timestamp: Date.now(),
    };

    log.info(`Plan routed to ${model.name}: ${task.slice(0, 80)}`);
    return { success: true, data: result };
  },
};

const orchestratorExecuteTool: McpTool = {
  name: 'orchestrator_execute',
  description: 'Route an execution task to Gemini 3.1 Flash for fast code generation',
  parameters: {
    subtask: { type: 'string', description: 'Specific subtask to execute' },
    plan: { type: 'string', description: 'Parent plan context (optional)', optional: true },
    files: { type: 'array', description: 'Relevant file paths (optional)', optional: true },
  },
  async execute(args): Promise<McpToolResult> {
    const { subtask, plan, files } = args as ExecuteRequest;
    const model = modelRegistry.getModel('gemini-3.1-flash');

    if (!model) {
      return { success: false, error: 'gemini-3.1-flash model not found in registry' };
    }

    const result: OrchestratorResult = {
      model: model.name,
      provider: model.provider,
      action: 'execute',
      input: { subtask, plan, files },
      timestamp: Date.now(),
    };

    log.info(`Execution routed to ${model.name}: ${subtask.slice(0, 80)}`);
    return { success: true, data: result };
  },
};

const orchestratorDelegateTool: McpTool = {
  name: 'orchestrator_delegate',
  description: 'Automatically route a task to the appropriate model based on task type',
  parameters: {
    task: { type: 'string', description: 'Task description' },
    taskType: { type: 'string', description: 'Task type: planning, execution, review, research, debug' },
    context: { type: 'string', description: 'Additional context (optional)', optional: true },
  },
  async execute(args): Promise<McpToolResult> {
    const { task, taskType, context } = args as DelegateRequest;
    const modelName = resolveModelForTaskType(taskType);
    const model = modelRegistry.getModel(modelName);

    if (!model) {
      return { success: false, error: `Model ${modelName} not found in registry` };
    }

    const result: OrchestratorResult = {
      model: model.name,
      provider: model.provider,
      action: `delegate:${taskType}`,
      input: { task, taskType, context },
      timestamp: Date.now(),
    };

    log.info(`Delegated [${taskType}] to ${model.name}: ${task.slice(0, 80)}`);
    return { success: true, data: result };
  },
};

export class OrchestratorServer implements McpServer {
  name = 'orchestrator-server';
  tools: McpTool[] = [orchestratorPlanTool, orchestratorExecuteTool, orchestratorDelegateTool];

  async start(): Promise<void> {
    log.info(`Orchestrator MCP server started (${modelRegistry.listModels().length} models registered)`);
  }

  async stop(): Promise<void> {
    log.info('Orchestrator MCP server stopped');
  }
}

export function createOrchestratorServer(): OrchestratorServer {
  return new OrchestratorServer();
}
