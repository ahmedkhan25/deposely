"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import {
  competitors,
  featureColumns,
  competitorDeepDive,
  integrationOpportunities,
  seoKeywords,
} from "@/lib/deposly-data";
import { ChevronDown, ChevronUp, Check, X, Search, Plug } from "lucide-react";

export default function CompetitivePage() {
  const [expandedComp, setExpandedComp] = useState<number | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
      {/* Feature Comparison Matrix */}
      <section>
        <SectionHeader
          title="Competitive Landscape"
          badge="Market"
          subtitle="Feature comparison across AI deposition tools"
        />
        <div className="border border-deposly-border rounded-xl overflow-x-auto bg-white">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-deposly-border bg-deposly-gray">
                <th className="text-left p-3 font-medium text-gray-700 sticky left-0 bg-deposly-gray">Tool</th>
                {featureColumns.map((f) => (
                  <th key={f.key} className="text-center p-3 font-medium text-gray-700 whitespace-nowrap text-xs">
                    {f.label}
                  </th>
                ))}
                <th className="text-center p-3 font-medium text-gray-700">Pricing</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c) => (
                <tr
                  key={c.name}
                  className={`border-b border-deposly-border last:border-0 ${c.highlight ? "bg-deposly-blue/5" : ""}`}
                >
                  <td className={`p-3 font-medium text-gray-900 sticky left-0 ${c.highlight ? "bg-deposly-blue/5" : "bg-white"}`}>
                    <div className="flex items-center gap-2">
                      {c.name}
                      {c.badges.map((b) => (
                        <span key={b} className="px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-deposly-blue text-white whitespace-nowrap">
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>
                  {featureColumns.map((f) => (
                    <td key={f.key} className="text-center p-3">
                      {(c.features as Record<string, boolean>)[f.key] ? (
                        <Check size={14} className="text-deposly-accent mx-auto" />
                      ) : (
                        <X size={14} className="text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                  <td className="text-center p-3 text-xs text-deposly-muted whitespace-nowrap">{c.pricing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Competitor Deep-Dive */}
      <section>
        <SectionHeader title="Competitor Deep-Dive" subtitle="Detailed analysis of key competitors" />
        <div className="space-y-3">
          {competitorDeepDive.map((c, i) => (
            <div key={i} className="border border-deposly-border rounded-xl bg-white overflow-hidden">
              <button
                onClick={() => setExpandedComp(expandedComp === i ? null : i)}
                className="w-full text-left p-5 flex items-center justify-between gap-4"
              >
                <span className="font-semibold text-gray-900">{c.name}</span>
                {expandedComp === i ? (
                  <ChevronUp size={16} className="text-deposly-muted" />
                ) : (
                  <ChevronDown size={16} className="text-deposly-muted" />
                )}
              </button>
              {expandedComp === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-gray-700 leading-relaxed">{c.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Deposly Differentiation */}
      <section>
        <SectionHeader title="Deposly's Differentiation" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: "Full Pipeline", desc: "Other tools do transcription OR analysis OR summaries — Deposly does all three in one platform." },
            { title: "AI-Native Architecture", desc: "RAG + live agents vs bolt-on AI features. Built from the ground up for AI-powered workflows." },
            { title: "Open Architecture", desc: "MCP connectors, API-first design, Claude Code integration potential. No vendor lock-in." },
            { title: "Privacy-First", desc: "Run embedding models (Kanon 2) and OCR (GLM-OCR) locally. Sensitive data never leaves the firm." },
          ].map((d, i) => (
            <div key={i} className="border border-deposly-border rounded-xl p-5 bg-white">
              <h3 className="font-semibold text-gray-900 text-sm">{d.title}</h3>
              <p className="text-sm text-deposly-muted mt-1 leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integration Opportunities */}
      <section>
        <SectionHeader title="Integration Opportunities" subtitle="MCP servers, APIs, and partner ecosystems" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrationOpportunities.map((cat) => (
            <div key={cat.category} className="border border-deposly-border rounded-xl p-5 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Plug size={14} className="text-deposly-blue" />
                <span className="font-semibold text-gray-900 text-sm">{cat.category}</span>
              </div>
              <ul className="space-y-1.5">
                {cat.items.map((item, j) => (
                  <li key={j} className="text-sm text-deposly-muted flex items-start gap-2">
                    <span className="text-deposly-blue mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* AI SEO Strategy */}
      <section>
        <SectionHeader title="AI SEO Strategy" badge="Growth" subtitle="Target keywords and content strategy for AI search visibility" />
        <div className="border border-deposly-border rounded-xl overflow-hidden bg-white mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-deposly-border bg-deposly-gray">
                <th className="text-left p-3 font-medium text-gray-700">Keyword</th>
                <th className="text-left p-3 font-medium text-gray-700">Volume</th>
                <th className="text-left p-3 font-medium text-gray-700">Difficulty</th>
                <th className="text-left p-3 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {seoKeywords.map((kw) => (
                <tr key={kw.keyword} className="border-b border-deposly-border last:border-0">
                  <td className="p-3 font-medium text-gray-900 flex items-center gap-2">
                    <Search size={12} className="text-deposly-muted" /> {kw.keyword}
                  </td>
                  <td className="p-3 text-deposly-muted">{kw.volume}</td>
                  <td className="p-3 text-deposly-muted">{kw.difficulty}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        kw.status === "Target"
                          ? "bg-deposly-blue/10 text-deposly-blue"
                          : "bg-deposly-accent/10 text-deposly-accent"
                      }`}
                    >
                      {kw.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-gray-800">
            <strong>Key insight:</strong> Google AI Overview for &quot;AI deposition tools&quot; doesn&apos;t mention Deposly yet — need structured data, technical content, and backlinks from legal tech publications (LawSites, Above the Law, Legaltech News).
          </p>
        </div>
      </section>
    </div>
  );
}
