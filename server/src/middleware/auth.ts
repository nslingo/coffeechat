import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth.js';

type Session = typeof auth.$Infer.Session;

declare global {
  namespace Express {
    interface Request {
      user: Session['user'];
    }
  }
}

export interface AuthRequest extends Request {
  user: Session['user'];
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    
    const headers = new Headers()

    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }
    }

    const session = await auth.api.getSession({headers})

    if (!session?.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    req.user = session.user as Express.Request['user'];
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}