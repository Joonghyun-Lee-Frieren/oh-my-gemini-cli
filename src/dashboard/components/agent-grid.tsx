import React from 'react';
import { Box, Text } from 'ink';
import { AgentStatus, type Agent } from '../../agents/types.js';
import { AgentPanel } from './agent-panel.js';
import { retroColors, type DashboardRenderMode } from '../theme.js';

interface AgentGridProps {
  agents: Agent[];
  renderMode: DashboardRenderMode;
}

export function AgentGrid({ agents, renderMode }: AgentGridProps) {
  const activeCount = agents.filter((a) => a.status === AgentStatus.Running).length;

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={retroColors.pink} bold>═══ PARTY MEMBERS ═══</Text>
      <Text color={retroColors.purple}>╔══════════════════════════════════════════════════════════╗</Text>
      <Box flexDirection="column" paddingX={1}>
        <Text color={retroColors.slate}>
          ♦ Active: <Text color={retroColors.green}>{activeCount}</Text>
          {' / '}
          Total: <Text color={retroColors.white}>{agents.length}</Text>
        </Text>
        <Text color={retroColors.dim}>──────────────────────────────────────────────────────</Text>
        {agents.length === 0 ? (
          <Text color={retroColors.dim} italic>No heroes have joined the party yet...</Text>
        ) : (
          agents.map((agent, i) => (
            <React.Fragment key={agent.id}>
              <AgentPanel agent={agent} renderMode={renderMode} />
              {i < agents.length - 1 && (
                <Text color={retroColors.dim}>──────</Text>
              )}
            </React.Fragment>
          ))
        )}
      </Box>
      <Text color={retroColors.purple}>╚══════════════════════════════════════════════════════════╝</Text>
    </Box>
  );
}
