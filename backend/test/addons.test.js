const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/index');
const addons = require('../src/services/studyAddons');
const openrouter = require('../src/services/openrouterService');

test('Addons: Flashcards and Concept Map validation and endpoint protection', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(r => server.once('listening', r));
  const appUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    // 1. Flashcards rejects empty topic
    const fcRes = await fetch(`${appUrl}/api/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' })
    });
    assert.equal(fcRes.status, 400);

    // 2. Concept Map rejects empty topic
    const cmRes = await fetch(`${appUrl}/api/concept-map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' })
    });
    assert.equal(cmRes.status, 400);

    // 3. OpenRouter is configured with key
    assert.ok(openrouter.isConfigured());

  } finally {
    await new Promise(r => server.close(r));
  }
});
