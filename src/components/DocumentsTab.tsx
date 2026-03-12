"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Clock, Download } from "lucide-react";
import { clsx } from "clsx";

interface Document {
  id: string;
  filename: string;
  sizeBytes: number | null;
  status: string;
  createdAt: string;
}

interface DocumentsTabProps {
  caseId: string;
  documents: Document[];
  onRefresh: () => void;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: "text-gray-500 bg-gray-100", icon: Clock, label: "Pending" },
  processing: { color: "text-amber-600 bg-amber-50", icon: Loader2, label: "Processing" },
  ready: { color: "text-green-600 bg-green-50", icon: CheckCircle, label: "Ready" },
  error: { color: "text-red-600 bg-red-50", icon: AlertCircle, label: "Error" },
};

export function DocumentsTab({ caseId, documents, onRefresh }: DocumentsTabProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        // Get presigned URL
        const urlRes = await fetch(
          `/api/upload-url?caseId=${caseId}&filename=${encodeURIComponent(file.name)}&size=${file.size}`
        );
        const { uploadUrl, document: doc } = await urlRes.json();

        // Upload to S3
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": "application/octet-stream" },
        });

        // Trigger processing
        await fetch(`/api/documents/${doc.id}/process`, { method: "POST" });

        onRefresh();
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    [caseId, onRefresh]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      uploadFile(file);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      uploadFile(file);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={clsx(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
          dragOver
            ? "border-[#4F6EF7] bg-[#4F6EF7]/5"
            : "border-gray-300 hover:border-gray-400"
        )}
      >
        <Upload className="mx-auto mb-3 text-gray-500" size={32} />
        <p className="text-sm text-gray-600 mb-1">
          {uploading ? "Uploading..." : "Drag & drop files here"}
        </p>
        <p className="text-xs text-gray-500 mb-3">PDF, DOCX, or TXT</p>
        <label className="inline-block px-4 py-2 text-sm font-medium text-[#4F6EF7] border border-[#4F6EF7] rounded-lg cursor-pointer hover:bg-[#4F6EF7]/5">
          Browse Files
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* File list */}
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-600 text-sm">
          No documents uploaded yet. Upload case files to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const status = statusConfig[doc.status] || statusConfig.pending;
            const Icon = status.icon;
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {doc.filename}
                    </p>
                    {doc.sizeBytes && (
                      <p className="text-xs text-gray-400">
                        {(doc.sizeBytes / 1024).toFixed(0)} KB
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === "ready" && (
                    <button
                      onClick={async () => {
                        const res = await fetch(`/api/documents/${doc.id}/download`);
                        const { downloadUrl } = await res.json();
                        window.open(downloadUrl, "_blank");
                      }}
                      className="p-1.5 text-gray-500 hover:text-[#4F6EF7] hover:bg-gray-100 rounded-lg transition-colors"
                      title="View / Download"
                    >
                      <Download size={14} />
                    </button>
                  )}
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      status.color
                    )}
                  >
                    <Icon
                      size={12}
                      className={doc.status === "processing" ? "animate-spin" : ""}
                    />
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
