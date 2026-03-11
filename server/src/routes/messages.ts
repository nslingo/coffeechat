import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message must be less than 1000 characters')
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = sendMessageSchema.parse(req.body);
    
    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: validatedData.recipientId }
    });
    
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    
    // Create the message
    const message = await prisma.message.create({
      data: {
        content: validatedData.content,
        senderId: req.user.id,
        recipientId: validatedData.recipientId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
});

router.get('/conversations', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    const allMessages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }]
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        recipient: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Keep only the latest message per partner (messages are already sorted desc)
    const seen = new Map<string, typeof allMessages[0]>();
    for (const msg of allMessages) {
      const partnerId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      if (!seen.has(partnerId)) seen.set(partnerId, msg);
    }

    const conversations = Array.from(seen.values()).map(msg => {
      const partner = msg.senderId === userId ? msg.recipient : msg.sender;
      return {
        partnerId: partner.id,
        partnerName: partner.name,
        partnerProfilePicture: partner.image,
        lastMessage: {
          content: msg.content,
          createdAt: msg.createdAt,
          senderId: msg.senderId
        }
      };
    });

    res.json({
      message: 'Conversations retrieved successfully',
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/conversations/:userId', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId as string
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;
    
    // Verify the other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, image: true }
    });
    
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, recipientId: userId },
          { senderId: userId, recipientId: req.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: limit
    });
    
    // Get total count for pagination
    const totalMessages = await prisma.message.count({
      where: {
        OR: [
          { senderId: req.user.id, recipientId: userId },
          { senderId: userId, recipientId: req.user.id }
        ]
      }
    });
    
    res.json({
      message: 'Conversation messages retrieved successfully',
      data: {
        messages,
        otherUser,
        pagination: {
          page,
          limit,
          total: totalMessages,
          totalPages: Math.ceil(totalMessages / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Remove the read receipt endpoint since it's not needed

export { router as messagesRouter };