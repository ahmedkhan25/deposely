"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  FileText,
  MessageSquare,
  ListTree,
  Video,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Upload Case Documents",
    description:
      "Upload PDFs, DOCX, or TXT files. Documents are chunked, embedded, and indexed for AI-powered search.",
  },
  {
    icon: MessageSquare,
    title: "Ask Docs (RAG Chat)",
    description:
      "Ask questions about your case documents. The AI searches relevant passages and cites sources.",
  },
  {
    icon: ListTree,
    title: "Prep Outline Generator",
    description:
      "AI analyzes case documents and generates a structured deposition outline with themes, questions, and rationale.",
  },
  {
    icon: Video,
    title: "Live Deposition",
    description:
      "Connect a Zoom meeting via Recall.ai. Get a real-time transcript streamed to your browser.",
  },
  {
    icon: AlertTriangle,
    title: "Contradiction Detection",
    description:
      "AI monitors testimony in real time and flags when a witness contradicts uploaded case documents.",
  },
  {
    icon: Sparkles,
    title: "Post-Depo Summary",
    description:
      "After a deposition ends, AI generates key admissions, contradiction reports, and a narrative summary.",
  },
];

const steps = [
  { num: "1", text: "Create a case and upload your documents (PDF, DOCX, or TXT)" },
  { num: "2", text: 'Use "Ask Docs" to query your documents with AI-powered search' },
  { num: "3", text: 'Go to "Prep Outline" and click Generate Outline to create a deposition plan' },
  { num: "4", text: "Create a deposition with a Zoom URL to start a live transcribed session" },
  { num: "5", text: "During the live depo, AI flags contradictions between testimony and documents" },
  { num: "6", text: "After the depo, review the AI-generated summary and contradiction report" },
];

export default function LandingPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-8 pt-16 pb-12">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* Video — left side */}
          <div className="relative w-full lg:w-5/12 shrink-0">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-black">
              <video
                ref={videoRef}
                src="/avatar-video-sm.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full aspect-[9/16] object-cover"
              />
              <button
                onClick={toggleMute}
                className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                title={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>

          {/* Text — right side */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium text-[#4F6EF7] bg-[#4F6EF7]/10 rounded-full">
              <Sparkles size={12} />
              Technology POC &middot; Built by Ahmed Khan
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Deposly <span className="text-2xl font-normal text-gray-400">Lite</span>
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              AI-powered deposition preparation and live testimony analysis for attorneys.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              This proof-of-concept demonstrates the architecture and technology behind Deposly —
              document ingestion with RAG, AI-generated deposition outlines, live transcription via Recall.ai,
              and real-time contradiction detection.
            </p>
            <button
              onClick={() => router.push("/cases")}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#4F6EF7] rounded-lg hover:bg-[#3d5ce0] transition-colors"
            >
              Open Case Hub
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-4xl mx-auto px-8 pb-12">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6 text-center">
          What this POC demonstrates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-5 bg-white border border-gray-200 rounded-xl"
            >
              <f.icon size={20} className="text-[#4F6EF7] mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {f.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How to use */}
      <div className="max-w-2xl mx-auto px-8 pb-16">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6 text-center">
          How to use
        </h2>
        <div className="space-y-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#4F6EF7] text-white text-xs font-bold shrink-0">
                {s.num}
              </span>
              <p className="text-sm text-gray-700 pt-0.5">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack footer */}
      <div className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <p className="text-xs text-gray-500">
            Built with Next.js 14 &middot; CopilotKit + AG-UI &middot; Neon PostgreSQL + pgvector &middot; OpenAI &middot; Recall.ai &middot; AWS S3 &middot; Render
          </p>
        </div>
      </div>
    </div>
  );
}
