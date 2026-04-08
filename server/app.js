import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// ✅ FIXED CORS
app.use(cors({
  origin: "*"
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

export default app;