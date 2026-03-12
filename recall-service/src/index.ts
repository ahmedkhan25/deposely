import "dotenv/config";
import express from "express";
import webhookRouter from "./webhook";
import { addClient, removeClient } from "./clients";

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Body parsing ────────────────────────────────────────────────────────────
// Real-time webhook uses JSON — must be registered BEFORE the raw parser
// because express.raw("/webhook/recall") prefix-matches "/webhook/recall/realtime"
app.use("/webhook/recall/realtime", express.json());
// Svix webhook verification needs raw body
app.use("/webhook/recall", express.raw({ type: "application/json" }));
// Everything else
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use(webhookRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ─── SSE stream for live deposition ──────────────────────────────────────────
app.get("/stream/:depositionId", (req, res) => {
  const { depositionId } = req.params;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  addClient(depositionId, res);

  // Heartbeat every 15s
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(depositionId, res);
  });
});

// ─── CORS for SSE ────────────────────────────────────────────────────────────
app.options("*", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Recall service running on port ${PORT}`);
});
