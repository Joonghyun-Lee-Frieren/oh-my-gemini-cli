import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { AgentStatus } from '../agents/types.js';
import { Header } from './components/header.js';
import { AgentGrid } from './components/agent-grid.js';
import { TaskList } from './components/task-list.js';
import { LogPanel } from './components/log-panel.js';
import { StatusBar } from './components/status-bar.js';
import { AsciiArt } from './components/ascii-art.js';
import { useAgentStatus } from './hooks/use-agent-status.js';
import { useTaskStream } from './hooks/use-task-stream.js';
import { retroColors, normalizeDashboardRenderMode, type DashboardRenderMode } from './theme.js';

interface DashboardAppProps {
  projectName?: string;
  version?: string;
  renderMode?: DashboardRenderMode;
}

export function DashboardApp({ projectName, version, renderMode }: DashboardAppProps) {
  const { exit } = useApp();
  const agents = useAgentStatus();
  const tasks = useTaskStream();
  const [showIntro, setShowIntro] = useState(true);
  const [paused, setPaused] = useState(false);
  const [cacheHitRate] = useState(0);
  const [tokenUsage] = useState(0);
  const [costEstimate] = useState(0);
  const mode = normalizeDashboardRenderMode(renderMode ?? process.env.OMG_DASHBOARD_STYLE);

  const activeCount = agents.filter((a) => a.status === AgentStatus.Running).length;

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }
    if (input === 'p') {
      setPaused(true);
      return;
    }
    if (input === 'r') {
      setPaused(false);
      return;
    }
    if (input === 'd' || input === 't') {
      return;
    }
    if (key.tab) {
      return;
    }
    const num = parseInt(input, 10);
    if (num >= 1 && num <= 9) {
      return;
    }
  });

  if (showIntro) {
    return (
      <Box flexDirection="column">
        <AsciiArt onComplete={handleIntroComplete} renderMode={mode} />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" width="100%">
      <Header
        projectName={projectName}
        version={version}
        activeAgentCount={activeCount}
        totalAgentCount={agents.length || 6}
        renderMode={mode}
      />

      <Box flexDirection="row" flexGrow={1}>
        <Box flexDirection="column" flexGrow={1} flexBasis="60%">
          <AgentGrid agents={agents} renderMode={mode} />
        </Box>
        <Box flexDirection="column" flexGrow={1} flexBasis="40%">
          <TaskList tasks={tasks} renderMode={mode} />
        </Box>
      </Box>

      <LogPanel maxLines={10} renderMode={mode} />

      <StatusBar
        cacheHitRate={cacheHitRate}
        tokenUsage={tokenUsage}
        costEstimate={costEstimate}
        renderMode={mode}
      />

      {paused && (
        <Box
          justifyContent="center"
          alignItems="center"
          position="absolute"
          width="100%"
          height="100%"
        >
          <Box flexDirection="column" alignItems="center" paddingX={3} paddingY={1}>
            <Text color={retroColors.purple}>╔══════════════════════════╗</Text>
            <Text color={retroColors.purple}>║                          ║</Text>
            <Text color={retroColors.purple}>
              ║  <Text color={retroColors.gold} bold>{mode === 'retro' ? '  PAUSED - RETRO   ' : '   GAME PAUSED     '}</Text>  ║
            </Text>
            <Text color={retroColors.purple}>║                          ║</Text>
            <Text color={retroColors.purple}>
              ║  <Text color={retroColors.slate}> press [r] to resume </Text>  ║
            </Text>
            <Text color={retroColors.purple}>║                          ║</Text>
            <Text color={retroColors.purple}>╚══════════════════════════╝</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
