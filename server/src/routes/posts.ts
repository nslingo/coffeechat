import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { PostType, PostCategory, Prisma } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Validation schemas
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  type: z.nativeEnum(PostType),
  category: z.nativeEnum(PostCategory),
  subject: z.string().min(1, 'Subject is required').max(100, 'Subject must be less than 100 characters'),
  courseCode: z.string().max(20, 'Course code must be less than 20 characters').optional(),
  tags: z.array(z.string()).default([]),
  availability: z.array(z.object({
    day: z.string().max(10),
    timeSlot: z.string().max(20)
  })).default([])
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  type: z.nativeEnum(PostType).optional(),
  category: z.nativeEnum(PostCategory).optional(),
  subject: z.string().min(1).max(100).optional(),
  courseCode: z.string().max(20).optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  availability: z.array(z.object({
    day: z.string().max(10),
    timeSlot: z.string().max(20)
  })).optional()
}).transform((data) => ({
  ...data,
  courseCode: data.courseCode === '' ? null : data.courseCode
}));

const searchPostsSchema = z.object({
  type: z.nativeEnum(PostType).optional(),
  category: z.nativeEnum(PostCategory).optional(),
  subject: z.string().optional(),
  courseCode: z.string().optional(),
  tags: z.string().optional(), // comma-separated tags
  search: z.string().optional(), // general search in title/description
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  authorId: z.string().optional() // for filtering by author
});


// GET /api/posts - Search and filter posts (public with optional auth)
router.get('/', requireAuth, async (req: any, res, next) => {
  try {
    const params = searchPostsSchema.parse(req.query);
    const { type, category, subject, courseCode, tags, search, page, limit, authorId } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PostWhereInput = {};

    if (type) where.type = type;
    if (category) where.category = category;
    if (subject) where.subject = { contains: subject, mode: 'insensitive' };
    if (courseCode) where.courseCode = { contains: courseCode, mode: 'insensitive' };
    if (authorId) where.authorId = authorId;
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = { hasSome: tagArray };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
              averageRating: true,
              totalReviews: true
            }
          },
          availability: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/posts/:id - Get single post (public)
router.get('/:id', requireAuth, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            averageRating: true,
            totalReviews: true,
            bio: true
          }
        },
        availability: true
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    return next(error);
  }
});

// POST /api/posts - Create new post (authenticated)
router.post('/', requireAuth, async (req: any, res, next) => {
  try {
    const validatedData = createPostSchema.parse(req.body);
    const { availability, ...postData } = validatedData;

    const postDataWithNulls = {
      ...postData,
      courseCode: postData.courseCode ?? null
    };

    const post = await prisma.post.create({
      data: {
        ...postDataWithNulls,
        author: {
          connect: { id: req.user.id }
        },
        availability: {
          create: availability
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            averageRating: true,
            totalReviews: true
          }
        },
        availability: true
      }
    });

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/posts/:id - Update post (authenticated, author only)
router.put('/:id', requireAuth, async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updatePostSchema.parse(req.body);
    const { availability, ...postData } = validatedData;

    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.authorId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    const updateData: any = { ...postData };

    // Handle availability updates if provided
    if (availability !== undefined) {
      updateData.availability = {
        deleteMany: {},
        create: availability
      };
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            averageRating: true,
            totalReviews: true
          }
        },
        availability: true
      }
    });

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/posts/:id - Hard delete post (authenticated, author only)
router.delete('/:id', requireAuth, async (req: any, res, next) => {
  try {
    const { id } = req.params;

    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingPost.authorId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    // Hard delete the post (cascading delete will handle availability)
    await prisma.post.delete({
      where: { id }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    return next(error);
  }
});

// GET /api/posts/my/posts - Get current user's posts (authenticated)
router.get('/my/posts', requireAuth, async (req: any, res, next) => {
  try {
    const params = searchPostsSchema.parse(req.query);
    const { type, category, subject, courseCode, tags, search, page, limit } = params;
    const skip = (page - 1) * limit;

    // Build where clause for user's posts
    const where: Prisma.PostWhereInput = {
      authorId: req.user.id
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (subject) where.subject = { contains: subject, mode: 'insensitive' };
    if (courseCode) where.courseCode = { contains: courseCode, mode: 'insensitive' };
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = { hasSome: tagArray };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
              averageRating: true,
              totalReviews: true
            }
          },
          availability: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return next(error);
  }
});

export { router as postsRouter };