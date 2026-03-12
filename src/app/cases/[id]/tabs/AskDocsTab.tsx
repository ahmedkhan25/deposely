"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { Search, FileText } from "lucide-react";

interface AskDocsTabProps {
  caseId: string;
}

export function AskDocsTab({ caseId }: AskDocsTabProps) {
  // System prompt for the legal AI assistant
  useCopilotReadable({
    description: "Instructions for the legal AI assistant",
    value: `You are a legal AI assistant helping an attorney prepare for depositions.
    Always call search_case_documents before answering any question.
    Cite sources using the document filename and chunk index provided by search results.
    If the answer is not in the documents, say so explicitly.
    Never fabricate case facts.`,
  });

  // RAG action: search case documents
  useCopilotAction({
    name: "search_case_documents",
    description:
      "Search the case documents to answer a legal question. Always call this before answering.",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "The question to search for",
      },
    ],
    handler: async ({ query }) => {
      const res = await fetch(`/api/cases/${caseId}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const { chunks } = await res.json();
      return chunks.map(
        (c: {
          content: string;
          documentFilename: string;
          chunkIndex: number;
        }) => ({
          content: c.content,
          source: c.documentFilename,
          chunkIndex: c.chunkIndex,
        })
      );
    },
    render: ({ status, args, result }) => {
      if (status === "executing") {
        return (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
            <Search size={14} className="animate-pulse" />
            Searching for &ldquo;{args.query}&rdquo;...
          </div>
        );
      }
      if (status === "complete" && result?.length > 0) {
        return (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {result.map(
              (
                source: { source: string; chunkIndex: number },
                i: number
              ) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-full"
                >
                  <FileText size={10} />
                  {source.source} §{source.chunkIndex}
                </span>
              )
            )}
          </div>
        );
      }
      return <></>;
    },
  });

  return (
    <div className="h-[600px] border border-gray-200 rounded-xl overflow-hidden">
      <CopilotChat
        labels={{
          title: "Ask Case Documents",
          initial:
            "What would you like to know about this case? I'll search the uploaded documents.",
        }}
        className="h-full"
      />
    </div>
  );
}
