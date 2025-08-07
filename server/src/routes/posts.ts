import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  type: z.enum(['teach', 'learn'], { message: 'Type must be either "teach" or "learn"' }),
  category: z.enum(['career', 'coursework', 'hobbies'], { message: 'Category must be career, coursework, or hobbies' }),
  subject: z.string().min(1, 'Subject is required'),
  tags: z.array(z.string()).optional(),
  courseCode: z.string().optional(),
  availability: z.array(z.object({
    day: z.string(),
    timeSlots: z.array(z.string())
  })).optional()
});

const searchPostsSchema = z.object({
  type: z.enum(['teach', 'learn']).optional(),
  category: z.enum(['career', 'coursework', 'hobbies']).optional(),
  subject: z.string().optional(),
  courseCode: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10)
});

router.post('/', async (req, res, next) => {
  try {
    const validatedData = createPostSchema.parse(req.body);
    res.status(201).json({
      message: 'Post created successfully',
      data: validatedData
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const validatedQuery = searchPostsSchema.parse(req.query);
    res.json({
      message: 'Posts retrieved successfully',
      data: {
        posts: [],
        pagination: {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
          total: 0,
          totalPages: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:postId', async (req, res) => {
  const { postId } = req.params;
  res.json({
    message: 'Post retrieved successfully',
    postId
  });
});

router.put('/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const validatedData = createPostSchema.partial().parse(req.body);
    res.json({
      message: 'Post updated successfully',
      postId,
      data: validatedData
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:postId', async (req, res) => {
  const { postId } = req.params;
  res.json({
    message: 'Post deleted successfully',
    postId
  });
});

export { router as postsRouter };