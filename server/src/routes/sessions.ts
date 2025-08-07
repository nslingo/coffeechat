import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const scheduleSessionSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  learnerId: z.string().min(1, 'Learner ID is required'),
  postId: z.string().min(1, 'Post ID is required'),
  scheduledTime: z.string().datetime('Must be a valid datetime'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(180, 'Duration cannot exceed 3 hours'),
  location: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
});

const rateSessionSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  feedback: z.string().max(500, 'Feedback must be less than 500 characters').optional()
});

router.post('/', async (req, res, next) => {
  try {
    const validatedData = scheduleSessionSchema.parse(req.body);
    res.status(201).json({
      message: 'Session scheduled successfully',
      data: validatedData
    });
  } catch (error) {
    next(error);
  }
});

router.get('/my-sessions', async (req, res) => {
  const { status } = req.query;
  res.json({
    message: 'User sessions retrieved successfully',
    data: {
      sessions: [],
      status
    }
  });
});

router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  res.json({
    message: 'Session retrieved successfully',
    sessionId
  });
});

router.put('/:sessionId/status', async (req, res) => {
  const { sessionId } = req.params;
  const { status } = req.body;
  res.json({
    message: 'Session status updated successfully',
    sessionId,
    status
  });
});

router.post('/:sessionId/rate', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const validatedData = rateSessionSchema.parse(req.body);
    res.json({
      message: 'Session rated successfully',
      sessionId,
      data: validatedData
    });
  } catch (error) {
    next(error);
  }
});

export { router as sessionsRouter };