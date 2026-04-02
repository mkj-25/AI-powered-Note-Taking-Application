import logger from '../utils/logger.js';

// ── Demo responses (when no OpenAI key) ─────────────────────────────────────
const DEMO_CHAT_RESPONSES = [
  (msg) => `**Notra AI** (demo mode)\n\nYou asked: *"${msg.substring(0, 80)}${msg.length > 80 ? '…' : ''}"*\n\nHere's a thoughtful response:\n\n• Consider breaking this topic into smaller sections\n• Look for existing notes that relate to this idea\n• Try the / command menu in the editor for structure blocks\n\n*Connect an OpenAI API key for real AI responses.*`,
  () => `**Key Insights** (demo mode)\n\n1. Your notes are building a knowledge base\n2. Use headings to organize ideas hierarchically\n3. AI summaries work best with detailed, structured notes\n\nWant me to help organize a specific topic?`,
  () => `**Notra AI** here! 👋 (demo mode)\n\nI can help you:\n- 📝 Summarize long notes\n- 🧠 Generate study flashcards\n- ✍️ Improve your writing\n- 🔍 Search across all your notes\n\nAdd an OpenAI key in your **.env** to unlock full AI power!`,
];

const DEMO_ACTIONS = {
  summarize: (text) => `**Summary**\n\n${text.split(/[.!?]+/).slice(0, 3).join('. ').trim()}.\n\n*Key ideas captured from your note.*`,
  explain: (text) => `**Explanation**\n\nThis content covers: ${text.substring(0, 120)}...\n\nBreaking it down into simpler terms reveals the core concepts.`,
  bullet_points: (text) => {
    const pts = text.split(/[.!?\n]+/).filter(s => s.trim().length > 10).slice(0, 6);
    return `**Key Points**\n\n${pts.map(p => `• ${p.trim()}`).join('\n')}`;
  },
  generate_questions: () =>
    `**Study Questions**\n\n1. What are the main concepts covered?\n2. How do these ideas connect?\n3. What are practical applications?\n4. What assumptions are made?\n5. How would you explain this to someone new to the topic?`,
  fix_grammar: (text) => text,
  improve: (text) => text,
  make_shorter: (text) => text.substring(0, Math.floor(text.length * 0.6)).trim() + '…',
  make_longer: (text) => `${text}\n\nFurthermore, expanding these ideas reveals additional nuances. The core concepts can be explored through real-world applications and examples that reinforce understanding.`,
  clean_ocr: (text) => text.replace(/\s{2,}/g, ' ').trim(),
  translate: (text) => text,
};

const ACTION_PROMPTS = {
  summarize: 'Summarize the following note content clearly and concisely using bullet points:',
  explain: 'Explain the following content in simple, accessible language:',
  bullet_points: 'Convert the following into a clean, readable bullet-point list:',
  generate_questions: 'Generate 5 high-quality study questions from the following content:',
  fix_grammar: 'Fix any grammar, spelling, and punctuation errors in the following text. Preserve the original meaning:',
  improve: 'Improve the clarity, flow, and readability of the following text:',
  make_shorter: 'Shorten the following text significantly while keeping all key ideas:',
  make_longer: 'Expand the following text with more detail and explanation:',
  clean_ocr: 'Clean up and intelligently format this OCR-extracted text, fixing obvious errors:',
  translate: 'Translate the following to English:',
};

// ── OpenAI client (lazy loaded) ───────────────────────────────────────────────
let openai = null;

const getOpenAI = async () => {
  if (openai) return openai;
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const { default: OpenAI } = await import('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai;
  } catch (e) {
    logger.warn('OpenAI SDK not available — running in demo mode');
    return null;
  }
};

// ── getAIResponse — multi-turn chat ──────────────────────────────────────────
/**
 * @param {string} message — latest user message
 * @param {string} systemPrompt — system context
 * @param {Array}  history — [{role, content}] previous turns (optional)
 */
export const getAIResponse = async (message, systemPrompt = '', history = []) => {
  const client = await getOpenAI();

  if (!client) {
    const fn = DEMO_CHAT_RESPONSES[Math.floor(Math.random() * DEMO_CHAT_RESPONSES.length)];
    return fn(message);
  }

  try {
    const messages = [
      { role: 'system', content: systemPrompt || 'You are Notra AI, a helpful, concise note-taking assistant.' },
      ...history.slice(-10).map(({ role, content }) => ({ role, content })),
      { role: 'user', content: message },
    ];

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages,
      max_tokens: 1200,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    logger.error(`OpenAI chat error: ${error.message}`);
    // Fall back to demo mode instead of crashing — keeps the UI functional
    const fn = DEMO_CHAT_RESPONSES[Math.floor(Math.random() * DEMO_CHAT_RESPONSES.length)];
    return fn(message) + '\n\n*Note: Using demo mode — OpenAI API unavailable.*';
  }
};

// ── getAIAction — single-turn text action ────────────────────────────────────
export const getAIAction = async (action, content) => {
  const client = await getOpenAI();

  if (!client) {
    const fn = DEMO_ACTIONS[action] || ((t) => t);
    return fn(content);
  }

  try {
    const prompt = ACTION_PROMPTS[action] || `Perform the following action (${action}) on the content:`;
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a concise writing assistant. Return only the processed result, no meta-commentary.' },
        { role: 'user', content: `${prompt}\n\n${content}` },
      ],
      max_tokens: 1500,
      temperature: 0.5,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    logger.error(`OpenAI action error (${action}): ${error.message}`);
    // Fall back to demo mode on any API error
    const fn = DEMO_ACTIONS[action] || ((t) => t);
    return fn(content);
  }
};
