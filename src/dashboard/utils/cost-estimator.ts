export interface ModelPricingPer1M {
  input: number;
  output: number;
}

const MODEL_PRICING_PER_1M: Record<string, ModelPricingPer1M> = {
  'gemini-2.5-pro': { input: 1.25, output: 10.0 },
  'gemini-2.5-flash': { input: 0.35, output: 0.7 },
  'gemini-2.5-flash-lite': { input: 0.1, output: 0.4 },
  default: { input: 0.5, output: 2.5 },
};

function normalizeModel(model?: string): string {
  return (model ?? '').toLowerCase().trim();
}

export function getModelPricing(model?: string): ModelPricingPer1M {
  const normalized = normalizeModel(model);
  if (normalized.includes('flash-lite')) return MODEL_PRICING_PER_1M['gemini-2.5-flash-lite'];
  if (normalized.includes('flash')) return MODEL_PRICING_PER_1M['gemini-2.5-flash'];
  if (normalized.includes('pro')) return MODEL_PRICING_PER_1M['gemini-2.5-pro'];
  return MODEL_PRICING_PER_1M.default;
}

export function estimateModelCostUsd(params: {
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
}): number {
  const pricing = getModelPricing(params.model);
  const inputTokens = Math.max(0, params.inputTokens ?? 0);
  const outputTokens = Math.max(0, params.outputTokens ?? 0);
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return Number((inputCost + outputCost).toFixed(6));
}
