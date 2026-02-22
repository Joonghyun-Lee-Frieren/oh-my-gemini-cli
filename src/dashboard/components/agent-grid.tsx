import React from 'react';
import { Box, Text } from 'ink';
import { AgentStatus, type Agent } from '../../agents/types.js';
import { AgentPanel } from './agent-panel.js';
import { colors } from '../theme.js';

interface AgentGridProps {
  agents: Agent[];
}

export function AgentGrid({ agents }: AgentGridProps) {
  const activeCount = agents.filter((a) => a.status === AgentStatus.Running).length;

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={colors.border} paddingX={1}>
      <Box marginBottom={1}>
        <Text bold color={colors.primary}>
          Agents
        </Text>
        <Text dimColor>
          {' '}
          ({activeCount} active / {agents.length} total)
        </Text>
      </Box>
      {agents.length === 0 ? (
        <Text dimColor>No agents spawned yet</Text>
      ) : (
        agents.map((agent) => <AgentPanel key={agent.id} agent={agent} />)
      )}
    </Box>
  );
}
