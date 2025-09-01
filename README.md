# CoffeeChat

A web platform designed to connect students within the Cornell community for peer-to-peer learning. Users can post requests to learn specific topics, offer to teach what they know, message each other directly, and rate their interactions.

## Features

- **User Authentication**: Cornell email login
- **Post Management**: Create "Teach Me" and "I Can Teach" posts with tags and availability
- **Search & Discovery**: Filter posts by type, subject, course codes, and availability
- **Messaging**: Direct messaging between users to coordinate learning
- **Rating System**: Rate and provide feedback after interactions

## Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- React Router
- Axios / React Query

### Backend
- Node.js + Express.js
- PostgreSQL with Prisma ORM
- JWT authentication (BetterAuth)
- Zod for validation
- Nodemailer for email notifications

### Deployment
- Frontend: Vercel
- Backend + Database: Render
- CI/CD: GitHub Actions

## Project Structure

```
coffeechat/
├── client/          # Frontend React application
├── server/          # Backend Node.js API
```
