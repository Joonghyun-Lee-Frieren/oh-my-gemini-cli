import React from 'react';
import { Box, Text } from 'ink';
import { TaskStatus, type Task } from '../../agents/types.js';
import { taskStatusColors, taskStatusIcons, taskStatusLabels, retroColors } from '../theme.js';

interface TaskListProps {
  tasks: Task[];
}

const statusOrder: Record<TaskStatus, number> = {
  [TaskStatus.InProgress]: 0,
  [TaskStatus.Assigned]: 1,
  [TaskStatus.Queued]: 2,
  [TaskStatus.Done]: 3,
  [TaskStatus.Failed]: 4,
};

export function TaskList({ tasks }: TaskListProps) {
  const sorted = [...tasks].sort(
    (a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99),
  );
  const doneCount = tasks.filter((t) => t.status === TaskStatus.Done).length;

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={retroColors.gold} bold>═══ QUEST LOG ═══</Text>
      <Text color={retroColors.purple}>╔════════════════════════════════════════╗</Text>
      <Box flexDirection="column" paddingX={1}>
        <Text color={retroColors.gold}>
          ★ <Text color={retroColors.green}>{doneCount}</Text>
          <Text color={retroColors.slate}>/{tasks.length} quests cleared</Text>
        </Text>
        <Text color={retroColors.dim}>──────────────────────────────────────</Text>
        {sorted.length === 0 ? (
          <Text color={retroColors.dim} italic>No quests available...</Text>
        ) : (
          sorted.map((task) => (
            <Box key={task.id} flexDirection="row" gap={1}>
              <Text color={taskStatusColors[task.status]}>
                {taskStatusIcons[task.status]}
              </Text>
              <Text color={taskStatusColors[task.status]} bold>
                [{taskStatusLabels[task.status]}]
              </Text>
              <Box width={20}>
                <Text wrap="truncate" color={retroColors.white}>{task.description}</Text>
              </Box>
              <Text color={retroColors.dim}>→</Text>
              <Text color={retroColors.slate} wrap="truncate">
                {task.assignedTo || '—'}
              </Text>
            </Box>
          ))
        )}
      </Box>
      <Text color={retroColors.purple}>╚════════════════════════════════════════╝</Text>
    </Box>
  );
}
