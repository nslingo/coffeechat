import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const updateProfileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  profilePicture: z.string().url('Must be a valid URL').optional().or(z.literal(''))
}).transform((data) => ({
  ...data,
  profilePicture: data.profilePicture === '' ? null : data.profilePicture
}));


router.get('/profile', requireAuth, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        profilePicture: true,
        averageRating: true,
        totalReviews: true,
        createdAt: true,
        emailVerified: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate additional stats (simplified for now)
    const stats = {
      activePosts: 0, // TODO: Count from posts table
      responseRate: 100 // TODO: Calculate from actual data
    };

    return res.json({
      user: {
        ...user,
        stats
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/profile', requireAuth, async (req: any, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body) as Prisma.UserUpdateInput;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        profilePicture: true,
        averageRating: true,
        totalReviews: true,
        createdAt: true,
        emailVerified: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/profile/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        bio: true,
        profilePicture: true,
        averageRating: true,
        totalReviews: true,
        createdAt: true
        // Note: Don't include email for public profiles
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

export { router as usersRouter };