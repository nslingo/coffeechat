import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import { usersRouter } from './routes/users.js';
import { postsRouter } from './routes/posts.js';
import { sessionsRouter } from './routes/sessions.js';
import { messagesRouter } from './routes/messages.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/messages', messagesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'CoffeeChat API is running' });
});

app.get('/api', (_req, res) => {
  res.json({
    message: 'Welcome to CoffeeChat API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      sessions: '/api/sessions',
      messages: '/api/messages'
    }
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API documentation: http://localhost:${PORT}/api`);
});