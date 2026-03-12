"use client";

import { useState } from "react";
import {
  Database,
  Brain,
  HardDrive,
  Video,
  Globe,
  Server,
  Zap,
  Shield,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from "lucide-react";
import { clsx } from "clsx";

/* ─── Architecture Data ─────────────────────────────────────────────── */

interface Layer {
  id: string;
  label: string;
  sub: string;
  color: string; // tailwind bg
  icon: typeof Database;
  pocDetail: string;
  prodDetail: string;
  pros: string[];
  cons: string[];
}

const layers: Layer[] = [
  {
    id: "frontend",
    label: "Frontend",
    sub: "Next.js 14 App Router",
    color: "bg-blue-600",
    icon: Globe,
    pocDetail: "Render — single instance, SSR + API routes co-located",
    prodDetail: "Vercel Edge — global CDN, edge SSR, auto-scaling, preview deploys",
    pros: ["Zero-config deploys", "Edge functions for low latency", "Built-in analytics"],
    cons: ["Vendor lock-in", "Cold starts on serverless", "Cost at scale for compute-heavy routes"],
  },
  {
    id: "ai",
    label: "AI / LLM",
    sub: "CopilotKit + OpenAI",
    color: "bg-purple-600",
    icon: Brain,
    pocDetail: "OpenAI GPT-4o + text-embedding-3-small — direct API calls, CopilotKit hosted runtime",
    prodDetail: "Self-hosted CopilotKit runtime, Kanon 2 Embedder (1792d), Universal Classifier reranker, fine-tuned legal models",
    pros: ["Domain-specific embeddings", "Reranking improves precision", "Data stays on-premise"],
    cons: ["Model hosting costs", "Fine-tuning requires labeled data", "Latency from self-hosted inference"],
  },
  {
    id: "database",
    label: "Database",
    sub: "Neon PostgreSQL + pgvector",
    color: "bg-green-600",
    icon: Database,
    pocDetail: "Single Neon instance — serverless Postgres, pgvector IVFFlat index, ~100 vectors",
    prodDetail: "Neon with read replicas + HNSW index, or migrate to Pinecone/Weaviate for vector workloads at scale",
    pros: ["SQL + vectors in one DB", "Serverless auto-scaling", "Branch-based dev workflow"],
    cons: ["IVFFlat degrades >1M vectors", "Cold start latency", "Shared compute on free tier"],
  },
  {
    id: "storage",
    label: "Document Storage",
    sub: "AWS S3",
    color: "bg-amber-600",
    icon: HardDrive,
    pocDetail: "Single S3 bucket — presigned URLs for upload/download, no CDN",
    prodDetail: "S3 + CloudFront CDN, AWS Textract for scanned PDFs, lifecycle policies, encryption at rest",
    pros: ["11 nines durability", "Cheap at scale", "Native AWS ecosystem"],
    cons: ["Egress costs", "No built-in virus scanning", "CORS config needed for browser uploads"],
  },
  {
    id: "transcription",
    label: "Live Transcription",
    sub: "Recall.ai + Express",
    color: "bg-red-600",
    icon: Video,
    pocDetail: "Recall.ai bot joins Zoom — real-time webhook to Express on Render, in-memory SSE broadcast",
    prodDetail: "Recall.ai (or Deepgram direct) + Redis pub/sub for multi-instance SSE, Kubernetes for webhook service",
    pros: ["Platform-agnostic (Zoom, Meet, Teams)", "Real-time transcript stream", "No client-side recording"],
    cons: ["Per-minute API cost", "Bot join latency (~5s)", "Single-instance SSE won't scale horizontally"],
  },
  {
    id: "queue",
    label: "Background Jobs",
    sub: "Sync (POC) / Queue (Prod)",
    color: "bg-cyan-600",
    icon: Zap,
    pocDetail: "Synchronous — document processing runs inline in API route, blocks response until done",
    prodDetail: "Trigger.dev or Inngest — async job queue with retries, dead letter queue, observability dashboard",
    pros: ["Decouples upload from processing", "Retry on failure", "Parallel chunk embedding"],
    cons: ["Added infra complexity", "Job monitoring overhead", "Cold start on serverless workers"],
  },
];

/* ─── Animated Block Diagram ─────────────────────────────────────────── */

function ArchBlock({
  label,
  sub,
  color,
  delay,
  pulse,
}: {
  label: string;
  sub: string;
  color: string;
  delay: number;
  pulse?: boolean;
}) {
  return (
    <div
      className={clsx(
        "relative px-3 py-2.5 rounded-lg text-white text-center transition-all",
        color,
        pulse && "animate-pulse"
      )}
      style={{
        animation: `fadeSlideIn 0.5s ease-out ${delay}ms both`,
      }}
    >
      <p className="text-xs font-semibold leading-tight">{label}</p>
      <p className="text-[10px] opacity-75 leading-tight mt-0.5">{sub}</p>
    </div>
  );
}

function Connector({ delay, dashed }: { delay: number; dashed?: boolean }) {
  return (
    <div
      className="flex justify-center"
      style={{ animation: `fadeIn 0.3s ease-out ${delay}ms both` }}
    >
      <div
        className={clsx(
          "w-px h-6",
          dashed ? "border-l border-dashed border-gray-400" : "bg-gray-300"
        )}
      />
    </div>
  );
}

function PocDiagram() {
  return (
    <div className="space-y-0">
      <ArchBlock label="Browser" sub="React + CopilotKit" color="bg-gray-600" delay={0} />
      <Connector delay={100} />
      <div
        className="border border-gray-600 rounded-xl p-3 space-y-2"
        style={{ animation: "fadeSlideIn 0.5s ease-out 150ms both" }}
      >
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          Render — Next.js
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <ArchBlock label="Case Hub" sub="CRUD" color="bg-blue-600" delay={200} />
          <ArchBlock label="Ask Docs" sub="RAG" color="bg-indigo-600" delay={250} />
          <ArchBlock label="Prep" sub="Outline" color="bg-violet-600" delay={300} />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <ArchBlock label="Live Depo" sub="SSE stream" color="bg-teal-600" delay={350} />
          <ArchBlock label="Review" sub="Summary" color="bg-rose-600" delay={400} />
        </div>
      </div>
      <Connector delay={450} />
      <div className="grid grid-cols-2 gap-2">
        <ArchBlock label="Neon" sub="pgvector" color="bg-green-700" delay={500} />
        <ArchBlock label="OpenAI" sub="GPT-4o" color="bg-purple-700" delay={550} />
      </div>
      <Connector delay={600} />
      <div className="grid grid-cols-2 gap-2">
        <ArchBlock label="S3" sub="Documents" color="bg-amber-700" delay={650} />
        <ArchBlock label="Recall.ai" sub="Zoom bot" color="bg-red-700" delay={700} />
      </div>
      <Connector delay={750} />
      <div
        className="border border-gray-600 rounded-xl p-3"
        style={{ animation: "fadeSlideIn 0.5s ease-out 800ms both" }}
      >
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-2">
          Render — Express
        </p>
        <ArchBlock label="Webhook Service" sub="Transcription + Contradiction" color="bg-orange-600" delay={850} />
      </div>
    </div>
  );
}

function ProdDiagram() {
  return (
    <div className="space-y-0">
      <ArchBlock label="Browser" sub="React + CopilotKit" color="bg-gray-600" delay={100} />
      <Connector delay={200} />
      <ArchBlock label="CDN / Edge" sub="Vercel Edge Network" color="bg-sky-600" delay={250} />
      <Connector delay={300} />
      <div
        className="border border-emerald-700 rounded-xl p-3 space-y-2"
        style={{ animation: "fadeSlideIn 0.5s ease-out 350ms both" }}
      >
        <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">
          Vercel — Next.js (Auto-scaled)
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <ArchBlock label="Case Hub" sub="Edge SSR" color="bg-blue-600" delay={400} />
          <ArchBlock label="Ask Docs" sub="RAG + Rerank" color="bg-indigo-600" delay={450} />
          <ArchBlock label="Prep" sub="Fine-tuned" color="bg-violet-600" delay={500} />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <ArchBlock label="Live Depo" sub="WebSocket" color="bg-teal-600" delay={550} />
          <ArchBlock label="Review" sub="Streaming" color="bg-rose-600" delay={600} />
        </div>
      </div>
      <Connector delay={650} />
      <div className="grid grid-cols-3 gap-2">
        <ArchBlock label="Neon" sub="Read replicas" color="bg-green-700" delay={700} />
        <ArchBlock label="Kanon 2" sub="1792d embed" color="bg-purple-700" delay={750} />
        <ArchBlock label="Redis" sub="Cache + PubSub" color="bg-red-800" delay={800} />
      </div>
      <Connector delay={850} />
      <div className="grid grid-cols-3 gap-2">
        <ArchBlock label="S3 + CF" sub="CDN delivery" color="bg-amber-700" delay={900} />
        <ArchBlock label="Textract" sub="Scanned PDFs" color="bg-amber-600" delay={950} />
        <ArchBlock label="Recall.ai" sub="Multi-platform" color="bg-red-700" delay={1000} />
      </div>
      <Connector delay={1050} />
      <div
        className="border border-emerald-700 rounded-xl p-3 space-y-2"
        style={{ animation: "fadeSlideIn 0.5s ease-out 1100ms both" }}
      >
        <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider mb-1">
          Kubernetes — Webhook Workers
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <ArchBlock label="Webhooks" sub="Auto-scaled pods" color="bg-orange-600" delay={1150} />
          <ArchBlock label="Job Queue" sub="Trigger.dev" color="bg-cyan-600" delay={1200} />
        </div>
      </div>
      <Connector delay={1250} />
      <ArchBlock label="Monitoring" sub="Datadog / Sentry" color="bg-gray-700" delay={1300} />
    </div>
  );
}

/* ─── Component Detail Card ──────────────────────────────────────────── */

function ComponentCard({ layer }: { layer: Layer }) {
  const [open, setOpen] = useState(false);
  const Icon = layer.icon;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center text-white", layer.color)}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{layer.label}</h3>
          <p className="text-xs text-gray-500">{layer.sub}</p>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {/* POC vs Production */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Current (POC)
              </p>
              <p className="text-xs text-gray-700">{layer.pocDetail}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                Production Scale
              </p>
              <p className="text-xs text-gray-700">{layer.prodDetail}</p>
            </div>
          </div>

          {/* Pros / Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-1.5">
                Advantages
              </p>
              <ul className="space-y-1">
                {layer.pros.map((p) => (
                  <li key={p} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <Check size={12} className="text-green-500 mt-0.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1.5">
                Trade-offs
              </p>
              <ul className="space-y-1">
                {layer.cons.map((c) => (
                  <li key={c} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <X size={12} className="text-red-400 mt-0.5 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div className="max-w-6xl mx-auto px-8 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-[#4F6EF7] flex items-center justify-center">
            <Server size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Architecture</h1>
            <p className="text-sm text-gray-500">
              POC implementation vs. production-ready scaling path
            </p>
          </div>
        </div>
      </div>

      {/* Diagrams — side by side */}
      <div className="max-w-6xl mx-auto px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* POC Diagram */}
          <div className="bg-[#0F1629] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <h2 className="text-sm font-semibold text-white">
                Current POC Architecture
              </h2>
              <span className="ml-auto text-[10px] text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">
                Single instance
              </span>
            </div>
            <PocDiagram />
          </div>

          {/* Production Diagram */}
          <div className="bg-[#0F1629] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-semibold text-white">
                Production Architecture
              </h2>
              <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                Auto-scaled
              </span>
            </div>
            <ProdDiagram />
          </div>
        </div>
      </div>

      {/* Component Deep Dives */}
      <div className="max-w-4xl mx-auto px-8 pb-16">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-[#4F6EF7]" />
          Component Breakdown — Click to expand
        </h2>
        <div className="space-y-3">
          {layers.map((layer) => (
            <ComponentCard key={layer.id} layer={layer} />
          ))}
        </div>
      </div>

      {/* Key Scaling Decisions */}
      <div className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6 text-center">
            Key Scaling Decisions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <Shield size={18} className="text-[#4F6EF7] mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Data Privacy</h3>
              <p className="text-xs text-gray-600">
                Self-hosted CopilotKit runtime + on-premise embeddings ensure attorney-client
                privilege. No case data leaves your infrastructure.
              </p>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <Zap size={18} className="text-[#4F6EF7] mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Real-time at Scale</h3>
              <p className="text-xs text-gray-600">
                Redis pub/sub replaces in-memory SSE broadcast, enabling horizontal scaling
                of webhook workers across multiple pods.
              </p>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <BarChart3 size={18} className="text-[#4F6EF7] mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Vector Search</h3>
              <p className="text-xs text-gray-600">
                Kanon 2 embeddings (1792d) + Universal Classifier reranking. HNSW index
                replaces IVFFlat for sub-100ms queries at 10M+ vectors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
