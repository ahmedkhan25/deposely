# Deposely POC — Claude Code Dev Plan v2
## Now with CopilotKit + AG-UI

**Stack:** Next.js 14 (App Router) · Neon PostgreSQL + pgvector · AWS S3 · OpenAI · Recall.ai · Render (webhook service)  
**UI layer:** CopilotKit (React components + hooks) · AG-UI protocol (agent ↔ frontend events)  
**Deploy:** Vercel · Render

---

## Why CopilotKit + AG-UI changes the POC

Without CopilotKit, the app is a Next.js app with AI baked into API routes — chat
is DIY, state sync is manual, and the agent can only talk back in text. With CopilotKit:

| Without | With CopilotKit + AG-UI |
|---|---|
| Custom useChat + fetch loop | `<CopilotChat />` drop-in, streaming built in |
| Agent returns text, you parse it | Agent calls `useFrontendTool` → React component renders inline |
| UI and agent state are disconnected | `useCopilotReadable` + `useCoAgent` keep them in sync |
| Human approval built from scratch | `useHumanInTheLoop` pattern, built in |
| SSE plumbing for live depo | AG-UI event stream handles the realtime layer |

The key mental model: **AG-UI is the protocol, CopilotKit is the React SDK on top of it.**
AG-UI is a lightweight, event-based protocol that standardizes how AI agents connect to
frontend applications. CopilotKit is the company behind it, and they provide open-source
React components and hooks — `<CopilotChat />`, `<CopilotSidebar />` — that plug directly
into it.

---

## CopilotKit pattern map — which hook goes where in Deposely

| Deposely feature | CopilotKit primitive | What it does |
|---|---|---|
| Ask Docs chat | `<CopilotChat />` | Drop-in chat UI, streaming, message history |
| Prep Outline generation | `useFrontendTool` | Agent calls `render_outline` → `<OutlineTree />` renders inline |
| Live contradiction flag | `useFrontendTool` | Agent calls `flag_contradiction` → `<FlagCard />` renders in real time |
| Outline tracker during live depo | `useCoAgent` / `useCopilotReadable` | Shares outline state bidirectionally between agent and UI |
| Post-depo summary | `useCoAgentStateRender` | Renders structured summary as agent state streams in |
| Attorney approves a flag | `useHumanInTheLoop` | Pauses agent, renders approve/dismiss UI, agent continues |
| Case context fed to agent | `useCopilotReadable` | Feeds case title, doc list, deposition status into every agent call |

---

## Phase 0 — Repo scaffold & environment

**Session prompt:**

```
Create a Next.js 14 app using the App Router. TypeScript. Tailwind CSS. Use src/ directory layout.

Install these dependencies:
- @neondatabase/serverless
- drizzle-orm drizzle-kit
- @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
- openai
- @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime
- lucide-react
- clsx
- zod

Create .env.local with these placeholder values:
DATABASE_URL=
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET_NAME=
RECALL_AI_KEY=
RECALL_WEBHOOK_SECRET=
RENDER_WEBHOOK_URL=

Create src/lib/db.ts — Neon serverless client using DATABASE_URL.
Create src/lib/s3.ts — S3 client using AWS credentials.
Create src/lib/openai.ts — OpenAI client singleton.

Create drizzle.config.ts pointing to src/db/schema.ts.

Create the CopilotKit runtime API route at src/app/api/copilotkit/route.ts:

import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterHandler } from "@copilotkit/runtime";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const runtime = new CopilotRuntime();

export const POST = copilotRuntimeNextJSAppRouterHandler({
  runtime,
  serviceAdapter: new OpenAIAdapter({ openai }),
  endpoint: "/api/copilotkit",
});

Wrap the root layout (src/app/layout.tsx) with the CopilotKit provider:
<CopilotKit runtimeUrl="/api/copilotkit">
  {children}
</CopilotKit>

Import @copilotkit/react-ui/styles.css in the layout as well.

Do not create any pages yet.
```

---

## Phase 1 — Database schema

**Session prompt:**

```
Create the full Drizzle ORM schema at src/db/schema.ts for the Deposely POC.

Tables required:

cases
  id          uuid primary key default gen_random_uuid()
  title       text not null
  description text
  created_at  timestamp default now()

documents
  id          uuid primary key default gen_random_uuid()
  case_id     uuid references cases(id) on delete cascade
  filename    text not null
  s3_key      text not null
  size_bytes  integer
  status      text default 'pending'   -- pending | processing | ready | error
  created_at  timestamp default now()

document_chunks
  id          uuid primary key default gen_random_uuid()
  document_id uuid references documents(id) on delete cascade
  case_id     uuid references cases(id) on delete cascade
  content     text not null
  chunk_index integer not null
  embedding   vector(1536)             -- OpenAI text-embedding-3-small
  created_at  timestamp default now()

depositions
  id            uuid primary key default gen_random_uuid()
  case_id       uuid references cases(id) on delete cascade
  title         text not null
  zoom_url      text
  recall_bot_id text
  status        text default 'pending'  -- pending | live | done
  transcript    jsonb default '[]'
  summary       text
  created_at    timestamp default now()

contradiction_flags
  id               uuid primary key default gen_random_uuid()
  deposition_id    uuid references depositions(id) on delete cascade
  testimony_text   text not null
  conflicting_text text not null
  source_doc       text
  chunk_id         uuid references document_chunks(id)
  dismissed        boolean default false
  created_at       timestamp default now()

Generate migration file at src/db/migrations/0001_init.sql with all CREATE TABLE
statements. Include:
  CREATE EXTENSION IF NOT EXISTS vector;
  CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

Create src/db/migrate.ts — script that runs the migration using the Neon serverless
driver directly (raw SQL, not drizzle-kit push).

Create src/db/index.ts — exports all table objects.
```

---

## Phase 2 — Case Hub

**Session prompt:**

```
Build the Case Hub feature — home screen of the app.

Layout:
- src/app/layout.tsx: minimal sidebar nav ("Cases"), import CopilotKit provider from Phase 0
- src/app/page.tsx: redirect to /cases

Pages:

1. /cases
   - List all cases, newest first (title, doc count, depo count, date)
   - "New Case" modal (inline)
   - Click case → /cases/[id]

2. /cases/[id]
   - Tabs: Documents | Ask Docs | Prep Outline | Depositions
   - Documents tab default

Documents tab:
   - Upload zone (drag-and-drop, PDF/DOCX/TXT)
   - File list with status badges: pending (gray) | processing (amber) | ready (green) | error (red)

Add useCopilotReadable to the case detail page to feed case context into every
agent call for this page:

useCopilotReadable({
  description: "Current case being worked on",
  value: {
    caseId: case.id,
    caseTitle: case.title,
    documentCount: documents.length,
    readyDocuments: documents.filter(d => d.status === 'ready').map(d => d.filename),
  }
});

API routes:
POST /api/cases          — create case
GET  /api/cases          — list cases with counts
GET  /api/cases/[id]     — case + documents
GET  /api/upload-url     — presigned S3 PUT URL + new document record
POST /api/documents/[id]/process — ingestion:
  1. Download from S3 (GetObjectCommand)
  2. Extract text (pdf-parse for PDF, mammoth for DOCX, plain for TXT)
     Install: pdf-parse mammoth
  3. Chunk: 800-token chunks, 100-token overlap, split on sentence boundaries
  4. Embed with text-embedding-3-small
  5. Insert into document_chunks
  6. Set document status ready or error

Upload flow: client gets presigned URL → PUT to S3 → calls /api/documents/[id]/process
```

---

## Phase 3 — Ask Docs (RAG chat with CopilotKit)

**Session prompt:**

```
Build the "Ask Docs" tab using CopilotKit's <CopilotChat /> component.

This replaces a custom chat implementation. CopilotKit handles streaming, message
history, and the UI.

In src/app/cases/[id]/tabs/AskDocsTab.tsx:

1. Register a useCopilotAction that performs RAG retrieval:

useCopilotAction({
  name: "search_case_documents",
  description: "Search the case documents to answer a legal question. Always call this before answering.",
  parameters: [
    { name: "query", type: "string", description: "The question to search for" }
  ],
  handler: async ({ query }) => {
    const res = await fetch(`/api/cases/${caseId}/search`, {
      method: 'POST',
      body: JSON.stringify({ query })
    });
    const { chunks } = await res.json();
    return chunks.map(c => ({
      content: c.content,
      source: c.document_filename,
      chunkIndex: c.chunk_index
    }));
  },
  render: ({ status, args, result }) => {
    if (status === 'executing') return <SearchingIndicator query={args.query} />;
    if (status === 'complete') return <SourcesList sources={result} />;
    return null;
  }
});

2. Add a CopilotKit system prompt for this tab:

useCopilotReadable({
  description: "Instructions for the legal AI assistant",
  value: `You are a legal AI assistant helping an attorney prepare for depositions.
    Always call search_case_documents before answering any question.
    Cite sources using the document filename and chunk index provided by search results.
    If the answer is not in the documents, say so explicitly.
    Never fabricate case facts.`
});

3. Render <CopilotChat /> with a custom header:

<CopilotChat
  labels={{
    title: "Ask Case Documents",
    initial: "What would you like to know about this case? I'll search the uploaded documents."
  }}
  className="h-full"
/>

API route: POST /api/cases/[id]/search
  1. Embed query with text-embedding-3-small
  2. SELECT chunks ORDER BY embedding <=> $query LIMIT 8 WHERE case_id = $caseId
  3. Return chunks with document_filename joined from documents table

Style: the CopilotChat fills the tab panel. Source pills render as amber badges
below each assistant message via the render callback.
```

---

## Phase 4 — Prep Outline (generative UI with useFrontendTool)

**Session prompt:**

```
Build the "Prep Outline" tab using CopilotKit's useFrontendTool for generative UI.

This is the key AG-UI demo: the agent calls a frontend tool that renders a React
component inline in the chat, not just text.

In src/app/cases/[id]/tabs/PrepOutlineTab.tsx:

1. Build the OutlineTree component (src/components/OutlineTree.tsx):

interface OutlineTheme {
  title: string;
  questions: Array<{
    question: string;
    rationale: string;
    source: string;
  }>;
}

export function OutlineTree({ themes, status }: { themes: OutlineTheme[], status: string }) {
  // Expandable tree: each theme is collapsible
  // Each question shows rationale on hover/expand
  // Source shown as amber pill badge
  // "Copy as Markdown" button at top
  // Status: if 'streaming', show pulsing skeleton for incomplete themes
}

2. Register the frontend tool that the agent will call to render the outline:

useFrontendTool({
  name: "render_deposition_outline",
  description: "Render a structured deposition preparation outline as an interactive UI component",
  parameters: [
    {
      name: "themes",
      type: "object[]",
      description: "Array of deposition themes with questions",
      attributes: [
        { name: "title", type: "string" },
        { name: "questions", type: "object[]", attributes: [
          { name: "question", type: "string" },
          { name: "rationale", type: "string" },
          { name: "source", type: "string" }
        ]}
      ]
    }
  ],
  render: ({ status, args }) => (
    <OutlineTree themes={args.themes ?? []} status={status} />
  ),
  handler: async ({ themes }) => {
    // Persist to state for use in live depo outline tracker
    setGeneratedOutline(themes);
    return { success: true, themeCount: themes.length };
  }
});

3. Add useCopilotReadable with doc chunks context:
   Fetch the top 40 chunks for this case, pass them as "caseDocumentExcerpts"

4. Register a system prompt instructing the agent to call render_deposition_outline
   with properly structured JSON when asked to generate an outline.

5. Render <CopilotChat /> with initial message:
   "I'm ready to generate a deposition outline. Ask me to 'generate the outline' 
    and I'll analyze the case documents and create a structured question plan."

6. Add a "Generate Outline" button that sends a pre-set message to the chat:
   "Generate a comprehensive deposition outline for this case based on all uploaded documents"

API route: GET /api/cases/[id]/chunks?limit=40
  Returns top chunks for this case (no embedding search, just sample by doc coverage)
```

---

## Phase 5 — Render webhook service (live depo backend)

**Session prompt:**

```
Create a separate Express.js service in a /recall-service directory at the project root.
This will be deployed to Render as a separate web service.

recall-service/
  package.json
  index.ts
  src/
    webhook.ts
    clients.ts    (SSE client management)

Setup:
- TypeScript + ts-node
- Express
- Install: express @types/express @neondatabase/serverless dotenv openai

recall-service/.env:
DATABASE_URL=
RECALL_WEBHOOK_SECRET=
OPENAI_API_KEY=

Endpoints:

POST /webhook/recall
  Verify signature using RECALL_WEBHOOK_SECRET (HMAC SHA-256)
  Handle event types:

  transcript.words_added
    1. Reconstruct sentence from words array
    2. Find deposition by recall_bot_id
    3. Append segment to depositions.transcript (jsonb)
    4. Broadcast { type: 'transcript', segment: { speaker, text, start_ms } }
       to all SSE clients for this deposition_id
    5. Run contradiction check — fire and forget

  bot.done
    1. Set deposition status to 'done'
    2. Trigger post-deposition summary — fire and forget
    3. Broadcast { type: 'done' } to SSE clients

GET /stream/:depositionId
  SSE endpoint (text/event-stream)
  Register response in in-memory client map keyed by depositionId
  On disconnect, remove from map
  Heartbeat every 15s

Contradiction check (per segment, fire and forget):
  Input: { depositionId, segmentText, caseId }
  1. Embed segmentText with text-embedding-3-small
  2. Find top 3 similar document_chunks for caseId
  3. Call GPT-4o:
     "Does this testimony contradict the provided documents?
      Testimony: {segmentText}
      Documents: {top3chunks}
      Respond ONLY with JSON: { contradiction: boolean, explanation: string, conflicting_text: string }"
  4. If contradiction true: INSERT into contradiction_flags
  5. Broadcast { type: 'flag', flag: { testimonyText, conflictingText, sourceDoc } }

Post-deposition summary (fire and forget after bot.done):
  1. Fetch full transcript from DB
  2. Fetch top 20 document chunks for the case
  3. Call GPT-4o with structured prompt for:
     - Key Admissions (bullets with timestamps)
     - Contradictions Found (testimony vs document)
     - Narrative Summary (2-3 paragraphs)
  4. Save to depositions.summary

Create recall-service/Dockerfile for Render deployment.
Create render.yaml at project root defining the recall-service as a web service.
```

---

## Phase 6 — Live Depo UI (CopilotKit + AG-UI for real-time generative UI)

**Session prompt:**

```
Build the Depositions tab and the live deposition view.
This is where CopilotKit's useFrontendTool shines — contradiction flags render
as interactive React components in real time, not just text alerts.

Pages:

1. Depositions tab on /cases/[id]
   - List depositions (title, status badge, date)
   - "New Deposition" modal: title + Zoom URL
   - On submit: POST /api/depositions (creates record + sends Recall.ai bot)
   - Click deposition → /depositions/[id]

2. /depositions/[id] — live deposition view
   Two-column layout:

   LEFT (60%): Live transcript + CopilotKit sidebar
   - Scrolling transcript feed (newest at bottom, auto-scroll)
   - [Speaker] text lines, timestamp on hover
   - Connection status pill: connecting / live / ended
   - CopilotKit sidebar toggled by a floating button labeled "AI Second Chair"

   RIGHT (40%): Two panels
   - Top: Contradiction Flags (live-updating, agent-rendered)
   - Bottom: Outline Tracker (checkboxes, attorney marks covered)

CopilotKit integration for live depo:

In src/app/depositions/[id]/page.tsx:

// Feed live depo state into the agent
useCopilotReadable({
  description: "Live deposition state",
  value: {
    depositionId,
    status,
    segmentCount: segments.length,
    recentTestimony: segments.slice(-5).map(s => `${s.speaker}: ${s.text}`).join('\n'),
    openFlags: flags.filter(f => !f.dismissed).length,
    outlineCoverage: `${coveredCount} of ${totalQuestions} questions addressed`
  }
});

// Register the frontend tool for rendering contradiction flags
// The agent calls this when the Render webhook broadcasts a new flag
useFrontendTool({
  name: "surface_contradiction_flag",
  description: "Display a contradiction between testimony and case documents as an interactive card",
  parameters: [
    { name: "testimonyText", type: "string" },
    { name: "conflictingText", type: "string" },
    { name: "sourceDoc", type: "string" },
    { name: "flagId", type: "string" },
    { name: "suggestedFollowUp", type: "string", description: "A suggested follow-up question" }
  ],
  render: ({ status, args }) => (
    <FlagCard
      testimony={args.testimonyText}
      conflict={args.conflictingText}
      source={args.sourceDoc}
      followUp={args.suggestedFollowUp}
      status={status}
      onDismiss={() => dismissFlag(args.flagId)}
    />
  ),
  handler: async ({ flagId }) => {
    await fetch(`/api/flags/${flagId}/acknowledge`, { method: 'POST' });
    return { acknowledged: true };
  }
});

// Human-in-the-loop: attorney approves follow-up question before it's logged
useFrontendTool({
  name: "suggest_followup_question",
  description: "Suggest a follow-up question for attorney review",
  parameters: [
    { name: "question", type: "string" },
    { name: "rationale", type: "string" }
  ],
  render: ({ args, status }) => (
    <FollowUpSuggestion
      question={args.question}
      rationale={args.rationale}
      isLoading={status === 'executing'}
    />
  ),
  handler: async ({ question }) => {
    addToQuestionQueue(question);
    return { queued: true };
  }
});

SSE bridge: connect to {RENDER_WEBHOOK_URL}/stream/{depositionId}
When a 'flag' event arrives from the Render service, send a message to the
CopilotKit agent via the chat input (or programmatically trigger the
surface_contradiction_flag tool with the flag data).

Build these components:
- FlagCard.tsx — amber-bordered card, testimony vs conflict, source badge, dismiss button
- FollowUpSuggestion.tsx — blue card with question + rationale, "Add to queue" button
- OutlineTracker.tsx — read-only outline tree with checkboxes the attorney can tick

API routes:
POST /api/depositions       — create + send Recall.ai bot
GET  /api/depositions/[id]  — deposition + flags
POST /api/depositions/[id]/stop — stop Recall.ai bot
POST /api/flags/[id]/acknowledge — mark flag as seen
```

---

## Phase 7 — Post-Deposition Review (useCoAgentStateRender)

**Session prompt:**

```
Build the post-deposition review view on /depositions/[id] when status === 'done'.

When deposition.status === 'done', replace the two-column live layout with
a review layout. Use CopilotKit's useCoAgentStateRender to stream the summary
as structured React components as it generates.

Layout:

1. Header: deposition title, completion date, "Export" button

2. Summary panel — rendered via useCoAgentStateRender:

useCoAgentStateRender({
  name: "summary_agent",
  render: ({ state }) => {
    if (!state) return <SummarySkeleton />;
    return (
      <div>
        {state.key_admissions && (
          <AdmissionsList admissions={state.key_admissions} />
        )}
        {state.narrative && (
          <NarrativeSummary text={state.narrative} />
        )}
      </div>
    );
  }
});

If deposition.summary already exists in DB (pre-generated by Render service),
parse it and hydrate the agent state directly — no re-generation needed.

If summary is null, trigger generation via POST /api/depositions/[id]/summarize
and poll every 3 seconds until it resolves.

3. Contradiction Report:
   Card per contradiction_flag with red left border
   Testimony text | "Conflicts with" | Document text + source badge

4. Full Transcript (collapsed by default):
   Speaker-labeled lines with HH:MM:SS timestamps
   Converted from start_ms

5. Export button:
   Generates plain text combining all sections
   Browser download via Blob + URL.createObjectURL
   Filename: [case]-[deposition]-summary.txt

Also register a useCopilotAction so attorneys can ask follow-up questions
about the completed deposition:

useCopilotAction({
  name: "search_deposition_transcript",
  description: "Search the completed deposition transcript for specific testimony",
  parameters: [{ name: "query", type: "string" }],
  handler: async ({ query }) => {
    // Simple substring search on the transcript segments
    const matches = transcript.filter(s =>
      s.text.toLowerCase().includes(query.toLowerCase())
    );
    return matches.slice(0, 5);
  },
  render: ({ status, result }) => {
    if (status === 'complete') return <TranscriptMatches segments={result} />;
    return null;
  }
});

Render <CopilotChat /> in a sidebar on the review page so attorneys can ask
"What did the witness say about the contract?" and get cited transcript matches.
```

---

## Phase 8 — Polish & demo prep

**Session prompt:**

```
Polish the Deposely POC for demo. Apply these improvements:

1. Design pass:
   - Color: dark navy sidebar (#0F1629), white main, accent #4F6EF7
   - Typography: Inter from Google Fonts
   - CopilotKit theme override via CSS variables:
     --copilot-kit-primary-color: #4F6EF7;
     --copilot-kit-background-color: #ffffff;
     --copilot-kit-separator-color: #e5e7eb;
   - All cards: rounded-xl, subtle shadow
   - Status badges: pill shape with colored dot

2. CopilotKit sidebar label customization on each page:
   - Case detail: title="Deposely AI", initial="Ask me about this case or generate a deposition outline."
   - Live depo: title="AI Second Chair", initial="I'm monitoring the testimony. I'll flag contradictions in real time."
   - Post-review: title="Review Assistant", initial="The deposition is complete. Ask me anything about the testimony."

3. CopilotKit floating button (not full sidebar) on the Documents tab —
   use <CopilotPopup /> instead of <CopilotSidebar /> so it doesn't crowd the upload UI.

4. Empty states on every list.

5. Loading skeletons on case list, chat, outline.

6. Error toasts (simple Toast component with useState).

7. Demo seed script at scripts/seed.ts:
   Case: "Johnson v. Meridian Corp" — employment discrimination, 2024
   2 documents (status ready, realistic legal filenames)
   8 document_chunks with realistic legal text + zero-vector embeddings
   1 completed deposition with 20-line mock transcript
   2 contradiction flags (one dismissed, one open)
   Full mock summary with key admissions, contradictions, narrative
   Run: npx ts-node scripts/seed.ts

8. README.md:
   Setup, env vars, migration, seed, local dev, Vercel + Render deploy instructions
   One-paragraph architecture overview
   "Upgrading the embedder" section (OpenAI → Kanon 2, one config change)
```

---

## Environment variables reference

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → Connection string |
| `OPENAI_API_KEY` | platform.openai.com |
| `AWS_ACCESS_KEY_ID` | IAM user with S3 PutObject + GetObject |
| `AWS_SECRET_ACCESS_KEY` | Same IAM user |
| `S3_BUCKET_NAME` | Your S3 bucket |
| `RECALL_AI_KEY` | recall.ai dashboard |
| `RECALL_WEBHOOK_SECRET` | recall.ai dashboard → webhook signing secret |
| `RENDER_WEBHOOK_URL` | Render service URL after deploy |

---

## CopilotKit component cheatsheet for this project

```tsx
// Root layout — wraps entire app
<CopilotKit runtimeUrl="/api/copilotkit">

// Chat embedded in a tab panel (Ask Docs, Post Review)
<CopilotChat labels={{ title: "...", initial: "..." }} />

// Floating popup (Documents tab — doesn't crowd the upload UI)
<CopilotPopup labels={{ title: "...", initial: "..." }} />

// Sidebar (Case detail, Live Depo)
<CopilotSidebar labels={{ title: "...", initial: "..." }} />

// Feed app state into every agent call (use in any page component)
useCopilotReadable({ description: "...", value: appState })

// Register an action the agent can call (RAG search, transcript search)
useCopilotAction({ name, description, parameters, handler, render })

// Register a frontend tool that renders a React component (outline, flag card)
useFrontendTool({ name, description, parameters, render, handler })

// Render agent state as a React component as it streams (post-depo summary)
useCoAgentStateRender({ name: "agent_name", render: ({ state }) => <MyComponent {...state} /> })

// Runtime API route (Phase 0, already set up)
// src/app/api/copilotkit/route.ts
```

---

## AG-UI event flow for live deposition

```
Recall.ai bot
  → transcript.words_added webhook
  → Render service (Express)
    → append to DB
    → run contradiction check (GPT-4o)
    → SSE broadcast to browser { type: 'flag', ... }
  
Browser (SSE client)
  → receives flag event
  → calls CopilotKit chat with flag data
  → CopilotKit agent invokes surface_contradiction_flag frontend tool
  → <FlagCard /> renders inline in the AI Second Chair sidebar
  → attorney sees flag in real time, dismisses or acts on it
```

---

## Upgrade path (post-POC)

| POC | Upgrade |
|---|---|
| `text-embedding-3-small` (1536d) | Kanon 2 Embedder via Isaacus API (1792d — one schema change) |
| No reranker | Kanon Universal Classifier — pass top 20, rerank to top 5 |
| CopilotKit hosted runtime | Self-hosted CopilotKit runtime on Render for data privacy |
| Sync ingestion | Background queue (Trigger.dev or Inngest free tier) |
| In-memory SSE on Render | Redis pub/sub for multi-instance scale |
| `pdf-parse` | AWS Textract for scanned/image PDFs |
