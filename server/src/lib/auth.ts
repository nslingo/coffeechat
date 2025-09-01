import { betterAuth } from 'better-auth';
import { prisma } from './prisma.js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailService } from './email.js';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET must be set")
}

if (!process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL must be set")
}

if (!process.env.CLIENT_URL) {
  throw new Error("CLIENT_URL must be set")
}

interface VerificationData {
  user: {
    email: string;
    name: string;
  };
  url: string;
  token: string;
}

const isCornellEmail = (email: string): boolean => email.toLowerCase().endsWith('@cornell.edu');

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    sendResetPassword: async ({user, url, token: _token}: VerificationData, _request?: Request): Promise<void> => {
      try {
        await emailService.sendPasswordResetEmail(user, url);
      } catch (error: unknown) {
        throw new Error("Unable to send password reset email");
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({user, url, token: _token}: VerificationData, _request?: Request): Promise<void> => {
      try {
        if (!isCornellEmail(user.email)) {
          throw new Error('Registration is limited to Cornell University email addresses (@cornell.edu)');
        }
        await emailService.sendVerificationEmail(user, url);
      } catch (error: unknown) {
        throw new Error("Unable to send verification email");
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day
  },
  user: {
    additionalFields: {
      bio: {
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
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    process.env.CLIENT_URL
  ]
});