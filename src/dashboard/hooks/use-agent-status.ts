import { useState, useEffect } from 'react';
import { eventBus } from '../../shared/event-bus.js';
import { AgentStatus, type Agent } from '../../agents/types.js';

export function useAgentStatus(): Agent[] {
  const [agents, setAgents] = useState<Map<string, Agent>>(new Map());

  useEffect(() => {
    const upsert = (id: string, updater: (prev: Agent | undefined) => Agent) => {
      setAgents((prev) => {
        const next = new Map(prev);
        next.set(id, updater(prev.get(id)));
        return next;
      });
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

    eventBus.on('agent:spawn', onSpawn);
    eventBus.on('agent:progress', onProgress);
    eventBus.on('agent:complete', onComplete);
    eventBus.on('agent:error', onError);

    return () => {
      eventBus.off('agent:spawn', onSpawn);
      eventBus.off('agent:progress', onProgress);
      eventBus.off('agent:complete', onComplete);
      eventBus.off('agent:error', onError);
    };
  }, []);

  return Array.from(agents.values());
}
