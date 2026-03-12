"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, FileText, Video } from "lucide-react";
import { NewCaseModal } from "@/components/NewCaseModal";

interface CaseRow {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  docCount: number;
  depoCount: number;
}

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCases = useCallback(async () => {
    const res = await fetch("/api/cases");
    const data = await res.json();
    setCases(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Cases</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4F6EF7] rounded-lg hover:bg-[#3d5ce0]"
        >
          <Plus size={16} />
          New Case
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 mb-4">No cases yet</p>
          <button
            onClick={() => setModalOpen(true)}
            className="text-sm text-[#4F6EF7] hover:underline"
          >
            Create your first case
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/cases/${c.id}`)}
              className="w-full text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-[#4F6EF7]/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{c.title}</h3>
                  {c.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                      {c.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText size={12} />
                    {c.docCount} docs
                  </span>
                  <span className="flex items-center gap-1">
                    <Video size={12} />
                    {c.depoCount} depos
                  </span>
                  <span>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <NewCaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchCases}
      />
    </div>
  );
}
