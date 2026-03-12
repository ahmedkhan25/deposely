"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import {
  Radio,
  Square,
  Download,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { clsx } from "clsx";
import { FlagCard } from "@/components/FlagCard";
import { FollowUpSuggestion } from "@/components/FollowUpSuggestion";
import { OutlineTracker } from "@/components/OutlineTracker";
import type { OutlineTheme } from "@/components/OutlineTree";

interface Segment {
  speaker: string;
  text: string;
  start_ms: number;
}

interface Flag {
  id: string;
  testimonyText: string;
  conflictingText: string;
  sourceDoc: string;
  dismissed: boolean;
}

interface DepoData {
  id: string;
  caseId: string;
  title: string;
  status: string;
  transcript: Segment[];
  summary: string | null;
  flags: Flag[];
  createdAt: string;
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function DepositionPage() {
  const { id } = useParams<{ id: string }>();
  const [depo, setDepo] = useState<DepoData | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "live" | "ended"
  >("connecting");
  const [questionQueue, setQuestionQueue] = useState<string[]>([]);
  const [outline] = useState<OutlineTheme[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Fetch deposition data
  const fetchDepo = useCallback(async () => {
    const res = await fetch(`/api/depositions/${id}`);
    if (res.ok) {
      const data: DepoData = await res.json();
      setDepo(data);
      setSegments(data.transcript || []);
      setFlags(data.flags || []);
    }
  }, [id]);

  useEffect(() => {
    fetchDepo();
  }, [fetchDepo]);

  // SSE connection for live updates
  useEffect(() => {
    if (!depo || depo.status === "done") {
      setConnectionStatus("ended");
      return;
    }

    const renderUrl = process.env.NEXT_PUBLIC_RENDER_WEBHOOK_URL || "";
    if (!renderUrl) {
      setConnectionStatus("ended");
      return;
    }

    const es = new EventSource(`${renderUrl}/stream/${id}`);

    es.onopen = () => setConnectionStatus("live");
    es.onerror = () => setConnectionStatus("connecting");

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "connected") {
        setConnectionStatus("live");
      } else if (data.type === "transcript") {
        setSegments((prev) => [...prev, data.segment]);
      } else if (data.type === "flag") {
        setFlags((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            testimonyText: data.flag.testimonyText,
            conflictingText: data.flag.conflictingText,
            sourceDoc: data.flag.sourceDoc,
            dismissed: false,
          },
        ]);
      } else if (data.type === "done") {
        setConnectionStatus("ended");
        fetchDepo();
      }
    };

    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depo?.status, id, fetchDepo]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [segments]);

  // Feed live state into CopilotKit
  useCopilotReadable({
    description: "Live deposition state",
    value: depo
      ? {
          depositionId: depo.id,
          status: depo.status,
          segmentCount: segments.length,
          recentTestimony: segments
            .slice(-5)
            .map((s) => `${s.speaker}: ${s.text}`)
            .join("\n"),
          openFlags: flags.filter((f) => !f.dismissed).length,
          outlineCoverage: `${0} of ${outline.reduce(
            (s, t) => s + (t.questions?.length || 0),
            0
          )} questions addressed`,
        }
      : null,
  });

  // CopilotKit action: surface contradiction flag
  useCopilotAction({
    name: "surface_contradiction_flag",
    description:
      "Display a contradiction between testimony and case documents",
    parameters: [
      { name: "testimonyText", type: "string", description: "The testimony" },
      {
        name: "conflictingText",
        type: "string",
        description: "The conflicting document text",
      },
      { name: "sourceDoc", type: "string", description: "Source document" },
      { name: "flagId", type: "string", description: "Flag ID" },
      {
        name: "suggestedFollowUp",
        type: "string",
        description: "A suggested follow-up question",
      },
    ],
    render: ({ status, args }) => (
      <FlagCard
        testimony={args.testimonyText ?? ""}
        conflict={args.conflictingText ?? ""}
        source={args.sourceDoc ?? ""}
        followUp={args.suggestedFollowUp}
        status={status}
        onDismiss={() => dismissFlag(args.flagId ?? "")}
      />
    ),
    handler: async ({ flagId }) => {
      if (flagId) {
        await fetch(`/api/flags/${flagId}/acknowledge`, { method: "POST" });
      }
      return { acknowledged: true };
    },
  });

  // CopilotKit action: suggest follow-up question
  useCopilotAction({
    name: "suggest_followup_question",
    description: "Suggest a follow-up question for attorney review",
    parameters: [
      { name: "question", type: "string", description: "The question" },
      { name: "rationale", type: "string", description: "Why this question" },
    ],
    render: ({ args, status }) => (
      <FollowUpSuggestion
        question={args.question ?? ""}
        rationale={args.rationale ?? ""}
        isLoading={status === "executing"}
      />
    ),
    handler: async ({ question }) => {
      if (question) {
        setQuestionQueue((prev) => [...prev, question]);
      }
      return { queued: true };
    },
  });

  // CopilotKit action: search transcript (Phase 7)
  useCopilotAction({
    name: "search_deposition_transcript",
    description: "Search the deposition transcript for specific testimony",
    parameters: [
      { name: "query", type: "string", description: "Search query" },
    ],
    handler: async ({ query }) => {
      const matches = segments.filter((s) =>
        s.text.toLowerCase().includes(query.toLowerCase())
      );
      return matches.slice(0, 5);
    },
    render: ({ status, result }) => {
      if (status === "complete" && result?.length > 0) {
        return (
          <div className="space-y-1 text-sm">
            {result.map(
              (
                seg: { speaker: string; text: string; start_ms: number },
                i: number
              ) => (
                <div key={i} className="p-2 bg-gray-50 rounded text-xs">
                  <span className="text-gray-400">
                    [{formatMs(seg.start_ms)}]
                  </span>{" "}
                  <span className="font-medium">{seg.speaker}:</span>{" "}
                  {seg.text}
                </div>
              )
            )}
          </div>
        );
      }
      return <></>;
    },
  });

  function dismissFlag(flagId: string) {
    setFlags((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, dismissed: true } : f))
    );
    if (flagId) {
      fetch(`/api/flags/${flagId}/acknowledge`, { method: "POST" });
    }
  }

  if (!depo) {
    return (
      <div className="p-8">
        <div className="h-8 w-64 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="h-96 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  // ─── Post-deposition review (Phase 7) ──────────────────────────
  if (depo.status === "done") {
    return <PostDepoReview depo={depo} segments={segments} flags={flags} />;
  }

  // ─── Live deposition view (Phase 6) ───────────────────────────
  return (
    <div className="flex h-screen">
      {/* LEFT: Transcript + Chat */}
      <div className="flex-[3] flex flex-col border-r border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {depo.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={clsx(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full",
                  connectionStatus === "live"
                    ? "text-green-700 bg-green-50"
                    : connectionStatus === "connecting"
                    ? "text-amber-700 bg-amber-50"
                    : "text-gray-500 bg-gray-100"
                )}
              >
                <span
                  className={clsx(
                    "w-1.5 h-1.5 rounded-full",
                    connectionStatus === "live"
                      ? "bg-green-500 animate-pulse"
                      : connectionStatus === "connecting"
                      ? "bg-amber-500 animate-pulse"
                      : "bg-gray-400"
                  )}
                />
                {connectionStatus}
              </span>
              <span className="text-xs text-gray-400">
                {segments.length} segments
              </span>
            </div>
          </div>
          <button
            onClick={async () => {
              await fetch(`/api/depositions/${id}/stop`, { method: "POST" });
              fetchDepo();
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
          >
            <Square size={14} />
            End
          </button>
        </div>

        {/* Transcript feed */}
        <div
          ref={transcriptRef}
          className="flex-1 overflow-y-auto p-4 space-y-2"
        >
          {segments.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              <Radio className="mx-auto mb-3 animate-pulse" size={24} />
              Waiting for transcript...
            </div>
          ) : (
            segments.map((seg, i) => (
              <div key={i} className="group flex gap-2 text-sm">
                <span
                  className="text-xs text-gray-400 pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  title={formatMs(seg.start_ms)}
                >
                  {formatMs(seg.start_ms)}
                </span>
                <div>
                  <span className="font-medium text-gray-700">
                    [{seg.speaker}]
                  </span>{" "}
                  <span className="text-gray-800">{seg.text}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Question queue */}
        {questionQueue.length > 0 && (
          <div className="border-t border-gray-200 p-3 bg-blue-50">
            <p className="text-xs font-semibold text-blue-700 mb-1">
              Question Queue ({questionQueue.length})
            </p>
            {questionQueue.map((q, i) => (
              <p key={i} className="text-xs text-blue-800 ml-2">
                {i + 1}. {q}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Flags + Outline + Chat sidebar */}
      <div className="flex-[2] flex flex-col">
        {/* Flags panel */}
        <div className="flex-1 overflow-y-auto p-4 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <AlertTriangle size={12} />
            Contradiction Flags ({flags.filter((f) => !f.dismissed).length})
          </h3>
          {flags.filter((f) => !f.dismissed).length === 0 ? (
            <p className="text-xs text-gray-400">No flags yet</p>
          ) : (
            <div className="space-y-3">
              {flags
                .filter((f) => !f.dismissed)
                .map((f) => (
                  <FlagCard
                    key={f.id}
                    testimony={f.testimonyText}
                    conflict={f.conflictingText}
                    source={f.sourceDoc || "Unknown"}
                    status="complete"
                    onDismiss={() => dismissFlag(f.id)}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Outline tracker */}
        <div className="p-4 border-b border-gray-200 max-h-64 overflow-y-auto">
          <OutlineTracker themes={outline} />
        </div>

        {/* AI Second Chair chat */}
        <div className="flex-1 min-h-[300px]">
          <CopilotChat
            labels={{
              title: "AI Second Chair",
              initial:
                "I'm monitoring the testimony. I'll flag contradictions in real time.",
            }}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Post-Deposition Review Component (Phase 7) ─────────────────

function PostDepoReview({
  depo,
  segments,
  flags,
}: {
  depo: DepoData;
  segments: Segment[];
  flags: Flag[];
}) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [summary, setSummary] = useState<{
    key_admissions?: Array<{ timestamp: string; text: string }>;
    contradictions?: Array<{
      testimony: string;
      document: string;
      source: string;
    }>;
    narrative?: string;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Parse existing summary or trigger generation
  useEffect(() => {
    if (depo.summary) {
      try {
        setSummary(JSON.parse(depo.summary));
      } catch {
        setSummary({ narrative: depo.summary });
      }
    } else {
      setSummaryLoading(true);
      fetch(`/api/depositions/${depo.id}/summarize`, { method: "POST" })
        .then((r) => r.json())
        .then((data) => {
          try {
            setSummary(JSON.parse(data.summary));
          } catch {
            setSummary({ narrative: data.summary });
          }
        })
        .catch(console.error)
        .finally(() => setSummaryLoading(false));
    }
  }, [depo.id, depo.summary]);

  function exportSummary() {
    const parts: string[] = [
      `DEPOSITION SUMMARY: ${depo.title}`,
      `Date: ${new Date(depo.createdAt).toLocaleDateString()}`,
      "",
    ];

    if (summary?.key_admissions?.length) {
      parts.push("KEY ADMISSIONS");
      parts.push("-".repeat(40));
      summary.key_admissions.forEach((a) =>
        parts.push(`[${a.timestamp}] ${a.text}`)
      );
      parts.push("");
    }

    if (summary?.contradictions?.length) {
      parts.push("CONTRADICTIONS FOUND");
      parts.push("-".repeat(40));
      summary.contradictions.forEach((c) =>
        parts.push(
          `Testimony: "${c.testimony}"\nConflicts with (${c.source}): "${c.document}"\n`
        )
      );
    }

    if (summary?.narrative) {
      parts.push("NARRATIVE SUMMARY");
      parts.push("-".repeat(40));
      parts.push(summary.narrative);
      parts.push("");
    }

    parts.push("FULL TRANSCRIPT");
    parts.push("-".repeat(40));
    segments.forEach((s) =>
      parts.push(`[${formatMs(s.start_ms)}] ${s.speaker}: ${s.text}`)
    );

    const blob = new Blob([parts.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${depo.title.replace(/\s+/g, "-").toLowerCase()}-summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-screen">
      {/* Main content */}
      <div className="flex-[3] overflow-y-auto">
        <div className="p-8 max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {depo.title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Completed {new Date(depo.createdAt).toLocaleDateString()} ·{" "}
                {segments.length} segments
              </p>
            </div>
            <button
              onClick={exportSummary}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#4F6EF7] border border-[#4F6EF7] rounded-lg hover:bg-[#4F6EF7]/5"
            >
              <Download size={16} />
              Export
            </button>
          </div>

          {/* Summary */}
          {summaryLoading ? (
            <div className="space-y-4">
              <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
              <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
            </div>
          ) : summary ? (
            <>
              {/* Key Admissions */}
              {summary.key_admissions && summary.key_admissions.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Key Admissions
                  </h2>
                  <div className="space-y-2">
                    {summary.key_admissions.map((a, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 bg-white border border-gray-200 rounded-xl"
                      >
                        <span className="text-xs text-gray-400 font-mono shrink-0 pt-0.5">
                          {a.timestamp}
                        </span>
                        <p className="text-sm text-gray-800">{a.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Narrative */}
              {summary.narrative && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Narrative Summary
                  </h2>
                  <div className="p-4 bg-white border border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {summary.narrative}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Contradiction Report */}
          {flags.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Contradiction Report ({flags.length})
              </h2>
              <div className="space-y-3">
                {flags.map((f) => (
                  <div
                    key={f.id}
                    className="border-l-4 border-red-400 bg-white border border-gray-200 rounded-r-xl p-4"
                  >
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          Testimony
                        </span>
                        <p className="text-gray-800 mt-0.5">
                          &ldquo;{f.testimonyText}&rdquo;
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          Conflicts with
                        </span>
                        <p className="text-gray-800 mt-0.5">
                          &ldquo;{f.conflictingText}&rdquo;
                        </p>
                        {f.sourceDoc && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs text-amber-700 bg-amber-50 rounded-full">
                            {f.sourceDoc}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Transcript */}
          <div>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <ChevronDown
                size={16}
                className={clsx(
                  "transition-transform",
                  !showTranscript && "-rotate-90"
                )}
              />
              Full Transcript ({segments.length} segments)
            </button>
            {showTranscript && (
              <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl max-h-96 overflow-y-auto space-y-1">
                {segments.map((seg, i) => (
                  <div key={i} className="text-sm flex gap-2">
                    <span className="text-xs text-gray-400 font-mono shrink-0 pt-0.5">
                      {formatMs(seg.start_ms)}
                    </span>
                    <div>
                      <span className="font-medium text-gray-600">
                        {seg.speaker}:
                      </span>{" "}
                      <span className="text-gray-800">{seg.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat sidebar */}
      <div className="flex-[1] border-l border-gray-200 min-w-[320px]">
        <CopilotChat
          labels={{
            title: "Review Assistant",
            initial:
              "The deposition is complete. Ask me anything about the testimony.",
          }}
          className="h-full"
        />
      </div>
    </div>
  );
}
