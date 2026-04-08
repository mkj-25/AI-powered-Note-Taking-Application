import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import setupCollaborationSocket from './sockets/collaborationSocket.js';
import logger from './utils/logger.js';

import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

// ✅ Allowed origins (VERY IMPORTANT)
const allowedOrigins = [
  "http://localhost:5173",
  "https://code-clash-crfl.vercel.app/" // 🔁 REPLACE THIS
];

// ✅ Socket.io setup (FIXED CORS)
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
});

setupCollaborationSocket(io);

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    logger.info(`🚀 Notra Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);

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