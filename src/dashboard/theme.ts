import { AgentStatus, TaskStatus } from '../agents/types.js';

export const statusColors: Record<AgentStatus, string> = {
  [AgentStatus.Running]: 'cyan',
  [AgentStatus.Completed]: 'green',
  [AgentStatus.Failed]: 'red',
  [AgentStatus.Idle]: 'gray',
  [AgentStatus.Assigned]: 'yellow',
};

export const taskStatusColors: Record<TaskStatus, string> = {
  [TaskStatus.Queued]: 'yellow',
  [TaskStatus.Assigned]: 'yellow',
  [TaskStatus.InProgress]: 'cyan',
  [TaskStatus.Done]: 'green',
  [TaskStatus.Failed]: 'red',
};

export const statusIcons: Record<AgentStatus, string> = {
  [AgentStatus.Running]: '⟳',
  [AgentStatus.Completed]: '✓',
  [AgentStatus.Failed]: '✗',
  [AgentStatus.Idle]: '○',
  [AgentStatus.Assigned]: '◉',
};

export const taskStatusIcons: Record<TaskStatus, string> = {
  [TaskStatus.Queued]: '○',
  [TaskStatus.Assigned]: '◉',
  [TaskStatus.InProgress]: '●',
  [TaskStatus.Done]: '✓',
  [TaskStatus.Failed]: '✗',
};

export const boxChars = {
  topLeft: '╭',
  topRight: '╮',
  bottomLeft: '╰',
  bottomRight: '╯',
  horizontal: '─',
  vertical: '│',
  teeRight: '├',
  teeLeft: '┤',
  teeDown: '┬',
  teeUp: '┴',
  cross: '┼',
} as const;

export const spinnerFrames = {
  braille: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  dots: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
  line: ['|', '/', '-', '\\'],
} as const;

export const progressChars = {
  filled: '█',
  empty: '░',
} as const;

export const colors = {
  primary: 'cyan',
  secondary: 'white',
  accent: 'magenta',
  muted: 'gray',
  success: 'green',
  warning: 'yellow',
  error: 'red',
  border: 'gray',
} as const;
