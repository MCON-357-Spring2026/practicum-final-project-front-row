/**
 * This file calls the OpenAI API for simple journaling helpers.
 * Set OPENAI_API_KEY in the environment (optional until you use these routes).
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

function ensureOpenAiConfigured() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('OpenAI is not configured');
    error.status = 503;
    throw error;
  }
}

/**
 * Sends a chat completion request and returns the assistant message text.
 */
async function chat(systemPrompt, userPrompt) {
  ensureOpenAiConfigured();

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = new Error('OpenAI request failed');
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

/**
 * Suggests a short journaling prompt for a life chapter topic.
 */
export async function suggestJournalPrompt(topic) {
  const prompt = topic?.trim() || 'my current life chapter';
  const text = await chat(
    'You help people journal about meaningful life chapters. Reply with one thoughtful prompt, under 40 words.',
    `Suggest a journal prompt about: ${prompt}`,
  );

  return { prompt: text };
}

/**
 * Lightly polishes journal text while keeping the author voice.
 */
export async function enhanceJournalText(text) {
  if (!text?.trim()) {
    const error = new Error('text is required');
    error.status = 400;
    throw error;
  }

  const enhanced = await chat(
    'You improve journal writing for clarity and warmth. Keep facts the same. Return only the revised entry.',
    text.trim(),
  );

  return { enhanced };
}
