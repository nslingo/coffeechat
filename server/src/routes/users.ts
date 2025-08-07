import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  profilePicture: z.string().url('Must be a valid URL').optional()
});

router.get('/profile', async (_req, res) => {
  res.json({ message: 'Get user profile endpoint' });
});

router.put('/profile', async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    res.json({ 
      message: 'Profile updated successfully',
      data: validatedData 
    });
  } catch (error) {
    next(error);
  }
});

router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  res.json({ 
    message: 'Get user profile by ID endpoint',
    userId 
  });
});

export { router as usersRouter };