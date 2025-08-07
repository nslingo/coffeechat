import { Router } from 'express';
import { z } from 'zod';
import { auth } from '../auth/auth.js';

const router = Router();

const signUpSchema = z.object({
  email: z.string().email('Must be a valid email address').refine(
    (email) => email.endsWith('@cornell.edu'),
    { message: 'Must be a valid Cornell email address (@cornell.edu)' }
  ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional()
});

const resendVerificationSchema = z.object({
  email: z.string().email('Must be a valid email address')
});

router.post('/signup', async (req, res, next) => {
  try {
    const validatedData = signUpSchema.parse(req.body);
    
    const response = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name || validatedData.email.split('@')[0] || 'Cornell Student'
      }
    });
    
    // For development, log the successful signup
    console.log('✅ User signed up:', response.user?.email);
    
    res.status(201).json({
      message: 'Account created! Please check your email (including junk folder) to verify your Cornell email address.',
      user: response.user,
      requiresVerification: !response.user?.emailVerified
    });
    return;
  } catch (error) {
    next(error);
  }
});

router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = resendVerificationSchema.parse(req.body);
    
    // BetterAuth doesn't have a direct resend method, so we'd need to implement this
    // For now, just acknowledge the request
    res.json({
      message: 'If an account with this email exists and is unverified, a new verification email will be sent.',
      email
    });
  } catch (error) {
    next(error);
  }
});

router.get('/session', async (req, res, next): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.replace('Bearer ', '');
    
    if (!sessionToken) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    // For development, just return a mock session for valid tokens
    // TODO: Implement proper session validation with BetterAuth
    res.json({
      user: {
        id: '1',
        email: 'test@cornell.edu',
        name: 'Test User',
        emailVerified: true
      },
      session: {
        id: 'session-1',
        token: sessionToken
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };