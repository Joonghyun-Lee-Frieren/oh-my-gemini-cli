import { useState, useEffect } from 'react';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { eventBus } from '../../shared/event-bus.js';
import { getProjectRoot, STATE_DIR } from '../../shared/config.js';
import { AgentStatus, type Agent } from '../../agents/types.js';

export function useAgentStatus(refreshMs: number = 1500, refreshTick: number = 0): Agent[] {
  const [agents, setAgents] = useState<Map<string, Agent>>(new Map());

  useEffect(() => {
    const statePath = resolve(getProjectRoot(), STATE_DIR, 'team-state.json');

    const upsert = (id: string, updater: (prev: Agent | undefined) => Agent) => {
      setAgents((prev) => {
        const next = new Map(prev);
        next.set(id, updater(prev.get(id)));
        return next;
      });
    };

    const loadSnapshot = () => {
      if (!existsSync(statePath)) return;
      try {
        const parsed = JSON.parse(readFileSync(statePath, 'utf-8')) as { agents?: Agent[] };
        if (!parsed.agents) return;
        setAgents((prev) => {
          const next = new Map(prev);
          for (const agent of parsed.agents ?? []) {
            next.set(agent.id, agent);
          }
          return next;
        });
      } catch {
        // Ignore malformed snapshot, event stream still drives UI.
      }
    };

    const onSpawn = ({ agent }: { agent: Agent }) => {
      upsert(agent.id, () => ({ ...agent, status: AgentStatus.Running }));
    };

    const onProgress = (payload: { agentId: string; progress: number; message?: string }) => {
      upsert(payload.agentId, (prev) => {
        if (!prev) return { id: payload.agentId, type: '' as never, status: AgentStatus.Running, config: {} as never, progress: payload.progress };
        return { ...prev, progress: payload.progress, status: AgentStatus.Running };
      });
    };

    const onComplete = (payload: { agentId: string }) => {
      upsert(payload.agentId, (prev) => {
        if (!prev) return { id: payload.agentId, type: '' as never, status: AgentStatus.Completed, config: {} as never, progress: 100 };
        return { ...prev, status: AgentStatus.Completed, progress: 100 };
      });
    };

    const onError = (payload: { agentId: string }) => {
      upsert(payload.agentId, (prev) => {
        if (!prev) return { id: payload.agentId, type: '' as never, status: AgentStatus.Failed, config: {} as never, progress: 0 };
        return { ...prev, status: AgentStatus.Failed };
      });
    };

    loadSnapshot();
    const pollId = setInterval(loadSnapshot, refreshMs);
    eventBus.on('agent:spawn', onSpawn);
    eventBus.on('agent:progress', onProgress);
    eventBus.on('agent:complete', onComplete);
    eventBus.on('agent:error', onError);

    return () => {
      clearInterval(pollId);
      eventBus.off('agent:spawn', onSpawn);
      eventBus.off('agent:progress', onProgress);
      eventBus.off('agent:complete', onComplete);
      eventBus.off('agent:error', onError);
    };
  }, [refreshMs, refreshTick]);

  return Array.from(agents.values());
}
