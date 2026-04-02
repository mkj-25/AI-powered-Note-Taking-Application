import logger from '../utils/logger.js';

export const extractTextFromImage = async (file) => {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    
    const { data: { text } } = await worker.recognize(file.buffer);
    await worker.terminate();
    
    logger.info(`OCR extracted ${text.length} characters`);
    return text;
  } catch (error) {
    logger.error(`OCR error: ${error.message}`);
    throw new Error('Failed to extract text from image.');
  }
};
