/**
 * Ollama Service for Need A Help API
 * Handles connection to local Ollama runtime and Gemma open-weight inference.
 * Completely isolated from Backboard and hosted APIs.
 */

const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';
const DEFAULT_OLLAMA_MODEL = 'gemma3:270m';

function getOllamaUrl() {
  return process.env.OLLAMA_URL || DEFAULT_OLLAMA_URL;
}

function getOllamaModel() {
  return process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
}

const LOCAL_SYSTEM_PROMPT = `You are Need A Help, an intelligent and helpful AI assistant running locally on your device via Ollama (Gemma 3).
Be helpful, direct, concise, and clear. Use formatted markdown, lists, and code blocks whenever appropriate.`;

/**
 * Check if local Ollama server is reachable and configured model is installed
 * @returns {Promise<{ available: boolean, provider: string, model: string, local: boolean }>}
 */
async function getLocalStatus() {
  const model = getOllamaModel();
  const url = getOllamaUrl();

  try {
    const res = await fetch(`${url}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });

    if (!res.ok) {
      return {
        available: false,
        provider: 'ollama',
        model,
        local: true
      };
    }

    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models : [];
    const modelFound = models.some(m => {
      const name = m.name || '';
      const modelIdentifier = m.model || '';
      return name === model ||
        modelIdentifier === model ||
        name === `${model}:latest` ||
        name.split(':')[0] === model;
    });

    return {
      available: Boolean(modelFound),
      provider: 'ollama',
      model,
      local: true
    };
  } catch {
    return {
      available: false,
      provider: 'ollama',
      model,
      local: true
    };
  }
}

/**
 * Send messages to local Ollama server for chat generation
 * @param {Array<{ role: string, content: string }>} messages
 * @returns {Promise<Object>} Normalized FriendForge response
 */
async function sendLocalChat(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages must be a non-empty array.');
  }

  const model = getOllamaModel();
  const url = getOllamaUrl();

  // Bounded context: keep at most last 10 non-system messages to protect memory/CPU
  const nonSystemMessages = messages
    .filter(m => m.role !== 'system')
    .slice(-10)
    .map(m => ({
      role: m.role,
      content: m.content
    }));

  // Always prepend the authoritative LOCAL_SYSTEM_PROMPT
  const chatMessages = [
    { role: 'system', content: LOCAL_SYSTEM_PROMPT },
    ...nonSystemMessages
  ];

  try {
    const response = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        stream: false
      }),
      signal: AbortSignal.timeout(180000) // 180s to account for CPU inference on 8 GB laptop
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.message?.content ?? '';

    return {
      success: true,
      content,
      message: content,
      model: {
        name: data.model || model,
        provider: 'ollama',
        openWeight: true,
        local: true
      },
      provider: 'ollama',
      local: true
    };
  } catch (error) {
    console.error('[OllamaService] Local AI request failed');
    throw new Error(`Local AI is unavailable. Make sure Ollama is running and ${model} is installed.`);
  }
}

module.exports = {
  getLocalStatus,
  sendLocalChat,
  getOllamaUrl,
  getOllamaModel,
  LOCAL_SYSTEM_PROMPT,
  DEFAULT_OLLAMA_URL,
  DEFAULT_OLLAMA_MODEL
};