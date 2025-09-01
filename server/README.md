# CoffeeChat Server

Backend API server for the CoffeeChat platform built with Node.js, Express, and TypeScript.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Update environment variables as needed

3. **Development:**
   ```bash
   npm run dev        # Start development server with hot reload
   npm run build      # Build for production
   npm run start      # Start production server
   npm run lint       # Run ESLint
   npm run lint:fix   # Fix ESLint errors
   ```

## API Endpoints

- **Health Check:** `GET /api/health`
- **API Info:** `GET /api`
- **Authentication:** `/api/auth/*`
- **Users:** `/api/users/*`
- **Posts:** `/api/posts/*`
- **Messages:** `/api/messages/*`

## Features

- ✅ Express.js server with TypeScript
- ✅ Zod validation schemas
- ✅ CORS configuration
- ✅ Error handling middleware
- ✅ Cornell email validation for auth
- ✅ Structured API routes
- ⏳ Database integration (Prisma + PostgreSQL)
- ⏳ Full BetterAuth integration
- ⏳ Email notifications

## Development Status

The server provides mock responses for all endpoints. Database integration and full authentication will be implemented in the next phase.