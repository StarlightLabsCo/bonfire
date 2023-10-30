// https://openai.com/pricing

type CompletionModel = 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k' | 'gpt-4' | 'gpt-4-32k';

type CompletionModelCosts = {
  prompt: number;
  completion: number;
};

const COMPLETION_MODEL_COSTS: { [key: string]: CompletionModelCosts } = {
  'gpt-3.5-turbo': {
    prompt: 0.0015 / 1000,
    completion: 0.002 / 1000,
  },
  'gpt-3.5-turbo-16k': {
    prompt: 0.003 / 1000,
    completion: 0.004 / 1000,
  },
  'gpt-4': {
    prompt: 0.03 / 1000,
    completion: 0.06 / 1000,
  },
  'gpt-4-32k': {
    prompt: 0.06 / 1000,
    completion: 0.12 / 1000,
  },
};

function getCompletionCosts(model: CompletionModel): CompletionModelCosts | undefined {
  return COMPLETION_MODEL_COSTS[model];
}

export function getPromptCost(model: CompletionModel, promptTokens: number): number {
  const costs = getCompletionCosts(model);
  if (!costs) {
    throw new Error(`Unknown model ${model}`);
  }

  return costs.prompt * promptTokens;
}

export function getCompletionCost(model: CompletionModel, completionTokens: number): number {
  const costs = getCompletionCosts(model);
  if (!costs) {
    throw new Error(`Unknown model ${model}`);
  }

  return costs.completion * completionTokens;
}
