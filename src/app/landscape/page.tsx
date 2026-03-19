"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import {
  landscapeStats,
  protocolLayers,
  frameworkComparison,
  legalLLMTiers,
  legalLLMCallouts,
  embeddingInsight,
  glmOcrHighlights,
  marketData,
} from "@/lib/deposly-data";
import { ChevronDown, ChevronUp, AlertTriangle, Zap, Database } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function ExpandableCard({ title, subtitle, description, details }: { title: string; subtitle: string; description: string; details: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-deposly-border rounded-xl bg-white overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left p-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-deposly-blue">{title}</span>
            <span className="text-xs text-deposly-muted">— {subtitle}</span>
          </div>
          <p className="text-sm text-gray-700 mt-1">{description}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-deposly-muted shrink-0 mt-1" /> : <ChevronDown size={16} className="text-deposly-muted shrink-0 mt-1" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0">
          <ul className="space-y-1.5">
            {details.map((d, i) => (
              <li key={i} className="text-sm text-deposly-muted flex items-start gap-2">
                <span className="text-deposly-blue mt-0.5">•</span> {d}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function LandscapePage() {
  const [glmOpen, setGlmOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
      {/* Stat Cards */}
      <section>
        <SectionHeader title="Legal AI Landscape" badge="AI Engineering" subtitle="The state of AI in legal — by the numbers" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {landscapeStats.map((s, i) => (
            <div key={i} className="border border-deposly-border rounded-xl p-6 bg-white text-center">
              <div className="text-3xl font-bold text-deposly-blue">
                <AnimatedCounter target={s.target} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <p className="text-sm font-medium text-gray-900 mt-2">{s.label}</p>
              <p className="text-xs text-deposly-muted mt-1">{s.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agent Protocol Stack */}
      <section>
        <SectionHeader title="Agent Protocol Stack" subtitle="Three layers powering AI-native deposition workflows" />
        <div className="space-y-3">
          {protocolLayers.map((p) => (
            <ExpandableCard key={p.name} title={p.name} subtitle={p.subtitle} description={p.description} details={p.details} />
          ))}
        </div>
      </section>

      {/* Framework Comparison */}
      <section>
        <SectionHeader title="Agent Framework Comparison" />
        <div className="border border-deposly-border rounded-xl overflow-x-auto bg-white">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-deposly-border bg-deposly-gray">
                <th className="text-left p-3 font-medium text-gray-700">Framework</th>
                <th className="text-left p-3 font-medium text-gray-700">Type</th>
                <th className="text-left p-3 font-medium text-gray-700">Strengths</th>
                <th className="text-left p-3 font-medium text-gray-700">Legal Use Case</th>
              </tr>
            </thead>
            <tbody>
              {frameworkComparison.map((f) => (
                <tr key={f.name} className={`border-b border-deposly-border last:border-0 ${f.highlight ? "bg-deposly-blue/5" : ""}`}>
                  <td className="p-3 font-medium text-gray-900">
                    {f.name}
                    {f.highlight && (
                      <span className="ml-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-deposly-blue text-white">
                        Current Stack
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-deposly-muted">{f.type}</td>
                  <td className="p-3 text-gray-700">{f.strengths}</td>
                  <td className="p-3 text-gray-700">{f.legal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* LLM Selection */}
      <section>
        <SectionHeader title="LLM Selection for Legal AI" subtitle="Key takeaways from LegalBench evaluation" />
        <div className="space-y-3 mb-6">
          {legalLLMCallouts.map((c, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-800">{c}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {legalLLMTiers.map((t) => (
            <div key={t.tier} className="border border-deposly-border rounded-xl p-5 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-deposly-blue">{t.tier} Tier</span>
              <p className="font-semibold text-gray-900 mt-1">{t.models}</p>
              <p className="text-xs text-deposly-muted mt-2 leading-relaxed">{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Embedding Models */}
      <section>
        <SectionHeader title="Embedding Models — General vs Legal Performance" />
        <div className="border border-deposly-border rounded-xl p-6 bg-white mb-4">
          <h3 className="font-semibold text-gray-900 text-lg">{embeddingInsight.headline}</h3>
          <p className="text-sm text-gray-700 mt-2 leading-relaxed">{embeddingInsight.body}</p>
          <div className="mt-4 p-3 bg-deposly-blue/5 rounded-lg border border-deposly-blue/20">
            <p className="text-sm text-deposly-blue font-medium flex items-center gap-2">
              <Database size={14} /> {embeddingInsight.callout}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {embeddingInsight.models.map((m) => (
            <div key={m.name} className="border border-deposly-border rounded-lg p-4 bg-white flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                <p className="text-xs text-deposly-muted mt-0.5">{m.focus}</p>
              </div>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{m.rank}</span>
            </div>
          ))}
        </div>
      </section>

      {/* GLM-OCR */}
      <section>
        <SectionHeader title="Emerging Tech" badge="Research" />
        <div className="border border-deposly-border rounded-xl bg-white overflow-hidden">
          <button onClick={() => setGlmOpen(!glmOpen)} className="w-full text-left p-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{glmOcrHighlights.name}</span>
                <span className="text-xs text-deposly-muted">— {glmOcrHighlights.tagline}</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {glmOcrHighlights.specs.map((s) => (
                  <span key={s.label} className="text-xs">
                    <span className="text-deposly-muted">{s.label}:</span>{" "}
                    <span className="font-medium text-gray-900">{s.value}</span>
                  </span>
                ))}
              </div>
            </div>
            {glmOpen ? <ChevronUp size={16} className="text-deposly-muted shrink-0 mt-1" /> : <ChevronDown size={16} className="text-deposly-muted shrink-0 mt-1" />}
          </button>
          {glmOpen && (
            <div className="px-5 pb-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-deposly-muted mb-2">Key Innovations</h4>
                <ul className="space-y-1.5">
                  {glmOcrHighlights.keyPoints.map((p, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <Zap size={12} className="text-deposly-blue shrink-0 mt-1" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-deposly-muted mb-2">Legal Relevance</h4>
                <ul className="space-y-1.5">
                  {glmOcrHighlights.legalRelevance.map((r, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-deposly-accent">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-deposly-muted mb-2">Deployment Options</h4>
                <div className="flex flex-wrap gap-2">
                  {glmOcrHighlights.deployment.map((d) => (
                    <span key={d} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Market Growth Chart */}
      <section>
        <SectionHeader title="Legal AI Market Growth" subtitle="Projected market size ($B), 2023–2028" />
        <div className="border border-deposly-border rounded-xl p-6 bg-white">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={marketData}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F6EF7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F6EF7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} tickFormatter={(v) => `$${v}B`} />
              <Tooltip formatter={(v) => [`$${v}B`, "Market Size"]} />
              <Area type="monotone" dataKey="value" stroke="#4F6EF7" strokeWidth={2} fill="url(#blueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
