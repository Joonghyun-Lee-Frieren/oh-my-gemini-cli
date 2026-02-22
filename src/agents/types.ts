export enum AgentType {
  Architect = 'architect',
  Planner = 'planner',
  Executor = 'executor',
  Reviewer = 'reviewer',
  Debugger = 'debugger',
  Researcher = 'researcher',
  Quick = 'quick',
}

export enum AgentStatus {
  Idle = 'idle',
  Assigned = 'assigned',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
}

export enum TaskStatus {
  Queued = 'queued',
  Assigned = 'assigned',
  InProgress = 'in_progress',
  Done = 'done',
  Failed = 'failed',
}

export enum TaskPriority {
  Critical = 0,
  High = 1,
  Normal = 2,
  Low = 3,
}

export interface AgentConfig {
  type: AgentType;
  model: string;
  description: string;
  capabilities: string[];
}

export interface Task {
  id: string;
  description: string;
  agentType: AgentType;
  status: TaskStatus;
  priority: TaskPriority;
  dependencies: string[];
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  assignedTo?: string;
  result?: TaskResult;
}

export interface TaskResult {
  taskId: string;
  agentId: string;
  success: boolean;
  output: string;
  error?: string;
  duration: number;
}

export interface Agent {
  id: string;
  type: AgentType;
  status: AgentStatus;
  config: AgentConfig;
  currentTask?: Task;
  startedAt?: number;
  progress: number;
}
