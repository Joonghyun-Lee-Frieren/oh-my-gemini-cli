import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { retroColors, progressChars, type DashboardRenderMode } from '../theme.js';

interface StatusBarProps {
  cacheHitRate?: number;
  tokenUsage?: number;
  costEstimate?: number;
  activeAgents: number;
  totalAgents: number;
  doneTasks: number;
  failedTasks: number;
  totalTasks: number;
  sessionState: 'running' | 'done' | 'failed';
  layoutMode: 'all' | 'agents' | 'tasks' | 'logs';
  refreshMs: number;
  inputMode: boolean;
  command: 'launch' | 'team-start' | 'status' | 'team-status' | null;
  hudVisibility: 'normal' | 'compact' | 'hidden';
  renderMode: DashboardRenderMode;
}

function miniBar(percent: number, width: number = 6): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;
  return progressChars.filled.repeat(filled) + progressChars.empty.repeat(empty);
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function commandHint(command: StatusBarProps['command']): string {
  if (command === 'launch') return 'launch';
  if (command === 'team-start') return 'team';
  if (command === 'team-status') return 'status';
  return 'idle';
}

export function StatusBar({
  cacheHitRate = 0,
  tokenUsage = 0,
  costEstimate = 0,
  activeAgents,
  totalAgents,
  doneTasks,
  failedTasks,
  totalTasks,
  sessionState,
  layoutMode,
  refreshMs,
  inputMode,
  command,
  hudVisibility,
  renderMode,
}: StatusBarProps) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setBlink((b) => !b), 700);
    return () => clearInterval(timer);
  }, []);

  const cacheColor = cacheHitRate > 60 ? retroColors.green : cacheHitRate > 30 ? retroColors.gold : retroColors.red;
  const sessionColor = sessionState === 'done'
    ? retroColors.green
    : sessionState === 'failed'
      ? retroColors.red
      : retroColors.cyan;
  const sessionLabel = sessionState.toUpperCase();
  const layoutLabel = layoutMode.toUpperCase();
  const border = '===========================================================================';
  const prompt = blink ? (renderMode === 'retro' ? '>>' : '>') : ' ';

  if (hudVisibility === 'hidden') {
    return (
      <Box flexDirection="column">
        <Text color={retroColors.purple}>{border}</Text>
        <Box justifyContent="space-between" paddingX={1}>
          <Text color={retroColors.dim}>HUD hidden | command {commandHint(command)} | state <Text color={sessionColor}>{sessionLabel}</Text></Text>
          <Text color={retroColors.dim}>
            <Text color={retroColors.cyan}>{prompt}</Text>{' '}
            <Text color={retroColors.pink}>h</Text>:hud{' '}
            <Text color={retroColors.pink}>tab</Text>:view{' '}
            <Text color={retroColors.pink}>q</Text>:quit
          </Text>
        </Box>
        <Text color={retroColors.purple}>{border}</Text>
      </Box>
    );
  }

  if (hudVisibility === 'compact') {
    return (
      <Box flexDirection="column">
        <Text color={retroColors.purple}>{border}</Text>
        <Box justifyContent="space-between" paddingX={1}>
          <Text color={retroColors.slate}>
            AG {activeAgents}/{totalAgents} | TK {doneTasks}/{totalTasks} | RF {(refreshMs / 1000).toFixed(1)}s | CS{' '}
            <Text color={cacheColor}>{cacheHitRate.toFixed(0)}%</Text> | ST <Text color={sessionColor}>{sessionLabel}</Text>
          </Text>
          <Text color={retroColors.dim}>
            <Text color={retroColors.cyan}>{prompt}</Text>{' '}
            <Text color={retroColors.pink}>h</Text>:hud{' '}
            <Text color={retroColors.pink}>q</Text>:quit{' '}
            <Text color={retroColors.pink}>tab</Text>:view{' '}
            <Text color={retroColors.pink}>f</Text>:refresh
          </Text>
        </Box>
        <Text color={retroColors.purple}>{border}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color={retroColors.purple}>{border}</Text>
      <Box justifyContent="space-between" paddingX={1}>
        <Box gap={2}>
          <Text>
            <Text color={retroColors.slate}>AGENTS </Text>
            <Text color={retroColors.white}>{activeAgents}</Text>
            <Text color={retroColors.dim}>/{totalAgents}</Text>
          </Text>
          <Text>
            <Text color={retroColors.slate}>TASKS </Text>
            <Text color={retroColors.white}>{doneTasks}</Text>
            <Text color={retroColors.dim}>/{totalTasks}</Text>
          </Text>
          <Text>
            <Text color={retroColors.slate}>RISKS </Text>
            <Text color={failedTasks > 0 ? retroColors.red : retroColors.green}>{failedTasks}</Text>
          </Text>
          <Text>
            <Text color={retroColors.slate}>CACHE </Text>
            <Text color={cacheColor}>{miniBar(cacheHitRate)}</Text>
            <Text color={cacheColor}> {cacheHitRate.toFixed(0)}%</Text>
          </Text>
          <Text>
            <Text color={retroColors.slate}>TOKENS </Text>
            <Text color={retroColors.cyan}>{formatTokens(tokenUsage)}/1M</Text>
          </Text>
          <Text>
            <Text color={retroColors.slate}>GOLD </Text>
            <Text color={retroColors.gold}>-${costEstimate.toFixed(4)}</Text>
          </Text>
          <Text>
            <Text color={retroColors.slate}>STATE </Text>
            <Text color={sessionColor}>{sessionLabel}</Text>
          </Text>
          <Text>
            <Text color={retroColors.slate}>VIEW </Text>
            <Text color={retroColors.white}>{layoutLabel}</Text>
          </Text>
          <Text>
            <Text color={retroColors.slate}>REFRESH </Text>
            <Text color={retroColors.white}>{(refreshMs / 1000).toFixed(1)}s</Text>
          </Text>
          {command === 'launch' && (
            <Text>
              <Text color={retroColors.slate}>INPUT </Text>
              <Text color={inputMode ? retroColors.green : retroColors.dim}>
                {inputMode ? 'ON' : 'OFF'}
              </Text>
            </Text>
          )}
        </Box>
        <Box gap={1}>
          <Text color={retroColors.dim}>
            <Text color={blink ? retroColors.cyan : retroColors.dim}>{prompt}</Text>{' '}
            <Text color={retroColors.pink}>q</Text>:quit{' '}
            <Text color={retroColors.pink}>p</Text>:pause{' '}
            <Text color={retroColors.pink}>r</Text>:resume{' '}
            <Text color={retroColors.pink}>tab</Text>:view{' '}
            <Text color={retroColors.pink}>a</Text>:rate{' '}
            <Text color={retroColors.pink}>f</Text>:refresh{' '}
            <Text color={retroColors.pink}>h</Text>:hud{' '}
            {command === 'launch' && (
              <>
                <Text color={retroColors.pink}>i</Text>:input{' '}
                <Text color={retroColors.pink}>esc</Text>:input-off
              </>
            )}
          </Text>
        </Box>
      </Box>
      <Text color={retroColors.purple}>{border}</Text>
    </Box>
  );
}
