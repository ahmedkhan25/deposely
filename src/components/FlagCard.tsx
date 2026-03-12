"use client";

import { AlertTriangle, X, FileText } from "lucide-react";

interface FlagCardProps {
  testimony: string;
  conflict: string;
  source: string;
  followUp?: string;
  status: string;
  onDismiss?: () => void;
}

export function FlagCard({
  testimony,
  conflict,
  source,
  followUp,
  status,
  onDismiss,
}: FlagCardProps) {
  return (
    <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold">
          <AlertTriangle size={14} />
          Contradiction Detected
          {status === "executing" && (
            <span className="text-xs font-normal text-amber-500 animate-pulse">
              analyzing...
            </span>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Testimony
          </span>
          <p className="text-gray-800 mt-0.5">&ldquo;{testimony}&rdquo;</p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Conflicts with
          </span>
          <p className="text-gray-800 mt-0.5">&ldquo;{conflict}&rdquo;</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
          <FileText size={10} />
          {source}
        </span>
      </div>

      {followUp && (
        <div className="pt-2 border-t border-amber-200">
          <p className="text-xs text-gray-500 mb-1">Suggested follow-up:</p>
          <p className="text-sm text-gray-800 italic">&ldquo;{followUp}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
