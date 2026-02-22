import React from 'react';
import { Box, Text } from 'ink';
import { AgentStatus, type Agent } from '../../agents/types.js';
import { statusColors, statusIcons } from '../theme.js';
import { Spinner } from './spinner.js';
import { ProgressBar } from './progress-bar.js';

interface AgentPanelProps {
  agent: Agent;
}

function modelTag(model: string): string {
  if (model.includes('pro')) return '[Pro]';
  if (model.includes('flash')) return '[Flash]';
  if (model.includes('ultra')) return '[Ultra]';
  return `[${model}]`;
}

export function AgentPanel({ agent }: AgentPanelProps) {
  const color = statusColors[agent.status];
  const icon = statusIcons[agent.status];
  const taskDesc = agent.currentTask?.description ?? '';

  return (
    <Box flexDirection="row" gap={1}>
      <Text color={color}>{icon}</Text>
      <Box width={14}>
        <Text color={color} bold>
          {agent.type}
        </Text>
      </Box>
      <Box width={8}>
        <Text dimColor>{modelTag(agent.config.model)}</Text>
      </Box>
      {agent.status === AgentStatus.Running ? (
        <>
          <Spinner active type="braille" color={color} />
          <ProgressBar percent={agent.progress} width={8} color={color} />
        </>
      ) : (
        <Box width={14}>
          <Text color={color}>{agent.status}</Text>
        </Box>
      )}
      <Box flexGrow={1}>
        <Text wrap="truncate" dimColor>
          {taskDesc}
        </Text>
      </Box>
    </Box>
  );
}
