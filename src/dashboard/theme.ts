import { AgentStatus, AgentType, TaskStatus } from '../agents/types.js';

export type DashboardRenderMode = 'safe' | 'retro';

export function normalizeDashboardRenderMode(mode?: string): DashboardRenderMode {
  return mode === 'retro' ? 'retro' : 'safe';
}

export const retroColors = {
  pink: '#ff6b9d',
  purple: '#c084fc',
  cyan: '#67e8f9',
  gold: '#fbbf24',
  green: '#4ade80',
  red: '#f87171',
  slate: '#94a3b8',
  white: '#e2e8f0',
  dim: '#475569',
} as const;

export const colors = {
  primary: retroColors.cyan,
  secondary: retroColors.white,
  accent: retroColors.pink,
  muted: retroColors.dim,
  success: retroColors.green,
  warning: retroColors.gold,
  error: retroColors.red,
  border: retroColors.purple,
} as const;

export const statusColors: Record<AgentStatus, string> = {
  [AgentStatus.Running]: retroColors.cyan,
  [AgentStatus.Completed]: retroColors.green,
  [AgentStatus.Failed]: retroColors.red,
  [AgentStatus.Idle]: retroColors.slate,
  [AgentStatus.Assigned]: retroColors.gold,
};

export const taskStatusColors: Record<TaskStatus, string> = {
  [TaskStatus.Queued]: retroColors.slate,
  [TaskStatus.Assigned]: retroColors.gold,
  [TaskStatus.InProgress]: retroColors.cyan,
  [TaskStatus.Done]: retroColors.green,
  [TaskStatus.Failed]: retroColors.red,
};

export const statusIconsByMode: Record<DashboardRenderMode, Record<AgentStatus, string>> = {
  safe: {
    [AgentStatus.Running]: '*',
    [AgentStatus.Completed]: '+',
    [AgentStatus.Failed]: 'x',
    [AgentStatus.Idle]: '.',
    [AgentStatus.Assigned]: '>',
  },
  retro: {
    [AgentStatus.Running]: '♦',
    [AgentStatus.Completed]: '★',
    [AgentStatus.Failed]: '✘',
    [AgentStatus.Idle]: '◇',
    [AgentStatus.Assigned]: '▶',
  },
};

export const taskStatusIconsByMode: Record<DashboardRenderMode, Record<TaskStatus, string>> = {
  safe: {
    [TaskStatus.Queued]: '.',
    [TaskStatus.Assigned]: '>',
    [TaskStatus.InProgress]: '*',
    [TaskStatus.Done]: '+',
    [TaskStatus.Failed]: 'x',
  },
  retro: {
    [TaskStatus.Queued]: '·',
    [TaskStatus.Assigned]: '▸',
    [TaskStatus.InProgress]: '⚡',
    [TaskStatus.Done]: '★',
    [TaskStatus.Failed]: '✘',
  },
};

export const statusLabels: Record<AgentStatus, string> = {
  [AgentStatus.Running]: 'ATK',
  [AgentStatus.Completed]: 'WIN',
  [AgentStatus.Failed]: 'KO',
  [AgentStatus.Idle]: 'ZZZ',
  [AgentStatus.Assigned]: 'RDY',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.Queued]: 'WAIT',
  [TaskStatus.Assigned]: 'RDY',
  [TaskStatus.InProgress]: 'ACTIVE',
  [TaskStatus.Done]: 'CLEAR!',
  [TaskStatus.Failed]: 'FAIL',
};

export const spinnerFrames = {
  pixel: ['◜', '◝', '◞', '◟'],
  block: ['▙', '▛', '▜', '▟'],
  music: ['♩', '♪', '♫', '♬'],
  sword: ['╱', '─', '╲', '│'],
} as const;

export const progressChars = {
  filled: '▓',
  half: '▒',
  empty: '░',
} as const;

export const boxChars = {
  topLeft: '╔',
  topRight: '╗',
  bottomLeft: '╚',
  bottomRight: '╝',
  horizontal: '═',
  vertical: '║',
  teeRight: '╠',
  teeLeft: '╣',
  teeDown: '╦',
  teeUp: '╩',
  cross: '╬',
  thin: '──────',
} as const;

export const agentSpritesByMode: Record<DashboardRenderMode, Record<string, string>> = {
  safe: {
    [AgentType.Architect]: '[AR]',
    [AgentType.Planner]: '[PL]',
    [AgentType.Executor]: '[EX]',
    [AgentType.Reviewer]: '[RV]',
    [AgentType.Debugger]: '[DB]',
    [AgentType.Researcher]: '[RS]',
    [AgentType.Quick]: '[QK]',
  },
  retro: {
    [AgentType.Architect]: 'AR',
    [AgentType.Planner]: 'PL',
    [AgentType.Executor]: 'EX',
    [AgentType.Reviewer]: 'RV',
    [AgentType.Debugger]: 'DB',
    [AgentType.Researcher]: 'RS',
    [AgentType.Quick]: 'QK',
  },
};
