# CoffeeChat

A web platform designed to connect students within the Cornell community for peer-to-peer learning. Users can post requests to learn specific topics, offer to teach what they know, message each other directly, and rate their interactions.

## Features

- **User authentication**: Cornell email login with required verification
- **Post management**: Create "Teach Me" and "I Can Teach" posts with tags and availability
- **Messaging**: Direct messaging between users to coordinate learning
- **Rating system**: Rate and provide feedback after interactions
- **Search and discovery**: Filter posts by type, subject, course codes, and availability

## Tech Stack

### Frontend
- TypeScript
- React
- Tailwind CSS
- React Router
- Axios + React Query

### Backend
- Node.js
- Express
- PostgreSQL with Prisma ORM
- BetterAuth Session Management
- Zod for validation
- Nodemailer for email notifications

## Project Structure

```
coffeechat/
├── client/          # Frontend React application
├── server/          # Backend Express API
```

## Installation

```bash
git clone https://github.com/nslingo/coffeechat.git
cd coffeechat
cd client && npm install
cd ../server && npm install
```

Create a `server/.env` file using `server/.env.example` as a reference.

## Usage

In one terminal:

```bash
cd server && npm run dev
```

In another terminal:

```bash
cd client && npm run dev
```
