"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Video, X } from "lucide-react";
import { clsx } from "clsx";

interface Deposition {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface DepositionsTabProps {
  caseId: string;
}

const statusColors: Record<string, string> = {
  pending: "text-gray-500 bg-gray-100",
  live: "text-green-600 bg-green-50",
  done: "text-blue-600 bg-blue-50",
};

export function DepositionsTab({ caseId }: DepositionsTabProps) {
  const router = useRouter();
  const [depos, setDepos] = useState<Deposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [zoomUrl, setZoomUrl] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchDepos = useCallback(async () => {
    const res = await fetch(`/api/depositions?caseId=${caseId}`);
    setDepos(await res.json());
    setLoading(false);
  }, [caseId]);

  useEffect(() => {
    fetchDepos();
  }, [fetchDepos]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !zoomUrl.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/depositions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, title: title.trim(), zoomUrl: zoomUrl.trim() }),
      });
      if (res.ok) {
        setTitle("");
        setZoomUrl("");
        setModalOpen(false);
        fetchDepos();
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4F6EF7] rounded-lg hover:bg-[#3d5ce0]"
        >
          <Plus size={16} />
          New Deposition
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : depos.length === 0 ? (
        <div className="text-center py-12">
          <Video className="mx-auto mb-3 text-gray-400" size={40} />
          <p className="text-gray-600 text-sm">No depositions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {depos.map((d) => (
            <button
              key={d.id}
              onClick={() => router.push(`/depositions/${d.id}`)}
              className="w-full text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-[#4F6EF7]/30 hover:shadow-sm transition-all flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium text-gray-900 text-sm">
                  {d.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(d.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={clsx(
                  "px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5",
                  statusColors[d.status] || statusColors.pending
                )}
              >
                {d.status === "live" && (
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                )}
                {d.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* New Deposition Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">New Deposition</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 leading-relaxed">
                This sends a Deposly bot (via Recall.ai) to your Zoom meeting. The bot may take
                30-60 seconds to join. Once in the call, it captures real-time transcription and
                streams it to this app, where AI checks testimony against your uploaded case documents.
              </p>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deposition of John Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zoom Meeting URL
                </label>
                <input
                  type="url"
                  value={zoomUrl}
                  onChange={(e) => setZoomUrl(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !zoomUrl.trim() || creating}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4F6EF7] rounded-lg hover:bg-[#3d5ce0] disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Start Deposition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
