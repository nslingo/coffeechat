import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { Prisma } from '@prisma/client';

const router = Router();

const createReviewSchema = z.object({
  revieweeId: z.string().min(1, 'Reviewee ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  feedback: z.string().max(500, 'Feedback must be less than 500 characters').optional()
});

// Create a review
router.post('/', requireAuth, async (req: any, res, next) => {
  try {
    const validatedData = createReviewSchema.parse(req.body);
    
    // Can't review yourself
    if (validatedData.revieweeId === req.user.id) {
      return res.status(400).json({ error: 'Cannot review yourself' });
    }
    
    // Verify reviewee exists
    const reviewee = await prisma.user.findUnique({
      where: { id: validatedData.revieweeId }
    });
    
    if (!reviewee) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create the review (will fail if duplicate due to unique constraint)
    const review = await prisma.review.create({
      data: {
        reviewerId: req.user.id,
        revieweeId: validatedData.revieweeId,
        rating: validatedData.rating,
        feedback: validatedData.feedback ?? null,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    
    // Update the reviewee's average rating
    const stats = await prisma.review.aggregate({
      where: { revieweeId: validatedData.revieweeId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    
    await prisma.user.update({
      where: { id: validatedData.revieweeId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating || 0
      }
    });
    
    res.status(201).json({
      message: 'Review created successfully',
      data: review
    });
  } catch (error: unknown) {
    // Handle unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'You have already reviewed this user' });
      }
    }
    next(error);
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = (page - 1) * limit;
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get reviews for this user
    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });
    
    // Get total count
    const totalReviews = await prisma.review.count({
      where: { revieweeId: userId }
    });
    
    // Get rating distribution
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      where: { revieweeId: userId },
      _count: { rating: true }
    });
    
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: ratingStats.find(stat => stat.rating === rating)?._count.rating || 0
    }));
    
    res.json({
      message: 'Reviews retrieved successfully',
      data: {
        reviews,
        ratingDistribution,
        pagination: {
          page,
          limit,
          total: totalReviews,
          totalPages: Math.ceil(totalReviews / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update a review (only by the reviewer)
router.put('/:reviewId', requireAuth, async (req: any, res, next) => {
  try {
    const { reviewId } = req.params;
    const updateData = createReviewSchema.omit({ revieweeId: true }).parse(req.body);
    
    // Find the review and verify ownership
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { reviewerId: true, revieweeId: true }
    });
    
    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    if (existingReview.reviewerId !== req.user.id) {
      return res.status(403).json({ error: 'Can only update your own reviews' });
    }
    
    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: updateData.rating,
        feedback: updateData.feedback ?? null,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    
    // Recalculate the reviewee's average rating
    const stats = await prisma.review.aggregate({
      where: { revieweeId: existingReview.revieweeId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    
    await prisma.user.update({
      where: { id: existingReview.revieweeId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating || 0
      }
    });
    
    res.json({
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
});

export { router as reviewsRouter };