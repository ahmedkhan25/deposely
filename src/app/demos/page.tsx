"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import {
  depositionTranscript,
  extractedFacts,
  depoOutline,
  contradictionFlags,
  agentCards,
} from "@/lib/deposly-data";
import { Play, FileSearch, List, AlertTriangle, Bot, Send } from "lucide-react";

const tabs = [
  { id: "extraction", label: "Fact Extraction", icon: FileSearch },
  { id: "qa", label: "Document Q&A", icon: Send },
  { id: "outline", label: "Depo Outline", icon: List },
  { id: "contradiction", label: "Contradiction Detection", icon: AlertTriangle },
  { id: "canvas", label: "Agent Canvas", icon: Bot },
] as const;

const categoryColors: Record<string, string> = {
  testimony: "bg-purple-100 text-purple-700",
  timeline: "bg-blue-100 text-blue-700",
  evidence: "bg-green-100 text-green-700",
  contradiction: "bg-red-100 text-red-700",
};

const severityColors = {
  critical: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
};

const agentStatusColors = {
  active: "bg-deposly-blue",
  complete: "bg-deposly-accent",
  waiting: "bg-deposly-muted",
};

const mockQA = [
  { role: "user" as const, text: "What vital signs were recorded when Dr. Martinez first saw the patient?" },
  {
    role: "assistant" as const,
    text: "When Dr. Martinez first saw the patient at approximately 9:15 PM, the vital signs showed:\n\n• Blood pressure: 85/55 (hypotensive)\n• Heart rate: 118 BPM (tachycardic)\n• Oxygen saturation: 91% (declining)\n\nThese readings indicated significant hemodynamic instability.",
    sources: [
      { doc: "Plaintiff Deposition", page: "p. 14" },
      { doc: "Medical Records", page: "p. 7" },
    ],
  },
];

export default function DemosPage() {
  const [activeTab, setActiveTab] = useState<string>("extraction");
  const [extracted, setExtracted] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <SectionHeader
        title="Interactive Demos"
        badge="Try It"
        subtitle="Explore Deposly's AI capabilities with sample data"
      />

      {/* Tab Bar */}
      <div className="flex gap-1 border border-deposly-border rounded-xl p-1 bg-deposly-gray overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-deposly-muted hover:text-gray-700"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {/* Fact Extraction */}
        {activeTab === "extraction" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-deposly-border rounded-xl bg-white overflow-hidden">
              <div className="p-4 border-b border-deposly-border bg-deposly-gray">
                <h3 className="font-semibold text-gray-900 text-sm">Deposition Transcript</h3>
              </div>
              <div className="p-4 max-h-[500px] overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {depositionTranscript}
                </pre>
              </div>
              <div className="p-4 border-t border-deposly-border">
                <button
                  onClick={() => setExtracted(true)}
                  className="w-full px-4 py-2.5 bg-deposly-blue text-white rounded-lg text-sm font-medium hover:bg-deposly-blue/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Play size={14} /> Extract Facts
                </button>
              </div>
            </div>
            <div className="border border-deposly-border rounded-xl bg-white overflow-hidden">
              <div className="p-4 border-b border-deposly-border bg-deposly-gray">
                <h3 className="font-semibold text-gray-900 text-sm">Extracted Facts</h3>
                {extracted && (
                  <p className="text-xs text-deposly-muted mt-0.5">{extractedFacts.length} facts found</p>
                )}
              </div>
              <div className="divide-y divide-deposly-border max-h-[500px] overflow-y-auto">
                {extracted ? (
                  extractedFacts.map((fact, i) => (
                    <div key={i} className="p-3 flex items-start gap-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0 ${
                          categoryColors[fact.category] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {fact.category}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{fact.text}</p>
                        <span className="text-xs text-deposly-muted">{fact.entity}</span>
                      </div>
                      <span className="text-xs font-mono text-deposly-muted shrink-0">
                        {Math.round(fact.confidence * 100)}%
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-sm text-deposly-muted">
                    Click &quot;Extract Facts&quot; to analyze the transcript
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document Q&A */}
        {activeTab === "qa" && (
          <div className="border border-deposly-border rounded-xl bg-white overflow-hidden">
            <div className="p-4 border-b border-deposly-border bg-deposly-gray">
              <h3 className="font-semibold text-gray-900 text-sm">RAG-Powered Document Q&A</h3>
              <div className="flex items-center gap-2 mt-2 text-xs text-deposly-muted overflow-x-auto pb-1">
                <span className="px-2 py-0.5 bg-white rounded border border-deposly-border">Query</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-white rounded border border-deposly-border">Embed</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-white rounded border border-deposly-border">Vector Search</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-white rounded border border-deposly-border">Rerank</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-deposly-blue/10 text-deposly-blue rounded border border-deposly-blue/20">Generate</span>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
              {mockQA.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-xl p-4 text-sm ${
                      msg.role === "user"
                        ? "bg-deposly-blue text-white"
                        : "bg-deposly-gray text-gray-800 border border-deposly-border"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.role === "assistant" && msg.sources && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-deposly-border">
                        {msg.sources.map((s, j) => (
                          <span key={j} className="px-2 py-0.5 text-[10px] bg-white rounded-full border border-deposly-border text-deposly-muted">
                            {s.doc}, {s.page}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deposition Outline */}
        {activeTab === "outline" && (
          <div className="border border-deposly-border rounded-xl bg-white overflow-hidden">
            <div className="p-4 border-b border-deposly-border bg-deposly-gray">
              <h3 className="font-semibold text-gray-900 text-sm">AI-Generated Deposition Outline</h3>
              <p className="text-xs text-deposly-muted mt-0.5">Johnson v. Metro Hospital — Medical Malpractice</p>
            </div>
            <div className="divide-y divide-deposly-border">
              {depoOutline.map((theme, i) => (
                <div key={i} className="p-5">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-deposly-blue/10 text-deposly-blue text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {theme.theme}
                  </h4>
                  <div className="mt-3 space-y-3 ml-7">
                    {theme.questions.map((q, j) => (
                      <div key={j} className="text-sm">
                        <p className="text-gray-800 font-medium">{q.q}</p>
                        <p className="text-xs text-deposly-muted mt-0.5">
                          <span className="italic">{q.rationale}</span>
                          <span className="mx-1.5">·</span>
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 text-[10px]">{q.source}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contradiction Detection */}
        {activeTab === "contradiction" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-deposly-border rounded-xl bg-white overflow-hidden">
              <div className="p-4 border-b border-deposly-border bg-deposly-gray">
                <h3 className="font-semibold text-gray-900 text-sm">Live Transcript</h3>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {depositionTranscript}
                </pre>
              </div>
            </div>
            <div className="border border-deposly-border rounded-xl bg-white overflow-hidden">
              <div className="p-4 border-b border-deposly-border bg-deposly-gray">
                <h3 className="font-semibold text-gray-900 text-sm">Flagged Contradictions</h3>
                <p className="text-xs text-deposly-muted mt-0.5">{contradictionFlags.length} issues detected</p>
              </div>
              <div className="divide-y divide-deposly-border max-h-[400px] overflow-y-auto">
                {contradictionFlags.map((flag) => (
                  <div key={flag.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${severityColors[flag.severity]}`}>
                        {flag.severity}
                      </span>
                      <span className="text-xs font-mono text-deposly-muted">{Math.round(flag.confidence * 100)}%</span>
                    </div>
                    <div className="p-2.5 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-xs text-gray-600 mb-0.5">Testimony:</p>
                      <p className="text-sm text-gray-800">&ldquo;{flag.testimonyText}&rdquo;</p>
                    </div>
                    <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-600 mb-0.5">Document Evidence:</p>
                      <p className="text-sm text-gray-800">{flag.conflictingText}</p>
                    </div>
                    <p className="text-xs text-deposly-muted">Source: {flag.source}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Agent Canvas */}
        {activeTab === "canvas" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agentCards.map((agent) => (
              <div key={agent.name} className="border border-deposly-border rounded-xl bg-white overflow-hidden">
                <div className="p-4 border-b border-deposly-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className="text-deposly-blue" />
                    <span className="font-semibold text-gray-900 text-sm">{agent.name}</span>
                  </div>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${agentStatusColors[agent.status]} ${agent.status === "active" ? "animate-pulse" : ""}`} />
                    <span className="text-xs text-deposly-muted capitalize">{agent.status}</span>
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {agent.fields.map((field, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-deposly-muted">{field.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
