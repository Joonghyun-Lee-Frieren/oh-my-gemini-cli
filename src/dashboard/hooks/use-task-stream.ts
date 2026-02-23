import { useState, useEffect } from 'react';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { eventBus } from '../../shared/event-bus.js';
import { getProjectRoot, STATE_DIR } from '../../shared/config.js';
import { TaskStatus, type Task } from '../../agents/types.js';

export function useTaskStream(refreshMs: number = 1500, refreshTick: number = 0): Task[] {
  const [tasks, setTasks] = useState<Map<string, Task>>(new Map());

  useEffect(() => {
    const statePath = resolve(getProjectRoot(), STATE_DIR, 'team-state.json');

    const upsert = (task: Task) => {
      setTasks((prev) => {
        const next = new Map(prev);
        next.set(task.id, task);
        return next;
      });
    };

    const loadSnapshot = () => {
      if (!existsSync(statePath)) return;
      try {
        const parsed = JSON.parse(readFileSync(statePath, 'utf-8')) as { tasks?: Task[] };
        if (!parsed.tasks) return;
        setTasks((prev) => {
          const next = new Map(prev);
          for (const task of parsed.tasks ?? []) {
            next.set(task.id, task);
          }
          return next;
        });
      } catch {
        // Ignore malformed snapshot, event stream still drives UI.
      }
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

    const onFailed = ({ task }: { task: Task }) => {
      upsert({ ...task, status: TaskStatus.Failed });
    };

    loadSnapshot();
    const pollId = setInterval(loadSnapshot, refreshMs);
    eventBus.on('task:queued', onQueued);
    eventBus.on('task:started', onStarted);
    eventBus.on('task:done', onDone);
    eventBus.on('task:failed', onFailed);

    return () => {
      clearInterval(pollId);
      eventBus.off('task:queued', onQueued);
      eventBus.off('task:started', onStarted);
      eventBus.off('task:done', onDone);
      eventBus.off('task:failed', onFailed);
    };
  }, [refreshMs, refreshTick]);

  return Array.from(tasks.values());
}
