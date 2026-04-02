import Note from '../models/Note.js';
import logger from '../utils/logger.js';

// Simple cosine similarity for in-memory vector search (no Pinecone needed)
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Simple text-to-vector using TF approach (fallback when no OpenAI)
function simpleTextToVector(text, dim = 128) {
  const vector = new Array(dim).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const idx = (word.charCodeAt(i) * (i + 1)) % dim;
      vector[idx] += 1;
    }
  }
  // Normalize
  const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < dim; i++) vector[i] /= norm;
  }
  return vector;
}

export const generateEmbedding = async (text) => {
  if (!process.env.OPENAI_API_KEY) {
    return simpleTextToVector(text);
  }

  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000),
    });
    return response.data[0].embedding;
  } catch (error) {
    logger.warn(`Embedding generation failed, using fallback: ${error.message}`);
    return simpleTextToVector(text);
  }
};

export const updateNoteEmbedding = async (noteId) => {
  try {
    const note = await Note.findById(noteId);
    if (!note) return;

    const text = `${note.title} ${note.content.map(b => b.content).join(' ')}`;
    if (text.trim().length < 10) return;

    const embedding = await generateEmbedding(text);
    await Note.findByIdAndUpdate(noteId, { embedding });
    logger.info(`Embedding updated for note: ${noteId}`);
  } catch (error) {
    logger.error(`Embedding update failed: ${error.message}`);
  }
};

export const semanticSearch = async (query, userId, limit = 5) => {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const notes = await Note.find({ userId }).select('+embedding');

    const scored = notes
      .filter(n => n.embedding && n.embedding.length > 0)
      .map(note => ({
        ...note.toObject(),
        score: cosineSimilarity(queryEmbedding, note.embedding),
      }))
      .filter(n => n.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  } catch (error) {
    logger.error(`Semantic search failed: ${error.message}`);
    return [];
  }
};
