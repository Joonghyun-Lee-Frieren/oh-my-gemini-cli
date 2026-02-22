import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { eventBus } from '../../shared/event-bus.js';
import { colors } from '../theme.js';

interface LogEntry {
  timestamp: Date;
  agentId: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
}

interface LogPanelProps {
  maxLines?: number;
}

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

const levelColors: Record<string, string> = {
  info: 'white',
  warn: 'yellow',
  error: 'red',
  debug: 'gray',
};

export function LogPanel({ maxLines = 10 }: LogPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const push = (entry: LogEntry) => {
      setLogs((prev) => {
        const next = [...prev, entry];
        return next.length > maxLines * 2 ? next.slice(-maxLines) : next;
      });
    };

    const onSpawn = ({ agent }: { agent: { id: string; type: string } }) => {
      push({ timestamp: new Date(), agentId: agent.id, message: `Agent spawned (${agent.type})`, level: 'info' });
    };

    const onProgress = (p: { agentId: string; progress: number; message?: string }) => {
      if (p.message) {
        push({ timestamp: new Date(), agentId: p.agentId, message: p.message, level: 'debug' });
      }
    };

    const onOutput = (p: { agentId: string; output: string }) => {
      push({ timestamp: new Date(), agentId: p.agentId, message: p.output, level: 'info' });
    };

    const onComplete = (p: { agentId: string }) => {
      push({ timestamp: new Date(), agentId: p.agentId, message: 'Completed', level: 'info' });
    };

    const onError = (p: { agentId: string; error: string }) => {
      push({ timestamp: new Date(), agentId: p.agentId, message: p.error, level: 'error' });
    };

    eventBus.on('agent:spawn', onSpawn);
    eventBus.on('agent:progress', onProgress);
    eventBus.on('agent:output', onOutput);
    eventBus.on('agent:complete', onComplete);
    eventBus.on('agent:error', onError);

    return () => {
      eventBus.off('agent:spawn', onSpawn);
      eventBus.off('agent:progress', onProgress);
      eventBus.off('agent:output', onOutput);
      eventBus.off('agent:complete', onComplete);
      eventBus.off('agent:error', onError);
    };
  }, [maxLines]);

  const visible = logs.slice(-maxLines);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.border}
      paddingX={1}
      height={maxLines + 2}
    >
      <Text bold color={colors.primary}>
        Log
      </Text>
      {visible.length === 0 ? (
        <Text dimColor>Waiting for events...</Text>
      ) : (
        visible.map((entry, i) => (
          <Text key={i} wrap="truncate">
            <Text dimColor>{formatTime(entry.timestamp)}</Text>
            <Text color={colors.accent}> [{entry.agentId}]</Text>
            <Text color={levelColors[entry.level] ?? 'white'}> {entry.message}</Text>
          </Text>
        ))
      )}
    </Box>
  );
}
