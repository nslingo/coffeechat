import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    sendVerificationEmail: async (data: any) => {
      console.log('🔐 Email verification requested for:', data.user.email);
      console.log('🔗 Verification URL:', data.url);
      
      // TODO: Replace with actual email service
      console.log(`
📧 EMAIL WOULD BE SENT:
To: ${data.user.email}
Subject: Verify your CoffeeChat account
      
Hi ${data.user.name}!
      
Welcome to CoffeeChat! Click the link below to verify your Cornell email:
${data.url}
      
⚠️ Can't find this email?
1. Check your Junk/Spam folder
2. Add noreply@coffeechat.app to your contacts  
3. Search for "CoffeeChat" in all folders
      
Still having trouble? Reply to this email for help.
      
Best,
The CoffeeChat Team
      `);
    },
    sendResetPassword: async (data) => {
      console.log('🔐 Password reset requested for:', data.user.email);
      console.log('🔗 Reset URL:', data.url);
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