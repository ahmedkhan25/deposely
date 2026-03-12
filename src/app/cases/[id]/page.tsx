"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useCopilotReadable } from "@copilotkit/react-core";
import { clsx } from "clsx";
import { DocumentsTab } from "@/components/DocumentsTab";
import { AskDocsTab } from "./tabs/AskDocsTab";

interface Document {
  id: string;
  filename: string;
  sizeBytes: number | null;
  status: string;
  createdAt: string;
}

interface CaseData {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  documents: Document[];
}

const tabs = ["Documents", "Ask Docs", "Prep Outline", "Depositions"] as const;
type Tab = (typeof tabs)[number];

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Documents");
  const [loading, setLoading] = useState(true);

  const fetchCase = useCallback(async () => {
    const res = await fetch(`/api/cases/${id}`);
    if (res.ok) {
      setCaseData(await res.json());
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  // Feed case context into every CopilotKit agent call
  useCopilotReadable({
    description: "Current case being worked on",
    value: caseData
      ? {
          caseId: caseData.id,
          caseTitle: caseData.title,
          documentCount: caseData.documents.length,
          readyDocuments: caseData.documents
            .filter((d) => d.status === "ready")
            .map((d) => d.filename),
        }
      : null,
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-64 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="h-96 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center text-gray-500">Case not found</div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {caseData.title}
        </h1>
        {caseData.description && (
          <p className="text-sm text-gray-500 mt-1">{caseData.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab
                  ? "border-[#4F6EF7] text-[#4F6EF7]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "Documents" && (
        <DocumentsTab
          caseId={caseData.id}
          documents={caseData.documents}
          onRefresh={fetchCase}
        />
      )}
      {activeTab === "Ask Docs" && (
        <AskDocsTab caseId={caseData.id} />
      )}
      {activeTab === "Prep Outline" && (
        <div className="text-center py-16 text-gray-400 text-sm">
          Prep Outline will be built in Phase 4
        </div>
      )}
      {activeTab === "Depositions" && (
        <div className="text-center py-16 text-gray-400 text-sm">
          Depositions will be built in Phase 6
        </div>
      )}
    </div>
  );
}
