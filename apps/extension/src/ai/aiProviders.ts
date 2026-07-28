import type { AiProvider } from '@semia/shared';

export type AiProviderConfig = {
  label: string;
  chatCompletionsUrl: string;
  model: string;
  hostPermission: string;
};

export const AI_PROVIDER_CONFIG: Record<AiProvider, AiProviderConfig> = {
  deepseek: {
    label: 'DeepSeek',
    chatCompletionsUrl: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    hostPermission: 'https://api.deepseek.com/*',
  },
  openai: {
    label: 'OpenAI',
    chatCompletionsUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    hostPermission: 'https://api.openai.com/*',
  },
};

export function resolveAiProvider(provider?: AiProvider): AiProvider {
  return provider === 'openai' ? 'openai' : 'deepseek';
}
