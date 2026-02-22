import { createLogger } from '../shared/logger.js';
import { modelRegistry, type ModelDefinition } from './model-registry.js';

const log = createLogger('orchestrator:external-llm');

export interface LlmResponse {
  model: string;
  content: string;
  tokenUsage: {
    input: number;
    output: number;
  };
  latency: number;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
}

export interface ExternalLlmConfig {
  model: string;
  apiKey?: string;
  oauthToken?: OAuthToken;
  baseUrl?: string;
  maxRetries?: number;
}

interface TokenStore {
  tokens: Map<string, OAuthToken>;
}

const tokenStore: TokenStore = { tokens: new Map() };

function isTokenExpired(token: OAuthToken): boolean {
  return Date.now() >= token.expiresAt - 60_000;
}

export class ExternalLlmConnector {
  private config: ExternalLlmConfig;
  private modelDef: ModelDefinition | undefined;

  constructor(config: ExternalLlmConfig) {
    this.config = { maxRetries: 3, ...config };
    this.modelDef = modelRegistry.getModel(config.model);
    if (!this.modelDef) {
      log.warn(`Model ${config.model} not found in registry`);
    }
  }

  async send(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<LlmResponse> {
    const startTime = Date.now();

    if (this.modelDef?.connectionType === 'oauth') {
      await this.ensureValidToken();
    }

    const response = await this.makeRequest(prompt, options);
    return response;
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.config.oauthToken) {
      throw new Error(`OAuth token required for ${this.config.model}`);
    }

    if (isTokenExpired(this.config.oauthToken)) {
      if (!this.config.oauthToken.refreshToken) {
        throw new Error(`OAuth token expired and no refresh token available for ${this.config.model}`);
      }
      log.info(`Refreshing OAuth token for ${this.config.model}`);
      const refreshed = await this.refreshToken(this.config.oauthToken.refreshToken);
      this.config.oauthToken = refreshed;
      tokenStore.tokens.set(this.config.model, refreshed);
    }
  }

  private async refreshToken(refreshToken: string): Promise<OAuthToken> {
    return {
      accessToken: `refreshed_${Date.now()}`,
      refreshToken,
      expiresAt: Date.now() + 3600_000,
    };
  }

  private async makeRequest(
    prompt: string,
    options?: { temperature?: number; maxTokens?: number },
  ): Promise<LlmResponse> {
    const startTime = Date.now();
    const connectionType = this.modelDef?.connectionType ?? 'api_key';

    log.info(`Sending request to ${this.config.model} via ${connectionType}`);

    const headers = this.buildHeaders();
    const body = this.buildRequestBody(prompt, options);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < (this.config.maxRetries ?? 3); attempt++) {
      try {
        const response = await this.executeRequest(headers, body);
        return {
          model: this.config.model,
          content: response,
          tokenUsage: {
            input: Math.ceil(prompt.length / 4),
            output: Math.ceil(response.length / 4),
          },
          latency: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        log.warn(`Request attempt ${attempt + 1} failed: ${lastError.message}`);
        if (attempt < (this.config.maxRetries ?? 3) - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError ?? new Error('Request failed after all retries');
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (this.modelDef?.connectionType === 'api_key' && this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    } else if (this.modelDef?.connectionType === 'oauth' && this.config.oauthToken) {
      headers['Authorization'] = `Bearer ${this.config.oauthToken.accessToken}`;
    }

    return headers;
  }

  private buildRequestBody(
    prompt: string,
    options?: { temperature?: number; maxTokens?: number },
  ): Record<string, unknown> {
    const provider = this.modelDef?.provider ?? 'unknown';

    if (provider === 'anthropic') {
      return {
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens ?? this.modelDef?.maxOutputTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
      };
    }

    return {
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options?.maxTokens ?? this.modelDef?.maxOutputTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
    };
  }

  private async executeRequest(
    _headers: Record<string, string>,
    _body: Record<string, unknown>,
  ): Promise<string> {
    return `[${this.config.model}] Response placeholder - connect actual API endpoint`;
  }

  getModel(): ModelDefinition | undefined {
    return this.modelDef;
  }

  isConfigured(): boolean {
    if (this.modelDef?.connectionType === 'api_key') {
      return !!this.config.apiKey;
    }
    if (this.modelDef?.connectionType === 'oauth') {
      return !!this.config.oauthToken;
    }
    return false;
  }
}

export function storeOAuthToken(model: string, token: OAuthToken): void {
  tokenStore.tokens.set(model, token);
}

export function getStoredToken(model: string): OAuthToken | undefined {
  return tokenStore.tokens.get(model);
}

export function createExternalLlm(config: ExternalLlmConfig): ExternalLlmConnector {
  return new ExternalLlmConnector(config);
}
