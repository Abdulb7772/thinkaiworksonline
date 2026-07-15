const express = require('express');
const router = express.Router();
const { callGemini, getFriendlyGeminiError } = require('../utils/gemini');

const CEO_SYSTEM_PROMPT = `You are Muhammad Ali, the CEO and founder of EcomSkyline and ThinkAIWorks. You are a real human being, not an AI assistant. You are warm, sharp, and straight forward.

How you talk:
- Sweet: warm, caring, use "yaar", "bhai", "Shukriya", "Assalamu Alaikum"
- Straight forward: zero corporate bs, no sugarcoating, you tell it like it is
- Mix in Urdu naturally and keep the tone conversational
- Use short, human sentences. No robotic or polished assistant tone.
- When replying to a greeting, just greet back naturally and keep it short.

Your business brain:
- You know both companies inside out — MRR, leads, team, pipeline, churn, every number
- You think like a founder who built everything from scratch
- You're warm with your team but sharp with deals
- You see opportunities in problems
- You give advice like an older brother, not a consultant

Personality notes:
- Do not call the user "boss". Speak like a CEO talking directly, with authority and warmth.
- You may use "bhai" sparingly if it feels natural, but keep it light.
- Use metaphors: "business is like cricket..." type thing
- Get excited about good ideas: "Arrey wah! Now you're thinking."
- Be blunt about bad ones: "Nahi bhai, that won't work because..."
- If the user asks about project progress, guide them using the current dashboard context.
- If the user asks something unrelated to the app, politely refuse and redirect back to company or project topics.
- Keep answers concise and natural. No formal bullet lists.

Rules:
- NEVER sound like a chatbot, AI, or customer support
- NEVER say "I'm an AI" or "as an AI"
- NEVER list bullet points formally — talk like a person
- When the user greets you with something short like "hi" or "hello", respond like a real CEO would: a warm, natural greeting, then stop there unless they ask more
- Keep replies conversational, human, and company-owner sharp — not scripted, not robotic
- Do not repeat the opener from the modal; only answer the user’s current message naturally
- If the user asks anything unrelated to EcomSkyline, ThinkAIWorks, or this app, politely refuse in one short sentence and redirect back to business topics
- Keep it real, keep it human`;

const GREETING_RESPONSES = [
  'Wa Alaikum Assalam. Good to see you.',
  'Hello. Good to see you.',
  'Hey. I’m here.',
  'Assalamu Alaikum. Nice to see you.',
];

const REFUSAL_RESPONSES = [
  'Shukriya, but I can only help with EcomSkyline, ThinkAIWorks, and this app. Ask me about the project, team, leads, revenue, or progress.',
  'I can’t help with that one. Keep it to company or app topics and I’ll answer straight.',
  'Sorry, I only discuss the business and the app here. Ask me about the current work and I’ll guide you.',
];

const isGreetingMessage = (message) => {
  const normalized = String(message || '').trim().toLowerCase();
  if (!normalized) return false;
  return [
    /^hi[!.\s]*$/,
    /^hello[!.\s]*$/,
    /^hey[!.\s]*$/,
    /^yo[!.\s]*$/,
    /^assalamu alaikum[!.\s]*$/,
    /^assalam alaikum[!.\s]*$/,
    /^walikum assalam[!.\s]*$/,
    /^wa alaikum assalam[!.\s]*$/,
    /^salaam[!.\s]*$/,
  ].some((pattern) => pattern.test(normalized));
};

const isBusinessMessage = (message) => {
  const normalized = String(message || '').trim().toLowerCase();
  if (!normalized) return false;
  return [
    'thinkaiworks', 'ecomskyline', 'project', 'progress', 'status', 'update', 'ongoing', 'pipeline',
    'lead', 'client', 'crm', 'revenue', 'mrr', 'budget', 'campaign', 'marketing', 'employee',
    'attendance', 'meeting', 'ticket', 'support', 'churn', 'growth', 'dashboard', 'team', 'company',
    'app', 'task', 'priority', 'roadmap', 'delivery', 'launch', 'performance'
  ].some((keyword) => normalized.includes(keyword)) || /what should we|how are we|where are we|can you|should we|what is|what are|tell me about/i.test(message);
};

const buildContextBlock = (context) => {
  if (!context) return '';
  if (typeof context === 'string') return context;
  try {
    return JSON.stringify(context);
  } catch {
    return String(context);
  }
};

const buildEmployeeCountReply = (context) => {
  const teamSize = context?.employees?.length;
  if (typeof teamSize !== 'number') return 'I don’t know enough about that right now.';
  return `We have ${teamSize} employees right now.`;
};

const buildAttendanceReply = () => 'Attendance is tracked in the Attendance page. That’s where you can see who is present, who is out, and the latest hours.';

const buildRatingsReply = () => 'Employee ratings are in the Employee Performance page. That’s where the latest scores, trends, and status are shown.';

const buildProgressReply = (context) => {
  const revenue = context?.overviewMetrics?.es?.[0]?.val || '$—';
  const growth = context?.overviewMetrics?.es?.[0]?.delta || '—';
  const activeClients = context?.overviewMetrics?.es?.[1]?.val || '—';
  const openLeads = context?.crmMetrics?.[0]?.val || '—';
  const teamSize = context?.employees?.length || '—';
  const activeCampaigns = context?.campaigns?.filter((campaign) => campaign.status === 'active').length || 0;
  const urgentIssues = context?.tickets?.filter((ticket) => ticket.priority === 'High' && ticket.status === 'Open').length || 0;

  return `Current progress is moving. Revenue is ${revenue} ${growth !== '—' ? `(${growth})` : ''}. Active clients are ${activeClients}, open leads are ${openLeads}, team size is ${teamSize}, and active campaigns are ${activeCampaigns}. Urgent issues sitting open: ${urgentIssues}.`;
};

const buildUnknownReply = () => 'I don’t know enough about that right now. Ask me about revenue, leads, employees, attendance, ratings, or current project progress.';

router.post('/chat', async (req, res, next) => {
  try {
    const { message, messages, context } = req.body;
    if (!message && !messages) return res.status(400).json({ error: 'Message required' });

    if (message && isGreetingMessage(message)) {
      const reply = GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)];
      return res.json({ reply });
    }

    if (message && !isBusinessMessage(message)) {
      const reply = REFUSAL_RESPONSES[Math.floor(Math.random() * REFUSAL_RESPONSES.length)];
      return res.json({ reply });
    }

    if (message) {
      const normalized = String(message || '').trim().toLowerCase();
      if (/how many employees|employee count|number of employees|employees do you have|right now/i.test(normalized)) {
        return res.json({ reply: buildEmployeeCountReply(context) });
      }
      if (/attendance|present|absent|check in|check out|clock in|clock out/i.test(normalized)) {
        return res.json({ reply: buildAttendanceReply() });
      }
      if (/employee ratings|ratings|performance score|employee performance|score/i.test(normalized)) {
        return res.json({ reply: buildRatingsReply() });
      }
      if (!/progress|status|update|ongoing|current|revenue|mrr|budget|profit|lead|pipeline|client|crm|marketing|campaign|outreach|upwork|employee|team|attendance|performance|rating/i.test(normalized)) {
        return res.json({ reply: buildUnknownReply() });
      }
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/(^["']|["']$)/g, '');
    if (!apiKey) {
      return res.status(500).json({ reply: 'Gemini API key not configured. Set GEMINI_API_KEY in your .env file.' });
    }

    const chatMessages = messages
      ? [{ role: 'system', content: CEO_SYSTEM_PROMPT }, ...messages]
      : [{ role: 'system', content: CEO_SYSTEM_PROMPT }, { role: 'user', content: message }];

    const contextBlock = buildContextBlock(context);
    if (contextBlock) {
      chatMessages.splice(1, 0, {
        role: 'system',
        content: `Current dashboard context: ${contextBlock}`,
      });
    }

    const reply = await callGemini(chatMessages, apiKey);

    res.json({ reply: reply || 'AI service temporarily unavailable. Please try again.' });
  } catch (error) {
    console.error('CEO Gemini error:', error.message);
    res.json({ reply: `AI service error: ${getFriendlyGeminiError(error)}` });
  }
});

module.exports = router;
