import { useState, useEffect } from 'react';
import { eventBus } from '../../shared/event-bus.js';
import { TaskStatus, type Task } from '../../agents/types.js';

export function useTaskStream(): Task[] {
  const [tasks, setTasks] = useState<Map<string, Task>>(new Map());

  useEffect(() => {
    const upsert = (task: Task) => {
      setTasks((prev) => {
        const next = new Map(prev);
        next.set(task.id, task);
        return next;
      });
    };

    const onQueued = ({ task }: { task: Task }) => {
      upsert({ ...task, status: TaskStatus.Queued });
    };

    const onStarted = ({ task, agentId }: { task: Task; agentId: string }) => {
      upsert({ ...task, status: TaskStatus.InProgress, assignedTo: agentId });
    };

    const onDone = ({ task }: { task: Task }) => {
      upsert({ ...task, status: TaskStatus.Done });
    };

    eventBus.on('task:queued', onQueued);
    eventBus.on('task:started', onStarted);
    eventBus.on('task:done', onDone);

    return () => {
      eventBus.off('task:queued', onQueued);
      eventBus.off('task:started', onStarted);
      eventBus.off('task:done', onDone);
    };
  }, []);

  return Array.from(tasks.values());
}
