# CodeReview AI

A full-stack Micro SaaS platform for automated code reviews powered by AI. Users paste code, get structured feedback with severity-categorized issues and line-specific fixes, and collaborate with their team in real time.

Built with Next.js 16, Express 5, MongoDB, and Socket.IO. Supports Bring Your Own Key (BYOK) so teams can use their own OpenAI-compatible endpoints.

<p align="center">
  <img src="assets/demo.gif" width="700" alt="Demo GIF">
</p>

Deployed <a href="https://realtime-ai-code-review.vercel.app/"> here </a>

## What it does

You paste code. The AI analyzes it and returns structured issues categorized as critical, warning, or suggestion, each with the exact line and a fix. Your team can view shared review links and discuss feedback through live comments powered by WebSockets.

Users get a 5-day trial on the default AI provider. After that, they either upgrade to Pro or configure their own API key in settings. The BYOK model means zero vendor lock-in and zero cost for teams running local models.

## Architecture

The backend validates every request with Zod schemas, enforces rate limits (5 reviews per minute, 100 general requests per 15 minutes), and sanitizes code input before sending it to the AI. The AI is prompted to return structured JSON with severity, line numbers, and fixes. If parsing fails, it falls back to raw markdown rendering.

Real-time collaboration works through Socket.IO rooms. When someone opens a shared review link, they join a room tied to that review ID. Comments broadcast instantly to everyone viewing the same review.

Authentication uses JWT with bcrypt password hashing. Tokens expire after 7 days.

## Tech Stack

Frontend: Next.js 16 (App Router), React 19, Vanilla CSS design system, Socket.IO client, React Markdown

Backend: Node.js, Express 5, MongoDB with Mongoose, JWT auth, Zod validation, express-rate-limit, Socket.IO

Testing: Vitest, React Testing Library, 26 automated tests

DevOps: Docker multi-stage builds, docker-compose, GitHub Actions CI

## Project Structure

```
code-review-ai/
  client/             Next.js frontend
  server/
    routes/           auth.js, reviews.js, settings.js
    middleware/       auth.js, validate.js, errorHandler.js
    lib/              logger.js, validators.js
    models/           User.js, Review.js, Comment.js
    tests/            ai.test.js, validators.test.js
    ai.js             AI integration with structured response parsing
    server.js         Entry point
  .github/workflows/  CI pipeline
  Dockerfile          Multi-stage build
  docker-compose.yml  Full stack with MongoDB
```

## Getting Started

You need Node.js 20+, a MongoDB instance, and an API key from OpenRouter or any OpenAI-compatible provider.

### Backend

```bash
cd server
cp .env.example .env    # fill in your values
npm install
npm run dev
```

The server runs on port 3001.

### Frontend

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

The client runs on port 3000.

### Deployment environment variables

On Render, configure the backend service with:

```bash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secure_random_string
CLIENT_ORIGIN=https://realtime-ai-code-review.vercel.app
BASE_URL=https://openrouter.ai/api/v1/chat/completions
MODEL_API_KEY=your_provider_key
DEFAULT_MODEL=deepseek/deepseek-chat
```

On Vercel, configure the frontend project with:

```bash
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com
```

After changing `NEXT_PUBLIC_API_URL`, redeploy the Vercel app so the new public environment variable is included in the client bundle.

### Docker (full stack)

```bash
cp server/.env.example .env
docker compose up
```

This starts MongoDB, the API server, and the Next.js frontend together.

### Running Tests

```bash
cd server && npm test    # 21 tests (validators, AI parsing)
cd client && npm test    # 5 tests (component rendering, interactions)
```

## API

POST /auth/signup - Create account
POST /auth/login - Get JWT token
GET /auth/me - Current user

GET /reviews - List user reviews
POST /reviews - Submit code for review (rate limited)
GET /reviews/:id - Get specific review

GET /reviews/:id/comments - List comments
POST /reviews/:id/comments - Post comment (broadcasts via WebSocket)

GET /settings - Get BYOK configuration
PUT /settings - Update custom endpoint, key, model
POST /settings/fetch-models - Query custom endpoint for available models
POST /settings/upgrade - Simulate Pro upgrade

GET /health - Server health check

## Key Engineering Decisions

BYOK over managed-only: Lets users avoid rate limits and costs entirely by plugging in their own key. The server validates the endpoint format but otherwise proxies transparently.

Structured JSON over raw markdown: The AI is prompted to return JSON with severity/line/fix fields. This enables the frontend to render interactive issue cards with color-coded badges instead of dumping a wall of text.

Rate limiting at two levels: A general limiter prevents abuse across all endpoints. A stricter per-minute limit on the review endpoint prevents cost runaway on the AI provider.

Zod validation on every endpoint: Catches malformed requests before they hit the database or AI provider. Enforces a 50KB code limit to prevent abuse.

Socket.IO rooms over broadcast: Each review gets its own room. Comments only go to users viewing that specific review, not everyone connected.

## License

MIT
