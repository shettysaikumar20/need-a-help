/**
 * OpenRouter Service for Need A Help
 * Provides direct connection to OpenRouter LLM API.
 * Uses OPENROUTER_API_KEY from backend environment.
 */

const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct';
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

function isConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim());
}

async function sendChat({
  messages,
  systemPrompt,
  model = DEFAULT_MODEL,
  temperature = 0.3,
  maxTokens = 2048,
  responseFormat
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('OpenRouter API key is not configured.'), {
      status: 503,
      safeMessage: 'OpenRouter is not configured on the server.'
    });
  }

  const formattedMessages = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }

  for (const m of messages) {
    formattedMessages.push({ role: m.role || 'user', content: m.content });
  }

  const payload = {
    model: model,
    messages: formattedMessages,
    temperature: temperature,
    max_tokens: maxTokens
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
      'X-Title': 'Need A Help'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OpenRouter Error]:', response.status, errorText);
    throw Object.assign(new Error(`OpenRouter API error: ${response.status}`), {
      status: response.status >= 500 ? 502 : 400,
      safeMessage: 'AI generation could not complete via OpenRouter. Please try again.'
    });
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const content = choice?.message?.content || '';

  return {
    content,
    model: data.model || model,
    usage: data.usage || null,
    provider: 'openrouter'
  };
}

module.exports = {
  isConfigured,
  sendChat,
  DEFAULT_MODEL
};
