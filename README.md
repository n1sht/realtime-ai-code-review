# CodeReview AI

A professional Micro SaaS platform that provides automated code reviews using AI. Built with Next.js and Node.js, the platform offers real-time collaboration, user authentication, and a Bring Your Own Key (BYOK) architecture designed for engineering teams.

## Features

* Bring Your Own Key (BYOK): Users can configure custom OpenAI-compatible endpoints and API keys in their settings to bypass default quotas and use localized or preferred AI models.
* Micro SaaS Architecture: Includes full user authentication (JWT and bcrypt), a 5-day trial system, simulated Pro tier upgrades, and persistent review history dashboards.
* Real-time Collaboration: Powered by WebSockets, allowing teams to share review links and discuss AI feedback in live comment threads.
* Developer First UI: A custom dark mode design system built from scratch with pure CSS, featuring an IDE-style code editor and semantic structure.

## Tech Stack

**Frontend**
* Next.js 16 (App Router)
* React 19
* Vanilla CSS (Custom Design System, Inter and JetBrains Mono)
* Socket.io-client
* React Markdown

**Backend**
* Node.js with Express 5
* MongoDB with Mongoose
* JWT Authentication and bcryptjs
* Socket.IO
* OpenRouter and Custom OpenAI-compatible endpoints

## Project Structure

```text
code-review-ai/
  client/          Next.js frontend application
  server/          Express REST API and WebSocket server
```

## Getting Started

You need Node.js, a MongoDB database (local or Atlas), and an API key from OpenRouter or any OpenAI-compatible provider.

### 1. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
MONGODB_URI=your_mongodb_connection_string
BASE_URL=https://openrouter.ai/api/v1/chat/completions
MODEL_API_KEY=your_default_api_key
JWT_SECRET=your_secure_jwt_secret
```

Start the backend server:

```bash
npm start
```

The server runs on port 3001.

### 2. Set up the Frontend

```bash
cd client
npm install
npm run dev
```

The client runs on port 3000. Open http://localhost:3000 in your browser.

## API Documentation

**Authentication**
* `POST /auth/signup` Create a new account
* `POST /auth/login` Authenticate and receive JWT
* `GET  /auth/me` Get current authenticated user details

**Reviews**
* `GET  /reviews` List all reviews for authenticated user
* `POST /reviews` Submit code for review (Auth required, enforces Trial/Pro quota)
* `GET  /reviews/:id` Get a specific review (Public for sharing)

**Collaboration**
* `GET  /reviews/:id/comments` List all comments on a review
* `POST /reviews/:id/comments` Post a comment (Uses authenticated user name or Anonymous)

**User Settings (BYOK)**
* `GET  /settings` Get custom AI configuration
* `PUT  /settings` Update custom API endpoint, key, and model
* `POST /settings/fetch-models` Query the custom endpoint for available models
* `POST /settings/upgrade` Simulate upgrading to Pro tier

## Architecture Details

When code is submitted, the backend validates the user's quota. If the user has a custom API key configured, the request is routed through their chosen endpoint. Otherwise, it defaults to the server's configured provider. The AI is prompted to return structured feedback categorizing issues by severity (critical, warning, suggestion) along with line-specific fixes. 

Real-time collaboration is handled by Socket.IO rooms. When users view a shared review link, they join a specific room tied to the review ID, broadcasting comments instantly to all connected clients.
