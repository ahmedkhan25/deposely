"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { documentComparisons, caseTimeline, caseBudget, contradictionFlags } from "@/lib/deposly-data";
import { FileText, Clock, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const badgeColors = {
  red: "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  green: "bg-green-50 text-green-700 border-green-200",
};

const categoryColors: Record<string, string> = {
  timeline: "bg-blue-100 text-blue-700",
  testimony: "bg-purple-100 text-purple-700",
  evidence: "bg-green-100 text-green-700",
  contradiction: "bg-red-100 text-red-700",
};

const severityStyles = {
  critical: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export default function CaseReviewPage() {
  const [selectedDoc, setSelectedDoc] = useState(0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div>
        <SectionHeader
          title="Johnson v. Metro Hospital"
          badge="Case Review"
          subtitle="Medical Malpractice — Delayed Surgical Response"
        />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-deposly-blue/10 text-deposly-blue">
          <FileText size={12} /> 3 Documents Analyzed
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel — Documents (60%) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Document selector tabs */}
          <div className="flex gap-2">
            {documentComparisons.map((doc, i) => (
              <button
                key={i}
                onClick={() => setSelectedDoc(i)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedDoc === i
                    ? "bg-deposly-blue text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {doc.name.split(" — ")[0]}
              </button>
            ))}
          </div>

          {/* Selected Document Card */}
          {documentComparisons.map((doc, i) => (
            selectedDoc === i && (
              <div key={i} className="border border-deposly-border rounded-xl bg-white overflow-hidden">
                <div className="p-5 border-b border-deposly-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                      <p className="text-sm text-deposly-muted mt-1">
                        {doc.factCount} facts extracted &middot; {Math.round(doc.confidence * 100)}% avg confidence
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${badgeColors[doc.badgeColor]}`}>
                      {doc.badge}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-deposly-border">
                  {doc.facts.map((fact, j) => (
                    <div key={j} className="p-4 flex items-start gap-3">
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0 ${categoryColors[fact.category] || "bg-gray-100 text-gray-600"}`}>
                        {fact.category}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{fact.text}</p>
                        <p className="text-xs text-deposly-muted mt-0.5">Source: {fact.source}</p>
                      </div>
                      <div className="shrink-0 w-16">
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-deposly-blue rounded-full h-1.5"
                            style={{ width: `${fact.confidence * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-deposly-muted text-right mt-0.5">{Math.round(fact.confidence * 100)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Right Panel (40%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <div className="border border-deposly-border rounded-xl p-5 bg-white">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-4">
              <Clock size={14} className="text-deposly-blue" /> Timeline
            </h3>
            <div className="space-y-3">
              {caseTimeline.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-deposly-blue mt-1.5" />
                    {i < caseTimeline.length - 1 && <div className="w-px flex-1 bg-deposly-border mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-mono text-deposly-blue font-medium">{t.time}</p>
                    <p className="text-sm text-gray-800">{t.event}</p>
                    <p className="text-[10px] text-deposly-muted">{t.source}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contradictions Summary */}
          <div className="border border-deposly-border rounded-xl p-5 bg-white">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-4">
              <AlertTriangle size={14} className="text-deposly-coral" /> Contradictions
            </h3>
            <div className="space-y-3">
              {contradictionFlags.map((c) => (
                <div key={c.id} className={`p-3 rounded-lg border text-sm ${severityStyles[c.severity]}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium uppercase">{c.severity}</span>
                    <span className="text-xs opacity-70">{Math.round(c.confidence * 100)}%</span>
                  </div>
                  <p className="text-xs leading-relaxed">&ldquo;{c.testimonyText}&rdquo;</p>
                  <p className="text-xs mt-1 opacity-80">vs. {c.source}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="border border-deposly-border rounded-xl p-5 bg-white">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Cost Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={caseBudget} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} width={100} />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Amount"]} />
                <Bar dataKey="amount" fill="#4F6EF7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
