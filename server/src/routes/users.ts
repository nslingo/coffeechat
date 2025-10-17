import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { Prisma } from '@prisma/client'

const router = Router();

const updateProfileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('').transform(() => undefined))
});


router.get('/profile', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        image: true,
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

router.put('/profile', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const cleanedData = Object.fromEntries(
      Object.entries(validatedData).filter(([, value]) => value !== undefined)
    );

    const updateData: Prisma.UserUpdateInput = cleanedData
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        image: true,
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

router.get('/profile/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId as string
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        bio: true,
        image: true,
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