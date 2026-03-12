# Deposely — Manual Test Plan

Walk through each phase to verify the app is working end-to-end.

---

## Prerequisites

Before testing, make sure:
- [ ] `.env.local` is filled in with all required values
- [ ] `recall-service/.env` is filled in
- [ ] Database migration has been run: `npx tsx src/db/migrate.ts`
- [ ] S3 bucket exists: `aws s3 ls s3://deposely-vectors` (create with `aws s3 mb s3://deposely-vectors --region us-west-2` if needed)

---

## Phase 0 — Dev Server

**Start the app:**
```bash
npm run dev
```

- [ ] Server starts on http://localhost:3000 without errors
- [ ] Opening http://localhost:3000 in a browser loads the app (sidebar + main area)

---

## Phase 1 — Database & Schema

```bash
curl -s http://localhost:3000/api/cases | python3 -m json.tool
```

- [ ] Returns `[]` (empty array, no errors) — confirms DB connection and tables exist

---

## Phase 2 — Case Hub & Document Ingestion

### Create a case

```bash
curl -s -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d '{"title":"Smith v. Acme Corp","description":"Product liability, 2024"}' | python3 -m json.tool
```

- [ ] Returns JSON with `id`, `title`, `description`, `createdAt`
- [ ] Save the `id` — you'll use it as `CASE_ID` below

### List cases

```bash
curl -s http://localhost:3000/api/cases | python3 -m json.tool
```

- [ ] Returns array with your case, including `docCount: "0"` and `depoCount: "0"`

### Get a presigned upload URL

```bash
curl -s -X POST http://localhost:3000/api/upload-url \
  -H "Content-Type: application/json" \
  -d '{"caseId":"CASE_ID","filename":"test-doc.txt","contentType":"text/plain","sizeBytes":500}' | python3 -m json.tool
```

- [ ] Returns `uploadUrl` (presigned S3 PUT URL) and `documentId`

### Upload a file to S3

Create a test file first:
```bash
echo "This is a test employment contract between Smith and Acme Corp dated January 2024. Section 3.1 states that the employee was never given a safety manual. Section 5.2 specifies that equipment inspections must occur monthly." > /tmp/test-doc.txt
```

Upload using the presigned URL from above:
```bash
curl -X PUT "UPLOAD_URL_HERE" \
  -H "Content-Type: text/plain" \
  --data-binary @/tmp/test-doc.txt
```

- [ ] Returns HTTP 200 (no body)

### Process (ingest) the document

```bash
curl -s -X POST http://localhost:3000/api/documents/DOCUMENT_ID/process | python3 -m json.tool
```

- [ ] Returns `{ "success": true, "chunks": N }` where N >= 1
- [ ] This extracts text, chunks it, generates embeddings, and stores in pgvector

### Verify case detail

```bash
curl -s http://localhost:3000/api/cases/CASE_ID | python3 -m json.tool
```

- [ ] Returns case with `documents` array
- [ ] Document status should be `"ready"`

---

## Phase 3 — RAG Search (Ask Docs)

```bash
curl -s -X POST http://localhost:3000/api/cases/CASE_ID/search \
  -H "Content-Type: application/json" \
  -d '{"query":"safety manual"}' | python3 -m json.tool
```

- [ ] Returns `{ "chunks": [...] }` with relevant document chunks
- [ ] Chunks should contain text related to "safety manual"

### Test via UI

- [ ] Open http://localhost:3000 in browser
- [ ] Click on your case
- [ ] Go to **Ask Docs** tab
- [ ] Type a question like "What does the contract say about safety?"
- [ ] CopilotKit should search docs and return an answer with citations

---

## Phase 4 — Prep Outline

### Verify chunks endpoint

```bash
curl -s "http://localhost:3000/api/cases/CASE_ID/chunks?limit=5" | python3 -m json.tool
```

- [ ] Returns array of random document chunks

### Test via UI

- [ ] Go to **Prep Outline** tab
- [ ] Click "Generate Outline" (or similar button)
- [ ] CopilotKit should generate a deposition outline based on case documents
- [ ] Outline should render as a tree with topics and suggested questions

---

## Phase 5 — Depositions & Recall.ai

### Start recall-service

```bash
# Terminal 2
cd recall-service
npm run dev
```

- [ ] Prints "Recall service running on port 3001"

### Health check

```bash
curl -s http://localhost:3001/health
```

- [ ] Returns `{"status":"ok"}`

### Test webhook authentication

```bash
# Bad token — should return 401
curl -s -o /dev/null -w "%{http_code}" -X POST \
  "http://localhost:3001/webhook/recall/realtime?token=wrong" \
  -H "Content-Type: application/json" -d '{}'
```

- [ ] Returns `401`

```bash
# Missing Svix signature — should return 400
curl -s -o /dev/null -w "%{http_code}" -X POST \
  http://localhost:3001/webhook/recall \
  -H "Content-Type: application/octet-stream" -d '{}'
```

- [ ] Returns `400`

### Create a deposition

```bash
curl -s -X POST http://localhost:3000/api/depositions \
  -H "Content-Type: application/json" \
  -d '{"caseId":"CASE_ID","title":"Smith Deposition","zoomUrl":"https://zoom.us/j/1234567890"}' | python3 -m json.tool
```

- [ ] Returns deposition with `id`, `status: "pending"`
- [ ] If Recall.ai API key is valid and meeting URL is real, `recallBotId` will be set
- [ ] For fake URLs, `recallBotId` will be null (expected — Recall returns "meeting not found")

### List depositions

```bash
curl -s "http://localhost:3000/api/depositions?caseId=CASE_ID" | python3 -m json.tool
```

- [ ] Returns array with your deposition

### Get deposition detail

```bash
curl -s http://localhost:3000/api/depositions/DEPO_ID | python3 -m json.tool
```

- [ ] Returns deposition with `flags: []`

### Stop deposition

```bash
curl -s -X POST http://localhost:3000/api/depositions/DEPO_ID/stop | python3 -m json.tool
```

- [ ] Returns `{ "success": true }`

```bash
# Verify status changed
curl -s http://localhost:3000/api/depositions/DEPO_ID | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])"
```

- [ ] Status is `"done"`

### Test SSE connection

```bash
# Should hang open (streaming connection) — Ctrl+C to stop
timeout 3 curl -sN http://localhost:3001/events/DEPO_ID
```

- [ ] Connection stays open (SSE stream)

---

## Phase 5b — Webhook Setup Checklist

### For local development (ngrok)

- [ ] ngrok tunnel is running: `ngrok http --domain=YOUR_DOMAIN.ngrok-free.app 3001`
- [ ] `.env.local` has `RENDER_WEBHOOK_URL=https://YOUR_DOMAIN.ngrok-free.app` (base URL only, no path)
- [ ] `recall-service/.env` has matching `RECALL_WEBHOOK_SECRET`

### Recall.ai Dashboard (https://us-west-2.recall.ai/dashboard/webhooks)

- [ ] Webhook endpoint exists pointing to `https://YOUR_DOMAIN.ngrok-free.app/webhook/recall`
- [ ] Subscribed to `bot.status_change` event
- [ ] Signing secret (`whsec_...`) is copied into both env files as `RECALL_WEBHOOK_SECRET`

### For production (Render)

- [ ] recall-service is deployed on Render
- [ ] `RENDER_WEBHOOK_URL` updated to `https://deposely-recall-service.onrender.com`
- [ ] Recall.ai dashboard webhook URL updated to Render URL
- [ ] All env vars set in Render dashboard for both services

---

## Phase 6 — Live Deposition (requires real Zoom meeting)

> This phase requires a real Zoom meeting and ngrok/Render running.

1. [ ] Start a Zoom meeting (or have someone start one)
2. [ ] Create a deposition with the real Zoom URL
3. [ ] Verify the Recall.ai bot joins the meeting
4. [ ] Open http://localhost:3000/depositions/DEPO_ID in browser
5. [ ] Speak during the meeting — transcript should stream in real-time
6. [ ] If testimony contradicts uploaded documents, a red flag card should appear
7. [ ] Click dismiss on a flag — should mark it as acknowledged

---

## Phase 7 — Post-Depo Review

### Test summarize endpoint (requires transcript data)

```bash
curl -s -X POST http://localhost:3000/api/depositions/DEPO_ID/summarize | python3 -m json.tool
```

- [ ] If transcript exists: returns `{ "summary": "..." }` with GPT-4o analysis
- [ ] If no transcript: returns `{ "error": "No transcript" }` (expected for test depos)

### Test via UI (after a real deposition)

- [ ] After stopping the deposition, the page should show the post-depo review
- [ ] Summary tab shows key admissions, contradictions, and narrative
- [ ] Export button works
- [ ] CopilotKit chat sidebar allows asking questions about the deposition

---

## Phase 8 — UI Walkthrough (Browser)

Open http://localhost:3000 and walk through the full flow:

1. [ ] **Home page** — sidebar shows, "New Case" button works
2. [ ] **Create a case** — fill in title + description
3. [ ] **Case detail page** — tabs visible (Documents, Ask Docs, Prep Outline, Depositions)
4. [ ] **Documents tab** — upload a file (drag or click), see it appear in the list, status goes from "pending" → "processing" → "ready"
5. [ ] **Ask Docs tab** — chat interface loads, can ask questions about uploaded docs
6. [ ] **Prep Outline tab** — can generate a deposition outline
7. [ ] **Depositions tab** — can create a deposition with a Zoom URL
8. [ ] **Live Depo page** — two-column layout (transcript left, flags right), SSE connection indicator

---

## Cleanup

Remove test data:

```bash
# Delete test depositions
curl -s -X DELETE http://localhost:3000/api/depositions/DEPO_ID

# Or clean up via DB directly
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon('YOUR_DATABASE_URL');
sql\`DELETE FROM depositions WHERE recall_bot_id IS NULL\`.then(() => console.log('Cleaned'));
"
```
