```
   _____  .___  _________            .___       __________            .__               
  /  _  \ |   | \_   ___ \  ____   __| _/____   \______   \ _______  _|__| ______  _  __
 /  /_\  \|   | /    \  \/ /  _ \ / __ |/ __ \   |       _// __ \  \/ /  |/ __ \ \/ \/ /
/    |    \   | \     \___(  <_> ) /_/ \  ___/   |    |   \  ___/\   /|  \  ___/\     / 
\____|__  /___|  \______  /\____/\____ |\___  >  |____|_  /\___  >\_/ |__|\___  >\/\_/  
        \/              \/            \/    \/          \/     \/             \/        
          __________              .__          ___________.__                           
          \______   \ ____ _____  |  |         \__    ___/|__| _____   ____             
           |       _// __ \\__  \ |  |    ______ |    |   |  |/     \_/ __ \            
           |    |   \  ___/ / __ \|  |__ /_____/ |    |   |  |  Y Y  \  ___/            
           |____|_  /\___  >____  /____/         |____|   |__|__|_|  /\___  >           
                  \/     \/     \/                                 \/     \/            
```

![demo](./assets/Ai-Code-Working.gif)

# code-review-ai

A full-stack app that takes your code, sends it to an AI model, and gives you a structured review back. Built with Next.js on the frontend and Node/Express on the backend, with MongoDB for storage and Socket.IO for real-time comment updates on reviews.

---

## What it does

- Paste your code, pick a language (Java, JavaScript, Python)
- AI reviews it and flags issues with severity levels (critical, warning, suggestion)
- Reviews are saved and browsable at /reviews
- Each review has a live comment section powered by WebSockets

---

## Stack

**Frontend**

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- NES.css (for the retro pixel UI)
- react-markdown (renders the AI output)
- socket.io-client

**Backend**

- Node.js + Express 5
- MongoDB + Mongoose
- Socket.IO
- DeepSeek (via OpenRouter API) for the actual AI review

---

## Project structure

```
code-review-ai/
  client/          Next.js frontend
  server/          Express backend
```

---

## Getting started

You need Node.js, MongoDB (local or Atlas), and an API key from OpenRouter.

**1. Clone the repo**

```bash
git clone https://github.com/yourname/code-review-ai.git
cd code-review-ai
```

**2. Set up the server**

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```
MONGODB_URI=your_mongodb_connection_string
BASE_URL=https://openrouter.ai/api/v1/chat/completions
MODEL_API_KEY=your_openrouter_api_key
```

Start the server:

```bash
npm start
```

It runs on port 3001.

**3. Set up the client**

```bash
cd client
npm install
npm run dev
```

It runs on port 3000. Open http://localhost:3000.

---

## API endpoints

```
GET  /reviews              - list all reviews
GET  /reviews/:id          - get a single review
POST /reviews              - create a new review (body: { code, language })

GET  /reviews/:id/comments - list comments on a review
POST /reviews/:id/comments - add a comment (body: { name, comment })
```

---

## How the AI review works

The backend sends your code to the DeepSeek model through OpenRouter. The prompt instructs it to look for errors first, then optimization opportunities, and format every issue like:

```
**Issue [n]**
- Severity: critical / warning / suggestion
- Issue: what's wrong
- Line: where
- Fix: code example
```

If nothing is wrong, it just says "No issues found."

---

## Real-time comments

When you open a review page, the client joins a Socket.IO room for that review ID. Any comment posted by anyone on that review shows up instantly without a page refresh.

---

## Notes

- The frontend uses the Press Start 2P font to keep the pixel aesthetic consistent with NES.css
- The `ai_prev.js` file in the server is an older version using the Gemini SDK, kept around for reference
- TLS certificate validation is disabled in the MongoDB connection (`tlsAllowInvalidCertificates: true`) - fine for local dev, change this for production
