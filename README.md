# Deposely

AI-powered deposition preparation platform for attorneys. Upload case documents, ask questions with RAG-powered chat, generate deposition outlines, and get real-time contradiction flags during live depositions.

**Stack:** Next.js 14 (App Router) · Neon PostgreSQL + pgvector · AWS S3 · OpenAI · Recall.ai · CopilotKit + AG-UI · Render · Vercel

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Next.js App (Vercel)                                │
│  ├── CopilotKit provider + runtime (/api/copilotkit) │
│  ├── Case Hub, Ask Docs, Prep Outline, Live Depo     │
│  └── API routes (cases, documents, depositions)       │
└──────────────┬──────────────────────┬────────────────┘
               │                      │
               ▼                      ▼
     ┌─────────────────┐    ┌──────────────────────┐
     │  Neon PostgreSQL │    │  recall-service       │
     │  + pgvector      │    │  (Render / ngrok)     │
     └─────────────────┘    │  ├── /webhook/recall   │
               ▲             │  ├── /webhook/realtime │
               │             │  └── /stream/:id (SSE) │
     ┌─────────┴───────┐    └──────────┬───────────┘
     │  AWS S3          │               │
     │  (doc storage)   │    ┌──────────▼───────────┐
     └─────────────────┘    │  Recall.ai            │
                             │  (Zoom bot + transcr.) │
                             └──────────────────────┘
```

---

## Prerequisites

- Node.js 20+
- npm
- ngrok (for local webhook development)
- Accounts: Neon, OpenAI, AWS (S3), Recall.ai, Render (optional for deploy)

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url> deposely
cd deposely
npm install

cd recall-service
npm install
cd ..
```

### 2. Environment variables

Copy and fill in `.env.local` (Next.js app):

```bash
# Neon PostgreSQL
DATABASE_URL=postgresql://user:pass@ep-xxx.us-west-2.aws.neon.tech/deposely?sslmode=require

# OpenAI
OPENAI_API_KEY=sk-proj-...

# AWS S3 — create a NEW bucket for this project
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-west-2
S3_BUCKET_NAME=deposely-vectors

# Recall.ai — from https://us-west-2.recall.ai/dashboard/developers/api-keys
# Store just the key value — prefix "Token " in code for Authorization header
RECALL_AI_API_KEY=cc7ca...

# Recall.ai webhook signing secret — from dashboard after creating endpoint (see below)
# Format: whsec_xxxxx (Svix format)
# Also used as the ?token= param for real-time transcription endpoints
RECALL_WEBHOOK_SECRET=whsec_...

# Render webhook service URL (or ngrok URL for local dev)
RENDER_WEBHOOK_URL=https://deposely-something.ngrok-free.app
```

Copy and fill in `recall-service/.env`:

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.us-west-2.aws.neon.tech/deposely?sslmode=require
RECALL_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-proj-...
```

### 3. Run database migration

```bash
npx tsx src/db/migrate.ts
```

This creates all tables (cases, documents, document_chunks, depositions, contradiction_flags) and enables the pgvector extension.

### 4. Start development servers

```bash
# Terminal 1 — Next.js app
npm run dev

# Terminal 2 — Recall webhook service
cd recall-service
npm run dev

# Terminal 3 — ngrok tunnel for webhooks
ngrok http --domain=deposely-something.ngrok-free.app 3001
```

---

## Recall.ai Webhook Setup

Recall.ai has **two separate webhook systems**. This is critical — they are NOT the same.

### Webhook 1 — Bot status events (configured in Recall dashboard)

These handle `bot.status_change` and `bot.done` events. Configured once in the Recall.ai dashboard.

1. Go to https://us-west-2.recall.ai/dashboard/webhooks
2. Click **"Add Endpoint"**
3. Fill in:
   - **Endpoint URL**: `https://deposely-something.ngrok-free.app/webhook/recall`
   - **Description**: `Deposely — bot status changes`
4. Under **"Subscribe to events"**, check only: `bot.status_change`
5. Click **Create**
6. Click into the newly created endpoint
7. Find the **signing secret** in the bottom-right corner — it looks like `whsec_xxxxxxxxxxxxxx`
8. Copy that value into both `.env.local` and `recall-service/.env` as `RECALL_WEBHOOK_SECRET`

**Verification**: Uses the `svix` npm package. The recall-service handles this automatically. The raw request body is required for signature verification — this is why the route uses `express.raw()`.

### Webhook 2 — Real-time transcription (configured per-bot in code)

Live transcript events are NOT configured in the dashboard. They are set per-bot when creating a bot via the Recall.ai API.

When the Next.js app creates a deposition and sends a bot to Zoom, the API call includes:

```json
{
  "recording_config": {
    "real_time_endpoints": [{
      "type": "webhook",
      "config": {
        "url": "https://deposely-something.ngrok-free.app/webhook/recall/realtime?token=<RECALL_WEBHOOK_SECRET>",
        "events": ["bot.transcription"]
      }
    }]
  }
}
```

**Verification**: The secret is passed as a query parameter `?token=`. The recall-service compares `req.query.token` against `RECALL_WEBHOOK_SECRET`.

**Important**: The event name is `bot.transcription` (not `transcript.words_added`).

### Transcription latency

Set `transcription_options.mode` to `prioritize_low_latency` in the Create Bot call. Without this, transcripts are delayed 3–10 minutes. With it, you get transcripts within seconds.

---

## ngrok Setup (Local Development)

ngrok exposes your local recall-service to the internet so Recall.ai can send webhooks to it.

1. Install ngrok: `brew install ngrok`
2. Add your authtoken: `ngrok config add-authtoken YOUR_TOKEN`
3. Get a static domain from https://dashboard.ngrok.com/domains — click **"New Domain"**
4. Run: `ngrok http --domain=deposely-something.ngrok-free.app 3001`

You can run multiple ngrok tunnels simultaneously for different projects (e.g. SHC on one domain, Deposely on another). Each uses a different static domain and port.

The ngrok URL goes into:
- `.env.local` → `RENDER_WEBHOOK_URL`
- Recall.ai dashboard → Webhook endpoint URL

---

## Deploy

### Next.js app → Vercel

```bash
vercel
```

Set all `.env.local` variables in Vercel dashboard → Settings → Environment Variables.

### Recall service → Render

The repo includes a `render.yaml` Blueprint. To deploy:

1. Push to GitHub
2. In Render dashboard → **New** → **Blueprint**
3. Connect the repo — Render reads `render.yaml` and creates the service
4. Set environment variables in Render dashboard:
   - `DATABASE_URL`
   - `RECALL_WEBHOOK_SECRET`
   - `OPENAI_API_KEY`

After deploy, update:
- `.env.local` → `RENDER_WEBHOOK_URL=https://deposely-recall-service.onrender.com`
- Recall.ai dashboard → Update webhook endpoint URL to the Render URL

---

## Project Structure

```
deposely/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── copilotkit/route.ts    # CopilotKit runtime endpoint
│   │   ├── layout.tsx                  # Root layout + CopilotKit provider
│   │   └── page.tsx
│   ├── db/
│   │   ├── schema.ts                  # Drizzle ORM schema (5 tables)
│   │   ├── migrations/0001_init.sql   # Raw SQL migration
│   │   ├── migrate.ts                 # Migration runner
│   │   └── index.ts                   # Table exports
│   └── lib/
│       ├── db.ts                      # Neon + Drizzle client
│       ├── s3.ts                      # S3 client
│       └── openai.ts                  # OpenAI client
├── recall-service/
│   ├── src/
│   │   ├── index.ts                   # Express server (port 3001)
│   │   ├── webhook.ts                 # Status + realtime webhook handlers
│   │   └── clients.ts                 # SSE client management
│   └── Dockerfile
├── render.yaml                        # Render Blueprint for recall-service
├── drizzle.config.ts
└── .env.local
```
