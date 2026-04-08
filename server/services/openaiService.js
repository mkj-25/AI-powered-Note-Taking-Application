import logger from '../utils/logger.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Demo responses (when no API key) ────────────────────────────────────────
const DEMO_CHAT_RESPONSES = [
  (msg) => `**Notra AI** (demo mode)\n\nYou asked: *"${msg.substring(0, 80)}${msg.length > 80 ? '…' : ''}"*\n\nHere's a thoughtful response:\n\n• Consider breaking this topic into smaller sections\n• Look for existing notes that relate to this idea\n• Try the / command menu in the editor for structure blocks\n\n*Connect a Gemini API key for real AI responses.*`,
  () => `**Key Insights** (demo mode)\n\n1. Your notes are building a knowledge base\n2. Use headings to organize ideas hierarchically\n3. AI summaries work best with detailed, structured notes\n\nWant me to help organize a specific topic?`,
  () => `**Notra AI** here! 👋 (demo mode)\n\nI can help you:\n- 📝 Summarize long notes\n- 🧠 Generate study flashcards\n- ✍️ Improve your writing\n- 🔍 Search across all your notes\n\nAdd a Gemini API key in your **.env** to unlock full AI power!`,
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

// ── Gemini client ───────────────────────────────────────────────────────────
let genAI = null;

const getGemini = () => {
  if (genAI) return genAI;
  
  // Checking for GEMINI_API_KEY, falling back to OPENAI_API_KEY if the user just replaced the value without renaming
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
  } catch (e) {
    logger.warn('Gemini SDK initialization failed — running in demo mode');
    return null;
  }
};

// ── getAIResponse — multi-turn chat ──────────────────────────────────────────
export const getAIResponse = async (message, systemPrompt = '', history = []) => {
  const client = getGemini();

  if (!client) {
    const fn = DEMO_CHAT_RESPONSES[Math.floor(Math.random() * DEMO_CHAT_RESPONSES.length)];
    return fn(message);
  }

  try {
    const model = client.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt || 'You are Notra AI, a helpful, concise note-taking assistant. Return pure markdown.'
    });
    
    // Convert generic history to Gemini format (user -> user, assistant/system -> model)
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chatSession = model.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 1200,
        temperature: 0.7,
      }
    });

    const result = await chatSession.sendMessage(message);
    return result.response.text();
  } catch (error) {
    logger.error(`Gemini chat error: ${error.message}`);
    // Specific handling for rate limit errors
    if (error.status === 429 || error.message?.includes('429')) {
      return `**Notra AI** ⚠️\n\nYou've hit the Gemini free-tier rate limit. Please wait a moment and try again.\n\n*The API is working correctly — this is just a temporary quota pause.*`;
    }
    // Fall back to demo mode for other errors
    const fn = DEMO_CHAT_RESPONSES[Math.floor(Math.random() * DEMO_CHAT_RESPONSES.length)];
    return fn(message) + '\n\n*Note: Using demo mode — Gemini API error.*';
  }
};

// ── getAIAction — single-turn text action ────────────────────────────────────
export const getAIAction = async (action, content) => {
  const client = getGemini();

  if (!client) {
    const fn = DEMO_ACTIONS[action] || ((t) => t);
    return fn(content);
  }

  try {
    const model = client.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: 'You are a concise writing assistant. Return only the processed result, no meta-commentary.'
    });
    
    const prompt = ACTION_PROMPTS[action] || `Perform the following action (${action}) on the content:`;
    const fullPrompt = `${prompt}\n\n${content}`;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.5,
      }
    });

    return result.response.text();
  } catch (error) {
    logger.error(`Gemini action error (${action}): ${error.message}`);
    // Specific handling for rate limit errors
    if (error.status === 429 || error.message?.includes('429')) {
      return `⚠️ **Rate limit reached.** The Gemini free-tier quota is temporarily exhausted. Please wait a moment and try again.`;
    }
    // Fall back to demo mode on other API errors
    const fn = DEMO_ACTIONS[action] || ((t) => t);
    return fn(content);
  }
};
