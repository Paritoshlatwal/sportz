# Sportz

Sportz is a full-stack Next.js sports activity platform where users can post upcoming games, send chat requests to organizers, and chat after requests are accepted.

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Route Handlers for the backend API
- Native MongoDB driver
- NextAuth credentials authentication with JWT sessions

## Main Features

- User sign up and log in with hashed passwords
- Create sports activity posts
- Feed of upcoming posts sorted by date
- Search and filter by sport and location using dropdowns
- Chat request workflow with accept and reject actions
- Participant-only chat after acceptance
- Basic notifications for new requests, accepted requests, and new messages

## Folder Structure

```text
app/
  api/
    auth/
    chat-request/
    chats/
    messages/
    notifications/
    posts/
  chats/
  create/
  feed/
  login/
  my-posts/
  requests/
  signup/
components/
  auth/
  chats/
  notifications/
  posts/
  requests/
generated/
lib/
  data.ts
  mongodb.ts
types/
```

## Environment

Copy [`.env.example`](./.env.example) to `.env` and update the values.

```env
DATABASE_URL="mongodb://127.0.0.1:27017/sportz"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Make sure MongoDB is running locally

Example local connection in [`.env.example`](./.env.example):

```bash
mongodb://127.0.0.1:27017/sportz
```

3. Start the development server

```bash
npm run dev
```

## Pages

- `/feed`
- `/create`
- `/my-posts`
- `/requests`
- `/chats`
- `/chats/[chatId]`
- `/login`
- `/signup`

## API Routes

- `POST /api/posts`
- `GET /api/posts`
- `POST /api/chat-request`
- `PATCH /api/chat-request/:id`
- `GET /api/chats`
- `GET /api/messages/:chatId`
- `POST /api/messages`
- `GET /api/notifications`
