import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth.js';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        bio?: string;
        image?: string;
        averageRating: number;
        totalReviews: number;
      };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any
    });

    if (!session?.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    req.user = session.user as any;
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}