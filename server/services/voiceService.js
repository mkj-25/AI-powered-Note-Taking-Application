import logger from '../utils/logger.js';
import { Readable } from 'stream';

/**
 * Transcribes audio using OpenAI Whisper.
 * Graceful demo fallback if no API key is set.
 * @param {Express.Multer.File} file — multer file object (buffer in memory)
 */
export const transcribeAudio = async (file) => {
  if (!process.env.OPENAI_API_KEY) {
    logger.info('Voice transcription: demo mode (no OpenAI key)');
    return 'Demo transcription: voice-to-text works with a valid OpenAI API key (Whisper model).';
  }

  try {
    const openaiModule = await import('openai');
    const OpenAI = openaiModule.default;
    const toFile = openaiModule.toFile;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Build an audio file object compatible with OpenAI SDK v4
    let audioFile;
    if (typeof toFile === 'function') {
      // OpenAI SDK ≥ 4.x provides toFile()
      audioFile = await toFile(
        file.buffer,
        file.originalname || 'audio.webm',
        { type: file.mimetype || 'audio/webm' }
      );
    } else {
      // Fallback: use a readable stream with filename + content-type attached
      const stream = Readable.from(file.buffer);
      stream.name = file.originalname || 'audio.webm';
      stream.type = file.mimetype || 'audio/webm';
      audioFile = stream;
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    });

    return typeof transcription === 'string' ? transcription : transcription.text || '';
  } catch (error) {
    logger.error(`Voice transcription error: ${error.message}`);
    throw new Error(`Voice transcription failed: ${error.message}`);
  }
};
