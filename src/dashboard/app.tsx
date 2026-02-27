import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Box, Text, useInput, useApp } from 'ink';
import { AgentStatus, TaskStatus } from '../agents/types.js';
import { Header } from './components/header.js';
import { AgentGrid } from './components/agent-grid.js';
import { TaskList } from './components/task-list.js';
import { LogPanel } from './components/log-panel.js';
import { HudLine } from './components/hud-line.js';
import { StatusBar } from './components/status-bar.js';
import { AsciiArt } from './components/ascii-art.js';
import { useAgentStatus } from './hooks/use-agent-status.js';
import { useTaskStream } from './hooks/use-task-stream.js';
import { retroColors, normalizeDashboardRenderMode, type DashboardRenderMode } from './theme.js';
import { eventBus } from '../shared/event-bus.js';
import { getProjectRoot, STATE_DIR } from '../shared/config.js';
import { estimateModelCostUsd } from './utils/cost-estimator.js';

interface DashboardAppProps {
  projectName?: string;
  version?: string;
  renderMode?: DashboardRenderMode;
}

export function DashboardApp({ projectName, version, renderMode }: DashboardAppProps) {
  const { exit } = useApp();
  const [refreshMs, setRefreshMs] = useState(1500);
  const [refreshTick, setRefreshTick] = useState(0);
  const agents = useAgentStatus(refreshMs, refreshTick);
  const tasks = useTaskStream(refreshMs, refreshTick);
  const [showIntro, setShowIntro] = useState(true);
  const [paused, setPaused] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'all' | 'agents' | 'tasks' | 'logs'>('all');
  const [inputMode, setInputMode] = useState(false);
  const [hudVisibility, setHudVisibility] = useState<'normal' | 'compact' | 'hidden'>('normal');
  const [command, setCommand] = useState<'launch' | 'team-start' | 'status' | 'team-status' | null>(null);
  const [cacheHitRate, setCacheHitRate] = useState(0);
  const [runtimeTokenUsage, setRuntimeTokenUsage] = useState(0);
  const [runtimeCostEstimate, setRuntimeCostEstimate] = useState(0);
  const [runtimeModel, setRuntimeModel] = useState<string | undefined>(undefined);
  const [runtimePhase, setRuntimePhase] = useState('running');
  const [sessionState, setSessionState] = useState<'running' | 'done' | 'failed'>('running');
  const mode = normalizeDashboardRenderMode(renderMode ?? process.env.OMG_DASHBOARD_STYLE);

  const activeCount = agents.filter(
    (a) => a.status === AgentStatus.Running || a.status === AgentStatus.Assigned,
  ).length;
  const doneCount = tasks.filter((task) => task.status === TaskStatus.Done).length;
  const runningCount = tasks.filter(
    (task) => task.status === TaskStatus.InProgress || task.status === TaskStatus.Assigned,
  ).length;
  const queuedCount = tasks.filter((task) => task.status === TaskStatus.Queued).length;
  const failedCount = tasks.filter((task) => task.status === TaskStatus.Failed).length;

  const activeModel = runtimeModel ?? agents.find((a) => a.config?.model)?.config.model;
  const estimatedTokenUsage = useMemo(() => {
    if (runtimeTokenUsage > 0) return runtimeTokenUsage;
    return Math.max(0, doneCount * 2200 + runningCount * 900 + queuedCount * 250);
  }, [doneCount, queuedCount, runningCount, runtimeTokenUsage]);

  const estimatedCost = useMemo(() => {
    if (runtimeCostEstimate > 0) return runtimeCostEstimate;
    return estimateModelCostUsd({
      model: activeModel,
      inputTokens: Math.ceil(estimatedTokenUsage * 0.4),
      outputTokens: Math.ceil(estimatedTokenUsage * 0.6),
    });
  }, [activeModel, estimatedTokenUsage, runtimeCostEstimate]);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  useEffect(() => {
    const onMetrics = (payload: { tokenUsage?: number; costEstimate?: number; cacheHitRate?: number; model?: string; phase?: string }) => {
      if (typeof payload.tokenUsage === 'number') setRuntimeTokenUsage(Math.max(0, payload.tokenUsage));
      if (typeof payload.costEstimate === 'number') setRuntimeCostEstimate(Math.max(0, payload.costEstimate));
      if (typeof payload.cacheHitRate === 'number') setCacheHitRate(Math.max(0, Math.min(100, payload.cacheHitRate)));
      if (typeof payload.model === 'string' && payload.model.trim()) setRuntimeModel(payload.model);
      if (typeof payload.phase === 'string' && payload.phase.trim()) setRuntimePhase(payload.phase);
    };
    const onSession = (payload: { command: 'launch' | 'team-start' | 'status' | 'team-status'; state: 'running' | 'done' | 'failed' }) => {
      setCommand(payload.command);
      setSessionState(payload.state);
    };
    const cacheStatsPath = resolve(getProjectRoot(), STATE_DIR, 'cache-stats.json');
    const hudStatePath = resolve(getProjectRoot(), STATE_DIR, 'hud.json');
    const loadCache = () => {
      if (!existsSync(cacheStatsPath)) return;
      try {
        const stats = JSON.parse(readFileSync(cacheStatsPath, 'utf-8')) as { hits?: number; misses?: number };
        const hits = stats.hits ?? 0;
        const misses = stats.misses ?? 0;
        const total = hits + misses;
        if (total <= 0) return;
        setCacheHitRate(Number(((hits / total) * 100).toFixed(2)));
      } catch {
        // Keep latest valid cache rate.
      }
    };
    const loadHudVisibility = () => {
      if (!existsSync(hudStatePath)) return;
      try {
        const hud = JSON.parse(readFileSync(hudStatePath, 'utf-8')) as { visibility?: string };
        if (hud.visibility === 'compact' || hud.visibility === 'hidden' || hud.visibility === 'normal') {
          setHudVisibility(hud.visibility);
        }
      } catch {
        // Keep the current HUD visibility if state is malformed.
      }
    };
    loadCache();
    loadHudVisibility();
    const pollId = setInterval(() => {
      loadCache();
      loadHudVisibility();
    }, 2000);
    eventBus.on('hud:metrics', onMetrics);
    eventBus.on('hud:session', onSession);
    return () => {
      clearInterval(pollId);
      eventBus.off('hud:metrics', onMetrics);
      eventBus.off('hud:session', onSession);
    };
  }, []);

  useInput((input, key) => {
    if (command === 'launch' && input === 'i') {
      setInputMode((prev) => !prev);
      return;
    }
    if (command === 'launch' && inputMode) {
      if (key.escape) {
        setInputMode(false);
        return;
      }
      if (key.return) {
        eventBus.emit('hud:stdin', { data: '\n' });
        return;
      }
      if (key.backspace) {
        eventBus.emit('hud:stdin', { data: '\b' });
        return;
      }
      if (input) {
        eventBus.emit('hud:stdin', { data: input });
      }
      return;
    }

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
    if (input === 'a') {
      setRefreshMs((prev) => (prev === 1000 ? 2000 : prev === 2000 ? 5000 : 1000));
      return;
    }
    if (input === 'f') {
      setRefreshTick((prev) => prev + 1);
      return;
    }
    if (input === 'h') {
      setHudVisibility((prev) => (
        prev === 'normal' ? 'compact' : prev === 'compact' ? 'hidden' : 'normal'
      ));
      return;
    }
    if (key.tab) {
      setLayoutMode((prev) => (
        prev === 'all' ? 'agents' : prev === 'agents' ? 'tasks' : prev === 'tasks' ? 'logs' : 'all'
      ));
      return;
    }
    if (input === '0') setLayoutMode('all');
    if (input === '1') setLayoutMode('agents');
    if (input === '2') setLayoutMode('tasks');
    if (input === '3') setLayoutMode('logs');
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
      <HudLine
        visibility={hudVisibility}
        command={command}
        phase={runtimePhase}
        activeAgents={activeCount}
        totalAgents={Math.max(agents.length, 1)}
        doneTasks={doneCount}
        totalTasks={tasks.length}
        failedTasks={failedCount}
        renderMode={mode}
      />

      {layoutMode === 'all' ? (
        <>
          <Box flexDirection="row" flexGrow={1}>
            <Box flexDirection="column" flexGrow={1} flexBasis="60%">
              <AgentGrid agents={agents} renderMode={mode} />
            </Box>
            <Box flexDirection="column" flexGrow={1} flexBasis="40%">
              <TaskList tasks={tasks} renderMode={mode} />
            </Box>
          </Box>
          <LogPanel maxLines={10} renderMode={mode} />
        </>
      ) : layoutMode === 'agents' ? (
        <AgentGrid agents={agents} renderMode={mode} />
      ) : layoutMode === 'tasks' ? (
        <TaskList tasks={tasks} renderMode={mode} />
      ) : (
        <LogPanel maxLines={20} renderMode={mode} />
      )}

      <StatusBar
        cacheHitRate={cacheHitRate}
        tokenUsage={estimatedTokenUsage}
        costEstimate={estimatedCost}
        activeAgents={activeCount}
        totalAgents={Math.max(agents.length, 1)}
        doneTasks={doneCount}
        failedTasks={failedCount}
        totalTasks={tasks.length}
        sessionState={sessionState}
        layoutMode={layoutMode}
        refreshMs={refreshMs}
        inputMode={inputMode}
        command={command}
        hudVisibility={hudVisibility}
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
