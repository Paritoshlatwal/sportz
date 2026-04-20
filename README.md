# Sportz

Sportz is a full-stack sports activity platform built with Next.js. Players can create upcoming game posts, discover matches nearby, send chat requests to organizers, and move into one-to-one conversations after a request is accepted.

## Highlights

- Authentication flow with sign up and credentials-based login
- Create and browse sports activity posts
- Filter the feed by sport and location
- Chat request workflow with accept and reject actions
- Private chat experience for accepted requests only
- Lightweight in-app notifications for requests, accepts, and messages

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- MongoDB native driver
- NextAuth
- Zod for validation

## User Flow

1. A user signs up or logs in.
2. The user creates a sports post with a game, location, and time.
3. Other users browse the feed and send a chat request.
4. The organizer accepts or rejects the request.
5. Once accepted, both users can chat to finalize the game.

## Project Structure

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
lib/
  auth.ts
  data.ts
  mongodb.ts
  validations.ts
types/
```

## Environment Variables

Copy [`.env.example`](./.env.example) to `.env` and update the values for your machine.

```env
DATABASE_URL="mongodb://127.0.0.1:27017/sportz"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

`DATABASE_URL` points to MongoDB, `NEXTAUTH_URL` should match your app URL, and `NEXTAUTH_SECRET` should be replaced with a real random secret before running the app in production.

## Run Locally

```bash
npm install
npm run dev
```

Before starting the app, make sure MongoDB is running and your local `.env` file is present.

## Main Routes

- `/feed`
- `/create`
- `/my-posts`
- `/requests`
- `/chats`
- `/chats/[chatId]`
- `/login`
- `/signup`

## API Endpoints

- `GET /api/posts`
- `POST /api/posts`
- `POST /api/chat-request`
- `PATCH /api/chat-request/:id`
- `GET /api/chats`
- `GET /api/messages/:chatId`
- `POST /api/messages`
- `GET /api/notifications`
- `PATCH /api/notifications`

## Notes

- Local environment files are intentionally ignored by Git.
- `.env.example` contains only safe placeholder values.
- A screenshot is not included yet; it can be added later once you capture the final UI you want to showcase.
