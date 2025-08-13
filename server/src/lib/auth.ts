import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { emailService } from './email.js';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true for production
    autoSignIn: true,
    sendResetPassword: async ({user, url, token}, request) => {
      console.log('🔐 Password reset requested for:', user.email);
      await emailService.sendPasswordResetEmail(user, url);
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // Server-side Cornell email validation
      if (!user.email.toLowerCase().endsWith('@cornell.edu')) {
        throw new Error('Registration is limited to Cornell University email addresses (@cornell.edu)');
      }

      console.log('🔐 Email verification requested for:', user.email);
      await emailService.sendVerificationEmail(user, url);
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day
  },
  user: {
    additionalFields: {
      displayName: {
        type: 'string',
        required: false
      },
      bio: {
        type: 'string', 
        required: false
      },
      profilePicture: {
        type: 'string',
        required: false
      },
      rating: {
        type: 'number',
        required: false,
        defaultValue: 0
      },
      totalRatings: {
        type: 'number',
        required: false,
        defaultValue: 0
      }
    }
  },
  secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001'
});