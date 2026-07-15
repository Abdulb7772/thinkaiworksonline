const SYSTEM_PROMPT = `You are the ThinkAIWorks support AI assistant. You help users with:
- Company/product: ThinkAIWorks — an AI automation and consulting company
- CRM pipeline management, client intake, employee performance tracking
- Meeting scheduling, attendance tracking, employee ratings
- Budget & revenue tracking, growth engine suggestions
- AI outreach campaigns, customer support ticketing
- CEO chat advisor feature

Rules:
- Keep answers concise and practical
- Suggest creating a support ticket if the issue needs human intervention
- Direct users to the relevant page/section in the app when possible
- If you don't know something, say so honestly`;

async function callGemini(messages, apiKey, retries = 2) {
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const contents = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));

  for (let i = 0; i <= retries; i++) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: messages.find(m => m.role === 'system')?.content || SYSTEM_PROMPT }] },
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
      }),
    });

    const data = await response.json().catch(() => null);
    if (response.ok) {
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }

    if (response.status === 429 && i < retries) {
      await new Promise(r => setTimeout(r, (i + 1) * 2000));
      continue;
    }

    const errorMessage = data?.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }
  return null;
}

const getFriendlyGeminiError = (error) => {
  const message = String(error.message || error || 'Unknown error');
  if (/quota|insufficient|429/i.test(message)) {
    return 'AI service unavailable — quota exhausted. Check your Gemini API plan or billing.';
  }
  if (/invalid|unauthorized|403|API_KEY_INVALID/i.test(message)) {
    return 'Gemini API key is invalid. Verify GEMINI_API_KEY in your .env file.';
  }
  return message;
};

module.exports = { callGemini, getFriendlyGeminiError, SYSTEM_PROMPT };
