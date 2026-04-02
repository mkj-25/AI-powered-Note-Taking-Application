import logger from '../utils/logger.js';

/**
 * Transcribes audio using OpenAI Whisper (with graceful demo fallback).
 * @param {Express.Multer.File} file — multer file object (buffer in memory)
 */
export const transcribeAudio = async (file) => {
  if (!process.env.OPENAI_API_KEY) {
    logger.info('Voice transcription: demo mode (no OpenAI key)');
    return 'This is a demo transcription. Add an OpenAI API key to enable real voice-to-text transcription with Whisper.';
  }

  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Create a File object from buffer (required by OpenAI SDK v4+)
    const { Blob } = await import('buffer');
    const audioBlob = new Blob([file.buffer], { type: file.mimetype || 'audio/webm' });
    const audioFile = new File([audioBlob], file.originalname || 'audio.webm', {
      type: file.mimetype || 'audio/webm',
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    });

    return typeof transcription === 'string' ? transcription : transcription.text || '';
  } catch (error) {
    logger.error(`Voice transcription error: ${error.message}`);
    throw new Error('Voice transcription failed. Please try again.');
  }
};
