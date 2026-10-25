const { randomUUID } = require('node:crypto');
const service = require('./backboardService');
const openrouter = require('./openrouterService');
const memory = require('./studyMemory');

function parseJSON(text) {
  try {
    return memory.parseJSON(text);
  } catch {
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
    throw new Error('Could not parse JSON response');
  }
}

function validateFlashcards(data) {
  if (!data || !Array.isArray(data.cards) || data.cards.length === 0) {
    throw new Error('Flashcards must contain an array of cards');
  }
  const cards = data.cards.slice(0, 10).map((c, idx) => {
    const front = typeof c.front === 'string' ? c.front.trim() : '';
    const back = typeof c.back === 'string' ? c.back.trim() : '';
    const tag = typeof c.tag === 'string' && c.tag.trim() ? c.tag.trim() : (data.topic || 'General');
    if (!front || !back) throw new Error('Card must have both front and back content');
    return {
      id: c.id || `card-${idx + 1}-${Date.now()}`,
      front: front.slice(0, 1000),
      back: back.slice(0, 2000),
      tag: tag.slice(0, 100)
    };
  });
  return {
    id: data.id || randomUUID(),
    topic: (data.topic || 'Study Topic').slice(0, 150),
    cards
  };
}

function validateConceptMap(data) {
  if (!data || !data.root || typeof data.root.label !== 'string') {
    throw new Error('Concept map must have a root node with label');
  }

  function cleanNode(node, depth = 0) {
    if (!node || typeof node.label !== 'string' || !node.label.trim()) {
      return null;
    }
    const cleaned = {
      id: node.id || `node-${depth}-${Math.random().toString(36).substring(2, 7)}`,
      label: node.label.trim().slice(0, 120),
      description: typeof node.description === 'string' ? node.description.trim().slice(0, 300) : ''
    };
    if (depth < 3 && Array.isArray(node.children)) {
      cleaned.children = node.children.map(child => cleanNode(child, depth + 1)).filter(Boolean);
    }
    return cleaned;
  }

  const root = cleanNode(data.root);
  if (!root) throw new Error('Root node is invalid');

  return {
    id: data.id || randomUUID(),
    topic: (data.topic || root.label).slice(0, 150),
    root
  };
}

async function generateFlashcards({ message, threadId, hasDocuments }) {
  const prompt = `You are Need A Help, an expert study coach.
Create exactly 5 high-yield, engaging flashcards for spaced repetition on the topic: "${message}".
${hasDocuments ? 'Ground the cards in the uploaded study notes if relevant.' : ''}

CRITICAL RULES:
- The front must test active recall (question, prompt, or challenge).
- The back must provide the concise explanation, formula, or breakdown.
- Include a specific concept tag for each card.
- Return ONLY valid JSON matching this exact schema:
{
  "topic": "${message.slice(0, 50)}",
  "cards": [
    {
      "id": "1",
      "front": "Question or prompt",
      "back": "Clear, informative answer",
      "tag": "Subject/Category"
    }
  ]
}`;

  let content = '';
  let modelInfo = { name: 'meta-llama/llama-3.1-8b-instruct' };
  let retrievedFiles = [];

  // Try Backboard RAG first if documents are present
  try {
    const res = await service.sendChatMessage({
      message: prompt,
      threadId,
      hasDocuments,
      skipMemoryExtraction: true,
      formatOnly: true,
      instructions: 'Return ONLY valid JSON matching the flashcards schema. No markdown wrapping.'
    });
    content = res.content;
    modelInfo = res.model || modelInfo;
    retrievedFiles = res.retrievedFiles || [];
  } catch (err) {
    // If Backboard fails or OpenRouter is configured directly, fallback to OpenRouter
    if (openrouter.isConfigured()) {
      const orRes = await openrouter.sendChat({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You format educational flashcards. Output ONLY valid JSON.'
      });
      content = orRes.content;
      modelInfo = { name: orRes.model, provider: 'openrouter' };
    } else {
      throw err;
    }
  }

  try {
    const parsed = parseJSON(content);
    const flashcards = validateFlashcards(parsed);
    return {
      success: true,
      flashcards,
      model: modelInfo,
      retrievedFiles
    };
  } catch (parseErr) {
    console.error('[Flashcards Parsing Error]:', parseErr.message, content);
    throw Object.assign(new Error('Flashcards generation failed'), {
      status: 502,
      safeMessage: 'Could not format flashcards. Please try a more specific topic.'
    });
  }
}

async function generateConceptMap({ message, threadId, hasDocuments }) {
  const prompt = `You are Need A Help, an expert knowledge visualizer.
Construct a clear concept hierarchy and mind map for: "${message}".
${hasDocuments ? 'Base the hierarchy on the uploaded study material.' : ''}

CRITICAL RULES:
- Root is the central topic.
- Root has 3-5 main branches (sub-topics/pillars).
- Each sub-topic has 2-4 key concepts or mechanisms.
- Provide a 1-sentence description for each node.
- Return ONLY valid JSON matching this exact schema:
{
  "topic": "${message.slice(0, 50)}",
  "root": {
    "label": "Central Concept",
    "description": "High-level definition",
    "children": [
      {
        "label": "Pillar 1",
        "description": "Short explanation",
        "children": [
          {
            "label": "Detail/Key Mechanism",
            "description": "How it works"
          }
        ]
      }
    ]
  }
}`;

  let content = '';
  let modelInfo = { name: 'meta-llama/llama-3.1-8b-instruct' };
  let retrievedFiles = [];

  try {
    const res = await service.sendChatMessage({
      message: prompt,
      threadId,
      hasDocuments,
      skipMemoryExtraction: true,
      formatOnly: true,
      instructions: 'Return ONLY valid JSON matching the concept map schema.'
    });
    content = res.content;
    modelInfo = res.model || modelInfo;
    retrievedFiles = res.retrievedFiles || [];
  } catch (err) {
    if (openrouter.isConfigured()) {
      const orRes = await openrouter.sendChat({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You build structured knowledge hierarchies. Output ONLY valid JSON.'
      });
      content = orRes.content;
      modelInfo = { name: orRes.model, provider: 'openrouter' };
    } else {
      throw err;
    }
  }

  try {
    const parsed = parseJSON(content);
    const conceptMap = validateConceptMap(parsed);
    return {
      success: true,
      conceptMap,
      model: modelInfo,
      retrievedFiles
    };
  } catch (parseErr) {
    console.error('[Concept Map Parsing Error]:', parseErr.message, content);
    throw Object.assign(new Error('Concept map generation failed'), {
      status: 502,
      safeMessage: 'Could not create concept mind map. Please try a clearer topic.'
    });
  }
}

module.exports = {
  generateFlashcards,
  generateConceptMap
};
