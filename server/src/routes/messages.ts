import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message must be less than 1000 characters')
});

router.post('/', requireAuth, async (req: any, res, next) => {
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

router.get('/conversations', requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.user.id;

    // Get all messages involving the current user and extract unique partner IDs
    const allMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      select: {
        senderId: true,
        recipientId: true
      }
    });

    // Extract unique partner IDs (ensuring we don't include the current user)
    const partnerIds = new Set<string>();
    allMessages.forEach(message => {
      const partnerId = message.senderId === userId ? message.recipientId : message.senderId;
      if (partnerId !== userId) {
        partnerIds.add(partnerId);
      }
    });

    // Get the latest message for each partner
    const conversations = await Promise.all(
      Array.from(partnerIds).map(async (partnerId) => {
        // Get the latest message between current user and this partner
        const latestMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, recipientId: partnerId },
              { senderId: partnerId, recipientId: userId }
            ]
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
                name: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        if (!latestMessage) return null;

        // The partner is always the user who is NOT the current user
        const partner = latestMessage.senderId === userId 
          ? latestMessage.recipient 
          : latestMessage.sender;

        return {
          partnerId: partner.id,  // Make sure we use partner.id, not partnerId variable
          partnerName: partner.name,
          partnerProfilePicture: partner.image,
          lastMessage: {
            content: latestMessage.content,
            createdAt: latestMessage.createdAt,
            senderId: latestMessage.senderId
          }
        };
      })
    );

    // Filter out null results and sort by latest message time
    const validConversations = conversations
      .filter(conv => conv !== null)
      .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());

    res.json({
      message: 'Conversations retrieved successfully',
      data: { conversations: validConversations }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/conversations/:userId', requireAuth, async (req: any, res, next) => {
  try {
    const { userId } = req.params;
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