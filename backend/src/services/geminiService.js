/**
 * Google Gemini Service for Need A Help
 * Primary online LLM service with support for Gemini models.
 */

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const FALLBACK_GEMINI_MODELS = ['gemma-4-31b-it', 'gemini-flash-latest'];

function isConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim());
}

async function sendChat({ messages, systemPrompt, temperature = 0.7, maxTokens = 2048 }) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw Object.assign(new Error('GEMINI_API_KEY is not configured.'), {
      status: 503,
      safeMessage: 'Gemini API is not configured on the server.'
    });
  }

  // Format messages for Gemini API
  const formattedContents = [];
  for (const m of messages) {
    const role = m.role === 'assistant' ? 'model' : 'user';
    formattedContents.push({
      role: role,
      parts: [{ text: m.content }]
    });
  }

  const payload = {
    contents: formattedContents,
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: maxTokens
    }
  };

  if (systemPrompt) {
    payload.system_instruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  // Try primary model, then fallback Gemini / Gemma models
  const modelsToTry = [DEFAULT_GEMINI_MODEL, ...FALLBACK_GEMINI_MODELS];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Gemini Warning] Model ${model} returned ${response.status}:`, errorText);
        throw Object.assign(new Error(`Gemini API error (${model}): ${response.status}`), {
          status: response.status,
          rawError: errorText
        });
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const part = candidate?.content?.parts?.[0];
      const text = part?.text || '';

      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      return {
        content: text,
        model: model,
        provider: 'gemini',
        usage: data.usageMetadata ? {
          totalTokens: data.usageMetadata.totalTokenCount,
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount
        } : null
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed.');
}

module.exports = {
  isConfigured,
  sendChat,
  DEFAULT_GEMINI_MODEL
};
