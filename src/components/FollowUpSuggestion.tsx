"use client";

import { MessageCircle } from "lucide-react";

interface FollowUpSuggestionProps {
  question: string;
  rationale: string;
  isLoading: boolean;
}

export function FollowUpSuggestion({
  question,
  rationale,
  isLoading,
}: FollowUpSuggestionProps) {
  return (
    <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 text-blue-700 text-sm font-semibold">
        <MessageCircle size={14} />
        Suggested Follow-up
        {isLoading && (
          <span className="text-xs font-normal text-blue-400 animate-pulse">
            processing...
          </span>
        )}
      </div>
      <p className="text-sm text-gray-800">&ldquo;{question}&rdquo;</p>
      <p className="text-xs text-gray-500 italic">{rationale}</p>
    </div>
  );
}
