import React from 'react';
import { Box, Text } from 'ink';
import { retroColors, type DashboardRenderMode } from '../theme.js';

export interface HudLineProps {
  visibility: 'normal' | 'compact' | 'hidden';
  command: 'launch' | 'team-start' | 'status' | 'team-status' | null;
  phase: string;
  activeAgents: number;
  totalAgents: number;
  doneTasks: number;
  totalTasks: number;
  failedTasks: number;
  renderMode: DashboardRenderMode;
}

function nextHint(command: HudLineProps['command'], phase: string, failedTasks: number): string {
  if (phase === 'failed' || failedTasks > 0) return 'inspect logs';
  if (phase === 'done') return command === 'launch' ? 'new prompt' : 'run verify';
  if (command === 'status' || command === 'team-status') return 'review blockers';
  return 'continue';
}

export function HudLine({
  visibility,
  command,
  phase,
  activeAgents,
  totalAgents,
  doneTasks,
  totalTasks,
  failedTasks,
  renderMode,
}: HudLineProps) {
  if (visibility === 'hidden') return null;

  const phaseLabel = phase.toUpperCase();
  const cmdLabel = (command ?? 'idle').toUpperCase();
  const next = nextHint(command, phase, failedTasks).toUpperCase();
  const compact = visibility === 'compact';
  const marker = renderMode === 'retro' ? '>>' : '>';

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={retroColors.purple}>---------------------------------------------------------------------------</Text>
      <Text color={retroColors.slate}>
        <Text color={retroColors.cyan}>{marker}</Text>{' '}
        <Text color={retroColors.white}>HUD</Text>{' '}
        <Text color={retroColors.dim}>CMD</Text> <Text color={retroColors.white}>{cmdLabel}</Text>{' '}
        <Text color={retroColors.dim}>PHASE</Text> <Text color={phase === 'failed' ? retroColors.red : retroColors.green}>{phaseLabel}</Text>{' '}
        <Text color={retroColors.dim}>AGENTS</Text> <Text color={retroColors.white}>{activeAgents}/{totalAgents}</Text>{' '}
        <Text color={retroColors.dim}>TASKS</Text> <Text color={retroColors.white}>{doneTasks}/{totalTasks}</Text>{' '}
        {!compact && (
          <>
            <Text color={retroColors.dim}>RISKS</Text>{' '}
            <Text color={failedTasks > 0 ? retroColors.red : retroColors.green}>{failedTasks}</Text>{' '}
          </>
        )}
        <Text color={retroColors.dim}>NEXT</Text> <Text color={retroColors.gold}>{next}</Text>
      </Text>
      <Text color={retroColors.purple}>---------------------------------------------------------------------------</Text>
    </Box>
  );
}
