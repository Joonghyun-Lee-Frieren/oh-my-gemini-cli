import { AgentType, TaskPriority, TaskStatus, type Task } from './types.js';

const KEYWORD_MAP: Array<{ keywords: string[]; agentType: AgentType }> = [
  {
    keywords: ['architecture', 'design', 'system design', 'api design', 'schema', 'structure', 'diagram'],
    agentType: AgentType.Architect,
  },
  {
    keywords: ['plan', 'break down', 'decompose', 'roadmap', 'strategy', 'steps', 'outline'],
    agentType: AgentType.Planner,
  },
  {
    keywords: ['implement', 'build', 'create', 'code', 'write', 'develop', 'add feature', 'refactor'],
    agentType: AgentType.Executor,
  },
  {
    keywords: ['review', 'audit', 'check', 'inspect', 'quality', 'lint', 'best practice'],
    agentType: AgentType.Reviewer,
  },
  {
    keywords: ['debug', 'fix', 'error', 'bug', 'crash', 'issue', 'stack trace', 'troubleshoot'],
    agentType: AgentType.Debugger,
  },
  {
    keywords: ['research', 'explore', 'find', 'search', 'investigate', 'analyze', 'documentation', 'look up'],
    agentType: AgentType.Researcher,
  },
  {
    keywords: ['format', 'rename', 'quick', 'simple', 'minor', 'typo', 'small'],
    agentType: AgentType.Quick,
  },
];

export function routeTask(description: string): AgentType {
  const lower = description.toLowerCase();

  let bestMatch: AgentType = AgentType.Executor;
  let bestScore = 0;

  for (const entry of KEYWORD_MAP) {
    const score = entry.keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry.agentType;
    }
  }

  return bestMatch;
}

let taskCounter = 0;

export function createTask(
  description: string,
  options: {
    priority?: TaskPriority;
    dependencies?: string[];
    agentType?: AgentType;
  } = {},
): Task {
  taskCounter++;
  return {
    id: `task-${Date.now()}-${taskCounter}`,
    description,
    agentType: options.agentType ?? routeTask(description),
    status: TaskStatus.Queued,
    priority: options.priority ?? TaskPriority.Normal,
    dependencies: options.dependencies ?? [],
    createdAt: Date.now(),
  };
}

export interface DependencyGraph {
  tasks: Task[];
  edges: Map<string, string[]>; // taskId -> depends on taskIds
}

export function buildDependencyGraph(tasks: Task[]): DependencyGraph {
  const edges = new Map<string, string[]>();
  for (const task of tasks) {
    edges.set(task.id, task.dependencies);
  }
  return { tasks, edges };
}

export function getReadyTasks(graph: DependencyGraph, completedIds: Set<string>): Task[] {
  return graph.tasks.filter((task) => {
    if (task.status === TaskStatus.Done || task.status === TaskStatus.InProgress) return false;
    const deps = graph.edges.get(task.id) ?? [];
    return deps.every((depId) => completedIds.has(depId));
  });
}
