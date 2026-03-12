"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Copy, Check } from "lucide-react";

export interface OutlineQuestion {
  question: string;
  rationale: string;
  source: string;
}

export interface OutlineTheme {
  title: string;
  questions: OutlineQuestion[];
}

interface OutlineTreeProps {
  themes: OutlineTheme[];
  status: string;
}

export function OutlineTree({ themes, status }: OutlineTreeProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  const [copied, setCopied] = useState(false);

  function toggle(index: number) {
    const next = new Set(expanded);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setExpanded(next);
  }

  function copyAsMarkdown() {
    const md = themes
      .map(
        (t) =>
          `## ${t.title}\n\n${t.questions
            .map(
              (q, i) =>
                `${i + 1}. **${q.question}**\n   - Rationale: ${q.rationale}\n   - Source: ${q.source}`
            )
            .join("\n\n")}`
      )
      .join("\n\n---\n\n");

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (themes.length === 0 && status === "executing") {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="ml-6 space-y-1.5">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">
          Deposition Outline
          {status === "executing" && (
            <span className="ml-2 text-xs text-amber-600 font-normal">
              generating...
            </span>
          )}
        </h3>
        <button
          onClick={copyAsMarkdown}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-white transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy as Markdown"}
        </button>
      </div>

      {/* Themes */}
      <div className="divide-y divide-gray-100">
        {themes.map((theme, ti) => (
          <div key={ti}>
            <button
              onClick={() => toggle(ti)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              {expanded.has(ti) ? (
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              ) : (
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              )}
              <span className="text-sm font-medium text-gray-900">
                {theme.title}
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {theme.questions?.length || 0} questions
              </span>
            </button>

            {expanded.has(ti) && theme.questions && (
              <div className="pb-3 pl-10 pr-4 space-y-3">
                {theme.questions.map((q, qi) => (
                  <div key={qi} className="group">
                    <p className="text-sm text-gray-800">{q.question}</p>
                    <div className="mt-1 flex items-start gap-3">
                      <p className="text-xs text-gray-500 italic">
                        {q.rationale}
                      </p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-full shrink-0">
                        <FileText size={10} />
                        {q.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skeleton for streaming theme */}
            {expanded.has(ti) &&
              status === "executing" &&
              (!theme.questions || theme.questions.length === 0) && (
                <div className="pb-3 pl-10 pr-4 space-y-2">
                  <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
