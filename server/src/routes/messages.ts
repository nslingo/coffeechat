import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message must be less than 1000 characters')
});

router.post('/', async (req, res, next) => {
  try {
    const validatedData = sendMessageSchema.parse(req.body);
    res.status(201).json({
      message: 'Message sent successfully',
      data: validatedData
    });
  } catch (error) {
    next(error);
  }
});

router.get('/conversations', async (_req, res) => {
  res.json({
    message: 'Conversations retrieved successfully',
    data: {
      conversations: []
    }
  });
});

router.get('/conversations/:userId', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  res.json({
    message: 'Conversation messages retrieved successfully',
    data: {
      messages: [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        totalPages: 0
      }
    }
  });
});

router.put('/:messageId/read', async (req, res) => {
  const { messageId } = req.params;
  res.json({
    message: 'Message marked as read',
    messageId
  });
});

export { router as messagesRouter };