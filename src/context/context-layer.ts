import { logger } from '../shared/logger.js';

export enum LayerType {
  SystemPrompt = 'system_prompt',
  Tools = 'tools',
  GeminiMd = 'gemini_md',
  Session = 'session',
  Conversation = 'conversation',
}

export interface ContextLayer {
  type: LayerType;
  content: string;
  frozen: boolean;
}

const LAYER_ORDER: LayerType[] = [
  LayerType.SystemPrompt,
  LayerType.Tools,
  LayerType.GeminiMd,
  LayerType.Session,
  LayerType.Conversation,
];

export class ContextLayerManager {
  private layers: Map<LayerType, ContextLayer> = new Map();
  private prefixFrozen = false;

  setLayer(type: LayerType, content: string): void {
    if (this.prefixFrozen && isPrefixLayer(type)) {
      logger.warn(`Cannot modify frozen prefix layer: ${type}`);
      return;
    }

    this.layers.set(type, {
      type,
      content,
      frozen: isPrefixLayer(type) && this.prefixFrozen,
    });
  }

  freezePrefix(): void {
    this.prefixFrozen = true;
    for (const type of getPrefixLayers()) {
      const layer = this.layers.get(type);
      if (layer) {
        layer.frozen = true;
      }
    }
    logger.debug('Context prefix frozen');
  }

  buildContextPrefix(): string {
    const parts: string[] = [];

    for (const type of getPrefixLayers()) {
      const layer = this.layers.get(type);
      if (layer?.content) {
        parts.push(layer.content);
      }
    }

    return parts.join('\n\n');
  }

  addSessionContext(content: string): void {
    const existing = this.layers.get(LayerType.Session);
    const current = existing?.content ?? '';
    const updated = current ? `${current}\n\n${content}` : content;

    this.layers.set(LayerType.Session, {
      type: LayerType.Session,
      content: updated,
      frozen: false,
    });
  }

  addConversationTurn(content: string): void {
    const existing = this.layers.get(LayerType.Conversation);
    const current = existing?.content ?? '';
    const updated = current ? `${current}\n\n${content}` : content;

    this.layers.set(LayerType.Conversation, {
      type: LayerType.Conversation,
      content: updated,
      frozen: false,
    });
  }

  buildFullContext(): string {
    const parts: string[] = [];

    for (const type of LAYER_ORDER) {
      const layer = this.layers.get(type);
      if (layer?.content) {
        parts.push(layer.content);
      }
    }

    return parts.join('\n\n');
  }

  getLayer(type: LayerType): string | undefined {
    return this.layers.get(type)?.content;
  }

  getContextSize(): number {
    let size = 0;
    for (const layer of this.layers.values()) {
      size += layer.content.length;
    }
    return size;
  }

  getPrefixSize(): number {
    let size = 0;
    for (const type of getPrefixLayers()) {
      const layer = this.layers.get(type);
      if (layer) size += layer.content.length;
    }
    return size;
  }

  clear(): void {
    this.layers.clear();
    this.prefixFrozen = false;
  }
}

function isPrefixLayer(type: LayerType): boolean {
  return type === LayerType.SystemPrompt
    || type === LayerType.Tools
    || type === LayerType.GeminiMd;
}

function getPrefixLayers(): LayerType[] {
  return [LayerType.SystemPrompt, LayerType.Tools, LayerType.GeminiMd];
}
