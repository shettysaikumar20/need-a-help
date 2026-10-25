/**
 * AI Router for Need A Help
 * Manages resilient model cascade:
 * 1. Google Gemini (Primary Online Provider - gemini-2.5-flash)
 * 2. Backboard (Secondary Fallback - Llama 3.1 8B + Document RAG)
 * 3. OpenRouter (Tertiary Fallback - High-speed Meta Llama 3.1)
 */

const gemini = require('./geminiService');
const backboard = require('./backboardService');
const openrouter = require('./openrouterService');

const SYSTEM_PROMPT = `You are Need A Help, a friendly, intelligent AI assistant designed to help students learn, solve problems, write code, and study effectively.
Be direct, helpful, clear, and encouraging. Use formatted markdown, lists, code blocks, or math formulas when helpful.`;

async function dispatchOnlineChat({
  message,
  messages = [],
  threadId = null,
  hasDocuments = false,
  mode = 'chat'
}) {
  const conversationMessages = [];
  if (Array.isArray(messages) && messages.length > 0) {
    for (const m of messages) {
      if (m && m.content) {
        conversationMessages.push({
          role: m.role || (m.sender === 'student' ? 'user' : 'assistant'),
          content: m.content
        });
      }
    }
  } else if (message) {
    conversationMessages.push({ role: 'user', content: message });
  }

  // Tier 1: Google Gemini (Primary)
  if (gemini.isConfigured()) {
    try {
      const res = await gemini.sendChat({
        messages: conversationMessages,
        systemPrompt: SYSTEM_PROMPT
      });
      return {
        success: true,
        content: res.content,
        model: { name: res.model, provider: 'gemini', tier: 'primary' },
        threadId: threadId || null,
        retrievedFiles: []
      };
    } catch (geminiError) {
      console.warn('[AI Router] Gemini failed, automatically shifting to Backboard:', geminiError.message);
    }
  }

  // Tier 2: Backboard API (Secondary Fallback)
  try {
    const res = await backboard.sendChatMessage({
      message,
      threadId,
      hasDocuments,
      mode
    });
    return {
      ...res,
      model: { ...res.model, tier: 'secondary-fallback (Backboard)' }
    };
  } catch (backboardError) {
    console.warn('[AI Router] Backboard failed, automatically shifting to OpenRouter:', backboardError.message);
  }

  // Tier 3: OpenRouter API (Tertiary Fallback)
  if (openrouter.isConfigured()) {
    try {
      const res = await openrouter.sendChat({
        messages: conversationMessages,
        systemPrompt: SYSTEM_PROMPT
      });
      return {
        success: true,
        content: res.content,
        model: { name: res.model, provider: 'openrouter', tier: 'tertiary-fallback (OpenRouter)' },
        threadId: threadId || null,
        retrievedFiles: []
      };
    } catch (openrouterError) {
      console.error('[AI Router] All providers failed. OpenRouter error:', openrouterError.message);
      throw Object.assign(new Error('All AI providers are currently unavailable.'), {
        status: 503,
        safeMessage: 'Unable to connect to AI providers. Please try again shortly.'
      });
    }
  }

  throw Object.assign(new Error('No AI provider available.'), {
    status: 503,
    safeMessage: 'Study service is temporarily unavailable.'
  });
}

module.exports = {
  dispatchOnlineChat
};
