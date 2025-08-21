import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailService } from './email.js';
import { prisma } from './prisma.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Set to true for production
    autoSignIn: false,
    sendResetPassword: async ({user, url, token}, request) => {
      try {
        console.log('🔐 Password reset requested for:', user.email);
        await emailService.sendPasswordResetEmail(user, url);
      } catch (error) {
        console.error('❌ Password reset email failed:', error);
        throw error;
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        // Server-side Cornell email validation
        if (!user.email.toLowerCase().endsWith('@cornell.edu')) {
          throw new Error('Registration is limited to Cornell University email addresses (@cornell.edu)');
        }

        console.log('🔐 Email verification requested for:', user.email);
        await emailService.sendVerificationEmail(user, url);
      } catch (error) {
        console.error('❌ Verification email failed:', error);
        throw error;
      }
    },
    async afterEmailVerification(user, request) {
      console.log(`✅ Email successfully verified for: ${user.email}`);
      // Could add additional logic here like welcome emails, analytics, etc.
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
      averageRating: {
        type: 'number',
        required: false,
        defaultValue: 0
      },
      totalReviews: {
        type: 'number',
        required: false,
        defaultValue: 0
      }
    }
  },
  secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  trustedOrigins: [
    process.env.CLIENT_URL || 'http://localhost:5173'
  ]
});