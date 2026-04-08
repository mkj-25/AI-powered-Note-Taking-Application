import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import setupCollaborationSocket from './sockets/collaborationSocket.js';
import logger from './utils/logger.js';

// Load env from parent directory
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

setupCollaborationSocket(io);

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();
  
  httpServer.listen(PORT, () => {
    logger.info(`🚀 Notra Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Check which AI is active
    let aiMode = 'Demo';
    if (process.env.GEMINI_API_KEY) aiMode = 'Gemini';
    else if (process.env.OPENAI_API_KEY) aiMode = 'OpenAI';
    logger.info(`🤖 AI Mode: ${aiMode}`);
  });
};

startServer().catch((error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
