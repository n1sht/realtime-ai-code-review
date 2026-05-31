# CodeReview AI

A BYOK (Bring Your Own Key) code review platform built as a micro SaaS. Connect any OpenAI-compatible API, paste your code, and get structured feedback broken down by severity with line-specific fixes. Teams can share reviews and leave comments in real time.

Live demo: [realtime-ai-code-review.vercel.app](https://realtime-ai-code-review.vercel.app)

---

![demo](assets/demo.gif)

---

## Why I built this

Most AI code review tools either lock you into one model or require handing over your API key to a third party. I wanted something where the user stays in control: bring your own key, point it at any OpenAI-compatible endpoint (OpenRouter, local Ollama, your company's proxy, whatever), and the platform routes through it. No key stored somewhere shady, no vendor lock-in.

The real-time collaboration piece came from a frustration I had watching engineers screenshot AI feedback and paste it into Slack. This lets you share a review link and discuss it live, right there.

---

## Features

- **BYOK architecture** - users configure their own API endpoint and key in settings. The backend checks for a custom config per user and routes accordingly. Supports any OpenAI-compatible provider.
- **Structured AI feedback** - the AI is prompted to return JSON categorizing issues as critical, warning, or suggestion, each with a line number and a suggested fix. No unformatted walls of text.
- **Real-time collaboration** - Socket.IO rooms scoped to individual review IDs. When someone opens a shared review link they join the room, and comments broadcast instantly to everyone watching.
- **Auth + trial system** - JWT authentication with bcrypt, a 5-day trial with quota enforcement, and a simulated Pro tier upgrade flow.
- **Review history** - every review is persisted to MongoDB and accessible from a dashboard. Public sharing works without an account.

---

## Tech stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- Vanilla CSS with a custom dark mode design system
- Socket.IO client
- React Markdown

**Backend**
- Node.js + Express 5
- MongoDB (Mongoose)
- Socket.IO
- JWT + bcryptjs
- Zod for request validation
- Vitest + React Testing Library (26 tests)
- GitHub Actions CI/CD
- Docker (multi-stage build)

---

## Architecture

```
Client (Next.js)
    |
    |-- REST API calls --> Express server (port 3001)
    |                          |
    |                          |-- Validates request with Zod
    |                          |-- Checks user quota (trial vs pro)
    |                          |-- Routes to user's custom endpoint OR default
    |                          |-- Returns structured JSON feedback
    |
    |-- WebSocket --> Socket.IO server
                          |
                          |-- Scoped to review ID rooms
                          |-- Broadcasts comments to all connected clients
```

When code is submitted, the server first validates the request, then checks whether the user has a custom API key configured. If yes, the request goes through their endpoint. If not, it falls back to the server default. The AI response is parsed from JSON into severity categories before being stored and returned to the client.

Rate limiting runs at two tiers: 5 reviews per minute per user, and 100 requests per 15 minutes globally. Prompt injection attempts are sanitized on the input before it reaches the model.

---

## Running locally

You need Node.js, a MongoDB database (local or Atlas), and an API key from OpenRouter or any OpenAI-compatible provider.

**Backend**

```bash
cd server
npm install
```

Create a `.env` in the server directory:

```
MONGODB_URI=your_mongodb_connection_string
BASE_URL=https://openrouter.ai/api/v1/chat/completions
MODEL_API_KEY=your_default_api_key
JWT_SECRET=your_secure_jwt_secret
```

```bash
npm start
```

Server runs on port 3001.

**Frontend**

```bash
cd client
npm install
npm run dev
```

Client runs on port 3000.

**Or just use Docker**

```bash
docker-compose up
```

Multi-stage build. Final image is around 40% smaller than a naive single-stage build.

---

## API reference

**Auth**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/signup` | Create account |
| POST | `/auth/login` | Get JWT |
| GET | `/auth/me` | Current user |

**Reviews**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/reviews` | List user's reviews |
| POST | `/reviews` | Submit code (quota enforced) |
| GET | `/reviews/:id` | Get review (public) |

**Collaboration**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/reviews/:id/comments` | List comments |
| POST | `/reviews/:id/comments` | Post comment |

**Settings (BYOK)**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/settings` | Get AI config |
| PUT | `/settings` | Update endpoint, key, model |
| POST | `/settings/fetch-models` | Query available models from custom endpoint |
| POST | `/settings/upgrade` | Upgrade to Pro |

---

## Testing

```bash
cd server && npm test
```

26 tests covering auth flows, review submission, quota enforcement, rate limiting, and comment posting.

```bash
cd client && npm test
```

Component tests with React Testing Library.

CI runs all tests on every push via GitHub Actions before deploy.

---

## What I would do differently

A few things I would change with more time:

- Replace the simulated Pro upgrade with actual Stripe integration
- Add a proper refresh token flow instead of relying solely on JWT expiry
- Move the AI parsing to a queue (Redis + Bull) so long-running reviews don't block the request
- Add per-user WebSocket auth so anonymous users can view but not post comments
