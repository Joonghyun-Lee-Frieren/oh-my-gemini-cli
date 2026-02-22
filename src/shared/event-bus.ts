import { EventEmitter } from 'node:events';
import type { Agent, Task, TaskResult } from '../agents/types.js';

export interface EventMap {
  'agent:spawn': { agent: Agent };
  'agent:progress': { agentId: string; progress: number; message?: string };
  'agent:output': { agentId: string; output: string };
  'agent:complete': { agentId: string; result: TaskResult };
  'agent:error': { agentId: string; error: string };
  'task:queued': { task: Task };
  'task:started': { task: Task; agentId: string };
  'task:done': { task: Task; result: TaskResult };
}

export type EventName = keyof EventMap;

class TypedEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  on<K extends EventName>(event: K, listener: (payload: EventMap[K]) => void): this {
    this.emitter.on(event, listener as (...args: unknown[]) => void);
    return this;
  }

  once<K extends EventName>(event: K, listener: (payload: EventMap[K]) => void): this {
    this.emitter.once(event, listener as (...args: unknown[]) => void);
    return this;
  }

  off<K extends EventName>(event: K, listener: (payload: EventMap[K]) => void): this {
    this.emitter.off(event, listener as (...args: unknown[]) => void);
    return this;
  }

  emit<K extends EventName>(event: K, payload: EventMap[K]): boolean {
    return this.emitter.emit(event, payload);
  }

  removeAllListeners(event?: EventName): this {
    this.emitter.removeAllListeners(event);
    return this;
  }
}

export const eventBus = new TypedEventBus();
