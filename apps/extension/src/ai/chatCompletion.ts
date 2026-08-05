import { AI_PROVIDER_CONFIG, resolveAiProvider } from './aiProviders';
import { getSemiaSettings } from '../semiaSettings';

type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function completeChatMessages(
  messages: ChatCompletionMessage[],
): Promise<string> {
  const settings = await getSemiaSettings();
  const apiKey = settings.aiApiKey?.trim();
  if (!apiKey) {
    throw new Error(
      'API key not set. Open extension Options and save your DeepSeek (or OpenAI) key.',
    );
  }

  const provider = resolveAiProvider(settings.aiProvider);
  const providerConfig = AI_PROVIDER_CONFIG[provider];

  const response = await fetch(providerConfig.chatCompletionsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: providerConfig.model,
      temperature: 0.3,
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `${providerConfig.label} request failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`,
    );
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`${providerConfig.label} returned an empty response.`);
  }

  return content;
}

export async function completeChat(
  system: string,
  user: string,
): Promise<string> {
  return completeChatMessages([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]);
}
