import React from 'react';
import { Box, Text } from 'ink';
import { TaskStatus, type Task } from '../../agents/types.js';
import { taskStatusColors, taskStatusIcons, colors } from '../theme.js';

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

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={colors.border} paddingX={1}>
      <Box marginBottom={1}>
        <Text bold color={colors.primary}>
          Tasks
        </Text>
        <Text dimColor>
          {' '}
          ({tasks.filter((t) => t.status === TaskStatus.Done).length}/{tasks.length} done)
        </Text>
      </Box>
      {sorted.length === 0 ? (
        <Text dimColor>No tasks in pipeline</Text>
      ) : (
        sorted.map((task) => (
          <Box key={task.id} flexDirection="row" gap={1}>
            <Text color={taskStatusColors[task.status]}>{taskStatusIcons[task.status]}</Text>
            <Box width={20}>
              <Text wrap="truncate">{task.description}</Text>
            </Box>
            <Box width={12}>
              <Text dimColor wrap="truncate">
                {task.assignedTo || '—'}
              </Text>
            </Box>
            <Text color={taskStatusColors[task.status]}>{task.status}</Text>
          </Box>
        ))
      )}
    </Box>
  );
}
