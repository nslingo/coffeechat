# CoffeeChat

A web platform designed to connect students within the Cornell community for peer-to-peer learning. Users can post requests to learn specific topics, offer to teach what they know, schedule one-on-one sessions, and rate their interactions.

## Features

- **User Authentication**: Cornell SSO login
- **Post Management**: Create "Teach Me" and "I Can Teach" posts with tags and availability
- **Search & Discovery**: Filter posts by type, subject, course codes, and availability
- **Scheduling**: Calendar-based session scheduling with confirmation flows
- **Messaging**: Direct messaging between matched users
- **Rating System**: Rate and provide feedback after sessions

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
