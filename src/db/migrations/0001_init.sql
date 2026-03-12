CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  size_bytes INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX document_chunks_embedding_idx
  ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE TABLE depositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  zoom_url TEXT,
  recall_bot_id TEXT,
  status TEXT DEFAULT 'pending',
  transcript JSONB DEFAULT '[]',
  summary TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE contradiction_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposition_id UUID NOT NULL REFERENCES depositions(id) ON DELETE CASCADE,
  testimony_text TEXT NOT NULL,
  conflicting_text TEXT NOT NULL,
  source_doc TEXT,
  chunk_id UUID REFERENCES document_chunks(id),
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
