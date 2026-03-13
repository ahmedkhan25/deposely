"use client";

import { useState, useEffect } from "react";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { ListTree, Sparkles } from "lucide-react";
import { OutlineTree, type OutlineTheme } from "@/components/OutlineTree";

interface PrepOutlineTabProps {
  caseId: string;
}

export function PrepOutlineTab({ caseId }: PrepOutlineTabProps) {
  const [generatedOutline, setGeneratedOutline] = useState<OutlineTheme[]>([]);
  const [docExcerpts, setDocExcerpts] = useState<
    Array<{ content: string; documentFilename: string; chunkIndex: number }>
  >([]);

  // Fetch top 40 chunks for context
  useEffect(() => {
    fetch(`/api/cases/${caseId}/chunks?limit=40`)
      .then((r) => r.json())
      .then((data) => setDocExcerpts(data.chunks))
      .catch(console.error);
  }, [caseId]);

  // Feed doc excerpts into agent context
  useCopilotReadable({
    description: "Case document excerpts for outline generation",
    value: docExcerpts.map((c) => ({
      source: c.documentFilename,
      chunk: c.chunkIndex,
      text: c.content,
    })),
  });

  // System prompt for outline generation
  useCopilotReadable({
    description: "Instructions for deposition outline generation",
    value: `You are a legal AI assistant specialized in deposition preparation.
When asked to generate an outline, analyze the case document excerpts and create a structured deposition outline.
You MUST call render_deposition_outline with properly structured JSON containing themes and questions.
Each theme should have a clear title and 3-5 targeted questions with rationale and source document references.
Focus on: key facts to establish, potential contradictions to explore, timeline gaps, and witness credibility.`,
  });

  // Frontend tool: render the outline as a React component
  useCopilotAction({
    name: "render_deposition_outline",
    description:
      "Render a structured deposition preparation outline as an interactive UI component",
    parameters: [
      {
        name: "themes",
        type: "object[]",
        description: "Array of deposition themes with questions",
        attributes: [
          { name: "title", type: "string", description: "Theme title" },
          {
            name: "questions",
            type: "object[]",
            description: "Questions for this theme",
            attributes: [
              { name: "question", type: "string", description: "The deposition question" },
              { name: "rationale", type: "string", description: "Why this question matters" },
              { name: "source", type: "string", description: "Source document filename" },
            ],
          },
        ],
      },
    ],
    handler: async ({ themes }) => {
      setGeneratedOutline(themes);
      return { success: true, themeCount: themes.length };
    },
    render: ({ status, args }) => (
      <OutlineTree themes={args.themes ?? []} status={status} />
    ),
  });

  function handleGenerate() {
    // Programmatically send a message to the CopilotChat
    const input = document.querySelector<HTMLTextAreaElement>('.copilotKitInput textarea');
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set;
      nativeInputValueSetter?.call(input, 'Generate a comprehensive deposition outline for this case based on all uploaded documents');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => {
        const form = input.closest('form');
        form?.requestSubmit();
      }, 100);
    }
  }

  return (
    <div className="space-y-4">
      {/* Generate button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {docExcerpts.length > 0
            ? `${docExcerpts.length} excerpts from your documents loaded for analysis`
            : "Loading document excerpts..."}
        </p>
        <button
          onClick={handleGenerate}
          disabled={docExcerpts.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4F6EF7] rounded-lg hover:bg-[#3d5ce0] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={16} />
          Generate Outline
        </button>
      </div>

      {/* Chat with outline rendering */}
      <div className="h-[600px] border border-gray-200 rounded-xl overflow-hidden">
        <CopilotChat
          labels={{
            title: "Prep Outline Generator",
            initial:
              'I\'m ready to generate a deposition outline. Click "Generate Outline" or ask me to create one based on the case documents.',
          }}
          className="h-full"
          instructions='When the user asks to generate an outline, analyze the case document excerpts and call render_deposition_outline with structured themes and questions. Each theme should have 3-5 questions with rationale and source.'
        />
      </div>

      {/* Persistent outline below chat if generated */}
      {generatedOutline.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ListTree size={16} className="text-[#4F6EF7]" />
            <h3 className="text-sm font-semibold text-gray-700">
              Saved Outline ({generatedOutline.length} themes)
            </h3>
          </div>
          <OutlineTree themes={generatedOutline} status="complete" />
        </div>
      )}
    </div>
  );
}
