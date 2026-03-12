"use client";

import { useState } from "react";
import type { OutlineTheme } from "./OutlineTree";

interface OutlineTrackerProps {
  themes: OutlineTheme[];
}

export function OutlineTracker({ themes }: OutlineTrackerProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    const next = new Set(checked);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setChecked(next);
  }

  const totalQuestions = themes.reduce(
    (sum, t) => sum + (t.questions?.length || 0),
    0
  );
  const coveredCount = checked.size;

  if (themes.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-xs">
        Generate an outline in Prep Outline tab first
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Outline Tracker
        </h4>
        <span className="text-xs text-gray-400">
          {coveredCount}/{totalQuestions} covered
        </span>
      </div>
      <div className="space-y-2">
        {themes.map((theme, ti) => (
          <div key={ti}>
            <p className="text-xs font-medium text-gray-700 mb-1">
              {theme.title}
            </p>
            <div className="space-y-1 ml-2">
              {theme.questions?.map((q, qi) => {
                const key = `${ti}-${qi}`;
                return (
                  <label
                    key={key}
                    className="flex items-start gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked.has(key)}
                      onChange={() => toggle(key)}
                      className="mt-0.5 rounded border-gray-300 text-[#4F6EF7] focus:ring-[#4F6EF7]"
                    />
                    <span
                      className={`text-xs ${
                        checked.has(key)
                          ? "text-gray-400 line-through"
                          : "text-gray-700"
                      }`}
                    >
                      {q.question}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
