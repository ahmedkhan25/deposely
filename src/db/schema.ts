import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  vector,
} from "drizzle-orm/pg-core";

export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id")
    .references(() => cases.id, { onDelete: "cascade" })
    .notNull(),
  filename: text("filename").notNull(),
  s3Key: text("s3_key").notNull(),
  sizeBytes: integer("size_bytes"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .references(() => documents.id, { onDelete: "cascade" })
      .notNull(),
    caseId: uuid("case_id")
      .references(() => cases.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    embeddingIdx: index("document_chunks_embedding_idx").using(
      "ivfflat",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);

export const depositions = pgTable("depositions", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id")
    .references(() => cases.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  zoomUrl: text("zoom_url"),
  recallBotId: text("recall_bot_id"),
  status: text("status").default("pending"),
  transcript: jsonb("transcript").default([]),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contradictionFlags = pgTable("contradiction_flags", {
  id: uuid("id").primaryKey().defaultRandom(),
  depositionId: uuid("deposition_id")
    .references(() => depositions.id, { onDelete: "cascade" })
    .notNull(),
  testimonyText: text("testimony_text").notNull(),
  conflictingText: text("conflicting_text").notNull(),
  sourceDoc: text("source_doc"),
  chunkId: uuid("chunk_id").references(() => documentChunks.id),
  dismissed: boolean("dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
