"use client";

import { SectionHeader } from "@/components/SectionHeader";
import { aboutProfile, valueProps } from "@/lib/deposly-data";
import { ExternalLink, Linkedin, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
      {/* Profile */}
      <section className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-deposly-blue/10 text-deposly-blue text-2xl font-bold mb-4">
          AK
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{aboutProfile.name}</h1>
        <p className="text-lg text-deposly-muted mt-1">{aboutProfile.title}</p>
        <p className="text-deposly-blue font-medium mt-2">{aboutProfile.highlight}</p>
        <p className="text-xs text-deposly-muted mt-1 italic">This is Deposly Lite — a demo site, not the production product.</p>
        <div className="flex justify-center gap-4 mt-4">
          <a
            href={aboutProfile.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-deposly-muted hover:text-deposly-blue transition-colors"
          >
            <Linkedin size={16} /> LinkedIn
          </a>
          <a
            href={aboutProfile.links.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-deposly-muted hover:text-deposly-blue transition-colors"
          >
            <Globe size={16} /> ahmedkhan-ai.com
          </a>
        </div>
      </section>

      {/* Key Work */}
      <section>
        <SectionHeader title="Key Work" />
        <div className="border border-deposly-border rounded-xl p-6 bg-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-deposly-blue/10 flex items-center justify-center text-deposly-blue font-bold shrink-0">
              D
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Deposly Lite — AI Deposition Platform Demo</h3>
              <p className="text-sm text-deposly-muted mt-1">
                Demo site showcasing the AI engineering vision for legal deposition preparation. This Lite version demonstrates
                RAG-powered document Q&A, multi-agent contradiction detection, real-time transcription via Recall.ai, and
                AI-generated deposition outlines — built as a proof of concept in one day.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["Next.js", "CopilotKit", "pgvector", "Recall.ai", "OpenAI", "Neon"].map((t) => (
                  <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Deposly */}
      <section>
        <SectionHeader title="Why Deposly" subtitle="Three reasons this problem is worth solving" />
        <div className="grid gap-4">
          {valueProps.map((vp, i) => (
            <div key={i} className="border border-deposly-border rounded-xl p-6 bg-white">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-deposly-blue/10 text-deposly-blue text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {vp.title}
              </h3>
              <p className="text-sm text-deposly-muted mt-2 leading-relaxed">{vp.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="text-center border-t border-deposly-border pt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Get in Touch</h2>
        <p className="text-deposly-muted mb-4">Interested in Deposly or AI-powered legal tools?</p>
        <a
          href={aboutProfile.links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-deposly-blue text-white rounded-lg text-sm font-medium hover:bg-deposly-blue/90 transition-colors"
        >
          Connect on LinkedIn <ExternalLink size={14} />
        </a>
      </section>
    </div>
  );
}
