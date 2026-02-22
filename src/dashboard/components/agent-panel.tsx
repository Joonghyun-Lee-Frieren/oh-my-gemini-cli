import React from 'react';
import { Box, Text } from 'ink';
import { AgentStatus, type Agent } from '../../agents/types.js';
import { statusColors, statusIcons, statusLabels, agentSprites, retroColors, progressChars } from '../theme.js';
import { Spinner } from './spinner.js';

interface AgentPanelProps {
  agent: Agent;
}

function modelTag(model: string): { label: string; color: string } {
  const displayLabel = `[${model}]`;
  if (model.includes('pro')) return { label: displayLabel, color: retroColors.gold };
  if (model.includes('flash')) return { label: displayLabel, color: retroColors.cyan };
  if (model.includes('ultra')) return { label: displayLabel, color: retroColors.pink };
  return { label: displayLabel, color: retroColors.slate };
}

function hpBar(percent: number, width: number = 8): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.floor((clamped / 100) * width);
  const hasHalf = (clamped / 100) * width - filled >= 0.5;
  const empty = width - filled - (hasHalf ? 1 : 0);
  return (
    progressChars.filled.repeat(filled) +
    (hasHalf ? progressChars.half : '') +
    progressChars.empty.repeat(empty)
  );
}

function hpColor(percent: number): string {
  if (percent > 60) return retroColors.green;
  if (percent > 30) return retroColors.gold;
  return retroColors.red;
}

export function AgentPanel({ agent }: AgentPanelProps) {
  const color = statusColors[agent.status];
  const icon = statusIcons[agent.status];
  const label = statusLabels[agent.status];
  const sprite = agentSprites[agent.type] ?? '?';
  const tag = modelTag(agent.config.model);
  const taskDesc = agent.currentTask?.description ?? '';

  return (
    <Box flexDirection="row" gap={1}>
      <Text>{sprite}</Text>
      <Text color={color}>{icon}</Text>
      <Box width={12}>
        <Text color={color} bold>{agent.type}</Text>
      </Box>
      <Box width={22}>
        <Text color={tag.color}>{tag.label}</Text>
      </Box>
      <Box width={5}>
        <Text color={color} bold>{label}</Text>
      </Box>
      {agent.status === AgentStatus.Running ? (
        <>
          <Spinner active type="pixel" color={color} />
          <Text>
            <Text dimColor>HP </Text>
            <Text color={hpColor(agent.progress)}>{hpBar(agent.progress)}</Text>
            <Text dimColor> {Math.round(agent.progress)}%</Text>
          </Text>
        </>
      ) : (
        <Box width={18} />
      )}
      {taskDesc && (
        <Box flexGrow={1}>
          <Text wrap="truncate" color={retroColors.dim}>» quest: {taskDesc}</Text>
        </Box>
      )}
    </Box>
  );
}
