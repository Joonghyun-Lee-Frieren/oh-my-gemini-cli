import { createLogger } from '../shared/logger.js';
import { modelRegistry } from './model-registry.js';

const log = createLogger('orchestrator:planner');

export interface SubTask {
  id: string;
  description: string;
  agentType: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  dependencies: string[];
  files: string[];
}

export interface TaskPlan {
  id: string;
  originalTask: string;
  summary: string;
  subtasks: SubTask[];
  estimatedTotalEffort: 'low' | 'medium' | 'high';
  createdAt: number;
  model: string;
}

export interface PlannerOptions {
  maxSubtasks?: number;
  preferredModel?: string;
  parentCacheKey?: string;
}

function generatePlanId(): string {
  return `plan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateSubtaskId(planId: string, index: number): string {
  return `${planId}_sub${index}`;
}

export class Planner {
  private model: string;

  constructor(options?: PlannerOptions) {
    this.model = options?.preferredModel ?? 'gemini-3.1-pro';
    const modelDef = modelRegistry.getModel(this.model);
    if (!modelDef) {
      log.warn(`Model ${this.model} not found in registry, using default`);
    }
  }

  async createPlan(task: string, context?: string): Promise<TaskPlan> {
    const planId = generatePlanId();
    log.info(`Creating plan ${planId} with ${this.model}: ${task.slice(0, 80)}`);

    const subtasks = this.decompose(task, context);

    const plan: TaskPlan = {
      id: planId,
      originalTask: task,
      summary: `Plan for: ${task.slice(0, 120)}`,
      subtasks,
      estimatedTotalEffort: this.estimateTotalEffort(subtasks),
      createdAt: Date.now(),
      model: this.model,
    };

    log.info(`Plan ${planId} created with ${subtasks.length} subtasks`);
    return plan;
  }

  private decompose(task: string, context?: string): SubTask[] {
    const planId = generatePlanId();
    const subtasks: SubTask[] = [];
    const keywords = task.toLowerCase();

    if (keywords.includes('refactor') || keywords.includes('restructure')) {
      subtasks.push(
        this.makeSubtask(planId, 0, 'Analyze current code structure', 'researcher', 'medium', []),
        this.makeSubtask(planId, 1, 'Design new architecture', 'architect', 'high', [`${planId}_sub0`]),
        this.makeSubtask(planId, 2, 'Implement refactoring', 'executor', 'high', [`${planId}_sub1`]),
        this.makeSubtask(planId, 3, 'Review changes', 'reviewer', 'medium', [`${planId}_sub2`]),
      );
    } else if (keywords.includes('bug') || keywords.includes('fix') || keywords.includes('error')) {
      subtasks.push(
        this.makeSubtask(planId, 0, 'Reproduce and analyze the issue', 'debugger', 'medium', []),
        this.makeSubtask(planId, 1, 'Implement fix', 'executor', 'medium', [`${planId}_sub0`]),
        this.makeSubtask(planId, 2, 'Verify fix', 'reviewer', 'low', [`${planId}_sub1`]),
      );
    } else if (keywords.includes('feature') || keywords.includes('implement') || keywords.includes('create')) {
      subtasks.push(
        this.makeSubtask(planId, 0, 'Research requirements and dependencies', 'researcher', 'low', []),
        this.makeSubtask(planId, 1, 'Plan implementation approach', 'planner', 'medium', [`${planId}_sub0`]),
        this.makeSubtask(planId, 2, 'Implement feature', 'executor', 'high', [`${planId}_sub1`]),
        this.makeSubtask(planId, 3, 'Code review', 'reviewer', 'medium', [`${planId}_sub2`]),
      );
    } else {
      subtasks.push(
        this.makeSubtask(planId, 0, 'Analyze task', 'planner', 'low', []),
        this.makeSubtask(planId, 1, 'Execute task', 'executor', 'medium', [`${planId}_sub0`]),
      );
    }

    return subtasks;
  }

  private makeSubtask(
    planId: string,
    index: number,
    description: string,
    agentType: string,
    effort: SubTask['estimatedEffort'],
    deps: string[],
  ): SubTask {
    return {
      id: generateSubtaskId(planId, index),
      description,
      agentType,
      estimatedEffort: effort,
      dependencies: deps,
      files: [],
    };
  }

  private estimateTotalEffort(subtasks: SubTask[]): TaskPlan['estimatedTotalEffort'] {
    const highCount = subtasks.filter((s) => s.estimatedEffort === 'high').length;
    if (highCount >= 2) return 'high';
    if (highCount >= 1 || subtasks.length > 3) return 'medium';
    return 'low';
  }

  buildHandoffMessage(plan: TaskPlan, subtaskIndex: number): string {
    const subtask = plan.subtasks[subtaskIndex];
    if (!subtask) return '';

    const depSummaries = subtask.dependencies
      .map((depId) => plan.subtasks.find((s) => s.id === depId))
      .filter(Boolean)
      .map((dep) => `- [${dep!.id}] ${dep!.description}`)
      .join('\n');

    return [
      `## Task Handoff`,
      `**Plan:** ${plan.id}`,
      `**Subtask:** ${subtask.id} - ${subtask.description}`,
      `**Agent Type:** ${subtask.agentType}`,
      `**Original Task:** ${plan.originalTask}`,
      depSummaries ? `\n**Completed Dependencies:**\n${depSummaries}` : '',
      subtask.files.length > 0 ? `\n**Relevant Files:**\n${subtask.files.join('\n')}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }
}

export function createPlanner(options?: PlannerOptions): Planner {
  return new Planner(options);
}
