import { config } from './lib/config.js';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import { usersRouter } from './routes/users.js';
import { postsRouter } from './routes/posts.js';
import { messagesRouter } from './routes/messages.js';
import { reviewsRouter } from './routes/reviews.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = config.server.port || 3001;

app.use(cors({
  origin: config.client.url || 'http://localhost:5173',
  credentials: true
}));

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/reviews', reviewsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});