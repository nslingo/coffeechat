import { betterAuth } from 'better-auth';
import { prisma } from './prisma.js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailService } from './email.js';
import { config } from './config.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    sendResetPassword: async ({user, url, token: _token}, _request) => {
      try {
        await emailService.sendPasswordResetEmail(user, url);
      } catch (error) {
        throw new Error("Unable to send password reset email");
      }
    }
  },
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({user, url, token: _token}, _request) => {
      try {
        if (!user.email.toLowerCase().endsWith('@cornell.edu')) {
          throw new Error('Registration is limited to Cornell University email addresses (@cornell.edu)');
        }
        await emailService.sendVerificationEmail(user, url);
      } catch (error) {
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
        required: false,
        input: true // Users can set their own bio
      },
      averageRating: {
        type: 'number',
        required: false,
        defaultValue: 0,
        input: false // Calculated field, not user input
      },
      totalReviews: {
        type: 'number',
        required: false,
        defaultValue: 0,
        input: false // Calculated field, not user input
      }
    }
  },
  secret: config.betterAuth.secret,
  baseURL: config.betterAuth.url,
  trustedOrigins: [
    config.client.url
  ]
});